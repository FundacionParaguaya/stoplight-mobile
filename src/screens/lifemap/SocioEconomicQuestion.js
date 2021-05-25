import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {Platform, StyleSheet, Text, View, Button, I18nManager } from 'react-native';
import {connect} from 'react-redux';
import * as _ from 'lodash';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';

import {calculateProgressBar} from '../utils/helpers';
import SelectWithFormik from '../../components/formik/SelectWithFormik';
import RadioWithFormik from '../../components/formik/RadioWithFormik';
import InputWithFormik from '../../components/formik/InputWithFormik';
import InputWithDep from '../../components/formik/InputWithDep';
import CheckboxWithFormik from '../../components/formik/CheckboxWithFormik';
import StickyFooter from '../../components/StickyFooter';
import {updateDraft} from '../../redux/actions';
import colors from '../../theme.json';
import {
  getConditionalOptions,
  getConditionalQuestions,
  getDraftWithUpdatedEconomic,
  getDraftWithUpdatedFamilyEconomics,
  getDraftWithUpdatedQuestionsCascading,
  getElementsWithConditionsOnThem,
  familyMemberWillHaveQuestions,
  shouldShowQuestion,
} from '../utils/conditional_logic';
import {getTotalScreens, setScreen} from './helpers';
import i18n from '../../i18n';
import Audio from '../../components/Audio';
import globalStyles from '../../globalStyles';
const capitalize = (string) => _.startCase(string).replace(/ /g, '');
export class SocioEconomicQuestion extends Component {
  readOnlyDraft = this.props.route.params.family || [];
  readOnly = this.props.route.params.readOnly || false;
  survey = this.props.route.params.survey;
  draftId = this.props.route.params.draftId;
  state = {
    initialValues: {},
    questionsWithConditionsOnThem: [],
    conditionalQuestions: [],
  };
  fieldIsRequired = 'validation.fieldIsRequired';
  capitalize = (string) => _.startCase(string).replace(/ /g, '');

  getDraft = () =>
    this.props.drafts.find((draft) => draft.draftId === this.draftId);

  onPressBack = () => {
    const socioEconomics = this.props.route.params.socioEconomics;

    const STEP_BACK = -1;

    if (
      (socioEconomics && socioEconomics.currentScreen === 1) ||
      !socioEconomics
    ) {
      this.props.navigation.navigate('Location', {
        survey: this.survey,
        draftId: this.draftId,
      });
    } else {
      const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          socioEconomics: {
            currentScreen: setScreen(
              socioEconomics,
              this.getDraft(),
              STEP_BACK,
            ),
            questionsPerScreen: socioEconomics.questionsPerScreen,
            totalScreens: socioEconomics.totalScreens,
          },
        },
      });
      this.props.navigation.replace('SocioEconomicQuestion', {
        socioEconomics: {
          currentScreen: setScreen(socioEconomics, this.getDraft(), STEP_BACK),
          questionsPerScreen: socioEconomics.questionsPerScreen,
          totalScreens: socioEconomics.totalScreens,
        },
        survey: this.survey,
        draftId: this.draftId,
      });
    }
  };

  onContinue = () => {
    const socioEconomics = this.props.route.params.socioEconomics;
    const STEP_FORWARD = 1;
    const NEXT_SCREEN_NUMBER = setScreen(
      socioEconomics,
      this.getDraft(),
      STEP_FORWARD,
    );

    if (
      !socioEconomics ||
      (socioEconomics &&
        socioEconomics.currentScreen === socioEconomics.totalScreens) ||
      (socioEconomics && NEXT_SCREEN_NUMBER > socioEconomics.totalScreens)
    ) {
      this.props.navigation.replace('BeginLifemap', {
        survey: this.survey,
        draftId: this.draftId,
      });
    } else {
      const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          socioEconomics: {
            currentScreen: NEXT_SCREEN_NUMBER,
            questionsPerScreen: socioEconomics.questionsPerScreen,
            totalScreens: socioEconomics.totalScreens,
          },
        },
      });
      this.props.navigation.replace('SocioEconomicQuestion', {
        survey: this.survey,
        draftId: this.draftId,
        socioEconomics: {
          currentScreen: NEXT_SCREEN_NUMBER,
          questionsPerScreen: socioEconomics.questionsPerScreen,
          totalScreens: socioEconomics.totalScreens,
        },
      });
    }
  };

  isQuestionInCurrentScreen = (question) => {
    const socioEconomics = this.props.route.params.socioEconomics;

    const questions = socioEconomics
      ? socioEconomics.questionsPerScreen[socioEconomics.currentScreen - 1]
      : null;

    const {forFamily = [], forFamilyMember = []} = questions;
    let isPresent = false;
    const lookIn = question.forFamilyMember ? forFamilyMember : forFamily;

    for (const q of lookIn) {
      if (q.codeName === question.codeName) {
        isPresent = true;
        break;
      }
    }
    return isPresent;
  };

  updateEconomicAnswerCascading = (
    question,
    value,
    setFieldValue,
    memberIndex,
  ) => {
    const draftFromProps = !this.readOnly
      ? this.getDraft()
      : this.readOnlyDraft;

    const {conditionalQuestions, questionsWithConditionsOnThem} = this.state;
    const hasOtherOption = question.codeName.match(/^custom/g);

    // // We get a draft with updated answer
    let key = question.codeName;
    let currentDraft;
    let keyName = 'value';
    let hasOtherValue;
    if (Array.isArray(value)) {
      keyName = 'multipleValue';
      hasOtherValue = !!question.options.find((o) => o.otherOption);
    }

    let newAnswer = {
      key,
      [keyName]: value,
    };

    let selectedValues;
    let answer;
    let answers = !question.forFamilyMember
      ? draftFromProps.economicSurveyDataList
      : draftFromProps.familyData.familyMembersList[memberIndex]
          .socioEconomicAnswers;
    answer = (answers || []).find((ans) => ans.key === key);
    if (hasOtherOption) {
      key = _.camelCase(question.codeName.replace(/^custom/g, ''));

      answer = answers.find((ans) => ans.key === key);
      if (question.answerType === 'checkbox') {
        selectedValues = !!answer ? answer.multipleValue : [];
      } else {
        selectedValues = question.options.find((o) => o.otherOption).value;
      }

      keyName = !Array.isArray(selectedValues) ? 'value' : 'multipleValue';

      newAnswer = {
        key,
        [keyName]: selectedValues,
        other: value,
      };
    }

    if (hasOtherValue && !hasOtherOption && !!answer) {
      newAnswer = {
        key,
        [keyName]: value,
        other: answer.other,
      };
    }

    if (question.forFamilyMember) {
      currentDraft = getDraftWithUpdatedFamilyEconomics(
        draftFromProps,
        newAnswer,
        memberIndex,
      );
    } else {
      currentDraft = getDraftWithUpdatedEconomic(draftFromProps, newAnswer);
    }

    const cleanUpHook = (conditionalQuestion, index) => {
      // Cleanup value from form that won't be displayed
      if (conditionalQuestion.forFamilyMember) {
        if (this.isQuestionInCurrentScreen(conditionalQuestion)) {
          setFieldValue(
            `forFamilyMember.[${index}].[${conditionalQuestion.codeName}]`,
            '',
          );
        }
      } else if (this.isQuestionInCurrentScreen(conditionalQuestion)) {
        setFieldValue(`forFamily.[${conditionalQuestion.codeName}]`, '');
      }
    };
    // If the question has some conditionals on it,
    // execute function that builds a new draft with cascaded clean up
    // applied
    if (questionsWithConditionsOnThem.includes(question.codeName)) {
      currentDraft = getDraftWithUpdatedQuestionsCascading(
        currentDraft,
        conditionalQuestions.filter(
          (conditionalQuestion) =>
            conditionalQuestion.codeName !== question.codeName,
        ),
        cleanUpHook,
      );
    }
    // Updating formik value for the question that triggered everything
    if (question.forFamilyMember) {
      setFieldValue(
        `forFamilyMember.[${memberIndex}].[${question.codeName}]`,
        value,
      );
    } else {
      setFieldValue(`forFamily.[${question.codeName}]`, value);
    }

    this.props.updateDraft(currentDraft);
  };

  setSocioEconomicsParam() {
    const {navigation} = this.props;
    const {params} = this.props.route;

    // If this is the first socio economics screen set the whole process
    // in the navigation. On every next screen it will know which questions
    // to ask and if it is done.
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    if (!params.socioEconomics) {
      let currentDimension = '';
      let questionsPerScreen = [];
      let totalScreens = 0;

      // go trough all questions and separate them by screen
      // filter method - checks if family members meet the conditions based on age
      this.survey.surveyEconomicQuestions.forEach((question) => {
        // if the dimention of the questions change, change the page
        if (question.topic !== currentDimension) {
          currentDimension = question.topic;
          totalScreens += 1;
        }

        // if there is object for n screen create one
        if (!questionsPerScreen[totalScreens - 1]) {
          questionsPerScreen[totalScreens - 1] = {
            forFamilyMember: [],
            forFamily: [],
          };
        }

        if (question.forFamilyMember) {
          questionsPerScreen[totalScreens - 1].forFamilyMember.push(question);
        } else {
          questionsPerScreen[totalScreens - 1].forFamily.push(question);
        }
      });

      if (params.fromBeginLifemap) {
        navigation.setParams({
          socioEconomics: {
            currentScreen: totalScreens,
            questionsPerScreen,
            totalScreens,
          },
          title: questionsPerScreen[totalScreens - 1].forFamily[0]
            ? questionsPerScreen[totalScreens - 1].forFamily[0].topic
            : questionsPerScreen[totalScreens - 1].forFamilyMember[0].topic,
        });
      } else {
        const page = params.page || 0;
        navigation.setParams({
          socioEconomics: {
            currentScreen: page ? page + 1 : 1,
            questionsPerScreen,
            totalScreens,
          },
          title: questionsPerScreen[page].forFamily[0]
            ? questionsPerScreen[page].forFamily[0].topic
            : questionsPerScreen[page].forFamilyMember[0].topic,
        });
      }

      let screen = 1;
      if (this.readOnly) {
        screen = params.page + 1;
      } else if (draft.progress.socioEconomics) {
        screen = draft.progress.socioEconomics.currentScreen;
      }
      const socioEconomics = {
        currentScreen: screen,
        questionsPerScreen,
        totalScreens,
      };

      const questionsForThisScreen = socioEconomics
        ? socioEconomics.questionsPerScreen[socioEconomics.currentScreen - 1]
        : [];

      this.setState({
        initialValues: this.buildInitialValuesForForm(
          questionsForThisScreen,
          draft,
        ),
      });
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          socioEconomics,
        },
      });
    } else {
      const socioEconomics = params.socioEconomics;
      const questionsForThisScreen = socioEconomics
        ? socioEconomics.questionsPerScreen[socioEconomics.currentScreen - 1]
        : [];

      navigation.setParams({
        title: questionsForThisScreen.forFamily[0]
          ? questionsForThisScreen.forFamily[0].topic
          : questionsForThisScreen.forFamilyMember[0].topic,
      });

      this.setState({
        initialValues: this.buildInitialValuesForForm(
          questionsForThisScreen,
          draft,
        ),
      });
    }
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }

  componentDidMount() {
    this.setSocioEconomicsParam();
    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    if (!this.readOnly) {
      const conditionalQuestions = getConditionalQuestions(this.survey);
      const elementsWithConditionsOnThem = getElementsWithConditionsOnThem(
        conditionalQuestions,
      );

      this.setState({
        conditionalQuestions,
        questionsWithConditionsOnThem:
          elementsWithConditionsOnThem.questionsWithConditionsOnThem,
      });

      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          screen: 'SocioEconomicQuestion',
          total: getTotalScreens(this.survey),
        },
      });

      this.props.navigation.setParams({
        onPressBack: this.onPressBack,
      });
    }
  }
  buildValidationForField = (question) => {
    let validation = Yup.string();
    if (question.required) {
      validation = validation.required(this.fieldIsRequired);
    }
    return validation;
  };

  buildValidationSchemaForQuestions = (questions, currentDraft) => {
    const forFamilySchema = {};
    const familyQuestions = (questions && questions.forFamily) || [];

    familyQuestions.forEach((question) => {
      if (shouldShowQuestion(question, currentDraft)) {
        forFamilySchema[question.codeName] = this.buildValidationForField(
          question,
        );
      }
    });

    const forFamilyMemberSchema = {};
    const familyMemberQuestions =
      (questions && questions.forFamilyMember) || [];
    const familyMembersList = _.get(
      currentDraft,
      'familyData.familyMembersList',
      [],
    );

    familyMembersList.forEach((_member, index) => {
      const memberScheme = {};
      familyMemberQuestions.forEach((question) => {
        if (shouldShowQuestion(question, currentDraft, index)) {
          memberScheme[question.codeName] = this.buildValidationForField(
            question,
          );
        }
      });

      forFamilyMemberSchema[index] = Yup.object().shape({
        ...memberScheme,
      });
    });
    const validationSchema = Yup.object().shape({
      forFamily: Yup.object().shape(forFamilySchema),
      forFamilyMember: Yup.object().shape(forFamilyMemberSchema),
    });

    return validationSchema;
  };

  buildInitialValuesForForm = (questions, currentDraft) => {
    const forFamilyInitial = {};
    const familyQuestions = (questions && questions.forFamily) || [];

    familyQuestions.forEach((question) => {
      const draftQuestion =
        currentDraft.economicSurveyDataList.find(
          (e) => e.key === question.codeName,
        ) || {};

      if (question.options.find((o) => o.otherOption)) {
        forFamilyInitial[`custom${this.capitalize(question.codeName)}`] =
          draftQuestion.hasOwnProperty('other') && !!draftQuestion.other
            ? draftQuestion.other
            : '';
      }
      forFamilyInitial[question.codeName] =
        (draftQuestion.hasOwnProperty('value') && !!draftQuestion.value
          ? draftQuestion.value
          : draftQuestion.multipleValue) || '';
    });

    const forFamilyMemberInitial = {};
    const familyMemberQuestions =
      (questions && questions.forFamilyMember) || [];
    const familyMembersList = _.get(
      currentDraft,
      'familyData.familyMembersList',
      [],
    );
    familyMembersList.forEach((familyMember, index) => {
      const memberInitial = {};
      const socioEconomicAnswers = familyMember.socioEconomicAnswers || [];
      familyMemberQuestions.forEach((question) => {
        const draftQuestion =
          socioEconomicAnswers.find((e) => e.key === question.codeName) || {};
        if (question.options.find((o) => o.otherOption)) {
          memberInitial[`custom${capitalize(question.codeName)}`] =
            draftQuestion.hasOwnProperty('other') && !!draftQuestion.other
              ? draftQuestion.other
              : '';
        }

        memberInitial[question.codeName] =
          (draftQuestion.hasOwnProperty('value') && !!draftQuestion.value
            ? draftQuestion.value
            : draftQuestion.multipleValue) || '';
      });
      forFamilyMemberInitial[index] = memberInitial;
    });

    return {
      forFamily: forFamilyInitial,
      forFamilyMember: forFamilyMemberInitial,
    };
  };

  render() {
    const {t, user} = this.props;

    const socioEconomics = this.props.route.params.socioEconomics;

    const questions = socioEconomics
      ? socioEconomics.questionsPerScreen[socioEconomics.currentScreen - 1]
      : null;

    const draft = !this.readOnly ? this.getDraft() : this.readOnlyDraft;

    if (
      !questions ||
      !this.state.initialValues.forFamily ||
      !this.state.initialValues.forFamilyMember
    ) {
      return null;
    }

    let topicAudio = null;
    if (questions && questions.forFamily.length > 0) {
      topicAudio = questions.forFamily[0]
        ? questions.forFamily[0].topicAudio
        : null;
    }
    if (questions && questions.forFamilyMember.length > 0) {
      topicAudio = questions.forFamilyMember[0]
        ? questions.forFamilyMember[0].topicAudio
        : null;
    }

    return (
      <Formik
        enableReinitialize
        initialValues={this.state.initialValues}
        validationSchema={this.buildValidationSchemaForQuestions(
          questions,
          draft,
        )}
        noValidate={true}
        onSubmit={this.onContinue}>
        {(formik) => (
          <StickyFooter
            onContinue={() => {
              for (let item of questions.forFamily) {
                formik.setFieldTouched(`forFamily.[${item.codeName}]`);
              }
              for (
                let i = 0;
                i < draft.familyData.familyMembersList.length;
                i++
              ) {
                for (let item of questions.forFamilyMember) {
                  formik.setFieldTouched(
                    `forFamilyMember.[${i}].[${item.codeName}]`,
                  );
                }
              }

              formik.handleSubmit();
            }}
            continueLabel={i18n.t('general.continue')}
            readOnly={!!this.readOnly}
            progress={calculateProgressBar({
              readOnly: this.readOnly,
              draft: draft,
              screen: socioEconomics ? socioEconomics.currentScreen + 4 : 4,
            })}>
            {/* <Decoration variation="socioEconomicQuestion" /> */}
            {user.interactive_help && topicAudio && (
              <Audio
                label={t('views.lifemap.audioHelp')}
                audioId={topicAudio}
                url={topicAudio}
                containerStyles={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  width: '100%',
                  paddingBottom: 10,
                }}
                styles={{
                  color: colors.palegreen,
                  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                }}
                labelStyle={globalStyles.h4}
              />
            )}
            {/* questions for entire family */}
            {questions &&
              questions.forFamily &&
              questions.forFamily.length > 0 &&
              questions.forFamily.map((question) => {
                const hasOtherOption = question.options.find(
                  (o) => o.otherOption,
                );

                const modifiedQuestion = hasOtherOption
                  ? {
                      ...question,
                      codeName: `custom${this.capitalize(question.codeName)}`,
                    }
                  : null;

                const cleanUp = (value) => {
                  this.updateEconomicAnswerCascading(
                    modifiedQuestion,
                    '',
                    formik.setFieldValue,
                  );
                  this.updateEconomicAnswerCascading(
                    question,
                    value,
                    formik.setFieldValue,
                  );
                };
                const cleanUpMultipleValue = () => {
                  this.updateEconomicAnswerCascading(
                    modifiedQuestion,
                    '',
                    formik.setFieldValue,
                  );
                };

                if (!shouldShowQuestion(question, draft)) {
                  return <React.Fragment key={question.codeName} />;
                }

                if (question.answerType === 'select') {
                  return (
                    <React.Fragment key={question.codeName}>
                      <SelectWithFormik
                        t={t}
                        name={`forFamily.[${question.codeName}]`}
                        formik={formik}
                        readOnly={!!this.readOnly}
                        value={
                          formik.values.forFamily
                            ? formik.values.forFamily[question.codeName]
                            : ''
                        }
                        rawOptions={getConditionalOptions(question, draft)}
                        question={question}
                        onChange={(value) => {
                          this.updateEconomicAnswerCascading(
                            question,
                            value ? value.value : '',
                            formik.setFieldValue,
                          );
                        }}
                      />
                      <InputWithDep
                        label="Specify Other"
                        formik={formik}
                        key={`custom${capitalize(question.codeName)}`}
                        dep={question.codeName}
                        from={draft}
                        fieldOptions={question.options}
                        target={`custom${capitalize(question.codeName)}`}
                        isEconomic
                        t={t}
                        readOnly={!!this.readOnly}
                        lng={this.props.language || 'en'}
                        question={question}
                        name={`forFamily.custom${capitalize(
                          question.codeName,
                        )}`}
                        onChange={(e) => {
                          this.updateEconomicAnswerCascading(
                            modifiedQuestion,
                            e,
                            formik.setFieldValue,
                          );
                        }}
                        cleanUp={cleanUp}
                      />
                    </React.Fragment>
                  );
                }
                if (question.answerType === 'radio') {
                  return (
                    <React.Fragment key={question.codeName}>
                      <RadioWithFormik
                        readOnly={!!this.readOnly}
                        rawOptions={getConditionalOptions(question, draft)}
                        t={t}
                        formik={formik}
                        question={question}
                        key={question.codeName}
                        name={`forFamily.[${question.codeName}]`}
                        onChange={(e) => {
                          this.updateEconomicAnswerCascading(
                            question,
                            e,
                            formik.setFieldValue,
                          );
                        }}
                      />

                      <InputWithDep
                        formik={formik}
                        key={`custom${capitalize(question.codeName)}`}
                        dep={question.codeName}
                        from={draft}
                        fieldOptions={question.options}
                        target={`custom${capitalize(question.codeName)}`}
                        isEconomic
                        t={t}
                        readOnly={!!this.readOnly}
                        lng={this.props.language || 'en'}
                        question={question}
                        name={`forFamily.custom${capitalize(
                          question.codeName,
                        )}`}
                        onChange={(e) => {
                          this.updateEconomicAnswerCascading(
                            modifiedQuestion,
                            e,
                            formik.setFieldValue,
                          );
                        }}
                        cleanUp={cleanUp}
                      />
                    </React.Fragment>
                  );
                }
                if (question.answerType === 'checkbox') {
                  return (
                    <React.Fragment key={question.codeName}>
                      <CheckboxWithFormik
                        rawOptions={getConditionalOptions(question, draft)}
                        t={t}
                        formik={formik}
                        readOnly={!!this.readOnly}
                        question={question}
                        name={`forFamily.[${question.codeName}]`}
                        onChange={(e) => {
                          this.updateEconomicAnswerCascading(
                            question,
                            e,
                            formik.setFieldValue,
                          );
                        }}
                      />
                      <InputWithDep
                        label="Specify Other"
                        formik={formik}
                        key={`custom${capitalize(question.codeName)}`}
                        dep={question.codeName}
                        from={draft}
                        fieldOptions={question.options}
                        target={`custom${capitalize(question.codeName)}`}
                        isEconomic
                        isMultiValue
                        t={t}
                        readOnly={!!this.readOnly}
                        lng={this.props.language || 'en'}
                        question={question}
                        name={`forFamily.custom${capitalize(
                          question.codeName,
                        )}`}
                        onChange={(e) => {
                          this.updateEconomicAnswerCascading(
                            modifiedQuestion,
                            e,
                            formik.setFieldValue,
                          );
                        }}
                        cleanUp={cleanUpMultipleValue}
                      />
                    </React.Fragment>
                  );
                }
                return (
                  <InputWithFormik
                    lng={this.props.language || 'en'}
                    t={t}
                    formik={formik}
                    readOnly={!!this.readOnly}
                    question={question}
                    key={question.codeName}
                    name={`forFamily.[${question.codeName}]`}
                    onChange={(e) =>
                      this.updateEconomicAnswerCascading(
                        question,
                        e,
                        formik.setFieldValue,
                      )
                    }
                  />
                );
              })}

            {questions &&
              questions.forFamilyMember &&
              questions.forFamilyMember.length > 0 &&
              draft.familyData.familyMembersList.map((familyMember, index) => {
                const willShowQuestions = familyMemberWillHaveQuestions(
                  questions,
                  draft,
                  index,
                );
                if (!willShowQuestions) {
                  return <React.Fragment key={familyMember.firstName} />;
                }
                return (
                  <React.Fragment key={index}>
                    <Text id={familyMember.firstName} style={styles.memberName}>
                      {familyMember.firstName}{' '}
                      {familyMember.lastName && familyMember.lastName}
                    </Text>

                    <React.Fragment>
                      {questions.forFamilyMember.map((question) => {
                        const hasOtherOption = question.options.find(
                          (o) => o.otherOption,
                        );
                        const modifiedQuestion = hasOtherOption
                          ? {
                              ...question,
                              codeName: `custom${capitalize(
                                question.codeName,
                              )}`,
                            }
                          : null;
                        const cleanUp = (value) => {
                          this.updateEconomicAnswerCascading(
                            modifiedQuestion,
                            '',
                            formik.setFieldValue,
                            index,
                          );
                          this.updateEconomicAnswerCascading(
                            question,
                            value,
                            formik.setFieldValue,
                            index,
                          );
                        };

                        const cleanUpMultipleValue = () => {
                          this.updateEconomicAnswerCascading(
                            modifiedQuestion,
                            '',
                            formik.setFieldValue,
                            index || 0,
                          );
                        };

                        if (!shouldShowQuestion(question, draft, index)) {
                          return <React.Fragment key={question.codeName} />;
                        }
                        if (question.answerType === 'select') {
                          return (
                            <React.Fragment key={question.codeName}>
                              <SelectWithFormik
                                rawOptions={getConditionalOptions(
                                  question,
                                  draft,
                                  index,
                                )}
                                t={t}
                                name={`forFamilyMember.[${index}].[${question.codeName}]`}
                                formik={formik}
                                readOnly={!!this.readOnly}
                                value={
                                  formik.values.forFamilyMember
                                    ? formik.values.forFamilyMember[index][
                                        question.codeName
                                      ]
                                    : ''
                                }
                                question={question}
                                onChange={(value) => {
                                  this.updateEconomicAnswerCascading(
                                    question,
                                    value ? value.value : '',
                                    formik.setFieldValue,
                                    index,
                                  );
                                }}
                              />
                              <InputWithDep
                                label="Specify Other"
                                index={index || 0}
                                formik={formik}
                                key={`custom${capitalize(question.codeName)}`}
                                dep={question.codeName}
                                from={draft}
                                fieldOptions={question.options}
                                target={`forFamilyMember.[${index}].[custom${capitalize(
                                  question.codeName,
                                )}]`}
                                t={t}
                                readOnly={!!this.readOnly}
                                lng={this.props.language || 'en'}
                                question={question}
                                name={`forFamilyMember.[${index}].[custom${capitalize(
                                  question.codeName,
                                )}]`}
                                onChange={(e) => {
                                  this.updateEconomicAnswerCascading(
                                    modifiedQuestion,
                                    e,
                                    formik.setFieldValue,
                                    index,
                                  );
                                }}
                                cleanUp={cleanUp}
                              />
                            </React.Fragment>
                          );
                        }
                        if (question.answerType === 'radio') {
                          return (
                            <React.Fragment key={question.codeName}>
                              <RadioWithFormik
                                rawOptions={getConditionalOptions(
                                  question,
                                  draft,
                                  index,
                                )}
                                t={t}
                                readOnly={!!this.readOnly}
                                formik={formik}
                                question={question}
                                key={question.codeName}
                                name={`forFamilyMember.[${index}].[${question.codeName}]`}
                                onChange={(e) => {
                                  this.updateEconomicAnswerCascading(
                                    question,
                                    e,
                                    formik.setFieldValue,
                                    index,
                                  );
                                }}
                              />

                              <InputWithDep
                                index={index || 0}
                                formik={formik}
                                key={`custom${capitalize(question.codeName)}`}
                                dep={question.codeName}
                                from={draft}
                                fieldOptions={question.options}
                                target={`forFamilyMember.[${index}].[custom${capitalize(
                                  question.codeName,
                                )}]`}
                                t={t}
                                readOnly={!!this.readOnly}
                                lng={this.props.language || 'en'}
                                question={question}
                                name={`forFamilyMember.[${index}].[custom${capitalize(
                                  question.codeName,
                                )}]`}
                                onChange={(e) => {
                                  this.updateEconomicAnswerCascading(
                                    modifiedQuestion,
                                    e,
                                    formik.setFieldValue,
                                    index,
                                  );
                                }}
                                cleanUp={cleanUp}
                              />
                            </React.Fragment>
                          );
                        }
                        if (question.answerType === 'checkbox') {
                          return (
                            <React.Fragment key={question.codeName}>
                              <CheckboxWithFormik
                                rawOptions={getConditionalOptions(
                                  question,
                                  draft,
                                  index,
                                )}
                                t={t}
                                formik={formik}
                                readOnly={!!this.readOnly}
                                question={question}
                                name={`forFamilyMember.[${index}].[${question.codeName}]`}
                                onChange={(e) => {
                                  this.updateEconomicAnswerCascading(
                                    question,
                                    e,
                                    formik.setFieldValue,
                                    index,
                                  );
                                }}
                              />
                              <InputWithDep
                                index={index || 0}
                                formik={formik}
                                key={`custom${capitalize(question.codeName)}`}
                                dep={question.codeName}
                                from={draft}
                                fieldOptions={question.options}
                                target={`forFamilyMember.[${index}].[custom${capitalize(
                                  question.codeName,
                                )}]`}
                                t={t}
                                readOnly={!!this.readOnly}
                                lng={this.props.language || 'en'}
                                question={question}
                                isMultiValue
                                isEconomic
                                name={`forFamilyMember.[${index}].[custom${capitalize(
                                  question.codeName,
                                )}]`}
                                onChange={(e) => {
                                  this.updateEconomicAnswerCascading(
                                    modifiedQuestion,
                                    e,
                                    formik.setFieldValue,
                                    index,
                                  );
                                }}
                                cleanUp={cleanUpMultipleValue}
                              />
                            </React.Fragment>
                          );
                        }
                        return (
                          <InputWithFormik
                            lng={this.props.language || 'en'}
                            t={t}
                            formik={formik}
                            readOnly={!!this.readOnly}
                            question={question}
                            key={question.codeName}
                            name={`forFamilyMember.[${index}].[${question.codeName}]`}
                            onChange={(e) =>
                              this.updateEconomicAnswerCascading(
                                question,
                                e,
                                formik.setFieldValue,
                                index,
                              )
                            }
                          />
                        );
                      })}
                    </React.Fragment>
                  </React.Fragment>
                );
              })}
          </StickyFooter>
        )}
      </Formik>
    );
  }
}

const styles = StyleSheet.create({
  memberName: {
    marginHorizontal: 20,
    fontWeight: 'normal',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
      },
      android: {
        fontFamily: 'Poppins SemiBold',
      },
    }),
  },
  headerTitleStyle: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
      },
      android: {
        fontFamily: 'Poppins SemiBold',
      },
    }),
    fontSize: 18,
    fontWeight: '200',
    lineHeight: 26,
    color: colors.black,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

SocioEconomicQuestion.propTypes = {
  t: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array,
  language: PropTypes.string,
  user: PropTypes.object.isRequired,
};

const mapDispatchToProps = {
  updateDraft,
};

const mapStateToProps = ({drafts, language, user}) => ({
  drafts,
  language,
  user,
});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(SocioEconomicQuestion),
);
