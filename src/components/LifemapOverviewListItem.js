import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Text, StyleSheet, View} from 'react-native';
import ListItem from './ListItem';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import {withNamespaces} from 'react-i18next';

import colors from '../theme.json';
import globalStyles from '../globalStyles';

class LifemapOverviewListItem extends Component {
  defineColor = (value) => {
    switch (value) {
      case 1:
        return colors.red;
      case 2:
        return colors.gold;
      case 3:
        return colors.palegreen;
      case 0:
        return colors.palegrey;

      default:
        return colors.palegrey;
    }
  };

  defineAccessibilityTextForColor = (value) => {
    switch (value) {
      case 1:
        return 'red';
      case 2:
        return 'yellow';
      case 3:
        return 'green';
      case 0:
        return 'grey';

      default:
        return 'grey';
    }
  };

  render() {
    const {t, pendingPrioritySync, errorPrioritySync} = this.props;
    const disabledButton = this.props.draftOverview
      ? !this.props.color
      : (!this.props.achievement && !this.props.priority) ||
        this.props.readOnly;

    return (
      <ListItem
        onPress={this.props.handleClick}
        style={styles.container}
        disabled={disabledButton}>
        {this.props.isRetake ? (
          <View style={{marginRight: -21}}>
            <View
              style={{
                backgroundColor: this.defineColor(this.props.previousColor),
                height: 30,
                width: 30,
                borderRadius: 30,
                marginRight: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {this.props.previousAchievement ? (
                <View style={{
                  ...styles.blueIconPrev,
                    //backgroundColor: colors.blue,
                    color:colors.white,
                    width: 17,
                    height: 17,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                  <Icon
                    name="stars"
                    color={colors.blue}
                    size={15}
                   
                  />
                </View>
              ) : (
                <View />
              )}
              {this.props.previousPriority ? (
                <View
                  style={{
                    ...styles.blueIconPrev,
                    backgroundColor: colors.blue,
                    borderWidth:2,
                    width: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Icon2 name="pin" color={colors.white} size={8} />
                </View>
              ) : (
                <View />
              )}
            </View>
          </View>
        ) : null}
        <View>
          {this.props.achievement ? (
            <Icon
              name="stars"
              color={colors.blue}
              size={20}
              style={{
                ...styles.blueIcon,
                width: 20,
                height: 20,
                zIndex: 15,
              }}
            />
          ) : (
            <View />
          )}
          {this.props.priority ? (
            <View
              style={{
                ...styles.blueIcon,
                backgroundColor: colors.blue,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 15,
              }}>
              <Icon2 name="pin" color={colors.white} size={12} />
            </View>
          ) : (
            <View />
          )}
          {pendingPrioritySync || errorPrioritySync ? (
            <View
              style={{
                ...styles.blueIcon,
                backgroundColor: colors.grey,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 15,
              }}>
              <Icon2 name="pin" color={colors.white} size={12} />
            </View>
          ) : (
            <View />
          )}
          <View
            style={[
              styles.ball,
              {
                backgroundColor: this.defineColor(this.props.color),
              },
            ]}
          />
        </View>
        <View style={[styles.listItem, styles.borderBottom]}>
          <View>
            <Text
              style={{...globalStyles.p}}
              accessibilityLabel={this.props.name}
              accessibilityHint={this.defineAccessibilityTextForColor(
                this.props.color,
              )}>
              {this.props.name}
            </Text>
            {errorPrioritySync && (
              <Text style={styles.errorLabel}>
                {t('views.family.priorityError')}
              </Text>
            )}
            {pendingPrioritySync && (
              <Text style={styles.pendingLabel}>
                {t('views.family.priorityPending')}
              </Text>
            )}
          </View>

          {!disabledButton ? (
            <Icon name="navigate-next" size={23} color={colors.lightdark} />
          ) : (
            <View />
          )}
        </View>
      </ListItem>
    );
  }
}

LifemapOverviewListItem.propTypes = {
  name: PropTypes.string.isRequired,
  achievement: PropTypes.bool,
  priority: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  color: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired,
  draftOverview: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 20,
    maxWidth: '100%',
  },
  listItem: {
    height: 95,
    paddingTop: 25,
    paddingBottom: 25,
    paddingRight: 25,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  borderBottom: {
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1,
  },
  blueIconPrev: {
    borderRadius: 17,
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderWidth: 0.5,
    zIndex: 10,
  },
  ball: {
    marginRight: 15,
    zIndex: 10,
    borderWidth: 3,
    borderColor: 'white',
    borderStyle: 'solid',
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  blueIcon: {
    position: 'absolute',
    right: 15,
    borderRadius: 11,
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderWidth: 2,
    zIndex: 10,
  },
  pendingLabel: {
    marginTop: 5,
    backgroundColor: colors.grey,
    paddingHorizontal: 10,
    marginHorizontal: 2,
    borderRadius: 10,
    color: 'white',
    alignSelf: 'flex-start',
  },
  errorLabel: {
    marginTop: 5,
    backgroundColor: colors.red,
    paddingHorizontal: 10,
    marginHorizontal: 2,
    borderRadius: 10,
    color: 'white',
    alignSelf: 'flex-start',
  },
});

export default withNamespaces()(LifemapOverviewListItem);
