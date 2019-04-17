import React, { Component } from 'react'
import { StyleSheet, Text, Platform } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import uuid from 'uuid/v1'
import {
  createDraft,
  addSurveyFamilyMemberData,
  addDraftProgress,
  addSurveyData,
  removeFamilyMembers
} from '../../redux/actions'
import { withNamespaces } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialIcons'
import StickyFooter from '../../components/StickyFooter'
import Select from '../../components/Select'
import TextInput from '../../components/TextInput'
import DateInputComponent from '../../components/DateInput'
import Decoration from '../../components/decoration/Decoration'
import colors from '../../theme.json'

export class FamilyParticipant extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <Text
          accessibilityLiveRegion="assertive"
          style={styles.headerTitleStyle}
        >
          {navigation.getParam('title', 'Primary Participant')}
        </Text>
      )
    }
  }

  //Get draft id from Redux store if it exists else create new draft id
  draftId = this.props.navigation.getParam('draftId') || uuid()

  //Get survey if from draft if it exists else from navigation route
  surveyId =
    (this.props.drafts.filter(draft => draft.draftId === this.draftId)[0] || {})
      .surveyId || this.props.navigation.getParam('survey')

  //Get survey by id
  survey = this.props.surveys.filter(survey => survey.id === this.surveyId)[0]

  errorsDetected = []

  readonly = !!this.props.navigation.getParam('family')

  state = { errorsDetected: [], showErrors: false }

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

  getDraft() {
    //Get data from Redux store if it's a draft or from
    // navigation if it's an excisting family else create new draft
    if (
      !this.props.navigation.getParam('draftId') &&
      !this.props.navigation.getParam('family')
    ) {
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

  setTitle() {
    this.props.navigation.setParams({
      title: this.props.navigation.getParam('family').familyData
        .familyMembersList[0].firstName
    })
  }

  componentDidMount() {
    if (this.props.navigation.getParam('family')) {
      this.setTitle()
    }

    this.getDraft()

    if (!this.readonly) {
      this.props.addDraftProgress(this.draftId, {
        screen: 'FamilyParticipant',
        current: 1,
        total: 5 + this.survey.surveyStoplightQuestions.length
      })
    }

    this.props.navigation.setParams({ draftId: this.draftId })
  }

  handleClick = () => {
    const draft = this.props.drafts.find(
      draft => draft.draftId === this.draftId
    )

    // check if form is valid
    if (this.errorsDetected.length) {
      this.setState({
        showErrors: true
      })
    } else {
      if (this.getFamilyCount(draft) > 1) {
        // if multiple family members navigate to members screens
        this.props.addDraftProgress(this.draftId, {
          current: draft.progress.current + 1,
          total: draft.progress.total + 2
        })

        this.props.navigation.navigate('FamilyMembersNames', {
          draftId: this.draftId,
          survey: this.survey
        })
      } else {
        // if only one family member, navigate directly to location
        this.props.addDraftProgress(draft.draftId, {
          current: draft.progress.current + 1
        })

        this.props.navigation.navigate('Location', {
          draftId: this.draftId,
          survey: this.survey
        })
      }
    }
  }

  addFamilyCount = (text, field) => {
    const draft = this.props.drafts.find(
      draft => draft.draftId === this.draftId
    )

    // if reducing the number of family members remove the rest
    if (text && this.getFamilyCount(draft) > text) {
      const index = text === -1 ? 1 : text
      this.props.removeFamilyMembers(this.draftId, index)

      this.setState({
        errorsDetected: this.errorsDetected
      })
    }

    this.setState({
      showErrors: false
    })

    this.props.addSurveyData(this.draftId, 'familyData', {
      [field]: text
    })
  }

  getFamilyMembersCountArray = t => [
    { text: t('views.family.onlyPerson'), value: 1 },
    ...Array.from(new Array(24), (val, index) => ({
      value: index + 2,
      text: `${index + 2}`
    })),

    {
      text: t('views.family.preferNotToSay'),
      value: -1
    }
  ]

  getFieldValue = (draft, field) => {
    if (!draft) {
      return
    }

    return draft.familyData.familyMembersList[0][field]
  }

  getFamilyCount = draft => {
    if (!draft) {
      return
    }
    return draft.familyData.countFamilyMembers
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

  gender = this.survey.surveyConfig.gender

  documentType = this.survey.surveyConfig.documentType

  shouldComponentUpdate() {
    return this.props.navigation.isFocused()
  }

  render() {
    const { t } = this.props
    const { showErrors } = this.state

    const draft =
      this.props.navigation.getParam('family') ||
      this.props.drafts.find(draft => draft.draftId === this.draftId)

    return (
      <StickyFooter
        handleClick={this.handleClick}
        continueLabel={t('general.continue')}
        readonly={this.readonly}
        progress={
          !this.readonly && draft
            ? draft.progress.current / draft.progress.total
            : 0
        }
      >
        <Decoration variation="primaryParticipant">
          <Icon name="face" color={colors.grey} size={55} style={styles.icon} />
        </Decoration>
        <TextInput
          validation="string"
          field="firstName"
          readonly={this.readonly}
          onChangeText={this.addSurveyData}
          placeholder={t('views.family.firstName')}
          value={this.getFieldValue(draft, 'firstName') || ''}
          required
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <TextInput
          field="lastName"
          validation="string"
          onChangeText={this.addSurveyData}
          readonly={this.readonly}
          placeholder={t('views.family.lastName')}
          value={this.getFieldValue(draft, 'lastName') || ''}
          required
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <Select
          id="gender"
          required
          onChange={this.addSurveyData}
          readonly={this.readonly}
          label={t('views.family.gender')}
          placeholder={t('views.family.selectGender')}
          field="gender"
          value={this.getFieldValue(draft, 'gender') || ''}
          detectError={this.detectError}
          showErrors={showErrors}
          options={this.gender}
        />

        <DateInputComponent
          required
          label={t('views.family.dateOfBirth')}
          field="birthDate"
          detectError={this.detectError}
          showErrors={showErrors}
          onValidDate={this.addSurveyData}
          value={this.getFieldValue(draft, 'birthDate')}
          readonly={this.readonly}
        />

        <Select
          required
          onChange={this.addSurveyData}
          readonly={this.readonly}
          label={t('views.family.documentType')}
          placeholder={t('views.family.documentType')}
          field="documentType"
          value={this.getFieldValue(draft, 'documentType') || ''}
          detectError={this.detectError}
          showErrors={showErrors}
          options={this.documentType}
        />
        <TextInput
          onChangeText={this.addSurveyData}
          readonly={this.readonly}
          field="documentNumber"
          required
          value={this.getFieldValue(draft, 'documentNumber')}
          placeholder={t('views.family.documentNumber')}
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <Select
          id="country"
          required
          onChange={this.addSurveyData}
          readonly={this.readonly}
          label={t('views.family.countryOfBirth')}
          countrySelect
          country={this.survey.surveyConfig.surveyLocation.country}
          placeholder={t('views.family.countryOfBirth')}
          field="birthCountry"
          value={
            this.getFieldValue(draft, 'birthCountry') ||
            this.survey.surveyConfig.surveyLocation.country
          }
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <Select
          id="familyMembersCount"
          required
          onChange={this.addFamilyCount}
          readonly={this.readonly}
          label={t('views.family.peopleLivingInThisHousehold')}
          placeholder={t('views.family.peopleLivingInThisHousehold')}
          field="countFamilyMembers"
          value={this.getFamilyCount(draft) || ''}
          detectError={this.detectError}
          showErrors={showErrors}
          options={this.getFamilyMembersCountArray(t)}
        />
        <TextInput
          onChangeText={this.addSurveyData}
          readonly={this.readonly}
          field="email"
          value={this.getFieldValue(draft, 'email')}
          placeholder={t('views.family.email')}
          validation="email"
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <TextInput
          onChangeText={this.addSurveyData}
          readonly={this.readonly}
          field="phoneNumber"
          value={this.getFieldValue(draft, 'phoneNumber')}
          placeholder={t('views.family.phone')}
          validation="phoneNumber"
          detectError={this.detectError}
          showErrors={showErrors}
        />
      </StickyFooter>
    )
  }
}
const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center'
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

FamilyParticipant.propTypes = {
  t: PropTypes.func.isRequired,
  surveys: PropTypes.array.isRequired,
  drafts: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  createDraft: PropTypes.func.isRequired,
  addSurveyFamilyMemberData: PropTypes.func.isRequired,
  addDraftProgress: PropTypes.func.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  removeFamilyMembers: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  createDraft,
  addSurveyFamilyMemberData,
  addDraftProgress,
  addSurveyData,
  removeFamilyMembers
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
