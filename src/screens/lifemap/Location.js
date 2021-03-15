import Geolocation from 'react-native-geolocation-service';
import NetInfo from '@react-native-community/netinfo';
import MapboxGL from '@react-native-mapbox-gl/maps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {
  ActivityIndicator,
  AppState,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Geocoder from 'react-native-geocoding';
/* eslint-disable import/named */
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
/* eslint-enable import/named */
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';

import center from '../../../assets/images/centerMap.png';
import happy from '../../../assets/images/happy.png';
import marker from '../../../assets/images/marker.png';
import sad from '../../../assets/images/sad.png';
import Select from '../../components/form/Select';
import TextInput from '../../components/form/TextInput';
import StickyFooter from '../../components/StickyFooter';
import globalStyles from '../../globalStyles';
import {updateDraft} from '../../redux/actions';
import colors from '../../theme.json';
import {getTotalScreens} from './helpers';
import {calculateProgressBar} from '../utils/helpers';

const GOOGLE_GEO_API_KEY = 'AIzaSyBLGYYy86_7QPT-dKgUnFMIJyhUE6AGVwM';
Geocoder.init(GOOGLE_GEO_API_KEY);

export class Location extends Component {
  survey = this.props.route.params.survey;
  readOnly = this.props.route.params.readOnly;
  draftId = this.props.route.params.draftId;
  readOnlyDraft = this.props.route.params.family || [];

  unsubscribeNetChange;
  state = {
    showList: false,
    searchAddress: '',
    showSearch: true,
    askingForPermission: false,
    centeringMap: false, // while map is centering we show a different spinner
    loading: true,
    showForm: false,
    showOfflineMapsList: false,
    hasShownList: false, // back button needs this
    cachedMapPacks: [],
    zoom: 15,
    appState: AppState.currentState,
    errors: [],
    showErrors: false,
    refreshedMap:false,
    currentAddress: '',
  };

  getDraft = () =>
    this.props.drafts.find((draft) => draft.draftId === this.draftId);

  setError = (error, field) => {
    const {errors} = this.state;

    if (error && !errors.includes(field)) {
      this.setState((previousState) => {
        return {
          ...previousState,
          errors: [...previousState.errors, field],
        };
      });
    } else if (!error) {
      this.setState({
        errors: errors.filter((item) => item !== field),
      });
    }
  };

  validateForm = () => {
    if (this.state.errors.length) {
      this.setState({
        showErrors: true,
      });
    } else {
      this.onContinue();
    }
  };

  getCurrentAddress = (latitude, longitude) => {
    Geocoder.from(latitude, longitude)
      .then((json) => {
        this.setState({currentAddress: json.results[0].formatted_address});
      })
      .catch(() => ({}));
  };

  onDragMap = (region) => {
    if(this.refreshedMap){
      this.setState({refreshedMap:false})
      return;
    }
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
    const {zoom} = this.state;
    const {familyData} = draft;
    const {coordinates} = region.geometry;
    const longitude = coordinates[0];
    const latitude = coordinates[1];

    this.getCurrentAddress(latitude, longitude);

    // prevent jumping of the marker by updating only when the region changes
    if (
      familyData.latitude !== latitude ||
      familyData.longitude !== longitude ||
      zoom !== region.properties.zoomLevel
    ) {
      this.props.updateDraft({
        ...draft,
        familyData: {
          ...familyData,
          latitude,
          longitude,
          accuracy: 0,
        },
      });

      this.setState({
        zoom: region.properties.zoomLevel || 15,
      });
    }
  };

  // if the user has draged the map and the draft has stored some coordinates
  setCoordinatesFromDraft = (isOnline) => {
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    const {familyData} = draft;

    this.setState({
      loading: false,
      centeringMap: false,
    });

    if (!isOnline) {
      const isLocationInBoundaries = this.state.cachedMapPacks.length
        ? this.isUserLocationWithinMapPackBounds(
            parseFloat(familyData.longitude),
            parseFloat(familyData.latitude),
            this.state.cachedMapPacks.map((pack) => pack.bounds),
          )
        : false;

      this.setState({
        showForm: isLocationInBoundaries ? false : true, // false shows map
        showSearch: false,
      });
    }
  };

  getCoordinatesOnline() {
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
    const {familyData} = draft;
    this.setState({askingForPermission: true});

    Geolocation.getCurrentPosition(
      // if location is available and we are online center on it
      (position) => {
        const {longitude, latitude, accuracy} = position.coords;

        this.setState({
          refreshedMap:true,
          loading: false,
          centeringMap: false,
          askingForPermission: false,
        });

        this.props.updateDraft({
          ...draft,
          familyData: {
            ...familyData,
            latitude,
            longitude,
            accuracy,
          },
        });

      
      },
      (err) => {
        // if no location available reset to survey location only when
        // no location comes from the draft
        if (!familyData.latitude) {
          const position = this.survey.surveyConfig.surveyLocation;

          this.props.updateDraft({
            ...draft,
            familyData: {
              ...familyData,
              latitude: position.latitude,
              longitude: position.longitude,
              accuracy: 0,
            },
          });

          this.setState({
            loading: false,
            centeringMap: false,
            askingForPermission: false,
          });
        } else {
          this.setState({
            centeringMap: false,
          });
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 25000,
        maximumAge: 0,
   
      },
    );
  }

  getCoordinatesOffline() {
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
    const {familyData} = draft;
    this.setState({askingForPermission: true});
    // if we have an emty array [] or an array with an empty object [{}] then dont show the offline maps because we dont have any.
    if (
      this.props.maps.length &&
      !!this.props.maps[0].name &&
      !this.state.showOfflineMapsList
    ) {
      this.setState({
        loading: false,
        showOfflineMapsList: true,
      });
    } else {
      this.setState({
        showOfflineMapsList: false,
      });
      Geolocation.getCurrentPosition(
        // if no offline map is available, but there is location save it
        (position) => {
          const {longitude, latitude, accuracy} = position.coords;

          const isLocationInBoundaries = this.state.cachedMapPacks.length
            ? this.isUserLocationWithinMapPackBounds(
                longitude,
                latitude,
                this.state.cachedMapPacks.map((pack) => pack.bounds),
              )
            : false;

            this.setState({
              refreshedMap:true,
              loading: false,
              askingForPermission: false,
              centeringMap: false,
              showForm: isLocationInBoundaries ? false : true,
            });
          this.props.updateDraft({
            ...draft,
            familyData: {
              ...familyData,
              latitude,
              longitude,
              accuracy,
            },
          });

         
        },
        // otherwise ask for more details
        () => {
          let familyDataCopy = {...draft.familyData};
          delete familyDataCopy.latitude;
          delete familyDataCopy.longitude;
          this.props.updateDraft({
            ...draft,
            familyData: familyDataCopy,
          });

          this.setState({
            loading: false,
            centeringMap: false,
            showForm: true,
          });
          //remove 
        },
        {
          forceRequestLocation: true,
          enableHighAccuracy: false,
          timeout: 25000,
          maximumAge: 0 ,
         
        },
      );
    }
  }

  // try getting device location and set map state according to online state
  getDeviceCoordinates = (isOnline) => {
    this.setState({
      centeringMap: true,
    });

    isOnline ? this.getCoordinatesOnline() : this.getCoordinatesOffline();
  };

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active' &&
      !this.state.askingForPermission
    ) {
      const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

      if (draft.progress.screen === 'Location') {
        this.props.navigation.replace('Location', {
          draft: this.state.draft,
          survey: this.survey,
          draftId: this.draftId,
        });
      }
    }
    this.setState({appState: nextAppState});
  };

  onContinue = () => {
    const nextPage =
      this.survey.surveyEconomicQuestions &&
      this.survey.surveyEconomicQuestions.length
        ? 'SocioEconomicQuestion'
        : 'BeginLifemap';

    this.props.navigation.navigate(nextPage, {
      draftId: this.draftId,
      survey: this.survey,
    });
  };

  updateFamilyData = (value, field) => {
  
    if(!value){
      console.log("stop");
      return;
    }
    console.log("continue");
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        [field]: value,
      },
    });
  };

  goToSearch = (data, details = null) => {
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      },
    });

    this.setState({
      showList: false,
    });
  };

  goToOfflineLocation = () => {
    this.setState({
      hasShownList: true,
      loading: true,
      showSearch: false,
    });
    this.getCoordinatesOffline();
  };

  centerOnOfflineMap = (map) => {
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        latitude: map.center[0],
        longitude: map.center[1],
      },
    });

    this.setState({
      hasShownList: true,
      loading: false,
      centeringMap: false,
      showForm: false,
      showSearch: false,
      showOfflineMapsList: false,
    });
  };

  _keyboardDidHide = () => {
    this.setState({showList: false});
  };
  _keyboardDidShow = () => {
    this.setState({showList: true});
  };

  onPressBack = () => {
    const {hasShownList} = this.state;

    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    if (hasShownList) {
      this.setState({
        showOfflineMapsList: true,
        hasShownList: false,
      });
    } else {
      const survey = this.survey;

      if (draft.familyData.countFamilyMembers > 1) {
        this.props.navigation.replace('FamilyMembersNames', {
          draftId: this.draftId,
          survey,
        });
      } else {
        this.props.navigation.navigate('FamilyParticipant', {
          draftId: this.draftId,
          survey,
        });
      }
    }
  };

  async requestLocationPermission() {
    this.setState({
      askingForPermission: true,
    });

    let isGranted = await MapboxGL.requestAndroidLocationPermissions();
    console.log(isGranted);
    if (isGranted) {
      this.setState({
        askingForPermission: false,
      });
    } else {
      this.setState({
        showForm: true,
        loading: false,
      });
    }
  }

  isUserLocationWithinMapPackBounds(longitude, latitude, packs) {
    return packs.some((packBoundaries) => {
      const neLng = packBoundaries[0][0];
      const neLat = packBoundaries[0][1];
      const swLng = packBoundaries[1][0];
      const swLat = packBoundaries[1][1];

      const eastBound = longitude <= neLng;
      const westBound = longitude >= swLng;

      let inLong;
      if (neLng <= swLng) {
        inLong = eastBound || westBound;
      } else {
        inLong = eastBound && westBound;
      }

      const inLat = latitude <= swLat && latitude >= neLat;
      return inLat && inLong;
    });
  }

  getMapOfflinePacks() {
    MapboxGL.offlineManager
      .getPacks()
      .then((packs) => {
        if (packs.length) {
          packs.map((offlinePack) => {
            this.setState({
              cachedMapPacks: [...this.state.cachedMapPacks, offlinePack],
            });
          });
        }
      })
      .catch(() => {});
  }

  determineScreenState(isOnline) {
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
    const {familyData} = draft;

    if (!this.readOnly) {
      this.props.navigation.setParams({
        onPressBack: this.onPressBack,
      });
    }

    if (!familyData.latitude) {
      this.getDeviceCoordinates(isOnline);
    } else {
      this.setCoordinatesFromDraft(isOnline);
    }
  }

  componentDidMount = async () => {
    this.setState({
      loading: true,
    });

    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    if (!this.readOnly) {
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          screen: 'Location',
          total: getTotalScreens(this.survey),
        },
        familyData: {
          ...draft.familyData,
          country:
            draft.familyData.country ||
            this.survey.surveyConfig.surveyLocation.country,
        },
      });
    }
    AppState.addEventListener('change', this._handleAppStateChange);
    this.getMapOfflinePacks();

    // set search location keyboard events
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
    //before getting the coordinates with Geolocation.getCurrentPosition,
    //we first need to wait for user permission.Otherwise the app will crash if offline.
    if (!this.readOnly) {
      await this.requestLocationPermission();
    }

    // check if online first
    NetInfo.fetch().then((state) => {
      this.determineScreenState(state.isConnected);
      this.setState({status: state.isConnected});
    });

    // monitor for connection changes
    this.unsubscribeNetChange = NetInfo.addEventListener((state) => {
      const {status} = this.state;

      if (status !== undefined && status !== state.isConnected) {
        this.setState({status: state.isConnected});
        this.determineScreenState(state.isConnected);
      }
    });
  };

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }

  componentWillUnmount() {
    if (this.unsubscribeNetChange) {
      this.unsubscribeNetChange();
    }
    AppState.removeEventListener('change', this._handleAppStateChange);
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  render() {
    const {t} = this.props;
    const {
      centeringMap,
      loading,
      showSearch,
      showForm,
      showOfflineMapsList,
      showErrors,
    } = this.state;

    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
    const familyData = draft.familyData;
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
      );
    } else if (showOfflineMapsList) {
      return (
        <StickyFooter
          onContinue={this.onContinue}
          visible={false}
          progress={calculateProgressBar({readOnly:this.readOnly,draft:draft,screen:3})}>
          <View style={[styles.placeholder, {height: '100%'}]}>
            <Text style={[globalStyles.h2, {marginBottom: 30}]}>
              {t('views.sync.offline')}
            </Text>
            <CommunityIcon
              style={styles.icon}
              name="wifi-off"
              size={60}
              color={colors.palegrey}
            />
            <Text style={[globalStyles.h3, {marginTop: 10}]}>
              {t('views.family.mapsEnabled')}
            </Text>
            <View
              style={{
                width: '100%',
                maxWidth: 400,
                paddingHorizontal: 30,
                marginVertical: 30,
              }}>
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.palegrey,
                }}>
                {this.props.maps.map((map) => (
                  <TouchableHighlight
                    underlayColor={colors.primary}
                    onPress={() => this.centerOnOfflineMap(map)}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.palegrey,
                      paddingVertical: 15,
                    }}
                    key={map.name}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        <Icon
                          style={[styles.icon, {marginRight: 10}]}
                          name="location-on"
                          size={20}
                          color={colors.palegrey}
                        />
                        <Text style={{fontSize: 15}}>{map.name}</Text>
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
              id="location-not-listed-above"
              underlayColor={'transparent'}
              onPress={this.goToOfflineLocation}>
              <Text style={[globalStyles.h3, styles.locationLink]}>
                {t('views.family.mapNotListedAbove')}
              </Text>
            </TouchableHighlight>
          </View>
        </StickyFooter>
      );
    } else if (!showForm) {
      return (
        <StickyFooter
          onContinue={this.onContinue}
          visible={!this.readOnly}
          continueLabel={t('general.continue')}
          progress={
            calculateProgressBar({readOnly:this.readOnly,draft:draft,screen:3})
          }
          fullHeight>
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
                key: GOOGLE_GEO_API_KEY,
                language: 'en', // language of the results
                types: '(cities)', // default: 'geocode'
              }}
              styles={{
                container: styles.search,
                listView: {
                  display: this.state.showList ? 'flex' : 'none',
                  ...styles.autoCompleteListView,
                },
                textInputContainer: styles.autoCompleteTextInputContainer,
                description: styles.autoCompleteDescription,
                predefinedPlacesDescription: styles.predefinedPlacesDescription,
                textInput: styles.autoCompleteTextInput,
              }}
              placeholderTextColor={colors.grey}
              currentLocation={false}
            />
          )}

          <MapboxGL.MapView
            accessible={true}
            accessibilityLabel={`Your current locations is ${this.state.currentAddress}`}
            style={{width: '100%', flexGrow: 2}}
            logoEnabled={false}
            zoomEnabled={!this.readOnly}
            rotateEnabled={false}
            scrollEnabled={!this.readOnly}
            pitchEnabled={false}
            onRegionDidChange={this.onDragMap}>
            {!this.readOnly && <MapboxGL.UserLocation visible={false} />}
            <MapboxGL.Camera
              defaultSettings={{
                centerCoordinate: [
                  +familyData.longitude || 0,
                  +familyData.latitude || 0,
                ],
                zoomLevel: this.state.zoom,
              }}
              centerCoordinate={[
                +familyData.longitude || 0,
                +familyData.latitude || 0,
              ]}
              minZoomLevel={10}
              maxZoomLevel={16}
            />
          </MapboxGL.MapView>

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
                  onPress={this.getDeviceCoordinates}>
                  <Image source={center} style={{width: 21, height: 21}} />
                </TouchableHighlight>
              )}
            </View>
          )}
        </StickyFooter>
      );
    } else {
      return (
        <StickyFooter
          onContinue={this.validateForm}
          continueLabel={t('general.continue')}
          readOnly={!!this.readOnly}
          progress={
            calculateProgressBar({readOnly:this.readOnly,draft:draft,screen:3})
          }>
          {!this.readOnly && (
            <View>
              {familyData.latitude ? (
                <View style={[styles.placeholder, styles.map]}>
                  <Image
                    source={happy}
                    style={{width: 50, height: 50, marginBottom: 20}}
                  />
                  <Text
                    id="weFoundYou"
                    style={[globalStyles.h2, {marginBottom: 20}]}>
                    {t('views.family.weFoundYou')}
                  </Text>
                  <Text style={[globalStyles.h3, {textAlign: 'center'}]}>
                    lat: {familyData.latitude}, long: {familyData.longitude}
                  </Text>
                  <Text style={[globalStyles.h4, {marginBottom: 20}]}>
                    {`${t('views.family.gpsAccurate').replace(
                      '%n',
                      Math.round(familyData.accuracy),
                    )}`}
                  </Text>
                  <Text style={[globalStyles.h3, {textAlign: 'center'}]}>
                    {t('views.family.tellUsMore')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.placeholder, styles.map]}>
                  <Image
                    source={sad}
                    style={{width: 50, height: 50, marginBottom: 20}}
                  />
                  <Text
                    id="weCannotLocate"
                    style={[globalStyles.h2, {marginBottom: 20}]}>
                    {t('views.family.weCannotLocate')}
                  </Text>
                  <Text style={[globalStyles.h3, {textAlign: 'center'}]}>
                    {t('views.family.tellUsMore')}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Select
            id="country"
            countrySelect
            label={t('views.family.country')}
            placeholder={
              this.readOnly
                ? t('views.family.country')
                : t('views.family.selectACountry')
            }
            initialValue={
              draft.familyData.country ||
              this.survey.surveyConfig.surveyLocation.country
            }
           
            defaultCountry={this.survey.surveyConfig.surveyLocation.country}
            onChange={this.updateFamilyData}
            readOnly={!!this.readOnly}
            showErrors={showErrors}
            setError={(isError) => this.setError(isError, 'country')}
          />
          <TextInput
            id="postCode"
            onChangeText={this.updateFamilyData}
            initialValue={draft.familyData.postCode || ''}
            placeholder={t('views.family.postcode')}
            readOnly={!!this.readOnly}
            showErrors={showErrors}
            setError={(isError) => this.setError(isError, 'postCode')}
          />
          <TextInput
            id="address"
            onChangeText={this.updateFamilyData}
            initialValue={draft.familyData.address || ''}
            placeholder={t('views.family.streetOrHouseDescription')}
            validation="long-string"
            multiline
            readOnly={!!this.readOnly}
            showErrors={showErrors}
            setError={(isError) => this.setError(isError, 'address')}
          />
        </StickyFooter>
      );
    }
  }
}

const styles = StyleSheet.create({
  map: {
    height: 300,
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeMarker: {
    zIndex: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 10, //raise the marker so it's point, not center, marks the location
    justifyContent: 'center',
    alignItems: 'center',
  },
  search: {
    zIndex: 3,
    position: 'absolute',
    top: 7.5,
    right: 7.5,
    left: 7.5,
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
    borderColor: colors.palegreen,
  },
  spinner: {
    marginBottom: 15,
  },
  autoCompleteTextInputContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  autoCompleteDescription: {
    fontWeight: 'bold',
  },
  predefinedPlacesDescription: {
    color: '#1faadb',
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
    color: colors.grey,
  },
  autoCompleteListView: {
    backgroundColor: colors.white,
    marginHorizontal: 9,
    marginTop: 8,
  },
  locationLink: {
    color: colors.green,
    textDecorationLine: 'underline',
    backgroundColor: 'transparent',
  },
});

Location.propTypes = {
  t: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
  maps: PropTypes.array,
};

const mapDispatchToProps = {
  updateDraft,
};

const mapStateToProps = ({drafts, maps}) => ({drafts, maps});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Location),
);
