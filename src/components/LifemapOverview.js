import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import LifemapOverviewListItem from './LifemapOverviewListItem'

import globalStyles from '../globalStyles'

class LifemapOverview extends Component {
  dimensions = this.props.surveyData.map(item => item.dimension)

  getColor = color =>
    this.props.draftData.indicatorSurveyDataList.filter(
      item => item.key === color
    )[0].value

  handleClick(color, indicator, indicatorText) {
    if (color === 3) {
      return this.props.navigateToScreen(
        'AddAchievement',
        indicator,
        indicatorText
      )
    } else if (color === 2 || color === 1) {
      return this.props.navigateToScreen(
        'AddPriority',
        indicator,
        indicatorText
      )
    }
  }

  render() {
    const priorities = this.props.draftData.priorities.map(
      priority => priority.indicator
    )
    const achievements = this.props.draftData.achievements.map(
      priority => priority.indicator
    )
    return (
      <View style={styles.container}>
        {[...new Set(this.dimensions)].map(item => (
          <View key={item}>
            <Text style={styles.dimension}>{item.toUpperCase()}</Text>
            {this.props.surveyData
              .filter(indicator => indicator.dimension === item)
              .map(indicator => (
                <LifemapOverviewListItem
                  key={indicator.questionText}
                  name={indicator.questionText}
                  color={this.getColor(indicator.codeName)}
                  priority={priorities.includes(indicator.codeName)}
                  achievement={achievements.includes(indicator.codeName)}
                  handleClick={() =>
                    this.handleClick(
                      this.getColor(indicator.codeName),
                      indicator.codeName,
                      indicator.questionText
                    )
                  }
                />
              ))}
          </View>
        ))}
      </View>
    )
  }
}

LifemapOverview.propTypes = {
  surveyData: PropTypes.array.isRequired,
  draftData: PropTypes.object.isRequired,
  navigateToScreen: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  container: { ...globalStyles.container, paddingTop: 0, paddingLeft: 25 },
  dimension: { ...globalStyles.h4, marginVertical: 12 }
})

export default LifemapOverview
