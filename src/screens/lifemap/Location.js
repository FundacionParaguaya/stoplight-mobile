import React, { Component } from 'react'
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity
} from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import MapView from 'react-native-maps'
import { withNamespaces } from 'react-i18next'

import { addSurveyData } from '../../redux/actions'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import globalStyles from '../../globalStyles'
import colors from '../../theme.json'
import SearchBar from '../../components/SearchBar'
import Select from '../../components/Select'
import marker from '../../../assets/images/marker.png'
import center from '../../../assets/images/centerMap.png'

export class Location extends Component {
  state = {
    latitude: null,
    longitude: null,
    accuracy: null,
    searchAddress: '',
    errorsDetected: [],
    mapsError: false,
    mapReady: false,
    centeringMap: false
  }
  addSurveyData = (text, field) => {
    this.props.addSurveyData(
      this.props.navigation.getParam('draftId'),
      'familyData',
      {
        [field]: text
      }
    )
  }
  getFieldValue = (draft, field) => {
    if (!draft) {
      return
    }
    return draft.familyData[field]
  }
  getDeviceLocation = () => {
    this.setState({
      centeringMap: true
    })
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          centeringMap: false,
          mapReady: false,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      error => {
        // if error, try getting position after timeout
        if (error.code === 2) {
          setTimeout(() => {
            this.getDeviceLocation()
          }, 5000)
        } else if (error.code === 3) {
          setTimeout(() => {
            this.getDeviceLocation()
          }, 30000)
        }

        this.setState({ centeringMap: false, mapsError: error.code })
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 1000,
        distanceFilter: 1000
      }
    )
  }
  detectError = (error, field) => {
    if (error && !this.state.errorsDetected.includes(field)) {
      this.setState({ errorsDetected: [...this.state.errorsDetected, field] })
    } else if (!error) {
      this.setState({
        errorsDetected: this.state.errorsDetected.filter(item => item !== field)
      })
    }
  }

  searcForAddress = () => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.searchAddress.replace(
        ' ',
        '+'
      )}&key=AIzaSyBLGYYy86_7QPT-dKgUnFMIJyhUE6AGVwM`
    )
      .then(r =>
        r
          .json()
          .then(res =>
            this.setState({
              latitude: res.results[0].geometry.location.lat,
              longitude: res.results[0].geometry.location.lng
            })
          )
          .catch()
      )
      .catch()
  }
  onDragMap = region => {
    if (!this.state.mapReady) {
      return this.setState({
        mapReady: true
      })
    }

    const { latitude, longitude } = region

    this.setState({
      latitude,
      longitude,
      accuracy: 0
    })
  }
  getDraft = () =>
    this.props.drafts.filter(
      draft => draft.draftId === this.props.navigation.getParam('draftId')
    )[0]
  componentDidMount() {
    const draft = this.getDraft()

    if (!this.getFieldValue(draft, 'latitude')) {
      this.getDeviceLocation()
    } else {
      this.setState({
        latitude: this.getFieldValue(draft, 'latitude'),
        longitude: this.getFieldValue(draft, 'longitude')
      })
    }
  }
  handleClick = () => {
    this.addSurveyData(this.state.latitude, 'latitude')
    this.addSurveyData(this.state.longitude, 'longitude')
    this.addSurveyData(this.state.accuracy, 'accuracy')

    this.props.navigation.navigate('SocioEconomicQuestion', {
      draftId: this.props.navigation.getParam('draftId'),
      survey: this.props.navigation.getParam('survey')
    })
  }
  render() {
    const { t } = this.props
    const {
      mapsError,
      latitude,
      longitude,
      accuracy,
      searchAddress,
      errorsDetected,
      centeringMap
    } = this.state

    const draft = this.getDraft()

    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}
      >
        {latitude ? (
          <View>
            <View pointerEvents="none" style={styles.fakeMarker}>
              <Image source={marker} />
            </View>
            <SearchBar
              id="searchAddress"
              style={styles.search}
              placeholder={t('views.family.searchByStreetOrPostalCode')}
              onChangeText={searchAddress => this.setState({ searchAddress })}
              onSubmit={this.searcForAddress}
              value={searchAddress}
            />
            <MapView
              style={styles.map}
              region={{
                latitude,
                longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
              }}
              onRegionChangeComplete={this.onDragMap}
            />
            {centeringMap ? (
              <ActivityIndicator
                style={styles.center}
                size={54}
                color={colors.palegreen}
              />
            ) : (
              <TouchableOpacity
                id="centerMap"
                style={styles.center}
                onPress={this.getDeviceLocation}
              >
                <Image source={center} style={{ width: 21, height: 21 }} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.placeholder, styles.map]}>
            <ActivityIndicator
              style={styles.spinner}
              size={80}
              color={colors.palered}
            />
            {!mapsError ? (
              <Text style={globalStyles.h2}>
                {t('views.family.gettingYourLocation')}
              </Text>
            ) : (
              <View>
                <Text style={[globalStyles.h2, styles.centerText]}>Hmmm!</Text>
                <Text style={[styles.errorMsg, styles.centerText]}>
                  {mapsError === 2
                    ? t('views.family.somethingIsNotWorking')
                    : t('views.family.cannotFindLocation')}
                </Text>
                <Text style={[styles.errorSubMsg, styles.centerText]}>
                  {mapsError === 2
                    ? t('views.family.checkLocationServicesTurnedOn')
                    : t('views.family.giveDetailInTheFormBelow')}
                </Text>
              </View>
            )}
          </View>
        )}

        <View>
          <Text id="accuracy" style={styles.container}>
            {accuracy
              ? `${t('views.family.gpsAccurate').replace(
                  '%n',
                  Math.round(accuracy)
                )}`
              : ' '}
          </Text>
          <Select
            id="countrySelect"
            required
            onChange={this.addSurveyData}
            label={t('views.family.country')}
            countrySelect
            placeholder={t('views.family.selectACountry')}
            field="country"
            value={
              this.getFieldValue(draft, 'country') ||
              draft.familyData.familyMembersList[0].countryOfBirth
            }
            detectError={this.detectError}
          />
          <TextInput
            id="postalCode"
            onChangeText={this.addSurveyData}
            field="postalCode"
            value={this.getFieldValue(draft, 'postalCode') || ''}
            placeholder={t('views.family.postcode')}
            detectError={this.detectError}
          />
          <TextInput
            id="houseDescription"
            onChangeText={this.addSurveyData}
            field="houseDescription"
            value={this.getFieldValue(draft, 'houseDescription') || ''}
            placeholder={t('views.family.streetOrHouseDescription')}
            validation="long-string"
            detectError={this.detectError}
            multiline
          />
        </View>
        <View style={{ marginTop: 15 }}>
          <Button
            id="continue"
            disabled={!!errorsDetected.length}
            colored
            text={t('general.continue')}
            handleClick={this.handleClick}
          />
        </View>
      </ScrollView>
    )
  }
}

Location.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  drafts: PropTypes.array
}

const mapDispatchToProps = {
  addSurveyData
}

const mapStateToProps = ({ drafts }) => ({
  drafts
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
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    paddingHorizontal: 16
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
    zIndex: 2,
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
  centerText: {
    textAlign: 'center'
  },
  errorMsg: {
    marginTop: 15,
    color: colors.palegrey
  },
  errorSubMsg: {
    marginTop: 20,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: colors.palered
  }
})
