import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import colors from '../theme.json'
class LifemapVisual extends Component {
  getColors = () =>
    this.props.questions.map(item => {
      switch (item.value) {
        case 1:
          return colors.red
        case 2:
          return colors.gold
        case 3:
          return colors.green
        case 0:
          return colors.palegrey

        default:
          return colors.palegrey
      }
    })

  render() {
    const prioritiesAndAchievements = [
      ...this.props.priorities.map(priority => priority.indicator),
      ...this.props.achievements.map(priority => priority.indicator)
    ]
    return (
      <View style={styles.container}>
        {this.getColors().map((item, i) => (
          <View key={i}>
            {prioritiesAndAchievements.includes(this.props.questions[i].key) &&
            this.props.questions[i].value ? (
              <Icon
                name="brightness-1"
                color={colors.blue}
                size={10}
                style={{
                  ...styles.iconBlue,
                  top: this.props.bigMargin ? 2 : 0,
                  right: this.props.bigMargin ? 6 : 3
                }}
              />
            ) : (
              <View />
            )}
            <Icon
              name="brightness-1"
              color={item}
              size={17}
              style={{
                marginHorizontal: this.props.bigMargin ? 8 : 4,
                marginVertical: this.props.bigMargin ? 4 : 2
              }}
            />
          </View>
        ))}
      </View>
    )
  }
}

LifemapVisual.propTypes = {
  questions: PropTypes.array.isRequired,
  achievements: PropTypes.array.isRequired,
  priorities: PropTypes.array.isRequired,
  bigMargin: PropTypes.bool
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap' },
  iconBlue: {
    right: 3,
    position: 'absolute',
    width: 10,
    height: 10,
    zIndex: 10,
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 5
  }
})

export default LifemapVisual
