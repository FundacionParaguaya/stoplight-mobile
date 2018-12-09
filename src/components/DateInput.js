import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { View, StyleSheet, Text } from 'react-native'
import { withNamespaces } from 'react-i18next'
import colors from '../theme.json'
import TextInput from './TextInput'
import Select from './Select'

export class DateInput extends React.Component {
  state = {
    day: '',
    month: '',
    year: '',
    error: false
  }
  setDay = day => {
    this.setState({ day })
    this.validateDate({ day })
  }
  setMonth = month => {
    this.setState({ month })
    this.validateDate({ month })
  }
  setYear = year => {
    this.setState({ year })
    this.validateDate({ year })
  }

  validateDate({ day, month, year }) {
    const validDate =
      moment.unix(this.props.value).format('YYYY MMMM D') !== 'Invalid date'

    const yearInput =
      year ||
      this.state.year ||
      (validDate ? moment.unix(this.props.value).format('YYYY') : '')

    const monthInput =
      month ||
      this.state.month ||
      (validDate ? moment.unix(this.props.value).format('MMMM') : '')

    const dayInput =
      day ||
      this.state.day ||
      (validDate ? moment.unix(this.props.value).format('D') : '')

    const error = !moment(
      `${yearInput} ${monthInput} ${dayInput}`,
      'YYYY MMMM D',
      true
    ).isValid(dayInput)

    if (yearInput && monthInput && dayInput) {
      this.setState({
        error
      })
      if (error) {
        this.props.detectError(true, this.props.field)
      } else {
        const unix = moment(
          `${yearInput} ${monthInput} ${dayInput}`,
          'YYYY MMMM D'
        ).unix()
        this.props.detectError(false, this.props.field)
        this.props.onValidDate(unix, this.props.field)
      }
    }
  }

  componentDidMount() {
    // on mount validate empty required fields without showing an errors message
    if (this.props.required && !this.props.value) {
      this.props.detectError(true, this.props.field)
    }
  }

  render() {
    const { t } = this.props
    const validDate =
      moment.unix(this.props.value).format('YYYY MMMM D') !== 'Invalid date'
    const month =
      this.state.month ||
      (validDate ? moment.unix(this.props.value).format('MMMM') : '')

    const year =
      this.state.year ||
      (validDate ? moment.unix(this.props.value).format('YYYY') : '')
    const day =
      this.state.day ||
      (validDate ? moment.unix(this.props.value).format('D') : '')

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

    return (
      <View>
        <Text style={styles.text}>{this.props.label}</Text>
        <View style={styles.container}>
          <View style={styles.month}>
            <Select
              onChange={month => this.setMonth(month)}
              label={t('general.month')}
              placeholder={t('views.family.selectMonth')}
              field=""
              value={month}
              data={months}
            />
          </View>
          <View style={styles.day}>
            <TextInput
              onChangeText={day => this.setDay(day)}
              value={day}
              placeholder={t('general.day')}
            />
          </View>
          <View style={styles.year}>
            <TextInput
              onChangeText={year => this.setYear(year)}
              value={year}
              placeholder={t('general.year')}
            />
          </View>
        </View>
        {this.state.error && (
          <Text style={{ ...styles.text, color: colors.red }}>
            {t('views.family.selectValidDate')}
          </Text>
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
  day: {
    width: '25%',
    marginLeft: '-3%'
  },
  year: { width: '36%', marginLeft: '-3%' },
  month: { width: '45%' },
  text: { paddingLeft: 25, marginTop: 20 }
})

DateInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  t: PropTypes.func.isRequired,
  field: PropTypes.string,
  required: PropTypes.bool,
  detectError: PropTypes.func,
  onValidDate: PropTypes.func
}

export default withNamespaces()(DateInput)
