import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native'
import Decoration from '../components/decoration/Decoration'
import { connect } from 'react-redux'
import { Sentry } from 'react-native-sentry'
import ProgressBar from '../components/ProgressBar'
import NetInfo from '@react-native-community/netinfo'
import MapboxGL from '@mapbox/react-native-mapbox-gl'
import Icon from 'react-native-vector-icons/MaterialIcons'
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AndroidBackHandler } from 'react-navigation-backhandler'
import DeviceInfo from 'react-native-device-info'
import {
  loadFamilies,
  loadSurveys,
  logout,
  setAppVersion,
  resetSyncState,
  setSyncedState
} from '../redux/actions'
import Button from '../components/Button'
import colors from '../theme.json'
import globalStyles from '../globalStyles'
import { url } from '../config'
import { initImageCaching } from '../cache'

const nodeEnv = process.env

export class Loading extends Component {
  state = {
    syncingServerData: false, // know when to show that data is synced
    cachingImages: false,
    downloadingMap: false,
    currentMapName: '',
    mapPercent: 0,
    maps: [],
    error: null
  }

  // STEP 1 - cache the surveys
  syncSurveys = resync => {
    // mark that loading has stated to show the progress
    this.setState({
      syncingServerData: true
    })

    // if surveys are synced skip to syncing families
    if (!resync && this.props.sync.surveys) {
      this.syncFamilies()
    } else {
      this.props.loadSurveys(url[this.props.env], this.props.user.token)
    }
  }

  // STEP 2 - cache the families
  syncFamilies = () => {
    // if families are synced skip to caching images
    if (this.props.sync.families) {
      this.checkOfflineMaps()
    } else {
      this.props.loadFamilies(url[this.props.env], this.props.user.token)
    }
  }

  isSurveyInSynced = title =>
    this.props.surveys.some(survey => survey.title && survey.title === title)

  downloadOfflineMapPack = map => {
    MapboxGL.offlineManager.getPack(map.name).then(pack => {
      // if pack exists delete it and re-download it
      if (pack) {
        MapboxGL.offlineManager.deletePack(map.name).then(() => {
          MapboxGL.offlineManager.createPack(
            {
              name: map.name,
              styleURL: MapboxGL.StyleURL.Street,
              ...map.options
            },
            this.onMapDownloadProgress,
            this.onMapDownloadError
          )
        })
      } else {
        MapboxGL.offlineManager.createPack(
          {
            name: map.name,
            styleURL: MapboxGL.StyleURL.Street,
            ...map.options
          },
          this.onMapDownloadProgress,
          this.onMapDownloadError
        )
      }
    })
  }

  // STEP 3 - check and cache the offline maps
  checkOfflineMaps = () => {
    if (
      (typeof this.props.navigation.getParam('syncMaps') !== 'undefined' &&
        !this.props.downloadMapsAndImages.downloadMaps) ||
      this.props.sync.maps
    ) {
      return this.handleImageCaching()
    }

    const mapsArray = []

    const surveysWithOfflineMaps = this.props.surveys.filter(
      survey => survey.surveyConfig.offlineMaps
    )

    if (surveysWithOfflineMaps) {
      surveysWithOfflineMaps.forEach(survey => {
        survey.surveyConfig.offlineMaps.forEach(map => {
          if (map.name && !mapsArray.some(item => item.name === map.name)) {
            const options = {
              minZoom: 10,
              maxZoom: 13,
              bounds: [map.from, map.to]
            }
            mapsArray.push({ name: map.name, status: 0, options })
          }
        })
      })

      this.setState({ maps: mapsArray }, this.initMapDownload)
    } else {
      this.handleImageCaching()
    }

    this.setState({
      downloadingMap: true
    })
  }

  // update map download progress
  onMapDownloadProgress = (offlineRegion, offlineRegionStatus) => {
    if (offlineRegionStatus.name !== this.state.currentMapName) {
      this.setState({
        currentMapName: offlineRegionStatus.name
      })
    }

    if (offlineRegionStatus.percentage === 100) {
      this.setState({
        maps: this.state.maps.map(map => {
          if (map.name === offlineRegionStatus.name) {
            return {
              ...map,
              status: 100
            }
          } else {
            return map
          }
        }),
        mapPercent: 100
      })

      this.initMapDownload()
    } else {
      this.setState({
        mapPercent: Math.trunc(offlineRegionStatus.percentage)
      })
    }
  }

  onMapDownloadError = (offlineRegion, mapDownloadError) => {
    if (mapDownloadError.message !== 'No Internet connection available.') {
      NetInfo.fetch().then(state => {
        Sentry.setExtraContext({
          mapDownloadError: mapDownloadError
        })

        Sentry.captureBreadcrumb({
          message: 'Map download error',
          category: 'action',
          data: {
            error: mapDownloadError.message,
            isOnline: state.isConnected,
            sync: this.props.sync
          }
        })
        Sentry.captureException('Map download error')
      })
    }
  }

  // STEP 4 - cache the survey indicator images
  handleImageCaching = () => {
    if (
      (typeof this.props.navigation.getParam('syncImages') !== 'undefined' &&
        !this.props.downloadMapsAndImages.downloadImages) ||
      (!!this.props.sync.images.total &&
        this.props.sync.images.total === this.props.sync.images.synced)
    ) {
      this.props.navigation.navigate('DrawerStack')
    } else {
      this.setState({
        cachingImages: true
      })
      initImageCaching()
    }
  }

  reload = () => {
    this.setState({
      syncingServerData: false, // know when to show that data is synced
      cachingImages: false,
      downloadingMap: false,
      maps: [],
      error: null
    })
    this.props.resetSyncState()
    setTimeout(() => {
      this.checkState()
    }, 500)
  }

  showError(msg) {
    this.setState({
      error: msg
    })
  }
  getDataPercentages = () => {
    let mapAllPercentage = 0
    let mapAllNames = []
    let mapAllNumber = 0
    this.state.maps.map(map => {
      let mapPercentageForNow = map.status || 0
      if (mapAllNames.length === this.state.maps.length - 1) {
        mapAllNumber = mapAllNumber + mapPercentageForNow
        mapAllPercentage = mapAllNumber / this.state.maps.length
      } else {
        mapAllNames.push(map.name)
        mapAllNumber = mapAllNumber + mapPercentageForNow
      }
    })
    if (isNaN(mapAllPercentage) && mapAllPercentage !== 100) {
      return 0
    } else {
      return mapAllPercentage
    }
  }
  initMapDownload() {
    const { maps } = this.state
    if (maps.length && maps.some(map => map.status !== 100)) {
      this.downloadOfflineMapPack(maps.find(map => map.status !== 100))
    } else {
      this.handleImageCaching()
    }
  }

  checkState() {
    // setup sentry context
    Sentry.setTagsContext({
      environment: nodeEnv.NODE_ENV
    })

    Sentry.setUserContext({
      username: this.props.user.username,
      extra: {
        env: this.props.env
      }
    })

    // check connection state
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        this.showError('There seems to be a problem with your connetion.')
      }
    })

    const { families, surveys, images, appVersion, maps } = this.props.sync

    if (!this.props.user.token) {
      // if user hasn't logged in, navigate to login
      this.props.navigation.navigate('Login')
    } else if (!appVersion || appVersion !== DeviceInfo.getVersion()) {
      // if there is no app version in store or version has changed
      // clear sync state and sync again
      this.props.resetSyncState()
      this.props.setAppVersion(DeviceInfo.getVersion())
      this.syncSurveys('re-sync')
    } else if (
      families &&
      surveys &&
      maps &&
      !!images.total &&
      images.total === images.synced
    ) {
      // if everything is synced navigate to Dashboard
      this.props.navigation.navigate('DrawerStack')
    } else {
      this.syncSurveys()
    }
  }

  componentDidMount() {
    this.checkState()
  }

  componentDidUpdate(prevProps) {
    // if user logs in
    if (!prevProps.user.token && this.props.user.token) {
      this.syncSurveys()
    }

    // start syncing families once surveys are synced
    if (!prevProps.sync.surveys && this.props.sync.surveys) {
      this.syncFamilies()
    }

    // if families are synced check for map data
    if (!prevProps.sync.families && this.props.sync.families) {
      this.checkOfflineMaps()
    }

    if (
      this.props.surveys.length &&
      !this.props.offline.outbox.lenght &&
      this.state.downloadingMap &&
      this.state.maps.every(map => map.status === 100) &&
      !this.state.cachingImages
    ) {
      this.setState({ cachingImages: true })
      this.props.setSyncedState('maps', true)
      this.handleImageCaching()
    }

    // if everything is synced navigate to home
    if (
      !!this.props.sync.images.total &&
      prevProps.sync.images.total !== prevProps.sync.images.synced &&
      this.props.sync.images.total === this.props.sync.images.synced &&
      this.state.maps.every(map => map.status === 100)
    ) {
      this.props.navigation.navigate('DrawerStack')
    }

    // if there is a download error
    if (!prevProps.sync.familiesError && this.props.sync.familiesError) {
      this.showError('We seem to have a problem downloading your families.')
    }

    if (!prevProps.sync.surveysError && this.props.sync.surveysError) {
      this.showError('We seem to have a problem downloading your surveys.')
    }
  }

  render() {
    const { sync, families, surveys } = this.props
    const {
      syncingServerData,
      cachingImages,
      downloadingMap,
      error,
      maps,
      currentMapName,
      mapPercent
    } = this.state

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
                    fontSize: 17
                  }
                ]}
              >
                We are preparing the app.
              </Text>

              {syncingServerData && (
                <View style={styles.sync} testID="syncing-surveys">
                  <View style={styles.syncingItem}>
                    <Text
                      style={
                        sync.surveys ? styles.colorGreen : styles.colorDark
                      }
                    >
                      {sync.surveys
                        ? `${surveys.length} Surveys cached`
                        : 'Downloading surveys...'}
                    </Text>
                    {sync.surveys ? (
                      <Icon name="check" color={colors.palegreen} size={23} />
                    ) : (
                      <ActivityIndicator size="small" />
                    )}
                  </View>
                  {!sync.surveys ? (
                    <Text style={styles.colorDark}>Families</Text>
                  ) : null}
                  {sync.surveys && (
                    <View style={styles.syncingItem}>
                      <Text
                        style={
                          sync.families ? styles.colorGreen : styles.colorDark
                        }
                      >
                        {sync.families
                          ? `${families.length} Families cached`
                          : 'Downloading families...'}
                      </Text>
                      {sync.families ? (
                        <Icon name="check" color={colors.palegreen} size={23} />
                      ) : (
                        <ActivityIndicator size="small" />
                      )}
                    </View>
                  )}

                  {downloadingMap || sync.maps ? (
                    <View>
                      <View style={styles.syncingItem}>
                        <Text
                          style={
                            sync.maps ? styles.colorGreen : styles.colorDark
                          }
                        >
                          {sync.maps ? 'Maps cached' : 'Downloading Maps...'}
                        </Text>
                        {!sync.maps ? (
                          <Text
                            style={
                              sync.maps ? styles.colorGreen : styles.colorDark
                            }
                          >{`${
                            maps.filter(item => item.status === 100).length
                          }/${maps.length}`}</Text>
                        ) : (
                          <Icon
                            name="check"
                            color={colors.palegreen}
                            size={23}
                          />
                        )}
                      </View>
                      {!sync.maps && (
                        <View style={styles.syncingItem}>
                          <Text>{currentMapName}</Text>
                          <Text>{`${Math.floor(mapPercent)}%`}</Text>
                        </View>
                      )}
                      <View style={sync.maps ? { display: 'none' } : {}}>
                        <ProgressBar
                          removePadding
                          hideBorder
                          progress={mapPercent / 100}
                        />
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.colorDark}>Offline Maps</Text>
                  )}
                  {!cachingImages ? (
                    <Text style={styles.colorDark}>Images</Text>
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
                              }
                            >
                              Images
                            </Text>
                            <Text
                              style={
                                sync.images.synced / sync.images.total === 1
                                  ? styles.colorGreen
                                  : styles.colorDark
                              }
                            >
                              {`${Math.floor(
                                (sync.images.synced / sync.images.total) * 100
                              )}%`}
                            </Text>
                          </View>
                          <View
                            style={
                              sync.images.synced / sync.images.total === 1
                                ? { display: 'none' }
                                : {}
                            }
                          >
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
                            marginBottom: 5
                          }}
                        >
                          Calculating total images to cache...
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
    )
  }
}

Loading.propTypes = {
  loadFamilies: PropTypes.func.isRequired,
  loadSurveys: PropTypes.func.isRequired,
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
  offline: PropTypes.object.isRequired,
  downloadMapsAndImages: PropTypes.object,
  hydration: PropTypes.bool.isRequired
}

const styles = StyleSheet.create({
  syncingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220
  },
  loadingContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorDark: {
    color: colors.dark,
    fontSize: 17,
    marginBottom: 5
  },
  colorGreen: {
    color: colors.palegreen,
    fontSize: 17,
    marginBottom: 5
  },
  sync: {
    alignItems: 'flex-start',
    marginTop: 10
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start'
  }
})

export const mapStateToProps = ({
  sync,
  surveys,
  env,
  user,
  offline,
  families,
  hydration,
  downloadMapsAndImages
}) => ({
  sync,
  surveys,
  env,
  user,
  offline,
  families,
  hydration,
  downloadMapsAndImages
})

const mapDispatchToProps = {
  loadFamilies,
  loadSurveys,
  logout,
  setAppVersion,
  resetSyncState,
  setSyncedState
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Loading)
