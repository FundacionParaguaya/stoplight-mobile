import React, { Component } from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { NavigationActions } from 'react-navigation'
import uuid from 'uuid/v1'
import { withNamespaces } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialIcons'
import {
  createDraft,
  deleteDraft,
  addSurveyFamilyMemberData
} from '../../redux/actions'

import Select from '../../components/Select'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import DateInput from '../../components/DateInput'
import globalStyles from '../../globalStyles'
import colors from '../../theme.json'

export class FamilyParticipant extends Component {
  //Get draft id from Redux store if it exists else create new draft id
  draftId = this.props.navigation.getParam('draft') || uuid()

  //Get survey if from draft if it exists else from navigation route
  surveyId =
    (this.props.drafts.filter(draft => draft.draftId === this.draftId)[0] || {})
      .surveyId || this.props.navigation.getParam('survey')

  //Get survey by id
  survey = this.props.surveys.filter(survey => survey.id === this.surveyId)[0]

  errorsDetected = []

  state = { errorsDetected: [] }

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

  getDraftFromRedux() {
    //Get draft  from Redux store if it exists else create new draft
    if (!this.props.navigation.getParam('draft')) {
      this.props.createDraft({
        surveyId: this.survey.id,
        surveyVersionId: this.survey['surveyVersionId'],
        created: Date.now(),
        draftId: this.draftId,
        economicSurveyDataList: [],
        indicatorSurveyDataList: [],
        priorities: [],
        achievements: [],
        familyData: {
          familyMembersList: [
            {
              firstParticipant: true,
              socioEconomicAnswers: []
            }
          ]
        }
      })
    }
  }

  componentDidMount() {
    this.getDraftFromRedux()
  }

  handleClick() {
    this.props.navigation.navigate('FamilyMembersNames', {
      draftId: this.draftId,
      survey: this.survey
    })
  }

  getFieldValue = (draft, field) => {
    if (!draft) {
      return
    }
    return draft.familyData.familyMembersList[0][field]
  }

  addSurveyData = (text, field) => {
    this.props.addSurveyFamilyMemberData({
      id: this.draftId,
      index: 0,
      payload: {
        [field]: text
      }
    })
  }

  componentDidUpdate(nextProps) {
    const { navigation } = nextProps

    // delete the draft if participant details not saved the first time
    if (navigation.getParam('deleteDraft')) {
      this.props.deleteDraft(this.draftId)
      navigation.setParams({ deleteDraft: false })
      navigation.reset([NavigationActions.navigate({ routeName: 'Dashboard' })])
    }
  }

  gender = this.survey.surveyConfig.gender

  documentType = this.survey.surveyConfig.documentType

  render() {
    const { t } = this.props
    const draft = this.props.drafts.filter(
      draft => draft.draftId === this.draftId
    )[0]
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
          <Icon name="face" color={colors.grey} size={55} style={styles.icon} />
          <TextInput
            validation="string"
            field="firstName"
            onChangeText={this.addSurveyData}
            placeholder={t('views.family.firstName')}
            value={this.getFieldValue(draft, 'firstName') || ''}
            required
            detectError={this.detectError}
          />
          <TextInput
            field="lastName"
            validation="string"
            onChangeText={this.addSurveyData}
            placeholder={t('views.family.lastName')}
            value={this.getFieldValue(draft, 'lastName') || ''}
            required
            detectError={this.detectError}
          />
          <Select
            id="gender"
            required
            onChange={this.addSurveyData}
            label={t('views.family.gender')}
            placeholder={t('views.family.selectGender')}
            field="gender"
            value={this.getFieldValue(draft, 'gender') || ''}
            detectError={this.detectError}
            data={this.gender}
          />

          <DateInput
            required
            label={t('views.family.dateOfBirth')}
            field="birthDate"
            detectError={this.detectError}
            onValidDate={this.addSurveyData}
            value={this.getFieldValue(draft, 'birthDate')}
          />

          <Select
            required
            onChange={this.addSurveyData}
            label={t('views.family.documentType')}
            placeholder={t('views.family.documentType')}
            field="documentType"
            value={this.getFieldValue(draft, 'documentType') || ''}
            detectError={this.detectError}
            data={this.documentType}
          />
          <TextInput
            onChangeText={this.addSurveyData}
            field="documentNumber"
            required
            value={this.getFieldValue(draft, 'documentNumber')}
            placeholder={t('views.family.documentNumber')}
            detectError={this.detectError}
          />
          <Select
            required
            onChange={this.addSurveyData}
            label={t('views.family.countryOfBirth')}
            countrySelect
            placeholder={t('views.family.selectACountry')}
            field="birthCountry"
            value={this.getFieldValue(draft, 'birthCountry') || ''}
            detectError={this.detectError}
          />
          <TextInput
            onChangeText={this.addSurveyData}
            field="email"
            value={this.getFieldValue(draft, 'email')}
            placeholder={t('views.family.email')}
            validation="email"
            detectError={this.detectError}
          />
          <TextInput
            onChangeText={this.addSurveyData}
            field="phoneNumber"
            value={this.getFieldValue(draft, 'phoneNumber')}
            placeholder={t('views.family.phone')}
            validation="phoneNumber"
            detectError={this.detectError}
          />
        </View>
        <View style={{ height: 50, marginTop: 50 }}>
          <Button
            disabled={!!this.errorsDetected.length}
            colored
            text={t('general.continue')}
            handleClick={() => this.handleClick()}
          />
        </View>
      </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center'
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
})

FamilyParticipant.propTypes = {
  t: PropTypes.func.isRequired,
  surveys: PropTypes.array.isRequired,
  drafts: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  createDraft: PropTypes.func.isRequired,
  deleteDraft: PropTypes.func.isRequired,
  addSurveyFamilyMemberData: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  createDraft,
  deleteDraft,
  addSurveyFamilyMemberData
}

const mapStateToProps = ({ surveys, drafts }) => ({
  surveys,
  drafts
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FamilyParticipant)
)
