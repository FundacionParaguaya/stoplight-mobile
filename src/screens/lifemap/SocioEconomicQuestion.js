import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text, Platform } from 'react-native'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'
import StickyFooter from '../../components/StickyFooter'
import TextInput from '../../components/TextInput'
import Select from '../../components/Select'
import {
  addSurveyData,
  addSurveyFamilyMemberData,
  addDraftProgress
} from '../../redux/actions'
import colors from '../../theme.json'

export class SocioEconomicQuestion extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <Text
          accessibilityLiveRegion="assertive"
          style={styles.headerTitleStyle}
        >
          {navigation.getParam('title')}
        </Text>
      )
    }
  }

  errorsDetected = []
  readonly = !!this.props.navigation.getParam('family')
  state = { errorsDetected: [], showErrors: false }
  draftId = this.props.navigation.getParam('draftId')
  survey = this.props.navigation.getParam('survey')

  constructor(props) {
    super(props)
    const draft = this.getDraft()
    // If this is the first socio economics screen set the whole process
    // in the navigation. On every next screen it will know which questions
    // to ask and if it is done.
    if (!props.navigation.getParam('socioEconomics')) {
      let currentDimension = ''
      let questionsPerScreen = []
      let totalScreens = 0

      // go trough all questions and separate them by screen
      // filter method - checks if family members meet the conditions based on age
      props.navigation
        .getParam('survey')
        .surveyEconomicQuestions.filter(question =>
          !!question.conditions &&
          question.conditions.length &&
          !!question.forFamilyMember &&
          question.conditions[0].codeName === 'birthdate'
            ? draft.familyData.familyMembersList.filter(
                member => !!this.isConditionMet(question, member)
              ).length
              ? question
              : false
            : question
        )
        .forEach(question => {
          // if the dimention of the questions change, change the page
          if (question.topic !== currentDimension) {
            currentDimension = question.topic
            totalScreens += 1
          }

          // if there is object for n screen create one
          if (!questionsPerScreen[totalScreens - 1]) {
            questionsPerScreen[totalScreens - 1] = {
              forFamilyMember: [],
              forFamily: []
            }
          }

          if (question.forFamilyMember) {
            questionsPerScreen[totalScreens - 1].forFamilyMember.push(question)
          } else {
            questionsPerScreen[totalScreens - 1].forFamily.push(question)
          }
        })
      if (props.navigation.getParam('fromBeginLifemap')) {
        props.navigation.setParams({
          socioEconomics: {
            currentScreen: totalScreens,
            questionsPerScreen,
            totalScreens
          },
          title: questionsPerScreen[totalScreens - 1].forFamily[0]
            ? questionsPerScreen[totalScreens - 1].forFamily[0].topic
            : questionsPerScreen[totalScreens - 1].forFamilyMember[0].topic
        })
      } else
        props.navigation.setParams({
          socioEconomics: {
            currentScreen: this.props.navigation.getParam('page')
              ? this.props.navigation.getParam('page') + 1
              : 1,
            questionsPerScreen,
            totalScreens
          },
          title: questionsPerScreen[0].forFamily[0]
            ? questionsPerScreen[0].forFamily[0].topic
            : questionsPerScreen[0].forFamilyMember[0].topic
        })
    } else {
      const socioEconomics = this.props.navigation.getParam('socioEconomics')
      const questionsForThisScreen = socioEconomics
        ? socioEconomics.questionsPerScreen[socioEconomics.currentScreen - 1]
        : []

      this.props.navigation.setParams({
        title: questionsForThisScreen.forFamily[0]
          ? questionsForThisScreen.forFamily[0].topic
          : questionsForThisScreen.forFamilyMember[0].topic
      })
    }
  }

  componentDidMount() {
    if (!this.readonly) {
      this.props.addDraftProgress(this.draftId, {
        screen: 'SocioEconomicQuestion',
        socioEconomics: this.props.navigation.getParam('socioEconomics')
      })

      if (!this.readonly) {
        this.props.navigation.setParams({
          onPressBack: this.onPressBack
        })
      }
    }
  }

  onPressBack = () => {
    const draft = this.getDraft()
    const socioEconomics = this.props.navigation.getParam('socioEconomics')

    this.props.addDraftProgress(this.draftId, {
      current: draft.progress.current - 1
    })

    socioEconomics.currentScreen === 1
      ? this.props.navigation.navigate('Location', {
          draftId: this.draftId,
          survey: this.survey
        })
      : this.props.navigation.push('SocioEconomicQuestion', {
          draftId: this.draftId,
          survey: this.survey,
          socioEconomics: {
            currentScreen: socioEconomics.currentScreen - 1,
            questionsPerScreen: socioEconomics.questionsPerScreen,
            totalScreens: socioEconomics.totalScreens
          }
        })
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused()
  }
  addSurveyData = (text, field) => {
    this.props.addSurveyData(this.draftId, 'economicSurveyDataList', {
      [field]: text
    })
  }
  addSurveyFamilyMemberData = (text, field, index) => {
    this.props.addSurveyFamilyMemberData({
      id: this.draftId,
      index,
      isSocioEconomicAnswer: true,
      payload: {
        [field]: text
      }
    })
  }
  getFieldValue = (draft, field) => {
    if (
      !draft ||
      !draft.economicSurveyDataList ||
      !draft.economicSurveyDataList.filter(item => item.key === field)[0]
    ) {
      return
    }

    return draft.economicSurveyDataList.filter(item => item.key === field)[0]
      .value
  }
  getFamilyMemberFieldValue = (draft, field, index) => {
    if (
      !draft ||
      !draft.familyData.familyMembersList[index].socioEconomicAnswers ||
      !draft.familyData.familyMembersList[index].socioEconomicAnswers.filter(
        item => item.key === field
      )[0]
    ) {
      return
    }

    return draft.familyData.familyMembersList[
      index
    ].socioEconomicAnswers.filter(item => item.key === field)[0].value
  }
  detectError = (error, field) => {
    if (error && !this.errorsDetected.includes(field)) {
      this.errorsDetected.push(field)
    } else if (!error) {
      this.errorsDetected = this.errorsDetected.filter(item => item !== field)
    }

    this.setState({
      errorsDetected: this.errorsDetected
    })
  }
  submitForm = () => {
    const draft = this.getDraft()

    if (this.errorsDetected.length) {
      this.setState({
        showErrors: true
      })
    } else {
      const socioEconomics = this.props.navigation.getParam('socioEconomics')

      this.props.addDraftProgress(this.draftId, {
        current: draft.progress.current + 1
      })

      socioEconomics.currentScreen === socioEconomics.totalScreens
        ? this.props.navigation.navigate('BeginLifemap', {
            draftId: this.draftId,
            survey: this.survey
          })
        : this.props.navigation.push('SocioEconomicQuestion', {
            draftId: this.draftId,
            survey: this.survey,
            socioEconomics: {
              currentScreen: socioEconomics.currentScreen + 1,
              questionsPerScreen: socioEconomics.questionsPerScreen,
              totalScreens: socioEconomics.totalScreens
            }
          })
    }
  }

  getDraft = () =>
    this.props.navigation.getParam('family') ||
    this.props.drafts.find(draft => draft.draftId === this.draftId)

  checkCondition = (selectedVal, conditionVal, operator) => {
    switch (operator) {
      case 'above':
        return selectedVal > conditionVal
      case 'equals':
        return selectedVal === conditionVal
      case 'greater_than_eq':
        return selectedVal >= conditionVal
      default:
        return false
    }
  }

  isConditionMet = (question, familyMember = false) => {
    const { codeName, value, operator } = question.conditions[0]
    const draft = this.getDraft()
    if (codeName === 'birthdate' && familyMember) {
      return this.checkCondition(
        this.calculateAge(familyMember.birthDate),
        value,
        operator
      )
    } else {
      const answeredQuestions = draft.economicSurveyDataList || []
      const userAnswer = answeredQuestions.find(
        answer => answer.key === codeName
      )
      return (
        userAnswer && this.checkCondition(userAnswer.value, value, operator)
      )
    }
  }

  calculateAge = timestamp => {
    const dataOfBirth = new Date(timestamp * 1000).getFullYear()
    const today = new Date().getFullYear()
    return today - dataOfBirth
  }

  render() {
    const { t } = this.props
    const { showErrors } = this.state
    const draft = this.getDraft()
    const socioEconomics = this.props.navigation.getParam('socioEconomics')
    const questionsForThisScreen = socioEconomics
      ? socioEconomics.questionsPerScreen[socioEconomics.currentScreen - 1]
      : []

    const showMemberName = (member, questionsForFamilyMember) => {
      const questionsForThisMember = questionsForFamilyMember.filter(question =>
        !!question.conditions && question.conditions.length
          ? this.isConditionMet(question, member)
          : true
      )
      return questionsForThisMember.length ? (
        <Text style={styles.memberName}>{member.firstName}</Text>
      ) : null
    }

    return (
      <StickyFooter
        readonly={this.readonly}
        handleClick={this.submitForm}
        continueLabel={t('general.continue')}
        progress={
          !this.readonly && draft
            ? draft.progress.current / draft.progress.total
            : 0
        }
      >
        {/* questions for entire family */}
        {socioEconomics ? (
          questionsForThisScreen.forFamily
            .filter(question =>
              question.conditions && question.conditions.length
                ? this.isConditionMet(question)
                  ? question
                  : false
                : question
            )
            .map(question =>
              question.answerType === 'select' ? (
                <Select
                  key={question.codeName}
                  required={question.required}
                  onChange={this.addSurveyData}
                  placeholder={question.questionText}
                  showErrors={showErrors}
                  label={question.questionText}
                  field={question.codeName}
                  value={this.getFieldValue(draft, question.codeName) || ''}
                  detectError={this.detectError}
                  readonly={this.readonly}
                  options={question.options}
                />
              ) : question.answerType === 'number' ? (
                <TextInput
                  multiline
                  key={question.codeName}
                  required={question.required}
                  onChangeText={this.addSurveyData}
                  placeholder={question.questionText}
                  showErrors={showErrors}
                  field={question.codeName}
                  value={this.getFieldValue(draft, question.codeName) || ''}
                  detectError={this.detectError}
                  readonly={this.readonly}
                  validation="number"
                  keyboardType="numeric"
                />
              ) : (
                <TextInput
                  multiline
                  key={question.codeName}
                  required={question.required}
                  onChangeText={this.addSurveyData}
                  placeholder={question.questionText}
                  showErrors={showErrors}
                  field={question.codeName}
                  value={this.getFieldValue(draft, question.codeName) || ''}
                  detectError={this.detectError}
                  readonly={this.readonly}
                />
              )
            )
        ) : (
          <View />
        )}

        {/* questions for family members */}
        {socioEconomics ? (
          questionsForThisScreen.forFamilyMember.length ? (
            draft.familyData.familyMembersList.map((member, i) => (
              <View key={member.firstName}>
                {showMemberName(member, questionsForThisScreen.forFamilyMember)}
                {questionsForThisScreen.forFamilyMember
                  .filter(question =>
                    question.conditions && question.conditions.length
                      ? this.isConditionMet(question, member)
                        ? question
                        : false
                      : question
                  )
                  .map(question =>
                    question.answerType === 'select' ? (
                      <Select
                        key={question.codeName}
                        required={question.required}
                        onChange={(text, field) =>
                          this.addSurveyFamilyMemberData(text, field, i)
                        }
                        placeholder={question.questionText}
                        showErrors={showErrors}
                        label={question.questionText}
                        field={question.codeName}
                        value={
                          this.getFamilyMemberFieldValue(
                            draft,
                            question.codeName,
                            i
                          ) || ''
                        }
                        detectError={this.detectError}
                        readonly={this.readonly}
                        options={question.options}
                      />
                    ) : (
                      <TextInput
                        key={question.codeName}
                        multiline
                        required={question.required}
                        onChangeText={(text, field) =>
                          this.addSurveyFamilyMemberData(text, field, i)
                        }
                        placeholder={question.questionText}
                        showErrors={showErrors}
                        field={question.codeName}
                        value={
                          this.getFamilyMemberFieldValue(
                            draft,
                            question.codeName,
                            i
                          ) || ''
                        }
                        detectError={this.detectError}
                        readonly={this.readonly}
                      />
                    )
                  )}
              </View>
            ))
          ) : (
            <View />
          )
        ) : (
          <View />
        )}
      </StickyFooter>
    )
  }
}

SocioEconomicQuestion.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  addSurveyFamilyMemberData: PropTypes.func.isRequired,
  addDraftProgress: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  memberName: {
    marginHorizontal: 20,
    fontWeight: 'normal',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 20
  },
  headerTitleStyle: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins'
      },
      android: {
        fontFamily: 'Poppins SemiBold'
      }
    }),
    fontSize: 18,
    fontWeight: '200',
    lineHeight: 26,
    color: colors.black,
    marginLeft: 'auto',
    marginRight: 'auto'
  }
})

const mapDispatchToProps = {
  addSurveyData,
  addSurveyFamilyMemberData,
  addDraftProgress
}

const mapStateToProps = ({ drafts, surveys }) => ({
  drafts,
  surveys
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SocioEconomicQuestion)
)
