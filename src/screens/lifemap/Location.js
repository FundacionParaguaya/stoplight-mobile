import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  Keyboard,
  TouchableHighlight,
  NetInfo
} from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'
import MapboxGL from '@mapbox/react-native-mapbox-gl'
import StickyFooter from '../../components/StickyFooter'
import { addSurveyData, addDraftProgress } from '../../redux/actions'
import TextInput from '../../components/TextInput'
import globalStyles from '../../globalStyles'
import colors from '../../theme.json'
import Select from '../../components/Select'
import marker from '../../../assets/images/marker.png'
import center from '../../../assets/images/centerMap.png'
import happy from '../../../assets/images/happy.png'
import sad from '../../../assets/images/sad.png'
import { getDraft } from './helpers'

export class Location extends Component {
  state = {
    showList: false,
    showErrors: false,
    latitude: null,
    longitude: null,
    accuracy: null,
    searchAddress: '',
    showSearch: true,
    errorsDetected: [],
    centeringMap: false, // while map is centering we show a different spinner
    loading: true,
    showForm: false
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

  addSurveyData = (text, field) => {
    this.props.addSurveyData(this.props.nav.draftId, 'familyData', {
      [field]: text
    })
  }
  getFieldValue = (draft, field) => {
    if (!draft) {
      return
    }
    return draft.familyData[field]
  }

  onDragMap = region => {
    const { coordinates } = region.geometry
    const longitude = coordinates[0]
    const latitude = coordinates[1]

    // prevent jumping of the marker by updating only when the region changes
    if (
      this.state.latitude !== latitude ||
      this.state.longitude !== longitude
    ) {
      this.setState({
        accuracy: 0
      })
      this.addSurveyData(latitude, 'latitude')
      this.addSurveyData(longitude, 'longitude')
      this.addSurveyData(0, 'accuracy')
    }
  }

  // if the user has draged the map and the draft has stored some coordinates
  setCoordinatesFromDraft = (isOnline, draft) => {
    const { survey } = this.props.nav

    this.setState({
      latitude: parseFloat(this.getFieldValue(draft, 'latitude')),
      longitude: parseFloat(this.getFieldValue(draft, 'longitude')),
      accuracy: parseFloat(this.getFieldValue(draft, 'accuracy')),
      loading: false,
      centeringMap: false
    })

    if (!isOnline) {
      if (survey.title === 'Chile - Geco') {
        this.setState({
          showSearch: false
        })
      } else {
        this.setState({
          showForm: true
        })
      }
    }
  }

  // try getting device location and set map state according to online state
  getDeviceCoordinates = isOnline => {
    const { survey } = this.props.nav

    this.setState({
      centeringMap: true
    })

    if (isOnline) {
      navigator.geolocation.getCurrentPosition(
        // if location is available and we are online center on it
        position => {
          this.setState({
            loading: false,
            centeringMap: false,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          this.addSurveyData(position.coords.latitude, 'latitude')
          this.addSurveyData(position.coords.longitude, 'longitude')
          this.addSurveyData(position.coords.accuracy, 'accuracy')
        },
        () => {
          // if no location available reset to survey location only when
          // no location comes from the draft
          if (!this.getFieldValue(getDraft(), 'latitude')) {
            const position = survey.surveyConfig.surveyLocation
            this.setState({
              loading: false,
              centeringMap: false,
              latitude: position.latitude,
              longitude: position.longitude,
              accuracy: 0
            })
            this.addSurveyData(position.latitude, 'latitude')
            this.addSurveyData(position.longitude, 'longitude')
            this.addSurveyData(0, 'accuracy')
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
    } else {
      // if offline map is available center on it
      if (survey.title === 'Chile - Geco') {
        const position = survey.surveyConfig.surveyLocation
        this.setState({
          showSearch: false,
          loading: false,
          centeringMap: false,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: 0
        })
        this.addSurveyData(position.latitude, 'latitude')
        this.addSurveyData(position.longitude, 'longitude')
        this.addSurveyData(0, 'accuracy')
      } else {
        navigator.geolocation.getCurrentPosition(
          // if no offline map is available, but there is location save it
          position => {
            this.setState({
              loading: false,
              centeringMap: false,
              showForm: true,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
            this.addSurveyData(position.coords.latitude, 'latitude')
            this.addSurveyData(position.coords.longitude, 'longitude')
            this.addSurveyData(position.coords.accuracy, 'accuracy')
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
  }

  componentDidMount() {
    // set search location keyboard events
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow
    )
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide
    )

    const draft = this.props.navigation.getParam('family') || getDraft()

    // the there is no save country in the draft, set it to the survey one
    if (!this.getFieldValue(draft, 'country')) {
      this.addSurveyData(
        this.props.nav.survey.surveyConfig.surveyLocation.country,
        'country'
      )
    }

    // monitor for connection changes
    NetInfo.addEventListener('connectionChange', conncection => {
      this.setState({
        loading: true
      })

      const isOnline = conncection.type === 'none' ? false : true

      if (!this.getFieldValue(draft, 'latitude')) {
        if (!this.props.nav.readonly) {
          this.getDeviceCoordinates(isOnline)
        } else {
          this.setState({
            loading: false,
            showForm: true
          })
        }
      } else {
        this.setCoordinatesFromDraft(isOnline, draft)
      }
    })

    // check if online first
    NetInfo.isConnected.fetch().then(isOnline => {
      if (!this.getFieldValue(draft, 'latitude')) {
        if (!this.props.nav.readonly) {
          this.getDeviceCoordinates(isOnline)
        } else {
          this.setState({
            isOnline,
            loading: false,
            showForm: true
          })
        }
      } else {
        this.setCoordinatesFromDraft(isOnline, draft)
      }
    })

    this.props.addDraftProgress(draft.draftId, {
      screen: 'Location'
    })

    if (!this.props.nav.readonly) {
      this.props.navigation.setParams({
        onPressBack: this.onPressBack
      })
    }
  }
  componentWillUnmount() {
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
    const { draftId } = this.props.nav
    const draft = getDraft()

    this.props.addDraftProgress(draftId, {
      current: draft.progress.current - 1
    })

    if (draft.familyData.familyMembersList.length > 1) {
      this.props.navigation.navigate('FamilyMembersNames')
    } else {
      this.props.navigation.navigate('FamilyParticipant', {
        draftId
      })
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
    if (this.errorsDetected.length) {
      this.setState({
        showErrors: true
      })
    } else {
      const draft = this.props.navigation.getParam('family') || getDraft()

      this.props.addDraftProgress(this.props.nav.draftId, {
        current: draft.progress.current + 1
      })

      this.props.navigation.replace('SocioEconomicQuestion')
    }
  }
  render() {
    const { t } = this.props
    const { survey, readonly } = this.props.nav

    const {
      latitude,
      longitude,
      accuracy,
      centeringMap,
      loading,
      showErrors,
      showSearch,
      showForm
    } = this.state

    const draft = this.props.navigation.getParam('family') || getDraft()
    if (loading) {
      return (
        <View style={[globalStyles.container, styles.placeholder]}>
          <ActivityIndicator
            style={styles.spinner}
            size={80}
            color={colors.palered}
          />
          {!readonly && (
            <Text style={globalStyles.h2}>
              {t('views.family.gettingYourLocation')}
            </Text>
          )}
        </View>
      )
    } else if (!showForm) {
      return (
        <StickyFooter
          handleClick={this.handleClick}
          readonly={readonly}
          continueLabel={t('general.continue')}
          progress={
            !readonly && draft
              ? draft.progress.current / draft.progress.total
              : 0
          }
          fullHeight
        >
          <View pointerEvents="none" style={styles.fakeMarker}>
            <Image source={marker} />
          </View>
          {!readonly && showSearch && (
            <GooglePlacesAutocomplete
              keyboardShouldPersistTaps={'handled'}
              placeholder={t('views.family.searchByStreetOrPostalCode')}
              autoFocus={false}
              returnKeyType={'default'}
              fetchDetails={true}
              onPress={(data, details = null) => {
                this.setState({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  showList: false
                })
              }}
              query={{
                key: 'AIzaSyBLGYYy86_7QPT-dKgUnFMIJyhUE6AGVwM',
                language: 'en', // language of the results
                types: '(cities)' // default: 'geocode'
              }}
              styles={{
                container: styles.search,
                listView: {
                  backgroundColor: colors.white,
                  display: this.state.showList ? 'flex' : 'none',
                  marginHorizontal: 9,
                  marginTop: 8
                },
                textInputContainer: {
                  backgroundColor: 'transparent',
                  borderBottomWidth: 0,
                  borderTopWidth: 0,
                  alignItems: 'center',
                  flexDirection: 'row'
                },
                description: {
                  fontWeight: 'bold'
                },
                predefinedPlacesDescription: {
                  color: '#1faadb'
                },
                textInput: {
                  height: 52,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  borderWidth: 1,
                  borderColor: colors.lightgrey,
                  fontFamily: 'Roboto',
                  fontSize: 16,
                  lineHeight: 21,
                  color: colors.lightdark
                }
              }}
              currentLocation={false}
            />
          )}
          <MapboxGL.MapView
            centerCoordinate={[longitude, latitude]}
            zoomLevel={15}
            style={{ width: '100%', flexGrow: 2 }}
            logoEnabled={false}
            zoomEnabled={!readonly}
            rotateEnabled={false}
            scrollEnabled={!readonly}
            pitchEnabled={false}
            onRegionDidChange={this.onDragMap}
            minZoomLevel={10}
            maxZoomLevel={15}
          />
          {!readonly && (
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
          readonly={readonly}
          continueLabel={t('general.continue')}
          progress={
            !readonly && draft
              ? draft.progress.current / draft.progress.total
              : 0
          }
        >
          {!readonly && (
            <View>
              {latitude ? (
                <View style={[styles.placeholder, styles.map]}>
                  <Image
                    source={happy}
                    style={{ width: 50, height: 50, marginBottom: 20 }}
                  />
                  <Text style={[globalStyles.h2, { marginBottom: 20 }]}>
                    {t('views.family.weFoundYou')}
                  </Text>
                  <Text style={[globalStyles.h3, { textAlign: 'center' }]}>
                    lat: {latitude}, long: {longitude}
                  </Text>
                  <Text style={[globalStyles.h4, { marginBottom: 20 }]}>
                    {`${t('views.family.gpsAccurate').replace(
                      '%n',
                      Math.round(accuracy)
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
            onChange={this.addSurveyData}
            label={t('views.family.country')}
            countrySelect
            placeholder={
              readonly
                ? t('views.family.country')
                : t('views.family.selectACountry')
            }
            field="country"
            value={
              this.getFieldValue(draft, 'country') ||
              survey.surveyConfig.surveyLocation.country
            }
            detectError={this.detectError}
            country={survey.surveyConfig.surveyLocation.country}
            readonly={readonly}
          />
          <TextInput
            id="postCode"
            onChangeText={this.addSurveyData}
            field="postCode"
            value={this.getFieldValue(draft, 'postCode') || ''}
            placeholder={t('views.family.postcode')}
            detectError={this.detectError}
            readonly={readonly}
          />
          <TextInput
            id="address"
            onChangeText={this.addSurveyData}
            field="address"
            value={this.getFieldValue(draft, 'address') || ''}
            placeholder={t('views.family.streetOrHouseDescription')}
            validation="long-string"
            detectError={this.detectError}
            readonly={readonly}
            multiline
          />
        </StickyFooter>
      )
    }
  }
}

Location.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  nav: PropTypes.object.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  addDraftProgress: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  addSurveyData,
  addDraftProgress
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
  }
})
