import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  ScrollView,
  Text,
  TextInput,
  Image,
  StyleSheet,
  View,
  Dimensions
} from 'react-native'
import { connect } from 'react-redux'
import { CheckBox } from 'react-native-elements'
import NetInfo from '@react-native-community/netinfo'
import { setEnv, login, setDimensions } from '../redux/actions'
import logo from '../../assets/images/logo.png'
import { url } from '../config'
import globalStyles from '../globalStyles'
import colors from '../theme.json'
import Button from '../components/Button'

// get env
const nodeEnv = process.env

export class Login extends Component {
  unsubscribeNetChange
  state = {
    username: '',
    password: '',
    error: false,
    connection: false,
    preparingScreen: true,
    loading: false,
    syncMaps: true,
    syncImages: true
  }
  componentDidMount() {
    this.setDimensions()
    NetInfo.fetch().then(state => {
      if (state.isConnected && this.props.user.token) {
        this.props.navigation.navigate('Loading')
      }

      this.setConnectivityState(state.isConnected)
      this.setState({
        preparingScreen: false
      })
    })
    this.unsubscribeNetChange = NetInfo.addEventListener(state => {
      this.setConnectivityState(state.isConnected)
    })
  }

  setConnectivityState = isConnected => {
    if (isConnected) {
      this.setState({ connection: true, error: '' })
    } else {
      this.setState({ connection: false, error: 'No connection' })
    }
  }

  setDimensions = () => {
    this.props.setDimensions({
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
      scale: Dimensions.get('window').scale
    })
  }

  checkDevOption = devProp => {
    this.setState({
      [devProp]: !this.state[devProp]
    })
  }

  onLogin = () => {
    this.setState({
      loading: true
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
        const { syncMaps, syncImages } = this.state
        this.setState({
          loading: false,
          error: false
        })
        this.props.navigation.navigate('Loading', { syncMaps, syncImages })
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscribeNetChange) {
      this.unsubscribeNetChange()
    }
  }

  render() {
    return !this.state.preparingScreen ? (
      <View style={globalStyles.container}>
        <ScrollView style={globalStyles.content}>
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
          <Text style={globalStyles.h5}>USERNAME</Text>
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
          <Text style={globalStyles.h5}>PASSWORD</Text>
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
            <React.Fragment>
              <Button
                id="login-button"
                handleClick={() => this.onLogin()}
                text="Logging in ..."
                disabled={true}
                colored
              />
            </React.Fragment>
          ) : (
            <Button
              id="login-button"
              testID="login-button"
              handleClick={() => this.onLogin()}
              text="Login"
              colored
              disabled={this.state.error === 'No connection' ? true : false}
            />
          )}
          {this.props.navigation.getParam('syncError') ? (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.error}>
                {this.props.navigation.getParam('syncError')}
              </Text>
            </View>
          ) : null}
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
        </ScrollView>
      </View>
    ) : (
      <View />
    )
  }
}

Login.propTypes = {
  setEnv: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  setDimensions: PropTypes.func.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  navigation: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  input: {
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

const mapStateToProps = ({ env, user }) => ({
  env,
  user
})

const mapDispatchToProps = {
  setEnv,
  login,
  setDimensions
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
