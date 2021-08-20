import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ListItem from '../../components/ListItem'
import PropTypes from 'prop-types'
import colors from '../../theme.json'
import { getLocaleForLanguage } from '../../utils'
import globalStyles from '../../globalStyles'
import i18n from '../../i18n'
import moment from 'moment'

class SyncListItem extends Component {

  getColor = status => {
    switch (status) {
      case 'Draft':
        return colors.lightgrey
      case 'Synced':
        return colors.green
      case 'Pending sync':
        return colors.palegold
      case 'Pending images':
        return colors.palegold
      case 'Sync error':
        return colors.error
      case 'Sync images error':
        return colors.error
      default:
        return colors.palegrey
    }
  }

  setStatusTitle = status => {
    switch (status) {
      case 'Draft':
        return i18n.t('draftStatus.draft')
      case 'Synced':
        return i18n.t('draftStatus.completed')
      case 'Pending sync':
        return i18n.t('draftStatus.syncPending')
      case 'Pending images':
        return i18n.t('draftStatus.syncPendingImages')
      case 'Sync error':
        return i18n.t('draftStatus.syncError')
      case 'Sync images error':
        return i18n.t('draftStatus.syncImagesError')
      default:
        return ''
    }
  }

  capitalize = s => {
    if (typeof s !== 'string') return ''
    const string = s.split('.').join('')
    return string.charAt(0).toUpperCase() + string.slice(1)
  }



  render() {
    const { item, status, lng } = this.props
    const linkDisabled = status !== 'Sync error'
    const itemCreateDateWithLocale = moment(item.created);
    itemCreateDateWithLocale.locale(getLocaleForLanguage(lng))

    const name = item &&
        item.familyData &&
        item.familyData.familyMembersList &&
        item.familyData.familyMembersList[0]
        ? `${item.familyData.familyMembersList[0].firstName} ${item.familyData.familyMembersList[0].lastName}`
        : ' - '
    return (
      <View>
        <ListItem
          style={{ ...styles.listItem, ...styles.borderBottom }}
          onPress={this.props.handleClick}
          disabled={linkDisabled}
        >
          <View >
            <Text
              id="dateCreated"
              style={globalStyles.tag}
              accessibilityLabel={itemCreateDateWithLocale.format(
                'MMM DD, YYYY'
              )}
            >
              {this.capitalize(itemCreateDateWithLocale.format('MMM DD, YYYY'))}
            </Text>
            <Text id="fullName" style={globalStyles.p}>
                {name}
            </Text>
            <View
            style={styles.container}
          >
            {(item.status === 'Pending images' || item.status === 'Sync images error')
              && (
                <Text
                  id="status"
                  style={{
                    ...styles.label,
                    backgroundColor: colors.green,
                    color: colors.white
                  }}
                >
                  {i18n.t('draftStatus.dataSaved')}
                </Text>
              )}
            {item.status !== 'Synced' && (
              <Text
                id="status"
                style={{
                  ...styles.label,
                  backgroundColor: this.getColor(item.status),
                  color:
                    item.status === 'Pending sync' || item.status === 'Pending images'
                      ? colors.black
                      : colors.white
                }}
              >
                {this.setStatusTitle(item.status)}
              </Text>)}
          </View>
          </View>
        </ListItem>
      </View>
    )
  }
}

SyncListItem.propTypes = {
  item: PropTypes.object.isRequired,
  status: PropTypes.string.isRequired,
  errors: PropTypes.array,
  handleClick: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
 
  view: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 20
  },
  listItem: {
    minHeight: 80,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 25,
  },
  container: { flexDirection: 'row', alignItems: 'center' },
  borderBottom: {
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1
  },
  icon: { transform: [{ rotate: '90deg' }], marginRight: 10 },
  label: {
    color: colors.lightdark,
    borderRadius: 5,
    minWidth: 100,
    paddingLeft: 5,
    paddingRight: 5,
    height: 25,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 5
  },
  pendingSync: {
    backgroundColor: colors.palered,
    color: colors.white
  },
  error: {
    backgroundColor: colors.palered,
    color: colors.white
  },
  label: {
    borderRadius: 5,
    alignSelf: 'flex-start',
    minWidth: 120,
    height: 25,
    paddingLeft: 5,
    paddingRight: 5,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 5,
    marginRight: 5
  },
})

export default SyncListItem
