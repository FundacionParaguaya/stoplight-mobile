import {Image, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import React, {Component} from 'react';
import {interventions, priorities} from '../redux/reducer';

import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import colors from '../theme.json';
import {connect} from 'react-redux';

export class IconButtonComponent extends Component {
  state = {
    pressed: false,
  };
  togglePressedState = (pressed) => {
    this.setState({
      pressed,
    });
  };
  render() {
    const {
      icon,
      communityIcon,
      text,
      imageSource,
      badge,
      offline,
      drafts,
      accessible,
      accessibilityLabel,
      interventions,
      priorities
    } = this.props;
    const syncErrors = drafts
      ? drafts.some((draft) => draft.status === 'Sync error') ||
        interventions.some(
          (intervention) => intervention.status == 'Sync Error',
        ) ||
        (priorities.some( priority => priority.status == 'Sync Error'))
      : null;

    const syncAvailable =
      drafts.filter(
        (draft) =>
          draft.status === 'Pending sync' || draft.status === 'Pending images',
      ).length +
      offline.outbox.filter((item) => item.type === 'SUBMIT_PRIORITY').length +
      interventions.filter((i) => i.status === 'Pending Status').length;

    return (
      <TouchableHighlight
        onPress={this.props.onPress}
        underlayColor={'transparent'}
        onHideUnderlay={() => this.togglePressedState(false)}
        onShowUnderlay={() => this.togglePressedState(true)}>
        <View style={this.props.style}>
          <View style={{position: 'relative'}}>
            {icon && (
              <Icon
                name={icon}
                style={this.props.iconStyle || {}}
                size={this.props.size || 30}
                color={this.state.pressed ? colors.palegreen : colors.palegreen}
                accessible={accessible}
                accessibilityLabel={accessibilityLabel}
              />
            )}
            {icon && !text && badge && (syncAvailable > 0 || syncErrors) ? (
              <View style={styles.badgePoint} />
            ) : null}
          </View>

          {communityIcon && (
            <CommunityIcon
              name={communityIcon}
              style={this.props.iconStyle || {}}
              size={this.props.size || 30}
              color={this.state.pressed ? colors.palegreen : colors.palegreen}
            />
          )}
          {imageSource && <Image source={imageSource} />}
          {text && (
            <Text
              style={[
                this.props.textStyle,
                text && !icon && !communityIcon
                  ? {}
                  : {
                      color: this.state.pressed
                        ? colors.palegreen
                        : colors.palegreen,
                    },
              ]}
              accessible={accessible}
              accessibilityLabel={accessibilityLabel}>
              {text}
            </Text>
          )}
          {icon && text && badge && (syncAvailable > 0 || syncErrors) ? (
            <Text style={styles.badge}>
              {!syncErrors ? syncAvailable : '!'}
            </Text>
          ) : null}
        </View>
      </TouchableHighlight>
    );
  }
}

IconButtonComponent.propTypes = {
  style: PropTypes.object,
  iconStyle: PropTypes.object,
  icon: PropTypes.string,
  communityIcon: PropTypes.string,
  size: PropTypes.number,
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string,
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  imageSource: PropTypes.number,
  badge: PropTypes.bool,
  drafts: PropTypes.array,
  interventions: PropTypes.array,
  priorities: PropTypes.array,
  offline: PropTypes.object.isRequired,
  accessible: PropTypes.bool,
  accessibilityLabel: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

const styles = StyleSheet.create({
  badge: {
    width: 32,
    height: 32,
    lineHeight: 32,
    borderRadius: 32 / 2,
    marginLeft: 20,
    marginTop: -5,
    backgroundColor: colors.palered,
    textAlign: 'center',
    color: '#ffffff',
  },
  badgePoint: {
    width: 8,
    height: 8,
    borderRadius: 8 / 2,
    backgroundColor: colors.palered,
    position: 'absolute',
    top: 2,
    right: '50%',
  },
});

const mapStateToProps = ({offline, drafts, interventions,priorities}) => ({
  offline,
  drafts,
  interventions,
  priorities,

});

export default connect(mapStateToProps)(IconButtonComponent);
