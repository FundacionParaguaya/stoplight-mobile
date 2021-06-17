import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Button from '../Button'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import PropTypes from 'prop-types'
import colors from '../../theme.json'
import globalStyles from '../../globalStyles'
import i18n from '../../i18n'
import { withNamespaces } from 'react-i18next'

export class SyncRetry extends Component {

  setMeesage(type,withError) {
    if(type ==='priority' && withError === 1) {
      return i18n.t('views.sync.priorityHasError').replace('%n', withError)
    }else if(type ==='intervention' && withError === 1){
      return i18n.t('views.sync.interventionHasError').replace('%n', withError)
    }else if(type ==='intervention' && withError !== 1){
      return i18n.t('views.sync.interventionsHasError').replace('%n', withError)
    }else if(type ==='priority' && withError !== 1){
      return i18n.t('views.sync.prioritiesHaveError').replace('%n', withError)
    }
  }

  
  render() {
    const { withError, retrySubmit, type } = this.props
    return (
      <View style={[styles.view, styles.borderBottom]}>
        <Text style={globalStyles.h3}>
          {i18n.t('views.sync.syncErrProblem')}
        </Text>
        <Icon
          style={styles.icon}
          name="exclamation"
          size={60}
          color={colors.palered}
        />
        <View style={styles.buttonWrapper}>
          <Button
            id="retry"
            style={styles.button}
            text={i18n.t('views.sync.retry')}
            handleClick={retrySubmit}
          />
        </View>
        <Text style={globalStyles.p}>
          {this.setMeesage(type, withError)}
        </Text>
      </View>
    )
  }
}

SyncRetry.propTypes = {
  withError: PropTypes.number.isRequired,
  retrySubmit: PropTypes.func.isRequired
}
const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.palered
  },
  view: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20
  },
  borderBottom: {
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1
  },
  icon: {
    paddingVertical: 20
  },
  buttonWrapper: {
    height: 50,
    alignSelf: 'stretch',
    marginBottom: 10,
    alignItems: 'center'
  }
})

export default withNamespaces()(SyncRetry)
