import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { withNamespaces } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import i18n from '../../i18n'
import colors from '../../theme.json'
import DatePickerWheel from './DatePickerWheel'

export class DateInputComponent extends React.Component {
  state = {
    date: this.props.initialValue || '',
    error: false
  }

  setDate = date => {
    this.setState({ date })
  }

  //Make array of the days
  days = Array.from({ length: 31 }, (v, i) => ({
    text: i + 1,
    value: i + 1
  }))

  //Make array of the years
  years = Array.from({ length: 101 }, (v, i) => {
    let d = new Date()
    let value = d.getFullYear() - 101 + i + 1
    return { text: value, value }
  }).reverse()

  validateDate() {
    const { date } = this.state
    const { id } = this.props

    const error =
      (this.props.required && !date) ||
      (this.props.required && !this.props.initialValue) ||
      (!this.props.required && !!date) || (this.props.required && !!date)
        ? (!moment(`${date}`, 'D MMMM YYYY', true).isValid()) || (!moment(`${date}`).isSameOrBefore(moment(new Date()).format("DD MMMM YYYY")))
        : false
    if (this.props.setError) {
      if (error) {
        this.props.setError(true, id)
      } else {
        const unix = moment(`${date}`, 'D MMMM YYYY').unix()

        this.props.setError(false, id)
        this.props.onValidDate(unix, id)
      }
      this.setState({
        error
      })
    } else if (!error) {
      const unix = moment(`${date}`, 'D MMMM YYYY').unix()
      this.props.onValidDate(unix, id)
    }
  }

  componentDidMount() {
    // on mount validate empty required fields without showing an errors message
    if (
      this.props.required &&
      !this.props.initialValue &&
      this.props.setError
    ) {
      this.props.setError(true, this.props.id)
    }

    if (this.props.initialValue) {
      this.setState({
        date: moment
          .unix(this.props.initialValue)
          .utc()
          .format('D MMMM YYYY')
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { date } = this.state

    if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
      if (date) {
        this.validateDate()
      }
      if (prevState.date) {
        this.validateDate()
      }
    }
    if (prevProps.showErrors !== this.props.showErrors) {
      this.validateDate()
    }
  }

  render() {
    const { t, readOnly, required } = this.props
    const { date } = this.state
    const months = [
      { text: t('months.january'), value: 'January' },
      { text: t('months.february'), value: 'February' },
      { text: t('months.march'), value: 'March' },
      { text: t('months.april'), value: 'April' },
      { text: t('months.may'), value: 'May' },
      { text: t('months.june'), value: 'June' },
      { text: t('months.july'), value: 'July' },
      { text: t('months.august'), value: 'August' },
      { text: t('months.september'), value: 'September' },
      { text: t('months.october'), value: 'October' },
      { text: t('months.november'), value: 'November' },
      { text: t('months.december'), value: 'December' }
    ]

    return readOnly && !this.props.initialValue ? null : (
      <View>
        {readOnly && (
          <Text
            style={[styles.text, { marginBottom: readOnly ? -15 : 15 }]}
            accessibilityLabel={`${this.props.label} ${
              required && !readOnly
                ? i18n.t('validation.fieldIsRequiredAccessibilityLabel')
                : ''
            }`}
          >
            {this.props.label} {required && !readOnly ? '*' : ''}
          </Text>
        )}
        <View style={styles.container}>
          <View style={styles.date}>
            <DatePickerWheel
              onChange={this.setDate}
              placeholder={
                readOnly
                  ? this.state.date
                    ? ''
                    : `${this.props.label}`
                  : `${this.props.label} ${required && !readOnly ? '*' : ''}`
              }
              readOnly={readOnly}
              value={date}
              days={this.days}
              months={months}
              years={this.years}
              hasError={!!this.state.error}
              required={this.props.required}
            />
          </View>
        </View>
        {this.state.error ? (
          <Text style={{ ...styles.text, color: colors.red, ...styles.error }}>
            {t('views.family.selectValidDate')}
          </Text>
        ) : (
          <View />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  date: { width: '100%' },
  text: { 
    marginLeft: 30, 
    fontSize: 14,
    fontWeight: 'normal', 
    color:colors.grey },
  error: { marginBottom: 10, marginTop: -10, textAlign:'left' }
})

DateInputComponent.propTypes = {
  label: PropTypes.string,
  initialValue: PropTypes.number,
  t: PropTypes.func.isRequired,
  id: PropTypes.string,
  required: PropTypes.bool,
  showErrors: PropTypes.bool,
  readOnly: PropTypes.bool,
  setError: PropTypes.func,
  onValidDate: PropTypes.func
}

export default withNamespaces()(DateInputComponent)
