import React, { Component } from 'react'
import { StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import uuid from 'uuid/v1'
import { createDraft, updateDraft } from '../../redux/actions'
import { withNamespaces } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialIcons'
import StickyFooter from '../../components/StickyFooter'
import Select from '../../components/Select'
import TextInput from '../../components/TextInput'
import DateInput from '../../components/DateInput'
import Decoration from '../../components/decoration/Decoration'
import colors from '../../theme.json'
import globalStyles from '../../globalStyles'
import { getTotalScreens } from './helpers'

export class FamilyParticipant extends Component {
  survey = this.props.navigation.getParam('survey')

  readOnly = this.props.navigation.getParam('readOnly')

  errorsDetected = []

  state = {
    loading: false,
    errorsDetected: [],
    showErrors: false,
    draft: null
  }

  detectError = async (error, field) => {
    if (error && !this.errorsDetected.includes(field)) {
      this.errorsDetected.push(field)
    } else if (!error) {
      this.errorsDetected = this.errorsDetected.filter(item => item !== field)
    }
    const { navigation } = this.props

    await this.setState({
      errorsDetected: this.errorsDetected
    })

    if (this.state.errorsDetected.length) {
      navigation.setParams({
        isNewDraft: true
      })
    } else {
      navigation.setParams({
        isNewDraft: !navigation.getParam('draft')
      })
    }
  }

  handleClick = () => {
    const { countFamilyMembers } = this.state.draft.familyData
    // check if form is valid
    if (this.errorsDetected.length) {
      this.setState({
        showErrors: true
      })
    } else {
      if (!this.state.loading) {
        this.setState({
          loading: true
        })
        const { draft } = this.state
        const survey = this.survey
        // if this is a new draft, add it to the store
        if (this.props.navigation.getParam('isNewDraft')) {
          this.props.createDraft(draft)
        } else {
          this.props.updateDraft(draft.draftId, draft)
        }

        if (countFamilyMembers && countFamilyMembers > 1) {
          // if multiple family members navigate to members screens
          this.props.navigation.push('FamilyMembersNames', {
            draft,
            survey
          })
        } else {
          // if only one family member, navigate directly to location
          this.props.navigation.navigate('Location', { draft, survey })
        }
      }
    }
  }

  addFamilyCount = value => {
    const { draft } = this.state
    const { countFamilyMembers } = this.state.draft.familyData

    let familyMembersList = this.state.draft.familyData.familyMembersList

    if (value !== -1 && countFamilyMembers > value) {
      familyMembersList.splice(value, familyMembersList.length - 1)
    } else if (
      value !== -1 &&
      (countFamilyMembers < value || !countFamilyMembers)
    ) {
      for (var i = 0; i < value - (countFamilyMembers || 1); i++) {
        familyMembersList.push({ firstParticipant: false })
      }
    }

    if (value === -1) {
      familyMembersList.splice(1, familyMembersList.length - 1)
    }

    this.setState({
      draft: {
        ...draft,
        familyData: {
          ...draft.familyData,
          countFamilyMembers: value === -1 ? 1 : value,
          familyMembersList
        }
      }
    })

    this.setState({
      showErrors: false
    })
  }

  getFamilyMembersCountArray = () => [
    { text: this.props.t('views.family.onlyPerson'), value: 1 },
    ...Array.from(new Array(24), (val, index) => ({
      value: index + 2,
      text: `${index + 2}`
    })),

    {
      text: this.props.t('views.family.preferNotToSay'),
      value: -1
    }
  ]

  updateParticipant = (value, field) => {
    const { draft } = this.state

    this.setState({
      draft: {
        ...draft,
        familyData: {
          ...draft.familyData,
          familyMembersList: Object.assign(
            [],
            draft.familyData.familyMembersList,
            {
              [0]: {
                ...draft.familyData.familyMembersList[0],
                [field]: value
              }
            }
          )
        }
      }
    })
  }

  generateNewDraft = () => ({
    status: 'Draft',
    surveyId: this.survey.id,
    surveyVersionId: this.props.navigation.getParam('survey')[
      'surveyVersionId'
    ],
    created: Date.now(),
    draftId: uuid(),
    economicSurveyDataList: [],
    indicatorSurveyDataList: [],
    priorities: [],
    achievements: [],
    progress: {
      screen: 'FamilyParticipant',
      total: getTotalScreens(this.props.navigation.getParam('survey'))
    },
    familyData: {
      familyMembersList: [
        {
          firstParticipant: true,
          socioEconomicAnswers: [],
          birthCountry: this.survey.surveyConfig.surveyLocation.country
        }
      ]
    }
  })

  componentDidMount() {
    const { navigation } = this.props
    const draft =
      this.props.navigation.getParam('draft') ||
      this.props.navigation.getParam('family') ||
      this.generateNewDraft()

    if (!this.readOnly) {
      navigation.setParams({
        isNewDraft: !navigation.getParam('draft'),
        getCurrentDraftState: () => this.state.draft
      })

      if (draft.progress.screen !== 'FamilyParticipant') {
        draft.progress = {
          ...draft.progress,
          screen: 'FamilyParticipant',
          total: getTotalScreens(this.survey)
        }
      }
    }

    this.setState({
      draft
    })
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused()
  }

  render() {
    const { t } = this.props
    const { showErrors, draft } = this.state

    const participant = draft ? draft.familyData.familyMembersList[0] : {}

    return draft ? (
      <StickyFooter
        handleClick={this.handleClick}
        continueLabel={t('general.continue')}
        readonly={this.readOnly}
        progress={!this.readOnly && draft ? 1 / draft.progress.total : 0}
      >
        <Decoration variation="primaryParticipant">
          <Icon name="face" color={colors.grey} size={61} style={styles.icon} />
          {this.readOnly !== true ? (
            <Text
              readonly={this.readOnly}
              style={[globalStyles.h2Bold, styles.heading]}
            >
              {t('views.family.primaryParticipantHeading')}
            </Text>
          ) : null}
        </Decoration>

        <TextInput
          autoFocus={!participant.firstName}
          validation="string"
          field="firstName"
          readonly={this.readOnly}
          onChangeText={this.updateParticipant}
          placeholder={t('views.family.firstName')}
          value={participant.firstName || ''}
          required
          detectError={this.detectError}
          showErrors={showErrors}
          upperCase
        />
        <TextInput
          field="lastName"
          validation="string"
          onChangeText={this.updateParticipant}
          readonly={this.readOnly}
          placeholder={t('views.family.lastName')}
          value={participant.lastName || ''}
          required
          detectError={this.detectError}
          showErrors={showErrors}
          upperCase
        />
        <Select
          id="gender"
          required
          onChange={this.updateParticipant}
          otherField="customGender"
          otherPlaceholder={t('views.family.specifyGender')}
          otherValue={participant.customGender}
          readonly={this.readOnly}
          label={t('views.family.gender')}
          placeholder={t('views.family.selectGender')}
          field="gender"
          value={participant.gender || ''}
          detectError={this.detectError}
          showErrors={showErrors}
          options={this.survey.surveyConfig.gender}
        />
        <DateInput
          required
          label={t('views.family.dateOfBirth')}
          field="birthDate"
          detectError={this.detectError}
          showErrors={showErrors}
          onValidDate={this.updateParticipant}
          value={participant.birthDate}
          readonly={this.readOnly}
        />

        <Select
          required
          onChange={this.updateParticipant}
          otherPlaceholder={t('views.family.customDocumentType')}
          otherField="customDocumentType"
          otherValue={participant.customDocumentType}
          readonly={this.readOnly}
          label={t('views.family.documentType')}
          placeholder={t('views.family.documentType')}
          field="documentType"
          value={participant.documentType || ''}
          detectError={this.detectError}
          showErrors={showErrors}
          options={this.survey.surveyConfig.documentType}
        />

        <TextInput
          onChangeText={this.updateParticipant}
          readonly={this.readOnly}
          field="documentNumber"
          required
          value={participant.documentNumber}
          placeholder={t('views.family.documentNumber')}
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <Select
          id="country"
          required
          onChange={this.updateParticipant}
          readonly={this.readOnly}
          label={t('views.family.countryOfBirth')}
          defaultCountry={this.survey.surveyConfig.surveyLocation.country}
          countrySelect
          countriesOnTop={this.survey.surveyConfig.countryOfBirth}
          placeholder={t('views.family.countryOfBirth')}
          field="birthCountry"
          value={participant.birthCountry}
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <Select
          id="familyMembersCount"
          field="countFamilyMembers"
          required
          onChange={this.addFamilyCount}
          readonly={this.readOnly}
          label={t('views.family.peopleLivingInThisHousehold')}
          placeholder={t('views.family.peopleLivingInThisHousehold')}
          value={draft.familyData.countFamilyMembers || ''}
          detectError={this.detectError}
          showErrors={showErrors}
          options={this.getFamilyMembersCountArray()}
        />
        <TextInput
          onChangeText={this.updateParticipant}
          readonly={this.readOnly}
          field="email"
          value={participant.email}
          placeholder={t('views.family.email')}
          validation="email"
          detectError={this.detectError}
          showErrors={showErrors}
        />
        <TextInput
          onChangeText={this.updateParticipant}
          readonly={this.readOnly}
          field="phoneNumber"
          value={participant.phoneNumber}
          placeholder={t('views.family.phone')}
          validation="phoneNumber"
          detectError={this.detectError}
          showErrors={showErrors}
        />
      </StickyFooter>
    ) : null
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
    paddingTop: 8,
    paddingHorizontal: 20,
    color: colors.grey
  }
})

FamilyParticipant.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  createDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  createDraft,
  updateDraft
}

const mapStateToProps = () => ({})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FamilyParticipant)
)
