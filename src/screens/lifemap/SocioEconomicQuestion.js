import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ScrollView, View, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'

import TextInput from '../../components/TextInput'
import Select from '../../components/Select'
import Button from '../../components/Button'
import globalStyles from '../../globalStyles'
import { addSurveyData, addSurveyFamilyMemberData } from '../../redux/actions'

export class SocioEconomicQuestion extends Component {
  errorsDetected = []

  state = { errorsDetected: [] }

  constructor(props) {
    super(props)

    // If this is the first socio economics screen set the whole process
    // in the navigation. On every next screen it will know which questions
    // to ask and if it is done.
    if (!props.navigation.getParam('socioEconomics')) {
      let currentDimension = ''
      let questionsPerScreen = []
      let totalScreens = 0

      // go trough all questions and separate them by screen
      props.navigation
        .getParam('survey')
        .surveyEconomicQuestions.forEach(question => {
          // if the dimention of the questions change, change the page
          if (question.dimension !== currentDimension) {
            currentDimension = question.dimension
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

      props.navigation.setParams({
        socioEconomics: {
          currentScreen: 1,
          questionsPerScreen,
          totalScreens
        }
      })
    }
  }
  addSurveyData = (text, field) => {
    this.props.addSurveyData(
      this.props.navigation.getParam('draftId'),
      'economicSurveyDataList',
      {
        [field]: text
      }
    )
  }
  addSurveyFamilyMemberData = (text, field, index) => {
    this.props.addSurveyFamilyMemberData({
      id: this.props.navigation.getParam('draftId'),
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

  render() {
    const { t } = this.props
    const draft = this.props.drafts.filter(
      draft => draft.draftId === this.props.navigation.getParam('draftId')
    )[0]

    const socioEconomics = this.props.navigation.getParam('socioEconomics')
    const questionsForThisScreen = socioEconomics
      ? socioEconomics.questionsPerScreen[socioEconomics.currentScreen - 1]
      : []

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
          {/* questions for entire family */}
          {!!socioEconomics &&
            questionsForThisScreen.forFamily.map(question =>
              question.answerType === 'select' ? (
                <Select
                  key={question.codeName}
                  required={question.required}
                  onChange={this.addSurveyData}
                  placeholder={question.questionText}
                  label={question.questionText}
                  field={question.codeName}
                  value={this.getFieldValue(draft, question.codeName) || ''}
                  detectError={this.detectError}
                  data={question.options}
                />
              ) : (
                <TextInput
                  key={question.codeName}
                  required={question.required}
                  onChangeText={this.addSurveyData}
                  placeholder={question.questionText}
                  field={question.codeName}
                  value={this.getFieldValue(draft, question.codeName) || ''}
                  detectError={this.detectError}
                />
              )
            )}

          {/* questions for family members */}
          {!!socioEconomics &&
            questionsForThisScreen.forFamilyMember.length &&
            draft.familyData.familyMembersList.map((member, i) => (
              <View key={member.firstName}>
                <Text style={styles.memberName}>{member.firstName}</Text>
                {questionsForThisScreen.forFamilyMember.map(question =>
                  question.answerType === 'select' ? (
                    <Select
                      key={question.codeName}
                      required={question.required}
                      onChange={(text, field) =>
                        this.addSurveyFamilyMemberData(text, field, i)
                      }
                      placeholder={question.questionText}
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
                      data={question.options}
                    />
                  ) : (
                    <TextInput
                      key={question.codeName}
                      required={question.required}
                      onChangeText={(text, field) =>
                        this.addSurveyFamilyMemberData(text, field, i)
                      }
                      placeholder={question.questionText}
                      field={question.codeName}
                      value={
                        this.getFamilyMemberFieldValue(
                          draft,
                          question.codeName,
                          i
                        ) || ''
                      }
                      detectError={this.detectError}
                    />
                  )
                )}
              </View>
            ))}

          <View style={{ marginTop: 15 }}>
            <Button
              id="continue"
              disabled={!!this.errorsDetected.length}
              colored
              text={t('general.continue')}
              handleClick={() =>
                socioEconomics.currentScreen === socioEconomics.totalScreens
                  ? this.props.navigation.navigate('BeginLifemap', {
                      draftId: this.props.navigation.getParam('draftId'),
                      survey: this.props.navigation.getParam('survey')
                    })
                  : this.props.navigation.push('SocioEconomicQuestion', {
                      draftId: this.props.navigation.getParam('draftId'),
                      survey: this.props.navigation.getParam('survey'),
                      socioEconomics: {
                        currentScreen: socioEconomics.currentScreen + 1,
                        questionsPerScreen: socioEconomics.questionsPerScreen,
                        totalScreens: socioEconomics.totalScreens
                      }
                    })
              }
            />
          </View>
        </View>
      </ScrollView>
    )
  }
}

SocioEconomicQuestion.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  addSurveyFamilyMemberData: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  memberName: {
    marginHorizontal: 20,
    fontWeight: 'normal',
    marginTop: 23,
    marginBottom: -20,
    fontSize: 16,
    lineHeight: 20
  }
})

const mapDispatchToProps = { addSurveyData, addSurveyFamilyMemberData }

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
