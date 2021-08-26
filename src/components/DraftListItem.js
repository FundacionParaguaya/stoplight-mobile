import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React, {Component} from 'react';

import Icon from 'react-native-vector-icons/MaterialIcons';
import ListItem from './ListItem';
import PropTypes from 'prop-types';
import colors from '../theme.json';
import {getLocaleForLanguage} from '../utils';
import globalStyles from '../globalStyles';
import i18n from '../i18n';
import moment from 'moment';

class DraftListItem extends Component {
  getColor = status => {
    switch (status) {
      case 'Draft':
        return colors.darkgrey;
      case 'Synced':
        return colors.green;
      case 'Pending sync':
        return colors.palegold;
      case 'Pending images':
        return colors.palegold;
      case 'Sync error':
        return colors.error;
      case 'Sync images error':
        return colors.error;
      default:
        return colors.palegrey;
    }
  };

  setStatusTitle = status => {
    switch (status) {
      case 'Draft':
        return i18n.t('draftStatus.draft');
      case 'Synced':
        return i18n.t('draftStatus.completed');
      case 'Pending sync':
        return i18n.t('draftStatus.syncPending');
      case 'Pending images':
        return i18n.t('draftStatus.syncPendingImages');
      case 'Sync error':
        return i18n.t('draftStatus.syncError');
      case 'Sync images error':
        return i18n.t('draftStatus.syncImagesError');
      default:
        return '';
    }
  };

  capitalize = s => {
    if (typeof s !== 'string') return '';
    const string = s.split('.').join('');
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  handleClick = () => {
    this.props.handleClick(this.props.item);
  };

  readyToSyncDraft = item =>
    item.status === 'Pending sync' || item.status === 'Sync error';

  readyToSyncImages = item =>
    item.status === 'Pending images' || item.status === 'Sync images error';

  render() {
    const {
      item,
      lng,
      handleSyncDraft,
      handleSyncImages,
      selectedDraftId,
      selectedImagesId,
      isConnected,
      disabled,
    } = this.props;
    const itemCreateDateWithLocale = moment(item.created);
    itemCreateDateWithLocale.locale(getLocaleForLanguage(lng));

    const name =
      item &&
      item.familyData &&
      item.familyData.familyMembersList &&
      item.familyData.familyMembersList[0]
        ? `${item.familyData.familyMembersList[0].firstName} ${item.familyData.familyMembersList[0].lastName}`
        : ' - ';

    const loading =
      selectedDraftId == item.draftId || selectedImagesId == item.draftId;
    const disableSyncDraft =
      !!selectedDraftId && selectedDraftId != item.draftId;
    const disableSyncImages =
      !!selectedImagesId && selectedImagesId != item.draftId;

    return (
      <ListItem
        style={{...styles.listItem, ...styles.borderBottom}}
        onPress={this.handleClick}
        disabled={this.props.user.role == 'ROLE_SURVEY_TAKER' ? true : false}>
        <View style={{maxWidth: '80%'}}>
          <Text
            id="dateCreated"
            style={globalStyles.tag}
            accessibilityLabel={itemCreateDateWithLocale.format(
              'MMMM DD, YYYY',
            )}>
            {this.capitalize(itemCreateDateWithLocale.format('MMM DD, YYYY'))}
          </Text>
          <Text id="fullName" style={globalStyles.p}>
            {name}
          </Text>
          <View style={styles.container}>
            {(item.status === 'Pending images' ||
              item.status === 'Sync images error') && (
              <View
                style={{
                  ...styles.label,
                  backgroundColor: colors.green,
                }}>
                <Text
                  id="status"
                  style={{
                    
                    color: colors.white,
                  }}>
                  {i18n.t('draftStatus.dataSaved')}
                </Text>
              </View>
            )}
            {item.status !== 'Synced' ? (
              <View
                style={{
                  ...styles.label,
                  backgroundColor: this.getColor(item.status),
                }}>
                <Text
                  id="status"
                  style={{
                    color:
                      item.status === 'Pending sync' ||
                      item.status === 'Pending images'
                        ? colors.black
                        : colors.white,
                  }}>
                  {this.setStatusTitle(item.status)}
                </Text>
              </View>
            ) : (
              <View style={{...styles.container, marginTop: 10}}>
                <Icon name="check" size={20} color={colors.green} />
                <Text id="completed" style={{color: colors.green}}>
                  {i18n.t('draftStatus.completed')}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          {this.readyToSyncDraft(item) && !loading && isConnected && (
            <Icon
              name="file-upload"
              size={25}
              style={styles.iconContainer}
              onPress={() => handleSyncDraft(item)}
              disabled={disableSyncDraft || disabled}
              color={
                disableSyncDraft || disabled
                  ? colors.lightgrey
                  : colors.lightdark
              }
            />
          )}
          {this.readyToSyncImages(item) && !loading && isConnected && (
            <Icon
              name="cloud-upload"
              size={25}
              style={styles.iconContainer}
              onPress={() => handleSyncImages(item)}
              disabled={disableSyncImages || disabled}
              color={
                disableSyncImages || disabled
                  ? colors.lightgrey
                  : colors.lightdark
              }
            />
          )}
          {loading && (
            <ActivityIndicator
              style={styles.iconContainer}
              size="small"
              color={colors.lightdark}
            />
          )}
        </View>
      </ListItem>
    );
  }
}

DraftListItem.propTypes = {
  item: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
  lng: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  listItem: {
    minHeight: 40,
    paddingVertical: 25,
    paddingLeft: 25,
    paddingRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  borderBottom: {
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1,
  },
  label: {
    borderRadius: 5,
    //alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 25,
    paddingLeft: 5,
    paddingRight: 5,
    marginTop: 5,
    marginRight: 5,
    minWidth: 120,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonsContainer: {
    paddingBottom: 12,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: 30,
  },
  iconContainer: {
    paddingLeft: 20,
    paddingRight: 15,
  },
});

export default DraftListItem;
