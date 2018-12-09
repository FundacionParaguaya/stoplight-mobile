import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  ScrollView,
  Text,
  TextInput,
  Image,
  StyleSheet,
  View,
  NetInfo
} from 'react-native'
import { connect } from 'react-redux'
import { setEnv, login } from '../redux/actions'
import logo from '../../assets/images/logo.png'
import { url } from '../config'
import globalStyles from '../globalStyles'
import colors from '../theme.json'
import Button from '../components/Button'
import Loading from '../components/Loading'

export class Login extends Component {
  state = {
    username: '',
    password: '',
    error: false,
    connection: false,
    loading: false
  }
  componentDidMount() {
    this.checkConnectivity().then(isConnected =>
      this.setConnectivityState(isConnected)
    )
    this.onConnectivityChange()
  }

  checkConnectivity = () => NetInfo.isConnected.fetch()

  setConnectivityState = isConnected =>
    isConnected
      ? this.setState({ connection: true })
      : this.setState({ connection: false, error: 'No connection' })

  onConnectivityChange = () => {
    NetInfo.addEventListener('connectionChange', () =>
      this.setState({
        connection: !this.state.connection,
        error: this.state.connection ? 'No connection' : false
      })
    )
  }

  componentDidUpdate() {
    if (this.state.username === 'demo') {
      this.props.setEnv('demo')
    } else if (this.state.username === 'life_survey_user') {
      this.props.setEnv('testing')
    } else this.props.setEnv('production')
  }

  onLogin = () => {
    this.setState({
      loading: true
    })

    this.props
      .login(this.state.username, this.state.password, url[this.props.env])
      .then(() => {
        if (this.props.user.status === 200) {
          this.setState({ error: false })
          this.props.navigation.navigate('Dashboard', {
            firstTimeVisitor: true
          })
        } else if (this.props.user.status === 401) {
          this.setState({
            loading: false
          })
          this.setState({ error: 'Wrong username or password' })
        }
      })
  }

  render() {
    return this.state.loading ? (
      <View style={globalStyles.container}>
        <Loading />
      </View>
    ) : (
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
            autoCapitalize="none"
            style={{
              ...styles.input,
              borderColor: this.state.error ? colors.red : colors.green
            }}
            onChangeText={username => this.setState({ username })}
          />
          <Text style={globalStyles.h5}>PASSWORD</Text>
          <TextInput
            id="password"
            secureTextEntry
            autoCapitalize="none"
            style={{
              ...styles.input,
              borderColor: this.state.error ? colors.red : colors.green,
              marginBottom: this.state.error ? 0 : 25
            }}
            onChangeText={password => this.setState({ password })}
          />
          {this.state.error && (
            <Text
              id="error-message"
              style={{ ...globalStyles.tag, ...styles.error }}
            >
              {this.state.error}
            </Text>
          )}
          <Button
            id="login-button"
            handleClick={() => this.onLogin()}
            text="Login"
            colored
            disabled={this.state.error === 'No connection' ? true : false}
          />
        </ScrollView>
      </View>
    )
  }
}

Login.propTypes = {
  setEnv: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
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
    color: colors.lightdark,
    backgroundColor: colors.white
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
  login
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
