import NetInfo from '@react-native-community/netinfo';
import MapboxGL from '@react-native-mapbox-gl/maps';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import { connect } from 'react-redux';

import { initAudioCaching, initImageCaching } from '../cache';
import Button from '../components/Button';
import Decoration from '../components/decoration/Decoration';
import ProgressBar from '../components/ProgressBar';
import { url } from '../config';
import globalStyles from '../globalStyles';
import {
  loadFamilies,
  loadMaps,
  loadSurveys,
  loadProjectsByOrganization,
  loadInterventionDefinition,
  logout,
  resetSyncState,
  setAppVersion,
  setSyncedState,
  validate
} from '../redux/actions';
import * as _ from 'lodash';
import colors from '../theme.json';
import Bugsnag from '@bugsnag/react-native';

export class Loading extends Component {
  state = {
    syncingServerData: false, // know when to show that data is synced
    cachingImages: false,
    downloadingMap: false,
    mapsDownloaded: false,
    cachingAudios: false,
    currentMapName: '',
    mapPercent: 0,
    maps: [],
    error: null,
  };

  // STEP 1 - cache the surveys
  syncSurveys = (resync) => {
    // mark that loading has stated to show the progress
    this.setState({
      syncingServerData: true,
    });

    // if surveys are synced skip to syncing families
    if (!resync && this.props.sync.surveys) {
      //this.syncFamilies();
      this.syncProjects();
    } else {
      this.props.loadSurveys(url[this.props.env], this.props.user.token);
    }
  };
  // NEW STEP 2 - cache the projects
  syncProjects = () => {
    //if projects are synced skip to caching intervention definition
    if (this.props.sync.projects) {
      this.syncInterventionDefinition();
      //this.syncFamilies();
    } else {
      this.props.loadProjectsByOrganization(url[this.props.env], this.props.user.token, this.props.user.organization.id);
    }
  }

  // NEW STEP 3 - cache the intervention definition
  syncInterventionDefinition = () => {
    // if intervention definition is synced skip to caching families
    if(this.props.sync.interventionDefinition){
      this.syncFamilies();
    } else {
      this.props.loadInterventionDefinition(url[this.props.env],this.props.user.token, this.props.user.organization.id);
    }
  }

  // STEP 4 - cache the families
  syncFamilies = () => {
    // if families are synced skip to caching images
    if (this.props.sync.families) {
      this.checkOfflineMaps();
    } else {
      this.props.loadFamilies(url[this.props.env], this.props.user.token);
    }
  };

  isSurveyInSynced = (title) =>
    this.props.surveys.some((survey) => survey.title && survey.title === title);

  downloadOfflineMapPack = (map) => {
    MapboxGL.offlineManager.getPack(map.name).then((pack) => {
      // if pack exists delete it and re-download it
      if (pack) {
        MapboxGL.offlineManager.deletePack(map.name).then(() => {
          MapboxGL.offlineManager.createPack(
            {
              name: map.name,
              styleURL: MapboxGL.StyleURL.Street,
              ...map.options,
            },
            this.onMapDownloadProgress,
            this.onMapDownloadError,
          );
        });
      } else {
        MapboxGL.offlineManager.createPack(
          {
            name: map.name,
            styleURL: MapboxGL.StyleURL.Street,
            ...map.options,
          },
          this.onMapDownloadProgress,
          this.onMapDownloadError,
        );
      }
    });
  };

  // STEP 5 - check and cache the offline maps
  checkOfflineMaps = async () => {
    MapboxGL.offlineManager.setTileCountLimit(200000);
    if (
      !this.props.downloadMapsAndImages.downloadMaps ||
      (this.state.maps.length && this.state.maps.every(map => map.status == 100) || this.props.sync.maps)
    ) {
      //when we decide to skip the maps form the dev options , we simply pretend that they are already downloaded
      this.setState({
        mapsDownloaded: true,
      });
      return this.handleImageCaching();
    } else {
      this.props.loadMaps(url[this.props.env], this.props.user.token);
      this.setState({
        downloadingMap: true,
      });
    }
  };

  // update map download progress
  onMapDownloadProgress = async (offlineRegion, offlineRegionStatus) => {
    if (offlineRegionStatus.name !== this.state.currentMapName) {
      this.setState({
        currentMapName: offlineRegionStatus.name,
      });
    }

    if (offlineRegionStatus.percentage === 100) {
      await this.setState({
        maps: this.state.maps.map((map) => {
          if (map.name === offlineRegionStatus.name) {
            return {
              ...map,
              status: 100,
            };
          } else {
            return map;
          }
        }),
        mapPercent: 100,
      });

      this.initMapDownload();
    } else {
      this.setState({
        mapPercent: Math.trunc(offlineRegionStatus.percentage),
      });
    }
  };

  onMapDownloadError = (offlineRegion, mapDownloadError) => {
    if (mapDownloadError.message !== 'No Internet connection available.') {
      NetInfo.fetch().then((state) => { });
    }
  };

  // STEP 6 - cache the survey indicator images
  handleImageCaching = () => {
    if (
      !this.props.downloadMapsAndImages.downloadImages ||
      (!!this.props.sync.images.total &&
        this.props.sync.images.total === this.props.sync.images.synced) ||
        this.props.surveys .length == 0
    ) {
      this.handleAudioCaching();
      //this.props.navigation.navigate('DrawerStack');
    } else if (!this.state.cachingImages) {
      this.setState({
        cachingImages: true,
      });
      initImageCaching();
    }
  };

  // STEP 7 - cache the survey indicator audios

  handleAudioCaching = () => {
    if (!this.props.downloadMapsAndImages.downloadAudios ||
      ((this.props.sync.audios.total != null) &&
        this.props.sync.audios.total === this.props.sync.audios.synced) || this.props.surveys.length == 0
    ) {
      this.props.navigation.navigate('DrawerStack')
    } else if (!this.state.cachingAudios) {
      this.setState({
        cachingAudios: true,
      });
      try {
        initAudioCaching();
      } catch (err) {
        console.log(err)
      }
    }
  }

  reload = () => {
    this.setState({
      syncingServerData: false, // know when to show that data is synced
      cachingImages: false,
      downloadingMap: false,
      cachingAudios: false,
      maps: [],
      error: null,
    });
    this.props.resetSyncState();
    setTimeout(() => {
      this.checkState();
    }, 500);
  };

  showError(msg) {
    this.setState({
      error: msg,
    });
  }
  getDataPercentages = () => {
    let mapAllPercentage = 0;
    let mapAllNames = [];
    let mapAllNumber = 0;
    this.state.maps.map((map) => {
      let mapPercentageForNow = map.status || 0;
      if (mapAllNames.length === this.state.maps.length - 1) {
        mapAllNumber = mapAllNumber + mapPercentageForNow;
        mapAllPercentage = mapAllNumber / this.state.maps.length;
      } else {
        mapAllNames.push(map.name);
        mapAllNumber = mapAllNumber + mapPercentageForNow;
      }
    });
    if (isNaN(mapAllPercentage) && mapAllPercentage !== 100) {
      return 0;
    } else {
      return mapAllPercentage;
    }
  };
  initMapDownload() {
    const { maps } = this.state;
    if (maps.length && maps.some((map) => map.status !== 100)) {
      this.downloadOfflineMapPack(maps.find((map) => map.status !== 100));
    } else {
      this.setState({
        downloadingMap: false,
        mapsDownloaded: true,
      });
      this.handleImageCaching();
    }
  }

  checkState() {
    const { families, surveys, projects,interventionDefinition, images, appVersion, audios } = this.props.sync;
    if (!this.props.user.token) {
      // if user hasn't logged in, navigate to login
      this.props.navigation.navigate('Login');
    }
    else if (this.props.user.username == 'amanda_torres') {
      this.props.navigation.navigate('DrawerStack');
    }
    
    else if (

      families &&
      surveys && projects && interventionDefinition  &&
      ((!!images.total &&
        images.total === images.synced) ||
        (!!audios.total &&
          audios.total === audios.synced))
    ) {
      // if everything is synced navigate to Dashboard
      this.props.navigation.navigate('DrawerStack');
    }
    else {
      // check connection state
      NetInfo.fetch().then((state) => {
        if (!state.isConnected) {
          this.showError('There seems to be a problem with your connetion.');
        } else {
          this.syncSurveys();
        }
      });
    }
  }

  componentDidMount() {
    this.props.validate(url[this.props.env], this.props.user.token);
    this.props.user && Bugsnag.setUser(this.props.user.username, this.props.user.token, this.props.user.role);
    this.checkState();
  }

  existMaps = () => !!this.props.maps && this.props.maps.length > 0 && !_.isEmpty(this.props.maps[0]);

  downloadMaps = async () => {
    let mapsArray = [];
    this.props.maps.forEach((map) => {
      if (map.name && !mapsArray.some((item) => item.name === map.name)) {
        const options = {
          minZoom: 10,
          maxZoom: 13,
          bounds: [map.from, map.to],
        };
        mapsArray.push({ name: map.name, status: 0, options });
      }
    });
    await this.setState({ maps: mapsArray });
    this.initMapDownload();
  };
  componentDidUpdate(prevProps) {
    // if user logs in
    if (!prevProps.user.token && this.props.user.token) {
      this.syncSurveys();
    }
    // deprecated - start syncing families once surveys are synced
    // start syncing projects once surveys are synced
    if (!prevProps.sync.surveys && this.props.sync.surveys) {
      //this.syncFamilies();
      this.syncProjects();
    }
    // start syncing intervention definition once projects are synced
    if (!prevProps.sync.projects && this.props.sync.projects) {
      this.syncInterventionDefinition();
    }

    // start syncing families once intervention definition is synced
    if (!prevProps.sync.projects && this.props.sync.projects && this.props.sync.interventionDefinition) {
      this.syncFamilies();
    }

    if ((!prevProps.maps.length && this.props.maps.length) 
    || (this.props.maps.length && !this.state.maps.length && !this.props.sync.maps)) {
      this.downloadMaps();
    }
    // if families are synced check for map data
    if (!prevProps.sync.families && this.props.sync.families) {
      this.checkOfflineMaps();
    }

    if (
     // this.props.surveys.length &&
      !this.props.offline.outbox.lenght &&
      this.state.mapsDownloaded &&
      this.state.maps.every((map) => map.status === 100) &&
      !this.state.cachingImages
    ) {
      this.setState({ cachingImages: true });
      this.props.setSyncedState('maps', true);
      this.handleImageCaching();
    }

    if (
    //  this.props.surveys.length &&
      !this.props.offline.outbox.lenght &&
      this.state.mapsDownloaded &&
      this.state.maps.every((map) => map.status === 100) &&
      this.state.cachingImages &&
      (!!this.props.sync.images.total &&
        this.props.sync.images.total === this.props.sync.images.synced) &&
      !this.state.cachingAudios
    ) {
      this.setState({ cachingAudios: true });
      //this.props.setSyncedState('images', true);
      this.handleAudioCaching();
    }

    // if everything is synced navigate to home
    if (
      !!this.props.sync.images.total &&
      prevProps.sync.images.total !== prevProps.sync.images.synced &&
      this.props.sync.images.total === this.props.sync.images.synced &&
      this.state.maps.every((map) => map.status === 100) &&
      this.props.downloadMapsAndImages.downloadAudios == false
    ) {
      this.props.navigation.navigate('DrawerStack');
    }

    if (this.state.maps.every((map) => map.status === 100) &&
      this.props.sync.audios.total != null &&
      prevProps.sync.audios.total !== prevProps.sync.audios.synced &&
      this.props.sync.audios.total === this.props.sync.audios.synced && this.props.downloadMapsAndImages.downloadImages == false) {
      this.props.navigation.navigate('DrawerStack');
    }

    if (this.state.maps.every((map) => map.status === 100) &&
      this.props.sync.audios.total != null &&
      this.props.sync.audios.total === this.props.sync.audios.synced &&
      !!this.props.sync.images.total &&
      ((prevProps.sync.images.total !== prevProps.sync.images.synced) || ((prevProps.sync.audios.total !== prevProps.sync.audios.synced))) &&
      this.props.sync.images.total === this.props.sync.images.synced && this.props.downloadMapsAndImages.downloadImages && this.props.downloadMapsAndImages.downloadAudios
    ) {
      this.props.navigation.navigate('DrawerStack');
    }



    // if there is a map download error
    if (!prevProps.sync.mapsError && this.props.sync.mapsError) {
      //in case of error we dont show the error... we just skip the maps.
      this.setState({
        mapsDownloaded: true,
        downloadingMap: false,
      });
    }
    // if there is a download error
    if (!prevProps.sync.familiesError && this.props.sync.familiesError) {
      this.showError('We seem to have a problem downloading your families.');
    }

    if (!prevProps.sync.surveysError && this.props.sync.surveysError) {
      this.showError('We seem to have a problem downloading your surveys.');
    }

    if (!prevProps.sync.projectsError && this.props.sync.projectsError) {
      this.showError('We seem to have a problem downloading your projects.');
    }

    if(!prevProps.sync.interventionDefinitionError && this.props.sync.interventionDefinitionError){
      this.showError('We seem to have a problem downloading your intervention definition')
    }
  }

  render() {
    const { sync, families, surveys, projects, interventionDefinition, t } = this.props;

    const {
      syncingServerData,
      cachingImages,
      cachingAudios,
      downloadingMap,
      mapsDownloaded,
      error,
      maps,
      currentMapName,
      mapPercent,
    } = this.state;
    return (
      <AndroidBackHandler onBackPress={() => true}>
        {!error ? (
          <View style={[globalStyles.container, styles.view]}>
            <Decoration variation="loading" />
            <View style={styles.loadingContainer}>
              <Text
                style={[
                  globalStyles.h3,
                  {
                    marginBottom: 34,
                    color: colors.dark,
                    fontSize: 17,
                  },
                ]}>
                {t('views.loading.weArePreparingTheApp')}
              </Text>

              {syncingServerData && (
                <View style={styles.sync} testID="syncing-surveys">
                  <View style={styles.syncingItem}>
                    <Text
                      style={
                        sync.surveys ? styles.colorGreen : styles.colorDark
                      }>
                      {sync.surveys
                        ? `${surveys.length} ${t(
                          'views.loading.surveysCached',
                        )}`
                        : t('views.loading.downloadingSurveys')}
                    </Text>
                    {sync.surveys ? (
                      <Icon name="check" color={colors.palegreen} size={23} />
                    ) : (
                        <ActivityIndicator
                          size="small"
                          color={colors.palegreen}
                        />
                      )}
                  </View>

                  {sync.surveys && (
                    <View style={styles.syncingItem}>

                      {sync.projects && Array.isArray(projects) && projects.length > 0
                        && (<><Text
                          style={
                            sync.projects ? styles.colorGreen : styles.colorDark
                          }>{`${projects.length} ${t('views.loading.projectsCached')}`}</Text>
                          <Icon
                            name="check"
                            color={colors.palegreen}
                            size={23}
                          /></>)
                      }
                    </View>
                  )}

                
                  {!sync.projects ? (
                    <Text style={styles.colorDark}>{t('views.families')}</Text>
                  ) : null}
                  {sync.projects && (
                    <View style={styles.syncingItem}>
                      <Text
                        style={
                          sync.families ? styles.colorGreen : styles.colorDark
                        }>
                        {sync.families
                          ? `${families.length} ${t(
                            'views.loading.familiesCached',
                          )}`
                          : t('views.loading.downloadingFamilies')}
                      </Text>
                      {sync.families ? (
                        <Icon name="check" color={colors.palegreen} size={23} />
                      ) : (
                          <ActivityIndicator
                            size="small"
                            color={colors.palegreen}
                          />
                        )}
                    </View>
                  )}

                  {(mapsDownloaded || downloadingMap) && (
                    <View>
                      {((!downloadingMap && this.existMaps()) || (downloadingMap && !mapsDownloaded)) && (
                        <>
                          <View style={styles.syncingItem}>

                            <Text
                              style={
                                !downloadingMap
                                  ? styles.colorGreen
                                  : styles.colorDark
                              }>
                              {!downloadingMap && this.existMaps()
                                && t('views.loading.mapsCached')}

                              {downloadingMap && !mapsDownloaded && this.existMaps()
                                && t('views.loading.mapsDownloading')}

                            </Text>

                            {downloadingMap && this.existMaps() && (
                              <Text
                                style={styles.colorDark}>
                                {`${maps.filter((item) => item.status === 100).length
                                  }/${maps.length}`}</Text>
                            )}

                            {!downloadingMap && this.existMaps() && (
                              <Icon
                                name="check"
                                color={colors.palegreen}
                                size={23}
                              />
                            )}
                          </View>

                          {downloadingMap && this.existMaps() && (
                            <>
                              <View style={styles.syncingItem}>
                                <Text>{currentMapName}</Text>
                                <Text>{`${Math.floor(mapPercent)}%`}</Text>
                              </View>
                              <View>
                                <ProgressBar
                                  removePadding
                                  hideBorder
                                  progress={mapPercent / 100}
                                />
                              </View>
                            </>
                          )}

                        </>
                      )}
                    </View>
                  )}
                  {!cachingImages ? (
                    <Text style={styles.colorDark}>
                      {t('views.loading.images')}
                    </Text>
                  ) : null}

                  {cachingImages && (
                    <View>
                      {sync.images.synced && sync.images.total ? (
                        <React.Fragment>
                          <View style={styles.syncingItem}>
                            <Text
                              style={
                                sync.images.synced / sync.images.total === 1
                                  ? styles.colorGreen
                                  : styles.colorDark
                              }>
                              {t('views.loading.images')}
                            </Text>
                            <Text
                              style={
                                sync.images.synced / sync.images.total === 1
                                  ? styles.colorGreen
                                  : styles.colorDark
                              }>
                              {`${Math.floor(
                                (sync.images.synced / sync.images.total) * 100,
                              )}%`}
                            </Text>
                          </View>
                          <View
                            style={
                              sync.images.synced / sync.images.total === 1
                                ? { display: 'none' }
                                : {}
                            }>
                            <ProgressBar
                              removePadding
                              hideBorder
                              progress={sync.images.synced / sync.images.total}
                            />
                          </View>
                        </React.Fragment>
                      ) : (
                          <Text
                            style={{
                              color: colors.dark,
                              fontSize: 14,
                              marginBottom: 5,
                            }}>
                            {t('views.loading.calcilatingTotalImages')}.
                          </Text>
                        )}
                    </View>
                  )}

                  {cachingAudios && (
                    <View>
                      {sync.audios.synced && sync.audios.total ? (
                        <React.Fragment>
                          <View style={styles.syncingItem}>
                            <Text
                              style={
                                sync.audios.synced / sync.audios.total === 1
                                  ? styles.colorGreen
                                  : styles.colorDark
                              }>
                              {t('views.loading.audios')}

                            </Text>
                            <Text
                              style={
                                sync.audios.synced / sync.audios.total === 1
                                  ? styles.colorGreen
                                  : styles.colorDark
                              }>
                              {`${Math.floor(
                                (sync.audios.synced / sync.audios.total) * 100,
                              )}%`}
                            </Text>
                          </View>
                          <View
                            style={
                              sync.audios.synced / sync.audios.total === 1
                                ? { display: 'none' }
                                : {}
                            }>
                            <ProgressBar
                              removePadding
                              hideBorder
                              progress={sync.audios.synced / sync.audios.total}
                            />
                          </View>
                        </React.Fragment>
                      ) : (
                          <Text
                            style={{
                              color: colors.dark,
                              fontSize: 14,
                              marginBottom: 5,
                            }}>
                            {t('views.loading.calculatingTotalAudios')}.

                          </Text>
                        )}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : (
            <View style={[globalStyles.container, styles.view]}>
              <View style={styles.loadingContainer}>
                <CommunityIcon
                  name="emoticon-sad-outline"
                  color={colors.palered}
                  size={60}
                />
                <Text style={[globalStyles.h1, { color: colors.palered }]}>
                  Hmm…
              </Text>
                <Text style={[globalStyles.h2, { textAlign: 'center' }]}>
                  {error}
                </Text>
                <Button
                  outlined
                  text="Retry"
                  style={{ paddingHorizontal: 30, marginTop: 30 }}
                  borderColor={colors.palered}
                  handleClick={this.reload}
                />
              </View>
            </View>
          )}
      </AndroidBackHandler>
    );
  }
}

Loading.propTypes = {
  loadFamilies: PropTypes.func.isRequired,
  loadSurveys: PropTypes.func.isRequired,
  loadProjectsByOrganization: PropTypes.func.isRequired,
  loadMaps: PropTypes.func.isRequired,
  logout: PropTypes.func,
  resetSyncState: PropTypes.func,
  setAppVersion: PropTypes.func,
  setSyncedState: PropTypes.func,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  user: PropTypes.object.isRequired,
  sync: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  surveys: PropTypes.array.isRequired,
  families: PropTypes.array.isRequired,
  maps: PropTypes.array.isRequired,
  offline: PropTypes.object.isRequired,
  downloadMapsAndImages: PropTypes.object,
  hydration: PropTypes.bool.isRequired,
  t: PropTypes.func,
};

const styles = StyleSheet.create({
  syncingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
  },
  loadingContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDark: {
    color: colors.dark,
    fontSize: 17,
    marginBottom: 5,
  },
  colorGreen: {
    color: colors.palegreen,
    fontSize: 17,
    marginBottom: 5,
  },
  sync: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
});

export const mapStateToProps = ({
  sync,
  surveys,
  env,
  user,
  offline,
  families,
  projects,
  maps,
  hydration,
  downloadMapsAndImages,
}) => ({
  sync,
  surveys,
  env,
  user,
  offline,
  families,
  projects,
  maps,
  hydration,
  downloadMapsAndImages,
});

const mapDispatchToProps = {
  loadFamilies,
  loadSurveys,
  loadProjectsByOrganization,
  loadInterventionDefinition,
  loadMaps,
  logout,
  setAppVersion,
  resetSyncState,
  setSyncedState,
  validate,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Loading),
);
