import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TouchableHighlight, StyleSheet, View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import colors from '../theme.json'

class Checkbox extends Component {
  state = { checked: false }

  onIconPress = () => {
    this.props.onIconPress(!this.state.checked)
    this.setState({ checked: !this.state.checked })
  }

  componentDidMount() {
    if (
      typeof this.props.value !== 'undefined' &&
      this.props.value !== null &&
      this.props.codeName !== 'undefined' &&
      this.props.codeName !== null
    ) {
      this.props.multipleValue.forEach(e => {
        if (e === this.props.value) {
          this.setState({ checked: true })
        }
      })
    }
  }
  render() {
    const { checked } = this.state
    const { containerStyle, textStyle, checkboxColor, showErrors } = this.props
    let renderOnlySelected = false
    if (typeof this.props.readonly !== 'undefined') {
      if (this.props.readonly) {
        renderOnlySelected = true
      }
    }
    return (
      <View>
        {renderOnlySelected ? (
          <View>
            {this.state.checked ? (
              <TouchableHighlight
                underlayColor={'transparent'}
                style={styles.touchable}
              >
                <CheckBox
                  disabled
                  title={`${this.props.title}${
                    showErrors && !checked ? ' *' : ''
                  }`}
                  iconType="material"
                  checkedColor={checkboxColor || colors.palegreen}
                  checkedIcon="check-box"
                  uncheckedIcon="check-box-outline-blank"
                  checked={checked}
                  containerStyle={containerStyle || styles.containerStyle}
                  textStyle={[
                    textStyle || styles.label,
                    showErrors && !checked ? styles.error : {}
                  ]}
                  accessibilityLabel={`${this.props.title}${
                    showErrors && !checked ? ' *' : ''
                  } ${checked === true ? 'checked' : 'unchecked'}`}
                />
              </TouchableHighlight>
            ) : null}
          </View>
        ) : (
          <TouchableHighlight
            underlayColor={'transparent'}
            style={styles.touchable}
            onPress={this.onIconPress}
          >
            <CheckBox
              disabled
              title={this.props.title}
              iconType="material"
              checkedColor={checkboxColor || colors.palegreen}
              checkedIcon="check-box"
              uncheckedIcon="check-box-outline-blank"
              checked={checked}
              containerStyle={containerStyle || styles.containerStyle}
              textStyle={[textStyle || styles.label]}
              accessibilityLabel={`${this.props.title}${
                showErrors && !checked ? ' *' : ''
              } ${checked === true ? 'checked' : 'unchecked'}`}
            />
          </TouchableHighlight>
        )}
      </View>
    )
  }
}

Checkbox.propTypes = {
  multipleValue: PropTypes.array,
  title: PropTypes.string.isRequired,
  onIconPress: PropTypes.func.isRequired,
  containerStyle: PropTypes.object,
  navigation: PropTypes.object,
  value: PropTypes.string,
  codeName: PropTypes.string,
  checkboxColor: PropTypes.string,
  showErrors: PropTypes.bool,
  textStyle: PropTypes.object,
  readonly: PropTypes.bool
}

export default Checkbox

const styles = StyleSheet.create({
  label: {
    color: colors.grey,
    fontWeight: 'normal'
  },
  touchable: {
    justifyContent: 'center',
    marginBottom: 0
  },
  containerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 0,
    paddingBottom: 0
  },
  error: {
    color: colors.palered,
    textDecorationLine: 'underline'
  }
})
