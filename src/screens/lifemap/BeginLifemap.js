import React, { Component } from 'react'
import { StyleSheet, ScrollView, View, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'

import globalStyles from '../../globalStyles'
import RoundImage from '../../components/RoundImage'
import Button from '../../components/Button'

export class BeginLifemap extends Component {
  survey = this.props.navigation.getParam('survey')
  numberOfQuestions = this.survey.surveyStoplightQuestions.length
  survey = this.props.navigation.getParam('survey')
  render() {
    const { t } = this.props
    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={{
            ...globalStyles.container,
            padding: 0
          }}
        >
          <Text style={{ ...globalStyles.h3, ...styles.text }}>
            {t('views.lifemap.thisLifeMapHas').replace(
              '%n',
              this.numberOfQuestions
            )}
          </Text>
          <RoundImage source="stoplight" />
        </View>
        <View style={{ height: 50 }}>
          <Button
            colored
            text={t('general.continue')}
            handleClick={() =>
              this.props.navigation.navigate('Question', {
                draftId: this.props.navigation.getParam('draftId'),
                survey: this.survey,
                step: 0
              })
            }
          />
        </View>
      </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 80,
    paddingBottom: 30
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
})

BeginLifemap.propTypes = {
  t: PropTypes.func.isRequired,
  surveys: PropTypes.array,
  navigation: PropTypes.object.isRequired
}

const mapStateToProps = ({ surveys }) => ({
  surveys
})

export default withNamespaces()(connect(mapStateToProps)(BeginLifemap))
