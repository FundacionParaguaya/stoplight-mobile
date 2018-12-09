import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Picker, StyleSheet, View, Text } from 'react-native'
import { FormValidationMessage } from 'react-native-elements'
import countries from 'localized-countries'

import colors from '../theme.json'
import globalStyles from '../globalStyles'
import i18n from '../i18n'

const countryList = countries(require('localized-countries/data/en'))

class Select extends Component {
  state = {
    status: 'edited',
    errorMsg: null
  }
  handleError(errorMsg) {
    this.props.detectError(true, this.props.field)
    this.props.onChange('', this.props.field)
    this.setState({
      errorMsg
    })
  }

  validateInput = value => {
    if (this.props.required && !value) {
      this.handleError(i18n.t('validation.fieldIsRequired'))
    } else {
      this.props.onChange(value, this.props.field)
      this.setState({
        status: 'edited',
        errorMsg: null
      })
      this.props.field ? this.props.detectError(false, this.props.field) : ''
    }
  }

  render() {
    const { errorMsg } = this.state
    return (
      <View>
        <Text
          numberOfLines={2}
          style={this.props.value ? styles.label : styles.labelNoValue}
        >
          {`${this.props.label} ${this.props.required ? '*' : ''}`}
        </Text>
        <View
          style={[
            styles.container,
            errorMsg ? styles.error : '',
            this.props.value ? styles.active : ''
          ]}
        >
          <Picker
            prompt={this.props.placeholder}
            style={styles.dropdown}
            onValueChange={value => this.validateInput(value)}
            selectedValue={this.props.value}
          >
            <Picker.Item style={styles.item} label={''} value={''} />

            {this.props.countrySelect
              ? countryList
                  .array()
                  .map(country => (
                    <Picker.Item
                      key={country.code}
                      label={country.label}
                      value={country.code}
                      color={colors.grey}
                    />
                  ))
              : this.props.data.map(item => (
                  <Picker.Item
                    key={item}
                    label={item.text}
                    value={item.value}
                    color={colors.grey}
                  />
                ))}
          </Picker>
        </View>
        {!!errorMsg && (
          <FormValidationMessage style={{ color: colors.red }}>
            {errorMsg}
          </FormValidationMessage>
        )}
      </View>
    )
  }
}

Select.propTypes = {
  onChange: PropTypes.func.isRequired,
  data: PropTypes.array,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  placeholder: PropTypes.string.isRequired,
  field: PropTypes.string,
  countrySelect: PropTypes.bool,
  required: PropTypes.bool,
  detectError: PropTypes.func
}

export default Select

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    backgroundColor: colors.beige
  },
  active: {
    backgroundColor: colors.palebeige,
    borderBottomColor: colors.grey
  },
  dropdown: {
    height: 60,
    paddingTop: 10
  },
  label: {
    ...globalStyles.subline,
    paddingHorizontal: 30,
    marginTop: 25,
    marginBottom: -25,
    color: colors.palegrey,
    zIndex: 100
  },
  labelNoValue: {
    ...globalStyles.subline,
    zIndex: 100,
    paddingHorizontal: 30,
    fontSize: 14,
    marginTop: 40,
    marginBottom: -40,
    color: colors.grey
  },
  item: {
    backgroundColor: colors.red
  },
  error: {
    backgroundColor: colors.white,
    borderBottomColor: colors.red
  }
})
