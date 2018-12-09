import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import colors from '../theme.json'

class Button extends Component {
  defineButtonStyle() {
    if (this.props.disabled) {
      return styles.disabled
    }
    if (this.props.colored) {
      return styles.colored
    }
    if (this.props.outlined) {
      return styles.outlined
    }
    return styles.transparent
  }

  render() {
    const { style, borderColor, disabled, colored, outlined } = this.props
    return (
      <TouchableOpacity
        style={[
          styles.buttonStyle,
          colored && styles.colored,
          disabled && styles.disabled,
          outlined && styles.outlined,
          !colored && !disabled && !outlined && styles.transparent,
          style,
          outlined && borderColor
            ? {
                borderColor
              }
            : { borderColor: colors.palegreen }
        ]}
        onPress={this.props.handleClick}
        disabled={this.props.disabled}
      >
        {this.props.icon && (
          <Icon
            name={this.props.icon}
            size={21}
            color={colors.palegreen}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.buttonText,
            outlined && borderColor
              ? {
                  color: borderColor
                }
              : this.props.colored
              ? styles.whiteText
              : styles.greenText,

            this.props.underlined ? styles.underlined : {}
          ]}
        >
          {this.props.text}
        </Text>
      </TouchableOpacity>
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
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object
}

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
    height: 48,
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
    fontSize: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    padding: 15
  },
  transparent: {
    backgroundColor: colors.palebeige
  },
  disabled: {
    backgroundColor: colors.palegrey
  },
  greenText: {
    color: colors.palegreen,
    fontSize: 14
  },
  whiteText: {
    color: colors.white,
    fontSize: 18
  },
  icon: {
    marginBottom: 4
  }
})

export default Button
