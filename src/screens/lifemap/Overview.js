import React, { Component } from 'react'
import { StyleSheet, ScrollView, View, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'

import Tip from '../../components/Tip'
import LifemapVisual from '../../components/LifemapVisual'
import Button from '../../components/Button'
import LifemapOverview from '../../components/LifemapOverview'

import globalStyles from '../../globalStyles'
import colors from '../../theme.json'

import { submitDraft } from '../../redux/actions'
import { url } from '../../config'

export class Overview extends Component {
  draftId = this.props.navigation.getParam('draftId')
  survey = this.props.navigation.getParam('survey')
  indicatorsArray = this.survey.surveyStoplightQuestions.map(
    item => item.codeName
  )

  navigateToScreen = (screen, indicator, indicatorText) =>
    this.props.navigation.navigate(screen, {
      draftId: this.draftId,
      survey: this.survey,
      indicator,
      indicatorText
    })

  getMandatoryPrioritiesCount(draft) {
    const potentialPrioritiesCount = draft.indicatorSurveyDataList.filter(
      question => question.value === 1 || question.value === 2
    ).length
    return potentialPrioritiesCount > this.survey.minimumPriorities
      ? this.survey.minimumPriorities
      : potentialPrioritiesCount
  }

  render() {
    const { t } = this.props
    const draft = this.props.drafts.filter(
      item => item.draftId === this.draftId
    )[0]
    const mandatoryPrioritiesCount = this.getMandatoryPrioritiesCount(draft)
    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}
      >
        <View>
          <View
            style={{
              ...globalStyles.container,
              paddingTop: 20
            }}
          >
            <LifemapVisual
              questions={draft.indicatorSurveyDataList}
              priorities={draft.priorities}
              achievements={draft.achievements}
            />
          </View>
          <View>
            <Text style={{ ...globalStyles.subline, ...styles.listTitle }}>
              All indicators
            </Text>
            <LifemapOverview
              surveyData={this.survey.surveyStoplightQuestions}
              draftData={draft}
              navigateToScreen={this.navigateToScreen}
            />
          </View>
        </View>
        <View style={{ height: 50 }}>
          <Button
            colored
            text={t('general.continue')}
            handleClick={() => {
              this.props.submitDraft(
                url[this.props.env],
                this.props.user.token,
                this.draftId,
                draft
              )
              this.navigateToScreen('Final')
            }}
            disabled={mandatoryPrioritiesCount > draft.priorities.length}
          />
        </View>
        {mandatoryPrioritiesCount ? (
          <Tip
            title={t('views.lifemap.beforeTheLifeMapIsCompleted')}
            description={
              mandatoryPrioritiesCount === 1
                ? t('views.lifemap.youNeedToAddPriotity')
                : t('views.lifemap.youNeedToAddPriorities').replace(
                    '%n',
                    mandatoryPrioritiesCount
                  )
            }
          />
        ) : (
          <View />
        )}
      </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  listTitle: {
    backgroundColor: colors.beige,
    height: 45,
    lineHeight: 45,
    flex: 1,
    textAlign: 'center'
  }
})

Overview.propTypes = {
  t: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  submitDraft: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  env: PropTypes.string.isRequired
}

const mapStateToProps = ({ drafts, env, user }) => ({
  drafts,
  env,
  user
})

const mapDispatchToProps = {
  submitDraft
}

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Overview)
)
