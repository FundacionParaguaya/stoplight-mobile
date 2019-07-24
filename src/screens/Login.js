import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  ScrollView,
  Text,
  TextInput,
  Image,
  StyleSheet,
  View,
  Dimensions,
  AppState
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'
import { CheckBox } from 'react-native-elements'
import NetInfo from '@react-native-community/netinfo'
import {
  setEnv,
  login,
  setDimensions,
  setDownloadMapsAndImages
} from '../redux/actions'
import logo from '../../assets/images/logo.png'
import { url } from '../config'
import globalStyles from '../globalStyles'
import colors from '../theme.json'
import Button from '../components/Button'
import InternalStorageFullModal, {
  MINIMUM_REQUIRED_STORAGE_SPACE_500_MB
} from './modals/InternalStorageFullModal'

// get env
const nodeEnv = process.env

export class Login extends Component {
  unsubscribeNetChange
  state = {
    username: '',
    password: '',
    error: false,
    connection: false,
    loading: false,
    syncMaps: true,
    syncImages: true,
    appState: AppState.currentState,
    notEnoughStorageSpace: false
  }
  componentDidMount() {
    // if use has logged in navigate to Loading
    if (this.props.user.token) {
      this.props.navigation.navigate('Loading')
    } else {
      AppState.addEventListener('change', this.handleAppStateChange)
      this.setDimensions()

      // check connection
      NetInfo.fetch().then(state =>
        this.setConnectivityState(state.isConnected)
      )
      this.unsubscribeNetChange = NetInfo.addEventListener(state => {
        this.setConnectivityState(state.isConnected)
      })
    }
  }

  setConnectivityState = isConnected => {
    if (isConnected !== this.state.connection) {
      isConnected
        ? this.setState({ connection: true, error: '' })
        : this.setState({ connection: false, error: 'No connection' })
    }
  }

  setDimensions = () => {
    const { width, height, scale } = this.props.dimensions
    const screenDimensions = Dimensions.get('window')

    if (
      width !== screenDimensions.width ||
      height !== screenDimensions.height ||
      scale !== screenDimensions.scale
    ) {
      this.props.setDimensions({
        height: screenDimensions.height,
        width: screenDimensions.width,
        scale: screenDimensions.scale
      })
    }
  }

  checkDevOption = devProp => {
    this.setState({
      [devProp]: !this.state[devProp]
    })
  }

  onLogin = () => {
    if (!this.isStorageSpaceEnough()) {
      this.setState({ notEnoughStorageSpace: true })
      return
    }

    this.setState({
      loading: true
    })
    this.props.setDownloadMapsAndImages({
      downloadMaps: this.state.syncMaps,
      downloadImages: this.state.syncImages
    })
    let env = this.state.username.trim() === 'demo' ? 'demo' : 'production'
    let username = this.state.username.trim()
    let envCheck = this.state.username.trim().substring(0, 2)

    if (envCheck === 't/' || envCheck === 'd/' || envCheck === 'p/') {
      if (envCheck === 't/') {
        env = 'testing'
      } else if (envCheck === 'd/') {
        env = 'demo'
      } else if (envCheck === 'p/') {
        env = 'production'
      }

      username = this.state.username
        .trim()
        .substring(2, this.state.username.trim().length)
    }

    this.props.setEnv(env)
    this.props.login(username, this.state.password, url[env]).then(() => {
      if (this.props.user.status === 401) {
        this.setState({
          loading: false
        })
        this.setState({ error: 'Wrong username or password' })
      } else {
        this.setState({
          loading: false,
          error: false
        })
        this.props.navigation.navigate('Loading')
      }
    })
  }

  handleAppStateChange = nextAppState =>
    this.setState({ appState: nextAppState })

  isStorageSpaceEnough = () => {
    return (
      DeviceInfo.getFreeDiskStorage() > MINIMUM_REQUIRED_STORAGE_SPACE_500_MB
    )
  }

  retryLogIn = () => this.setState({ notEnoughStorageSpace: false })

  componentWillUnmount() {
    if (this.unsubscribeNetChange) {
      this.unsubscribeNetChange()
    }
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  render() {
    return (
      <View key={this.state.appState} style={globalStyles.container}>
        <ScrollView style={globalStyles.content}>
          {this.state.notEnoughStorageSpace && !this.state.error ? (
            <InternalStorageFullModal
              retryLogIn={this.retryLogIn}
              isOpen={!!this.state.notEnoughStorageSpace}
            />
          ) : (
            <View>
              <Image style={styles.logo} source={logo} />
              <Text style={globalStyles.h1}>Welcome back!</Text>
              <Text
                style={{
                  ...globalStyles.h4,
                  marginBottom: 64,
                  color: colors.lightdark
                }}
              >
                Let&lsquo;s get started...
              </Text>
              <View
                style={{
                  width: '100%',
                  maxWidth: 400,
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                <Text style={globalStyles.h5}>USERNAME</Text>
              </View>
              <TextInput
                id="username"
                testID="username-input"
                autoCapitalize="none"
                style={{
                  ...styles.input,
                  borderColor: this.state.error ? colors.red : colors.palegreen
                }}
                onChangeText={username => this.setState({ username })}
              />
              <View
                style={{
                  width: '100%',
                  maxWidth: 400,
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                <Text style={globalStyles.h5}>PASSWORD</Text>
              </View>

              <TextInput
                id="password"
                testID="password-input"
                secureTextEntry
                autoCapitalize="none"
                style={{
                  ...styles.input,
                  borderColor: this.state.error ? colors.red : colors.palegreen,
                  marginBottom: this.state.error ? 0 : 25
                }}
                onChangeText={password => this.setState({ password })}
              />
              {this.state.error ? (
                <Text
                  id="error-message"
                  style={{ ...globalStyles.tag, ...styles.error }}
                >
                  {this.state.error}
                </Text>
              ) : (
                <View />
              )}
              {this.state.loading ? (
                <Button
                  style={{
                    maxWidth: 400,
                    width: '100%',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                  id="login-button"
                  handleClick={() => this.onLogin()}
                  text="Logging in ..."
                  disabled={true}
                  colored
                />
              ) : (
                <Button
                  style={{
                    maxWidth: 400,
                    width: '100%',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                  id="login-button"
                  testID="login-button"
                  handleClick={() => this.onLogin()}
                  text="Login"
                  colored
                  disabled={this.state.error === 'No connection' ? true : false}
                />
              )}
              {nodeEnv.NODE_ENV === 'development' && (
                <View style={{ marginTop: 20 }}>
                  <Text>Dev options</Text>
                  <CheckBox
                    containerStyle={styles.checkbox}
                    onPress={() => this.checkDevOption('syncMaps')}
                    title="Sync maps?"
                    checked={this.state.syncMaps}
                    textStyle={{ fontWeight: 'normal' }}
                  />
                  <CheckBox
                    containerStyle={styles.checkbox}
                    onPress={() => this.checkDevOption('syncImages')}
                    title="Sync images?"
                    checked={this.state.syncImages}
                    textStyle={{ fontWeight: 'normal' }}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}

Login.propTypes = {
  setEnv: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  setDimensions: PropTypes.func.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  navigation: PropTypes.object.isRequired,
  dimensions: PropTypes.object,
  setDownloadMapsAndImages: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  input: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 400,
    width: '100%',
    fontSize: 16,
    fontFamily: 'Roboto',
    borderWidth: 1,
    borderRadius: 2,
    height: 48,
    marginBottom: 25,
    padding: 15,
    paddingBottom: 12,
    color: colors.lightdark,
    backgroundColor: colors.white
  },
  checkbox: {
    marginLeft: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent'
  },
  logo: { width: 42, height: 42, marginBottom: 8 },
  error: { color: colors.red, lineHeight: 15, marginBottom: 10 }
})

const mapStateToProps = ({ env, user, dimensions }) => ({
  env,
  user,
  dimensions
})

const mapDispatchToProps = {
  setEnv,
  login,
  setDimensions,
  setDownloadMapsAndImages
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
