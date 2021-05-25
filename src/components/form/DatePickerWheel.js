import { WheelPicker } from '@delightfulstudio/react-native-wheel-picker-android'

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native'

import arrow from '../../../assets/images/selectArrow.png'
import globalStyles from '../../globalStyles'
import i18n from '../../i18n'
import colors from '../../theme.json'
import BottomModal from '../BottomModal'

class DatePickerWheel extends Component {
  state = {
    isOpen: false,
    day: '',
    month: '',
    year: ''
  }

  toggleDropdown = () => {
    if (!this.props.readOnly) {
      this.setState({
        isOpen: !this.state.isOpen
      })
    }
  }

  validateInput = value => {
    this.setState({
      isOpen: false
    })

    this.props.onChange(value)
  }

  setDay = day => {
    this.setState({ day })
  }

  setMonth = month => {
    this.setState({ month })
  }

  setYear = year => {
    this.setState({ year })
  }

  setDateText = date => {
    const dateFromValue = new Date(date)
    const year = dateFromValue.getFullYear()
    const month = this.props.months[dateFromValue.getMonth()].text
    const day = dateFromValue.getDate()
    return `${day} ${month} ${year}`
  }

  getSelectedDate = (days, years) => {
    const day = Object.keys(this.state.day).length
      ? this.state.day.data
      : days[0]
    const month = Object.keys(this.state.month).length
      ? this.props.months.find(m => m.text === this.state.month.data).value
      : this.props.months[0].value
    const year = Object.keys(this.state.year).length
      ? this.state.year.data
      : years[0]
    return `${day} ${month} ${year}`
  }

  render() {
    const { isOpen } = this.state
    const {
      days,
      months,
      years,
      value,
      placeholder,
      readOnly,
      hasError,
      required
    } = this.props
    const wheelDays = days.map(day => day.value);
    const wheelMonths =  months.map(month =>  month.text);
    const wheelYears = years.map(year => year.value)
    const text = value ? this.setDateText(value) : ''
    const daysWheelPosition =
      !!this.state.day && !!text ? this.state.day.position : 0
    const monthsWheelPosition =
      !!this.state.month && !!text ? this.state.month.position : 0
    const yearsWheelPosition =
      !!this.state.year && !!text ? this.state.year.position : 0

    return (
      <TouchableHighlight
        id="datePicker"
        underlayColor={'transparent'}
        activeOpacity={1}
        onPress={this.toggleDropdown}
        accessible={true}
        accessibilityLabel={
          required && !readOnly
            ? `${placeholder.replace('*', '')} ${i18n.t(
                'validation.fieldIsRequiredAccessibilityLabel'
              )}`
            : ''
        }
      >
        <View style={styles.wrapper}>
          <View
            style={[
              styles.container,
              !value && styles.withoutValue,
              isOpen && styles.active,
              hasError && styles.error
            ]}
          >
            {!!value && (
              <Text
                style={[
                  styles.title,
                  isOpen &&
                    !hasError && {
                      color: colors.green
                    }
                ]}
              >{`${placeholder}`}</Text>
            )}
            <Text
              id="placeholder"
              style={[
                styles.placeholder,
                hasError ? { color: colors.red } : {}
              ]}
            >
              {value ? text : `${placeholder}`}
            </Text>
            {!readOnly ? <Image source={arrow} style={styles.arrow} /> : null}

            <BottomModal
              isOpen={isOpen}
              onRequestClose={this.toggleDropdown}
              onEmptyClose={() => {
                this.validateInput('')
                this.toggleDropdown()
              }}
            >
              <View style={styles.dropdown}>
                <View style={{ marginTop: -25 }}>
                  <View style={styles.wheelPickerHeader}>
                    <TouchableOpacity
                      id="confirm"
                      onPress={() => {
                        const date = this.getSelectedDate(wheelDays, wheelYears)
                        this.validateInput(date)
                      }}
                    >
                      <Text style={styles.confirm}>
                        {i18n.t('general.confirm')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.wheelsContainer}>
                    <WheelPicker
                      id="dayWheel"
                      onItemSelected={this.setDay}
                      isCurved={true}
                      data={wheelDays}
                      visibleItemCount={6}
                      style={styles.wheelPicker}
                      selectedItemTextColor={colors.black}
                      isCyclic={true}
                      renderIndicator={true}
                      indicatorColor={colors.lightgrey}
                      indicatorSize={3}
                      selectedItemPosition={daysWheelPosition}
                    />
                    <WheelPicker
                      id="monthWheel"
                      onItemSelected={this.setMonth}
                      isCurved={true}
                      data={wheelMonths}
                      visibleItemCount={6}
                      style={styles.wheelPicker}
                      selectedItemTextColor={colors.black}
                      isCyclic={true}
                      renderIndicator={true}
                      indicatorColor={colors.lightgrey}
                      indicatorSize={3}
                      selectedItemPosition={monthsWheelPosition}
                    />
                    <WheelPicker
                      id="yearWheel"
                      onItemSelected={this.setYear}
                      isCurved={true}
                      data={wheelYears}
                      visibleItemCount={6}
                      style={styles.wheelPicker}
                      selectedItemTextColor={colors.black}
                      isCyclic={true}
                      renderIndicator={true}
                      indicatorColor={colors.lightgrey}
                      indicatorSize={3}
                      selectedItemPosition={yearsWheelPosition}
                    />
                  </View>
                </View>
              </View>
            </BottomModal>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15
  },
  container: {
    borderBottomWidth: 1,
    marginHorizontal: 15,
    justifyContent: 'center',
    height: 65,
    paddingBottom: 6,
    borderBottomColor: colors.grey,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  placeholder: {
    paddingHorizontal: 15,
    ...globalStyles.subline,
    lineHeight: 50,
    height: 50,
    textAlign:'left'
  },
  withoutValue: {
    backgroundColor: colors.primary,
    height: 65
  },
  dropdown: {
    paddingVertical: 25,
    maxHeight: 360,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white
  },

  arrow: {
    width: 10,
    height: 5,
    position: 'absolute',
    right: 13,
    top: '50%'
  },
  active: {
    backgroundColor: colors.white,
    borderBottomColor: colors.green
  },
  error: {
    backgroundColor: colors.white,
    borderBottomColor: colors.red
  },

  title: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.palegrey,
    // marginBottom: 10,
    zIndex: 100,
    textAlign:'left'
  },
  wheelPicker: {
    width: '33%',
    height: 220
  },
  wheelsContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  wheelPickerHeader: {
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 35
  },
  confirm: {
    color: colors.palegreen,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: 17
  }
})

DatePickerWheel.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  placeholder: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  hasError: PropTypes.bool,
  days: PropTypes.array.isRequired,
  months: PropTypes.array.isRequired,
  years: PropTypes.array.isRequired
}

export default DatePickerWheel
