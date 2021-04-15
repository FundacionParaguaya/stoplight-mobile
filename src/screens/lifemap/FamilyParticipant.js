import {PhoneNumberUtil} from 'google-libphonenumber';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import uuid from 'uuid/v1';

import Decoration from '../../components/decoration/Decoration';
import DateInput from '../../components/form/DateInput';
import Select from '../../components/form/Select';
import TextInput from '../../components/form/TextInput';
import StickyFooter from '../../components/StickyFooter';
import globalStyles from '../../globalStyles';
import {createDraft, updateDraft} from '../../redux/actions';
import colors from '../../theme.json';
import {generateNewDemoDraft, calculateProgressBar} from '../utils/helpers';
import CallingCodes from './CallingCodes';
import {getTotalScreens, setValidationSchema} from './helpers';

export class FamilyParticipant extends Component {
  survey = this.props.route.params.survey;
  draftId = this.props.route.params.draftId;
  readOnly = this.props.route.params.readOnly;
  phoneCodes = CallingCodes.map((element) => ({
    ...element,
    text: `${element.country} - (+${element.value})`,
  }));

  initialPhoneCode = this.survey
    ? this.phoneCodes.find(
        (e) => e.code == this.survey.surveyConfig.surveyLocation.country,
      ).value
    : null;

  requiredFields =
    (this.survey &&
      this.survey.surveyConfig &&
      this.survey.surveyConfig.requiredFields &&
      this.survey.surveyConfig.requiredFields.primaryParticipant) ||
    null;
  familyMembersArray = []; // the options array for members count dropdown
  readOnlyDraft = this.props.route.params.family || [];
  projectId = this.props.route.params.project || null;

  state = {
    errors: [],
    showErrors: false,
  };

  getDraft = () =>
    this.props.drafts.find((draft) => draft.draftId === this.draftId);

  setError = (error, field) => {
    const {errors} = this.state;
    let amountErrors = [];

    if (error && !errors.includes(field)) {
      this.setState(
        (previousState) => {
          amountErrors = [...previousState.errors, field];
          return {
            ...previousState,
            errors: amountErrors,
          };
        },
        () => this.onErrorStateChange(error || amountErrors.length),
      );
    } else if (!error) {
      this.setState(
        (previousState) => {
          amountErrors = errors.filter((item) => item !== field);
          return {
            ...previousState,
            errors: amountErrors,
          };
        },
        () => this.onErrorStateChange(error || amountErrors.length),
      );
    }
  };

  validateForm = () => {
    if (this.state.errors.length) {
      this.setState({
        showErrors: true,
      });
    } else {
      this.onContinue();
    }
  };

  onContinue = () => {
    if (this.readOnly) {
      return;
    }

    const draft = this.getDraft();
    const survey = this.survey;

    const {draftId} = draft;
    const {familyMembersList} = draft.familyData;

    if (familyMembersList.length > 1) {
      // if multiple family members navigate to members screens
      this.props.navigation.replace('FamilyMembersNames', {
        draftId,
        survey,
      });
    } else {
      // if only one family member, navigate directly to location
      this.props.navigation.navigate('Location', {draftId, survey});
    }
  };

  addFamilyCount = (value) => {
    if (this.readOnly) {
      return;
    }
    const draft = this.getDraft();
    const {countFamilyMembers} = draft.familyData;
    const PREFER_NOT_TO_SAY = -1;
    let familyMembersList = draft.familyData.familyMembersList;
    const numberOfMembers =
      countFamilyMembers === PREFER_NOT_TO_SAY ? 1 : countFamilyMembers;
    const valueIsNumber = typeof value === 'number';
    if (
      valueIsNumber &&
      value !== PREFER_NOT_TO_SAY &&
      numberOfMembers > value
    ) {
      var itemsICanRemove = 0;
      for (var index in familyMembersList) {
        var currMember = familyMembersList[index];
        if (
          !currMember.birthDate &&
          !currMember.gender &&
          !currMember.firstName
        ) {
          itemsICanRemove += 1;
        }
      }
      var finalRemove = 0;
      if (itemsICanRemove > familyMembersList.length - value) {
        finalRemove = value;
      } else {
        finalRemove = itemsICanRemove;
      }

      if (finalRemove != 0) {
        var itemsRemoved = 0;
        let i = familyMembersList.length;
        while (i--) {
          if (
            !currMember.birthDate &&
            !currMember.gender &&
            !currMember.firstName &&
            itemsRemoved != finalRemove
          ) {
            familyMembersList.splice(i, 1);
            itemsRemoved += 1;
          }
        }
      }
    } else if (
      valueIsNumber &&
      value !== PREFER_NOT_TO_SAY &&
      (numberOfMembers < value || !numberOfMembers)
    ) {
      var newMembersToAdd = value - familyMembersList.length;
      if (newMembersToAdd > 0) {
        for (let a = 0; a < newMembersToAdd; a++) {
          familyMembersList.push({firstParticipant: false});
        }
      }
    }
    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        countFamilyMembers: valueIsNumber ? value : undefined,
        familyMembersList,
      },
    });
  };

  getFamilyMembersCountArray = () => [
    {text: this.props.t('views.family.onlyPerson'), value: 1},
    ...Array.from(new Array(24), (val, index) => ({
      value: index + 2,
      text: `${index + 2}`,
    })),
    {
      text: this.props.t('views.family.preferNotToSay'),
      value: -1,
    },
  ];

  phoneValidation = (value) => {
    const phoneUtil = PhoneNumberUtil.getInstance();
    try {
      const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
      const phoneCode = draft.familyData.familyMembersList[0].phoneCode
        ? draft.familyData.familyMembersList[0].phoneCode
        : this.initialPhoneCode;
      const contryCode = this.phoneCodes
        ? this.phoneCodes.find((x) => x.value === phoneCode).code
        : null;
      const international = '+' + phoneCode + ' ' + value;
      const phone = phoneUtil.parse(international, contryCode);
      let validation = phoneUtil.isValidNumber(phone);
      return validation;
    } catch (e) {
      return false;
    }
  };

  updateParticipant = (value, field) => {
    if (this.readOnly || (!value && field == 'phoneCode')) {
      return;
    }
    const draft = this.getDraft();

    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        familyMembersList: Object.assign(
          [],
          draft.familyData.familyMembersList,
          {
            [0]: {
              ...draft.familyData.familyMembersList[0],
              [field]: value,
            },
          },
        ),
      },
    });
  };

  onErrorStateChange = (hasErrors) => {
    const {navigation} = this.props;

    // for this particular screen we need to detect if form is valid
    // in order to delete the draft on exiting

    navigation.setParams({
      deleteDraftOnExit: hasErrors,
    });
  };

  createNewDraft() {
    // check if current survey is demo
    const isDemo =
      this.survey &&
      this.survey.surveyConfig &&
      this.survey.surveyConfig.isDemo;
    // generate a new draft id
    const draftId = uuid();

    // and update the component and navigation with it
    this.draftId = draftId;
    this.props.navigation.setParams({draftId});


    const regularDraft = {
      draftId,
      project: this.projectId,
      stoplightSkipped: false,
      sign: '',
      pictures: [],
      sendEmail: false,
      created: Date.now(),
      status: 'Draft',
      surveyId: this.survey.id,
      surveyVersionId: this.survey.surveyVersionId,
      economicSurveyDataList: [],
      indicatorSurveyDataList: [],
      priorities: [],
      achievements: [],
      progress: {
        screen: 'FamilyParticipant',
        total: getTotalScreens(this.survey),
      },
      familyData: {
        familyMembersList: [
          {
            firstParticipant: true,
            socioEconomicAnswers: [],
            birthCountry:
              this.survey && this.survey.surveyConfig.surveyLocation.country,
            phoneCode: this.initialPhoneCode,
          },
        ],
      },
    };

    // create the new draft in redux
    this.props.createDraft(
      isDemo
        ? generateNewDemoDraft(this.survey, draftId, this.projectId)
        : regularDraft,
    );
  }

  componentDidMount() {
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    this.familyMembersArray = this.getFamilyMembersCountArray();
    // generate a new draft if not resuming or reviewing an old one,
    // else just set the draft progress

    if (!this.draftId && !this.readOnly) {
      this.createNewDraft();
    } else if (
      !this.readOnly &&
      draft.progress.screen !== 'FamilyParticipant'
    ) {
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          screen: 'FamilyParticipant',
        },
      });
    }
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }

  render() {
    const {t} = this.props;
    const {showErrors} = this.state;
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
    let participant = draft ? draft.familyData.familyMembersList[0] : {};
    return draft ? (
      <StickyFooter
        onContinue={this.validateForm}
        continueLabel={t('general.continue')}
        readOnly={!!this.readOnly}
        progress={calculateProgressBar({
          readOnly: this.readOnly,
          draft: draft,
          screen: 1,
        })}>
        <Decoration variation="primaryParticipant">
          <Icon name="face" color={colors.grey} size={61} style={styles.icon} />
          {!this.readOnly ? (
            <Text
              readOnly={this.readOnly}
              style={[globalStyles.h2Bold, styles.heading]}>
              {t('views.family.primaryParticipantHeading')}
            </Text>
          ) : null}
        </Decoration>

        <TextInput
          id="firstName"
          upperCase
          autoFocus={!participant.firstName}
          placeholder={t('views.family.firstName')}
          initialValue={participant.firstName || ''}
          required={setValidationSchema(this.requiredFields, 'firstName', true)}
          //validation="string"
          readOnly={!!this.readOnly}
          onChangeText={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'firstName')}
        />

        <TextInput
          id="lastName"
          upperCase
          placeholder={t('views.family.lastName')}
          initialValue={participant.lastName || ''}
          required={setValidationSchema(this.requiredFields, 'lastName', true)}
          //validation="string"
          readOnly={!!this.readOnly}
          onChangeText={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'lastName')}
        />

        <Select
          id="gender"
          label={t('views.family.gender')}
          placeholder={
            !!this.readOnly
              ? t('views.family.gender')
              : t('views.family.selectGender')
          }
          initialValue={participant.gender || ''}
          required={setValidationSchema(this.requiredFields, 'gender', true)}
          options={this.survey ? this.survey.surveyConfig.gender : []}
          onChange={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'gender')}
          otherField="customGender"
          otherPlaceholder={t('views.family.specifyGender')}
          readOnly={!!this.readOnly}
          initialOtherValue={participant.customGender}
        />

        <DateInput
          id="birthDate"
          required={setValidationSchema(this.requiredFields, 'birthDate', true)}
          label={t('views.family.dateOfBirth')}
          initialValue={participant.birthDate}
          readOnly={!!this.readOnly}
          onValidDate={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'birthDate')}
        />

        <Select
          id="documentType"
          label={t('views.family.documentType')}
          placeholder={t('views.family.documentType')}
          options={this.survey ? this.survey.surveyConfig.documentType : []}
          initialValue={participant.documentType || ''}
          required={setValidationSchema(
            this.requiredFields,
            'documentType',
            true,
          )}
          otherPlaceholder={t('views.family.customDocumentType')}
          otherField="customDocumentType"
          initialOtherValue={participant.customDocumentType}
          readOnly={!!this.readOnly}
          onChange={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'documentType')}
        />

        <TextInput
          id="documentNumber"
          placeholder={t('views.family.documentNumber')}
          initialValue={participant.documentNumber}
          required={setValidationSchema(
            this.requiredFields,
            'documentNumber',
            true,
          )}
          readOnly={!!this.readOnly}
          onChangeText={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'documentNumber')}
        />

        <Select
          id="birthCountry"
          countrySelect
          label={t('views.family.countryOfBirth')}
          placeholder={t('views.family.countryOfBirth')}
          initialValue={participant.birthCountry}
          required={setValidationSchema(
            this.requiredFields,
            'birthCountry',
            true,
          )}
          defaultCountry={
            this.survey ? this.survey.surveyConfig.surveyLocation.country : 'PY'
          }
          countriesOnTop={
            this.survey ? this.survey.surveyConfig.countryOfBirth : null
          }
          readOnly={!!this.readOnly}
          onChange={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'birthCountry')}
        />

        <TextInput
          id="email"
          initialValue={participant.email}
          placeholder={t('views.family.email')}
          validation="email"
          readOnly={!!this.readOnly}
          onChangeText={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'email')}
        />

        <Select
          id="phoneCode"
          label={t('views.family.phoneCode')}
          placeholder={t('views.family.phoneCode')}
          initialValue={participant.phoneCode || this.initialPhoneCode}
          options={this.phoneCodes}
          onChange={this.updateParticipant}
          readOnly={!!this.readOnly}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'phoneCode')}
        />

        <TextInput
          id="phoneNumber"
          initialValue={participant.phoneNumber}
          placeholder={t('views.family.phone')}
          validation="phoneNumber"
          phoneValidation={this.phoneValidation}
          readOnly={!!this.readOnly}
          onChangeText={this.updateParticipant}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'phoneNumber')}
        />

        <Select
          id="countFamilyMembers"
          label={t('views.family.peopleLivingInThisHousehold')}
          placeholder={t('views.family.peopleLivingInThisHousehold')}
          initialValue={draft.familyData.countFamilyMembers || ''}
          required={setValidationSchema(
            this.requiredFields,
            'countFamilyMembers',
            true,
          )}
          options={this.familyMembersArray}
          readOnly={!!this.readOnly}
          onChange={this.addFamilyCount}
          showErrors={showErrors}
          setError={(isError) => this.setError(isError, 'countFamilyMembers')}
        />
      </StickyFooter>
    ) : null;
  }
}
const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
  heading: {
    alignSelf: 'center',
    textAlign: 'center',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    color: colors.grey,
  },
});

FamilyParticipant.propTypes = {
  drafts: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  createDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  createDraft,
  updateDraft,
};

const mapStateToProps = ({drafts}) => ({drafts});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(FamilyParticipant),
);
