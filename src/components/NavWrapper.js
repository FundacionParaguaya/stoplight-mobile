import React, { Component } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getHydrationState } from '../redux/store'
import { LoginStack, AppStack } from './navigation'
import Loading from './Loading'
import colors from '../theme.json'

export class NavWrapper extends Component {
  state = {
    loadingTime: 'ok',
    rehydrated: false
  }
  slowLoadingTimer
  checkHydrationTimer
  clearTimers = () => {
    clearTimeout(this.slowLoadingTimer)
    this.slowLoadingTimer = null
    clearTimeout(this.checkHydrationTimer)
    this.checkHydrationTimer = null
  }
  checkHydration = () => {
    if (getHydrationState() === false) {
      this.checkHydrationTimer = setTimeout(() => {
        this.checkHydration()
      }, 1000)
    } else {
      this.clearTimers()
      this.setState({
        rehydrated: true
      })
    }
  }
  detectSlowLoading = () => {
    this.slowLoadingTimer = setTimeout(
      () => this.setState({ loadingTime: 'slow' }),
      15000
    )
  }
  componentDidMount() {
    this.checkHydration()
    this.detectSlowLoading()
  }
  componentWillUnmount = () => {
    this.clearTimers()
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.palebeige} barStyle="dark-content" />
        {this.state.rehydrated ? (
          <View style={styles.container}>
            {this.props.user.token ? <AppStack /> : <LoginStack />}
          </View>
        ) : (
          <Loading time={this.state.loadingTime} />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

NavWrapper.propTypes = {
  user: PropTypes.object
}

const mapStateToProps = ({ user }) => ({
  user
})

export default connect(mapStateToProps)(NavWrapper)
