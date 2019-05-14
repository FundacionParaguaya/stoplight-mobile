import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import IconButton from '../../components/IconButton'
import StickyFooter from '../../components/StickyFooter'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'
import { isPortrait, isTablet } from '../../responsivenessHelpers'
import { getDraft, getTotalEconomicScreens } from './helpers'

import {
  addSurveyData,
  addDraftProgress,
  deleteSurveyPriorityAcheivementData
} from '../../redux/actions'
import colors from '../../theme.json'
import SliderComponent from '../../components/Slider'

export class Question extends Component {
  step = this.props.navigation.getParam('step')
  indicators = this.props.nav.survey.surveyStoplightQuestions
  indicator = this.indicators[this.step]
  slides = this.indicator.stoplightColors

  componentDidMount() {
    this.props.addDraftProgress(this.props.nav.draftId, {
      screen: 'Question',
      step: this.step
    })
    this.props.navigation.setParams({
      onPressBack: this.onPressBack
    })
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused()
  }

  getFieldValue(draft, field) {
    const indicatorObject = draft.indicatorSurveyDataList.find(
      item => item.key === field
    )
    if (indicatorObject) {
      return indicatorObject.value
    }
  }

  selectAnswer = answer => {
    const { draftId } = this.props.nav
    const draft = getDraft()
    const skippedQuestions = draft.indicatorSurveyDataList.filter(
      question => question.value === 0
    )
    const fieldValue = this.getFieldValue(draft, this.indicator.codeName)

    //When the user changes the answer of a question
    if (fieldValue !== answer) {
      //If the indicator is green or skipped

      if (answer === 3 || answer === 0) {
        //delete priority
        this.props.deleteSurveyPriorityAcheivementData({
          id: draftId,
          category: 'priorities',
          indicator: this.indicator.codeName
        })
      }
      //If indicator is yellow, red or skipped
      if (answer < 3) {
        //Delete achievements
        this.props.deleteSurveyPriorityAcheivementData({
          id: draftId,
          category: 'achievements',
          indicator: this.indicator.codeName
        })
      }
    }

    this.props.addSurveyData(draftId, 'indicatorSurveyDataList', {
      [this.indicator.codeName]: answer
    })

    if (
      this.step + 1 < this.indicators.length &&
      !this.props.navigation.getParam('skipped')
    ) {
      return this.props.navigation.replace('Question', {
        step: this.step + 1
      })
    } else if (this.step + 1 >= this.indicators.length && answer === 0) {
      return this.props.navigation.navigate('Skipped')
    } else if (
      (this.props.navigation.getParam('skipped') &&
        skippedQuestions.length === 1 &&
        answer !== 0) ||
      skippedQuestions.length === 0
    ) {
      return this.props.navigation.navigate('Overview', {
        resumeDraft: false
      })
    } else {
      return this.props.navigation.replace('Skipped')
    }
  }

  onPressBack = () => {
    if (this.step > 0) {
      this.props.navigation.replace('Question', {
        step: this.step - 1
      })
    } else this.props.navigation.navigate('BeginLifemap')
  }

  render() {
    const draft = getDraft()
    const { t, dimensions, navigation } = this.props
    const { navigationHeight } = navigation.state.params
    const headerHeight = navigationHeight ? navigationHeight : 95
    const paddingOfStickyFooter = 15
    const portrait = !!dimensions && isPortrait(dimensions)
    const tablet = !!dimensions && isTablet(dimensions)
    const bodyHeight = dimensions.height - headerHeight - paddingOfStickyFooter
    return (
      <StickyFooter
        handleClick={this.handleClick}
        readonly
        progress={
          draft
            ? ((draft.familyData.countFamilyMembers > 1 ? 5 : 4) +
                getTotalEconomicScreens(this.props.nav.survey) +
                this.step) /
              draft.progress.total
            : 0
        }
        currentScreen="Question"
      >
        <View
          style={[
            { height: bodyHeight },
            tablet && portrait ? { marginTop: 30 } : {}
          ]}
        >
          <SliderComponent
            slides={this.slides}
            value={this.getFieldValue(draft, this.indicator.codeName)}
            selectAnswer={answer => this.selectAnswer(answer)}
            bodyHeight={bodyHeight}
            tablet={tablet}
            portrait={portrait}
          />
          <View
            style={[
              styles.skip,
              !tablet && !portrait
                ? { height: 40 }
                : tablet && portrait
                ? { height: 120 }
                : { height: 60 }
            ]}
          >
            {this.indicator.required ? (
              <Text>{t('views.lifemap.responseRequired')}</Text>
            ) : (
              <IconButton
                text={t('views.lifemap.skipThisQuestion')}
                textStyle={styles.link}
                onPress={() => this.selectAnswer(0)}
              />
            )}
          </View>
        </View>
      </StickyFooter>
    )
  }
}

const styles = StyleSheet.create({
  skip: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 30
    // marginTop: 0
  },
  link: {
    color: colors.palegreen
  }
})

Question.propTypes = {
  t: PropTypes.func.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  dimensions: PropTypes.object.isRequired,
  nav: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  addDraftProgress: PropTypes.func.isRequired,
  deleteSurveyPriorityAcheivementData: PropTypes.func.isRequired
}

const mapStateToProps = ({ nav, dimensions }) => ({
  nav,
  dimensions
})

const mapDispatchToProps = {
  addSurveyData,
  addDraftProgress,
  deleteSurveyPriorityAcheivementData
}

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Question)
)
