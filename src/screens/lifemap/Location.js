import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  Keyboard,
  TouchableHighlight,
  NetInfo,
  AppState
} from 'react-native'
import Geolocation from '@react-native-community/geolocation'
import Icon from 'react-native-vector-icons/MaterialIcons'
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
/* eslint-disable import/named */
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
/* eslint-enable import/named */
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'
import MapboxGL from '@mapbox/react-native-mapbox-gl'
import { updateDraft } from '../../redux/actions'
import StickyFooter from '../../components/StickyFooter'
import TextInput from '../../components/TextInput'
import globalStyles from '../../globalStyles'
import colors from '../../theme.json'
import Select from '../../components/Select'
import marker from '../../../assets/images/marker.png'
import center from '../../../assets/images/centerMap.png'
import happy from '../../../assets/images/happy.png'
import sad from '../../../assets/images/sad.png'
import { getTotalScreens } from './helpers'

export class Location extends Component {
  survey = this.props.navigation.getParam('survey')
  readOnly = this.props.navigation.getParam('readOnly')

  state = {
    showList: false,
    showErrors: false,
    searchAddress: '',
    showSearch: true,
    errorsDetected: [],
    centeringMap: false, // while map is centering we show a different spinner
    loading: true,
    showForm: false,
    showOfflineMapsList: false,
    hasShownList: false, // back button needs this
    cachedMapPacks: [],
    appState: AppState.currentState,
    draft:
      this.props.navigation.getParam('draft') ||
      this.props.navigation.getParam('family')
  }

  errorsDetected = []
  locationCheckTimer

  detectError = (error, field) => {
    if (error && !this.errorsDetected.includes(field)) {
      this.errorsDetected.push(field)
    } else if (!error) {
      this.errorsDetected = this.errorsDetected.filter(item => item !== field)
    }

    this.setState({
      errorsDetected: this.errorsDetected
    })
  }

  onDragMap = region => {
    const { draft } = this.state
    const { familyData } = draft
    const { coordinates } = region.geometry
    const longitudeCheck = coordinates[0]
    const latitudeCheck = coordinates[1]
    const longitude = familyData.longitude
    const latitude = familyData.latitude
    // prevent jumping of the marker by updating only when the region changes
    if (
      latitude !== latitudeCheck ||
      longitude !== longitudeCheck
    ) {
      this.setState({
        draft: {
          ...draft,
          familyData: {
            ...familyData,
            latitude,
            longitude,
            accuracy: 0
          }
        }
      })
    }
  }

  // if the user has draged the map and the draft has stored some coordinates
  setCoordinatesFromDraft = isOnline => {
    
    const { draft } = this.state
    const { familyData } = draft
    this.setState({
      loading: false,
      centeringMap: false
    })

    if (!isOnline) {
      const isLocationInBoundaries = this.state.cachedMapPacks.length
        ? this.isUserLocationWithinMapPackBounds(
            parseFloat(familyData.longitude),
            parseFloat(familyData.latitude),
            this.state.cachedMapPacks.map(pack => pack.bounds)
          )
        : false

      this.setState({
        showForm: isLocationInBoundaries ? false : true, // false shows map
        showSearch: false
      })
    }
  }

  getCoordinatesOnline = survey => {
    const { draft } = this.state
    const { familyData } = draft

    Geolocation.getCurrentPosition(
      // if location is available and we are online center on it
      position => {
        const { longitude, latitude, accuracy } = position.coords
        this.setState({
          loading: false,
          centeringMap: false,
          draft: {
            ...draft,
            familyData: {
              ...familyData,
              latitude,
              longitude,
              accuracy
            }
          }
        })
      },
      () => {
        // if no location available reset to survey location only when
        // no location comes from the draft
        if (!familyData.latitude) {
          const position = survey.surveyConfig.surveyLocation
          this.setState({
            loading: false,
            centeringMap: false,
            draft: {
              ...draft,
              familyData: {
                ...familyData,
                latitude: position.latitude,
                longitude: position.longitude,
                accuracy: 0
              }
            }
          })
        } else {
          this.setState({
            centeringMap: false
          })
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  getCoordinatesOffline = () => {
    const { draft } = this.state
    const { familyData } = draft

    if (
      this.survey.surveyConfig.offlineMaps &&
      !this.state.showOfflineMapsList
    ) {
      this.setState({
        loading: false,
        showOfflineMapsList: true
      })
    } else {
      this.setState({
        loading: false,
        showOfflineMapsList: false
      })
      Geolocation.getCurrentPosition(
        // if no offline map is available, but there is location save it
        position => {
          const { longitude, latitude, accuracy } = position.coords
          const isLocationInBoundaries = this.state.cachedMapPacks.length
            ? this.isUserLocationWithinMapPackBounds(
                longitude,
                latitude,
                this.state.cachedMapPacks.map(pack => pack.bounds)
              )
            : false

          this.setState({
            loading: false,
            centeringMap: false,
            showForm: isLocationInBoundaries ? false : true,
            draft: {
              ...draft,
              familyData: {
                ...familyData,
                latitude,
                longitude,
                accuracy
              }
            }
          })
        },
        // otherwise ask for more details
        () => {
          this.setState({
            loading: false,
            centeringMap: false,
            showForm: true
          })
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }
  }

  // try getting device location and set map state according to online state
  getDeviceCoordinates = isOnline => {
    this.setState({
      centeringMap: true
    })

    isOnline
      ? this.getCoordinatesOnline(this.survey)
      : this.getCoordinatesOffline()
  }

  isUserLocationWithinMapPackBounds(longitude, latitude, packs) {
    return packs.some(packBoundaries => {
      const neLng = packBoundaries[0][0]
      const neLat = packBoundaries[0][1]
      const swLng = packBoundaries[1][0]
      const swLat = packBoundaries[1][1]

      const eastBound = longitude <= neLng
      const westBound = longitude >= swLng
      let inLong
      if (neLng <= swLng) {
        inLong = eastBound || westBound
      } else {
        inLong = eastBound && westBound
      }

      const inLat = latitude >= swLat && latitude <= neLat
      return inLat && inLong
    })
  }

  getMapOfflinePacks() {
    MapboxGL.offlineManager
      .getPacks()
      .then(packs => {
        if (packs.length) {
          packs.map(offlinePack => {
            this.setState({
              cachedMapPacks: [...this.state.cachedMapPacks, offlinePack]
            })
          })
        }
      })
      .catch(() => {})
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.props.navigation.replace('Location')
    }
    this.setState({ appState: nextAppState })
  }

  determineScreenState(isOnline) {
    const { draft } = this.state
    const { familyData } = draft

    if (!this.readOnly) {
      this.props.navigation.setParams({
        onPressBack: this.onPressBack
      })
    }

    if (!familyData.latitude) {
      this.getDeviceCoordinates(isOnline)
    } else {
      this.setCoordinatesFromDraft(isOnline)
    }
  }

  componentDidMount() {
    const { draft } = this.state
    if (!this.readOnly) {
      this.setState({
        draft: {
          ...draft,
          progress: {
            ...draft.progress,
            screen: 'Location',
            total: getTotalScreens(this.survey)
          },
          familyData: {
            ...draft.familyData,
            country:
              draft.familyData.country ||
              this.survey.surveyConfig.surveyLocation.country
          }
        },
        loading: true
      })
    } else {
      this.setState({
        loading: true
      })
    }

    this.props.navigation.setParams({
      getCurrentDraftState: () => this.state.draft
    })

    AppState.addEventListener('change', this._handleAppStateChange)
    this.getMapOfflinePacks()

    // set search location keyboard events
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow
    )
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide
    )

    // monitor for connection changes
    NetInfo.addEventListener('connectionChange', conncection => {
      const isOnline = conncection.type === 'none' ? false : true

      this.determineScreenState(isOnline)
    })

    // check if online first
    NetInfo.isConnected.fetch().then(isOnline => {
      this.determineScreenState(isOnline)
    })
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }
  _keyboardDidHide = () => {
    this.setState({ showList: false })
  }
  _keyboardDidShow = () => {
    this.setState({ showList: true })
  }

  onPressBack = () => {
    const { draft, hasShownList } = this.state

    if (hasShownList) {
      this.setState({
        showOfflineMapsList: true,
        hasShownList: false
      })
    } else {
      const survey = this.survey

      if (draft.familyData.familyMembersList.length > 1) {
        this.props.navigation.navigate('FamilyMembersNames', { draft, survey })
      } else {
        this.props.navigation.navigate('FamilyParticipant', { draft, survey })
      }
    }
  }

  shouldComponentUpdate() {
    if (!this.props.navigation.isFocused()) {
      clearTimeout(this.locationCheckTimer)
      this.locationCheckTimer = null
    }
    return this.props.navigation.isFocused()
  }

  handleClick = () => {
    const { draft } = this.state
    if (this.errorsDetected.length) {
      this.setState({
        showErrors: true
      })
    } else {
      this.props.updateDraft(draft.draftId, draft)
      this.props.navigation.replace('SocioEconomicQuestion', {
        draft,
        survey: this.survey
      })
    }
  }

  updateFamilyData = (value, field) => {
    const { draft } = this.state

    this.setState({
      draft: {
        ...draft,
        familyData: {
          ...draft.familyData,
          [field]: value
        }
      }
    })
  }

  goToSearch = (data, details = null) => {
    const { draft } = this.state

    this.setState({
      showList: false,
      draft: {
        ...draft,
        familyData: {
          ...draft.familyData,
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng
        }
      }
    })
  }

  goToOfflineLocation = () => {
    this.setState({
      hasShownList: true,
      loading: true,
      showSearch: false
    })
    this.getCoordinatesOffline()
  }

  centerOnOfflineMap = map => {
    const { draft } = this.state

    this.setState({
      hasShownList: true,
      loading: false,
      centeringMap: false,
      showForm: false,
      showSearch: false,
      showOfflineMapsList: false,
      draft: {
        ...draft,
        familyData: {
          ...draft.familyData,
          latitude: map.center[0],
          longitude: map.center[1]
        }
      }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    // update nav draft param if the data changes
    // so the exit modal can access it
    if (prevState.draft.familyData !== this.state.draft.familyData) {
      this.props.navigation.setParams({ draft: this.state.draft })
    }
  }

  render() {
    const { t } = this.props
    const {
      centeringMap,
      loading,
      showErrors,
      showSearch,
      showForm,
      draft,
      showOfflineMapsList
    } = this.state

    const familyData = draft.familyData

    if (loading) {
      return (
        <View style={[globalStyles.container, styles.placeholder]}>
          <ActivityIndicator
            style={styles.spinner}
            size="large"
            color={colors.palered}
          />
          {!this.readOnly && (
            <Text style={globalStyles.h2}>
              {t('views.family.gettingYourLocation')}
            </Text>
          )}
        </View>
      )
    } else if (showOfflineMapsList) {
      return (
        <StickyFooter
          handleClick={this.handleClick}
          readonly={this.readOnly}
          visible={false}
          progress={
            !this.readOnly && draft
              ? (draft.familyData.countFamilyMembers > 1 ? 3 : 2) /
                draft.progress.total
              : 0
          }
          fullHeight
        >
          <View style={[styles.placeholder, { height: '100%' }]}>
            <Text style={[globalStyles.h2, { marginBottom: 30 }]}>
              {t('views.sync.offline')}
            </Text>
            <CommunityIcon
              style={styles.icon}
              name="wifi-off"
              size={60}
              color={colors.palegrey}
            />
            <Text style={[globalStyles.h3, { marginTop: 10 }]}>
              {t('views.family.mapsEnabled')}
            </Text>
            <View
              style={{
                width: '100%',
                maxWidth: 400,
                paddingHorizontal: 30,
                marginVertical: 30
              }}
            >
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.palegrey
                }}
              >
                {this.survey.surveyConfig.offlineMaps.map(map => (
                  <TouchableHighlight
                    underlayColor={colors.primary}
                    onPress={() => this.centerOnOfflineMap(map)}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.palegrey,
                      paddingVertical: 15
                    }}
                    key={map.name}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                      }}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Icon
                          style={[styles.icon, { marginRight: 10 }]}
                          name="location-on"
                          size={20}
                          color={colors.palegrey}
                        />
                        <Text style={{ fontSize: 15 }}>{map.name}</Text>
                      </View>
                      <Icon
                        style={styles.icon}
                        name="navigate-next"
                        size={25}
                        color={colors.palegrey}
                      />
                    </View>
                  </TouchableHighlight>
                ))}
              </View>
            </View>

            <TouchableHighlight
              underlayColor={'transparent'}
              onPress={this.goToOfflineLocation}
            >
              <Text style={[globalStyles.h3, styles.locationLink]}>
                {t('views.family.mapNotListedAbove')}
              </Text>
            </TouchableHighlight>
          </View>
        </StickyFooter>
      )
    } else if (!showForm) {
      return (
        <StickyFooter
          handleClick={this.handleClick}
          readonly={this.readOnly}
          continueLabel={t('general.continue')}
          progress={
            !this.readOnly && draft
              ? (draft.familyData.countFamilyMembers > 1 ? 3 : 2) /
                draft.progress.total
              : 0
          }
          fullHeight
        >
          <View pointerEvents="none" style={styles.fakeMarker}>
            <Image source={marker} />
          </View>
          {!this.readOnly && showSearch && (
            <GooglePlacesAutocomplete
              keyboardShouldPersistTaps={'handled'}
              placeholder={t('views.family.searchByStreetOrPostalCode')}
              autoFocus={false}
              returnKeyType={'default'}
              fetchDetails={true}
              onPress={this.goToSearch}
              query={{
                key: 'AIzaSyBLGYYy86_7QPT-dKgUnFMIJyhUE6AGVwM',
                language: 'en', // language of the results
                types: '(cities)' // default: 'geocode'
              }}
              styles={{
                container: styles.search,
                listView: {
                  display: this.state.showList ? 'flex' : 'none',
                  ...styles.autoCompleteListView
                },
                textInputContainer: styles.autoCompleteTextInputContainer,
                description: styles.autoCompleteDescription,
                predefinedPlacesDescription: styles.predefinedPlacesDescription,
                textInput: styles.autoCompleteTextInput
              }}
              placeholderTextColor={colors.grey}
              currentLocation={false}
            />
          )}
          <MapboxGL.MapView
            centerCoordinate={[+familyData.longitude, +familyData.latitude]}
            zoomLevel={15}
            style={{ width: '100%', flexGrow: 2 }}
            onStyleLoad={ el => this.getEl(el)}
            logoEnabled={false}
            zoomEnabled={!this.readOnly}
            rotateEnabled={false}
            scrollEnabled={!this.readOnly}
            pitchEnabled={false}
            onRegionDidChange={this.onDragMap}
            minZoomLevel={10}
            maxZoomLevel={15}
          />
          {!this.readOnly && (
            <View>
              {centeringMap ? (
                <ActivityIndicator
                  style={styles.center}
                  size="small"
                  color={colors.palegreen}
                />
              ) : (
                <TouchableHighlight
                  id="centerMap"
                  underlayColor={'transparent'}
                  activeOpacity={1}
                  style={styles.center}
                  onPress={this.getDeviceCoordinates}
                >
                  <Image source={center} style={{ width: 21, height: 21 }} />
                </TouchableHighlight>
              )}
            </View>
          )}
        </StickyFooter>
      )
    } else {
      return (
        <StickyFooter
          handleClick={this.handleClick}
          readonly={this.readOnly}
          continueLabel={t('general.continue')}
          progress={
            !this.readOnly && draft
              ? draft.progress.current / draft.progress.total
              : 0
          }
        >
          {!this.readOnly && (
            <View>
              {familyData.latitude ? (
                <View style={[styles.placeholder, styles.map]}>
                  <Image
                    source={happy}
                    style={{ width: 50, height: 50, marginBottom: 20 }}
                  />
                  <Text style={[globalStyles.h2, { marginBottom: 20 }]}>
                    {t('views.family.weFoundYou')}
                  </Text>
                  <Text style={[globalStyles.h3, { textAlign: 'center' }]}>
                    lat: {familyData.latitude}, long: {familyData.longitude}
                  </Text>
                  <Text style={[globalStyles.h4, { marginBottom: 20 }]}>
                    {`${t('views.family.gpsAccurate').replace(
                      '%n',
                      Math.round(familyData.accuracy)
                    )}`}
                  </Text>
                  <Text style={[globalStyles.h3, { textAlign: 'center' }]}>
                    {t('views.family.tellUsMore')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.placeholder, styles.map]}>
                  <Image
                    source={sad}
                    style={{ width: 50, height: 50, marginBottom: 20 }}
                  />
                  <Text style={[globalStyles.h2, { marginBottom: 20 }]}>
                    {t('views.family.weCannotLocate')}
                  </Text>
                  <Text style={[globalStyles.h3, { textAlign: 'center' }]}>
                    {t('views.family.tellUsMore')}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Select
            id="countrySelect"
            required
            showErrors={showErrors}
            onChange={this.updateFamilyData}
            label={t('views.family.country')}
            countrySelect
            placeholder={
              this.readOnly
                ? t('views.family.country')
                : t('views.family.selectACountry')
            }
            field="country"
            value={
              draft.familyData.country ||
              this.survey.surveyConfig.surveyLocation.country
            }
            detectError={this.detectError}
            country={this.survey.surveyConfig.surveyLocation.country}
            readonly={this.readOnly}
          />
          <TextInput
            id="postCode"
            onChangeText={this.updateFamilyData}
            field="postCode"
            value={draft.familyData.postCode || ''}
            placeholder={t('views.family.postcode')}
            detectError={this.detectError}
            readonly={this.readOnly}
          />
          <TextInput
            id="address"
            onChangeText={this.updateFamilyData}
            field="address"
            value={draft.familyData.address || ''}
            placeholder={t('views.family.streetOrHouseDescription')}
            validation="long-string"
            detectError={this.detectError}
            readonly={this.readOnly}
            multiline
          />
        </StickyFooter>
      )
    }
  }
}

Location.propTypes = {
  t: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

const mapDispatchToProps = {
  updateDraft
}

const mapStateToProps = ({ nav }) => ({
  nav
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Location)
)

const styles = StyleSheet.create({
  map: {
    height: 300,
    width: '100%'
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  fakeMarker: {
    zIndex: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 10, //raise the marker so it's point, not center, marks the location
    justifyContent: 'center',
    alignItems: 'center'
  },
  search: {
    zIndex: 3,
    position: 'absolute',
    top: 7.5,
    right: 7.5,
    left: 7.5
  },
  center: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: 54,
    height: 54,
    bottom: 25,
    right: 15,
    backgroundColor: colors.white,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: colors.palegreen
  },
  spinner: {
    marginBottom: 15
  },
  autoCompleteTextInputContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    alignItems: 'center',
    flexDirection: 'row'
  },
  autoCompleteDescription: {
    fontWeight: 'bold'
  },
  predefinedPlacesDescription: {
    color: '#1faadb'
  },
  autoCompleteTextInput: {
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.lightgrey,
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 21,
    color: colors.grey
  },
  autoCompleteListView: {
    backgroundColor: colors.white,
    marginHorizontal: 9,
    marginTop: 8
  },
  locationLink: {
    color: colors.green,
    textDecorationLine: 'underline',
    backgroundColor: 'transparent'
  }
})
