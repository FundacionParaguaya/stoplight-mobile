import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import React, { Component } from 'react'

import CommunityIcon from 'react-native-vector-icons/FontAwesome'
import Icon from 'react-native-vector-icons/MaterialIcons'
import PropTypes from 'prop-types'
import colors from '../theme.json'

class Button extends Component {
  state = {
    pressed: false
  }

  togglePressedState = () => {
    this.setState({
      pressed: !this.state.pressed
    })
  }

  render() {
    const {
      borderColor,
      disabled,
      colored,
      outlined,
      icon,
      communityIcon,
      handleClick,
      underlined,
      text,
      style,
      testID,
      loading
    } = this.props

    const { pressed } = this.state

    return (
      <TouchableHighlight
        testID={testID}
        style={[
          styles.buttonStyle,
          !colored && !disabled && !loading && !outlined && styles.transparent,
          style,
          ['colored', 'disabled', 'outlined', 'loading'].map(item =>
            this.props[item] ? styles[item] : {}
          ),
          {
            borderColor:
              outlined && borderColor ? borderColor : colors.palegreen
          },
          pressed &&
            !colored &&
            !underlined && {
              borderColor:
                !borderColor || borderColor === colors.palegreen
                  ? colors.palegreen
                  : borderColor === colors.palered
                  ? colors.red
                  : colors.lightdark
            }
        ]}
        underlayColor={colored ? colors.palegreen : colors.white}
        activeOpacity={1}
        onPress={handleClick}
        disabled={disabled || loading}
        onHideUnderlay={this.togglePressedState}
        onShowUnderlay={this.togglePressedState}
        accessibilityRole="button"
        accessibilityLabel={text}
        accessibilityHint={disabled || loading ? 'disabled' : ''}
      >
        <View style={{ flexDirection: 'row' }}>
          {communityIcon && !loading && (
            <CommunityIcon
              name={communityIcon}
              size={21}
              color={colors.palegreen}
              style={styles.icon}
            />
          )}
          {icon && !loading ? (
            <Icon
              name={icon}
              size={21}
              color={pressed ? colors.palegreen : colors.palegreen}
              style={styles.icon}
            />
          ) : (
            <View />
          )}
          {loading && (
            <ActivityIndicator
              size="small"
              color={outlined ? colors.palegreen : colors.white}
              style={{ marginRight: 10 }}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              outlined && borderColor
                ? {
                    color: borderColor
                  }
                : colored
                ? styles.whiteText
                : styles.greenText,
              underlined ? styles.underlined : {},
              pressed &&
                !colored && {
                  color:
                    !borderColor || borderColor === colors.palegreen
                      ? colors.palegreen
                      : borderColor === colors.palered
                      ? colors.red
                      : colors.lightdark
                },
              this.props.style && this.props.style['backgroundColor']
                ? styles.whiteText
                : null
            ]}
          >
            {text}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  borderColor: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
  colored: PropTypes.bool,
  underlined: PropTypes.bool,
  outlined: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.string,
  communityIcon: PropTypes.string,
  testID: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object
}

/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  buttonText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '600'
      },
      android: {
        fontFamily: 'Poppins SemiBold'
      }
    })
  },
  buttonStyle: {
    borderRadius: 2,
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  underlined: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: colors.palegreen
  },
  colored: {
    backgroundColor: colors.palegreen
  },
  outlined: {
    flex: 0,
    borderRadius: 4,
    borderWidth: 1.5,
    padding: 15
  },
  transparent: {
    backgroundColor: colors.white
  },
  disabled: {
    backgroundColor: colors.palegrey
  },
  loading: {
    backgroundColor: colors.palegrey
  },
  greenText: {
    color: colors.palegreen,
    fontSize: 18
  },
  whiteText: {
    color: colors.white,
    fontSize: 18
  },
  icon: {
    marginBottom: 4,
    marginRight: 10
  }
})

export default Button
