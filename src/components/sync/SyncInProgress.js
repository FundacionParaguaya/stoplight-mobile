import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {ProgressBar} from '@react-native-community/progress-bar-android'
import PropTypes from 'prop-types'
import colors from '../../theme.json'
import globalStyles from '../../globalStyles'
import i18n from '../../i18n'
import { withNamespaces } from 'react-i18next'

export class SyncInProgress extends Component {
  initalNumOfDraftsPending = this.props.initial

  render() {
    
    let currentNumOfDraftsPending =
      this.initalNumOfDraftsPending - this.props.pendingDraftsLength
     
    return (
      <View style={styles.view}>
        <Text style={globalStyles.h3}>{i18n.t('views.sync.inProgress')}</Text>
        <ProgressBar
          styleAttr="Horizontal"
          style={{ width: '100%', marginVertical: 20 }}
          color={colors.red}
          indeterminate={false}
          progress={currentNumOfDraftsPending / this.initalNumOfDraftsPending}
        />
        <Text style={globalStyles.p}>
          {`${currentNumOfDraftsPending} ${i18n.t('views.sync.of')} ${
            this.initalNumOfDraftsPending
          } ${i18n.t('views.sync.updates')}`}
        </Text>
      </View>
    )
  }
}

SyncInProgress.propTypes = {
  pendingDraftsLength: PropTypes.number.isRequired
}
const styles = StyleSheet.create({
  view: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight:80,
    paddingVertical: 25,
  }
})

export default withNamespaces()(SyncInProgress)
