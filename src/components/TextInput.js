import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet } from 'react-native'
import { FormInput, FormValidationMessage } from 'react-native-elements'
import colors from '../theme.json'
import validator from 'validator'
import globalStyles from '../globalStyles'
import i18n from '../i18n'
class TextInput extends Component {
  state = {
    status: this.props.value ? 'filled' : 'blur',
    text: this.props.value || '',
    errorMsg: null
  }

  onChangeText(text) {
    this.setState({ text })
  }

  onEndEditing = () => {
    this.props.onChangeText(this.state.text.trim(), this.props.field)
  }

  onFocus() {
    this.setState({
      status: 'active'
    })
  }

  onBlur() {
    const { text } = this.state

    this.setState({
      text: text.trim(),
      status: text ? 'filled' : 'blur'
    })
    this.props.validation || this.props.required
      ? this.validateInput(text.trim())
      : ''
  }

  handleError(errorMsg) {
    this.props.onChangeText('', this.props.field)
    this.props.detectError(true, this.props.field)
    this.setState({
      status: 'error',
      errorMsg
    })
  }

  validateInput(text) {
    if (this.props.required && !text) {
      return this.handleError(i18n.t('validation.fieldIsRequired'))
    }
    if (this.props.validation === 'long-string' && text.length > 250) {
      return this.handleError(i18n.t('validation.lessThan250Characters'))
    }
    if (this.props.validation !== 'long-string' && text.length > 50) {
      return this.handleError(i18n.t('validation.lessThan50Characters'))
    }
    if (
      this.props.validation === 'email' &&
      !validator.isEmail(text) &&
      !validator.isEmpty(text)
    ) {
      return this.handleError(i18n.t('validation.validEmailAddress'))
    }

    if (
      this.props.validation === 'string' &&
      !/^[a-zA-Z\u0080-\uFFFF]([\w -]*[a-zA-Z\u0080-\uFFFF])?$/.test(text) &&
      !validator.isEmpty(text)
    ) {
      return this.handleError(i18n.t('validation.alphabeticCharacters'))
    }
    if (
      this.props.validation === 'phoneNumber' &&
      !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(text) &&
      !validator.isEmpty(text)
    ) {
      return this.handleError(i18n.t('validation.validPhoneNumber'))
    }
    if (
      this.props.validation === 'number' &&
      !validator.isNumeric(text) &&
      !validator.isEmpty(text)
    ) {
      return this.handleError(i18n.t('validation.validNumber'))
    }

    this.props.detectError(false, this.props.field)
  }

  defineTextColor = status => {
    switch (status) {
      case 'active':
        return colors.green
      case 'blur':
        return colors.palegrey
      case 'error':
        return colors.red
      default:
        return colors.palegrey
    }
  }

  componentDidMount() {
    // on mount validate empty required fields without showing an errors message
    if (this.props.required && !this.props.value) {
      this.props.detectError(true, this.props.field)
    }
  }

  render() {
    const { text, errorMsg } = this.state
    const { label, placeholder, required, readonly, multiline } = this.props
    const status = this.props.status || this.state.status

    let showPlaceholder = status === 'blur' && !text

    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.container, styles[status]]}>
          {!showPlaceholder && (
            <Text
              style={{
                ...styles.text,
                color: this.defineTextColor(status)
              }}
            >
              {`${placeholder} ${required ? '*' : ''}`}
              {'\n'}
            </Text>
          )}
          <FormInput
            autoCapitalize="none"
            onFocus={() => this.onFocus()}
            onBlur={() => this.onBlur(text)}
            placeholder={
              showPlaceholder ? `${placeholder} ${required ? '*' : ''}` : ''
            }
            onChangeText={text => this.onChangeText(text)}
            onEndEditing={this.onEndEditing}
            inputStyle={[
              styles.inputStyle,
              !showPlaceholder ? styles.activeInput : {}
            ]}
            editable={!readonly}
            multiline={multiline}
          >
            <Text style={{ fontSize: 14, margin: 10 }}>{text}</Text>
          </FormInput>
        </View>
        {status === 'error' && errorMsg && (
          <FormValidationMessage style={{ color: colors.red }}>
            {errorMsg}
          </FormValidationMessage>
        )}
      </View>
    )
  }
}

/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  container: {
    color: colors.grey,
    borderBottomWidth: 1,
    marginHorizontal: 15,
    justifyContent: 'center',
    minHeight: 60
  },
  label: {
    paddingHorizontal: 15,
    paddingVertical: 10,

    ...globalStyles.subline
  },
  inputStyle: {
    marginVertical: 0,
    marginLeft: -4,
    width: '100%',
    fontSize: 14
  },
  activeInput: {
    marginTop: -25
  },
  blur: {
    backgroundColor: colors.beige,
    borderBottomColor: colors.grey
  },
  filled: {
    backgroundColor: colors.palebeige,
    borderBottomColor: colors.grey
  },
  active: {
    backgroundColor: colors.white,
    borderBottomColor: colors.green
  },
  error: {
    backgroundColor: colors.white,
    borderBottomColor: colors.red
  },
  text: {
    marginLeft: 15,
    zIndex: 100
  }
})

TextInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  field: PropTypes.string,
  required: PropTypes.bool,
  readonly: PropTypes.bool,
  onChangeText: PropTypes.func.isRequired,
  multiline: PropTypes.bool,
  validation: PropTypes.oneOf([
    'email',
    'string',
    'phoneNumber',
    'number',
    'long-string'
  ]),
  status: PropTypes.oneOf(['blur', 'error', 'active', 'filled']),
  detectError: PropTypes.func
}

export default TextInput
