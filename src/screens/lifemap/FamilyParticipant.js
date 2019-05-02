import React, { Component } from 'react'
import { StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import uuid from 'uuid/v1'
import {
  createDraft,
  addSurveyFamilyMemberData,
  addDraftProgress,
  addSurveyData,
  removeFamilyMembers,
  updateNav
} from '../../redux/actions'
import { withNamespaces } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialIcons'
import StickyFooter from '../../components/StickyFooter'
import Select from '../../components/Select'
import TextInput from '../../components/TextInput'
import DateInput from '../../components/DateInput'
import Decoration from '../../components/decoration/Decoration'
import colors from '../../theme.json'
import globalStyles from '../../globalStyles'

export class FamilyParticipant extends Component {
  //Get draft id from Redux store if it exists else create new draft id
  draftId = this.props.nav.readonly
    ? null
    : this.props.navigation.getParam('draftId') || uuid()

  errorsDetected = []

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

  createDraft() {
    this.props.createDraft({
      surveyId: this.props.nav.survey.id,
      surveyVersionId: this.props.nav.survey['surveyVersionId'],
      created: Date.now(),
      draftId: this.draftId,
      economicSurveyDataList: [],
      indicatorSurveyDataList: [],
      priorities: [],
      achievements: [],
      progress: {
        screen: 'FamilyParticipant',
        current: 1,
        total: 5 + this.props.nav.survey.surveyStoplightQuestions.length
      },
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

  componentDidMount() {
    // create a new draft if not exising
    if (
      !this.props.nav.readonly &&
      !this.props.navigation.getParam('family') &&
      !this.props.navigation.getParam('draftId')
    ) {
      this.props.updateNav('draftId', this.draftId)
      this.createDraft()
    }

    if (!this.props.nav.readonly && this.props.nav.draftId) {
      this.props.addDraftProgress(this.draftId, {
        screen: 'FamilyParticipant',
        current: 1,
        total: 5 + this.props.nav.survey.surveyStoplightQuestions.length
      })
    }
  }

  handleClick = () => {
    const { draftId } = this.props.nav

    const draft = this.props.drafts.find(draft => draft.draftId === draftId)

    // check if form is valid
    if (this.errorsDetected.length) {
      this.setState({
        showErrors: true
      })
    } else {
      // create drafts

      if (this.getFamilyCount(draft) > 1) {
        // if multiple family members navigate to members screens
        this.props.addDraftProgress(this.draftId, {
          current: draft.progress.current + 1,
          total: draft.progress.total + 2
        })

        this.props.navigation.navigate('FamilyMembersNames')
      } else {
        // if only one family member, navigate directly to location
        this.props.addDraftProgress(draft.draftId, {
          current: draft.progress.current + 1
        })

        this.props.navigation.navigate('Location')
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.errorsDetected.length !== this.state.errorsDetected.length) {
      this.props.updateNav(
        'deleteDraftOnExit',
        !!this.state.errorsDetected.length
      )
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
    let draft = this.props.drafts.find(draft => draft.draftId === this.draftId)
    let primaryParticipantDraft = (primaryParticipantDraft =
      draft.familyData.familyMembersList[0])
    if (
      primaryParticipantDraft.gender === 'O' &&
      field === 'gender' &&
      text !== 'O'
    ) {
      delete primaryParticipantDraft.otherGender
    }

    this.props.addSurveyFamilyMemberData({
      id: this.draftId,
      index: 0,
      payload: {
        [field]: text
      }
    })

    if (this.errorsDetected.length) {
      this.props.updateNav('deleteDraftOnExit', true)
    }
  }

  gender = this.props.nav.survey.surveyConfig.gender

  documentType = this.props.nav.survey.surveyConfig.documentType

  shouldComponentUpdate() {
    return this.props.navigation.isFocused()
  }

  render() {
    const { t } = this.props
    const { survey, readonly } = this.props.nav
    const { showErrors } = this.state

    const draft =
      this.props.navigation.getParam('family') ||
      this.props.drafts.find(draft => draft.draftId === this.draftId)
    let autofocusFirstName
    if (this.getFieldValue(draft, 'firstName')) {
      autofocusFirstName = false
    } else {
      autofocusFirstName = true
    }

    return (
      <StickyFooter
        handleClick={this.handleClick}
        continueLabel={t('general.continue')}
        readonly={readonly}
        progress={
          !readonly && draft ? draft.progress.current / draft.progress.total : 0
        }
      >
        <Decoration variation="primaryParticipant">
          <Icon name="face" color={colors.grey} size={61} style={styles.icon} />
          <Text style={[globalStyles.h2Bold, styles.heading]}>
            {t('views.family.primaryParticipantHeading')}
          </Text>
        </Decoration>

        <TextInput
          autoFocus={autofocusFirstName}
          validation="string"
          field="firstName"
          readonly={readonly}
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
          readonly={readonly}
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
          readonly={readonly}
          label={t('views.family.gender')}
          placeholder={t('views.family.selectGender')}
          field="gender"
          value={this.getFieldValue(draft, 'gender') || ''}
          detectError={this.detectError}
          showErrors={showErrors}
          options={this.gender}
        />
        {draft && draft.familyData.familyMembersList[0].gender === 'O' ? (
          <TextInput
            field="otherGender"
            validation="string"
            onChangeText={this.addSurveyData}
            readonly={readonly}
            placeholder={t('views.family.specifyGender')}
            value={this.getFieldValue(draft, 'otherGender') || ''}
            required
            detectError={this.detectError}
            showErrors={showErrors}
          />
        ) : null}
        <DateInput
          required
          label={t('views.family.dateOfBirth')}
          field="birthDate"
          detectError={this.detectError}
          showErrors={showErrors}
          onValidDate={this.addSurveyData}
          value={this.getFieldValue(draft, 'birthDate')}
          readonly={readonly}
        />

        <Select
          required
          onChange={this.addSurveyData}
          readonly={readonly}
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
          readonly={readonly}
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
          readonly={readonly}
          label={t('views.family.countryOfBirth')}
          countrySelect
          country={survey.surveyConfig.surveyLocation.country}
          placeholder={t('views.family.countryOfBirth')}
          field="birthCountry"
          value={
            this.getFieldValue(draft, 'birthCountry') ||
            survey.surveyConfig.surveyLocation.country
          }
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <Select
          id="familyMembersCount"
          required
          onChange={this.addFamilyCount}
          readonly={readonly}
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
          readonly={readonly}
          field="email"
          value={this.getFieldValue(draft, 'email')}
          placeholder={t('views.family.email')}
          validation="email"
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <TextInput
          onChangeText={this.addSurveyData}
          readonly={readonly}
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
  heading: {
    alignSelf: 'center',
    textAlign: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
    color: colors.grey
  }
})

FamilyParticipant.propTypes = {
  t: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired,
  nav: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  createDraft: PropTypes.func.isRequired,
  addSurveyFamilyMemberData: PropTypes.func.isRequired,
  addDraftProgress: PropTypes.func.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  removeFamilyMembers: PropTypes.func.isRequired,
  updateNav: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  createDraft,
  addSurveyFamilyMemberData,
  addDraftProgress,
  addSurveyData,
  removeFamilyMembers,
  updateNav
}

const mapStateToProps = ({ drafts, nav }) => ({
  drafts,
  nav
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FamilyParticipant)
)
