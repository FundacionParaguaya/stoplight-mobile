import * as Yup from 'yup';

import {Form, Formik} from 'formik';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {capitalize, uniqueId, values} from 'lodash';

import BooleanWithFormik from '../../components/formik/BooleanWithFormik';
import CheckboxWithFormik from '../../components/formik/CheckboxWithFormik';
import DateInput from '../../components/form/DateInput';
import InputWithDep from '../../components/formik/InputWithDep';
import InputWithFormik from '../../components/formik/InputWithFormik';
import MultiSelectWithFormik from '../../components/formik/MultiSelectWithFormik';
import OtherOptionInput from '../../components/OtherOptionInput';
import RadioWithFormik from '../../components/formik/RadioWithFormik';
import SelectWithFormik from '../../components/formik/SelectWithFormik';
import StickyFooter from '../../components/StickyFooter';
import colors from '../../theme.json';
import {connect} from 'react-redux';
import {drafts} from '../../redux/reducer';
import i18n from '../../i18n';
import moment from 'moment';
import { pathHasError } from '../../components/formik/utils/form-utils';
import {submitIntervention} from '../../redux/actions';
import {url} from '../../config.json';
import uuid from 'uuid/v1';
import {withNamespaces} from 'react-i18next';

const Intervention = ({
  t,
  env,
  user,
  interventionDefinition,
  route,
  submitIntervention,
}) => {
  const [questions, setQuestions] = useState([]);
  const survey = route.params.survey;
  const snapshot = route.params.draft;
  const interventionId = route.params.interventionId;
  const navigation = route.params.navigation;
  const intervention = route.params.intervention;
  const readonly = route.params.readonly;
  const buildInitialValuesForForm = (questions,intervention) => {
    console.log('i',intervention)
    const initialValue = {};

    questions.forEach((question) => {
      initialValue[question.codeName] = '';

      if (question.answerType === 'boolean') {
        initialValue[question.codeName] = false;
      }
    });
    return initialValue;
  };

  const buildValidationSchemaForForm = (questions) => {
    const schema = {};
    let validation = Yup.string();
    let dateValidation = Yup.date();
    const validDate = 'validation.validDate';
    const fieldIsRequired = 'validation.fieldIsRequired';

    questions.forEach((question) => {
      if (question.codeName === 'stoplightIndicator') {
        schema[question.codeName] = Yup.string().when(
          'generalIntervention',
          (generalIntervention, schema) => {
            return schema.test(
              'stoplightIndicator',
              fieldIsRequired,
              (value) => {
                return (
                  (!!value && !generalIntervention) ||
                  (!value && generalIntervention)
                );
              },
            );
          },
        );
      } else if (question.answerType === 'date' && question.coreQuestion) {
        schema[question.codeName] = dateValidation
          .typeError(fieldIsRequired)
          .transform((_value, originalValue) => {
            return originalValue
              ? moment.unix(originalValue).toDate()
              : new Date('');
          })
          .required(validDate)
          .test({
            name: 'test-date-range',
            test: function (date) {
              if (Date.parse(date) / 1000 > moment().unix()) {
                return this.createError({
                  message: validDate,
                  path: question.codeName,
                });
              }
              return true;
            },
          });
      } else if (
        question.required &&
        question.codeName !== 'generalIntervention'
      ) {
        schema[question.codeName] = validation.required(fieldIsRequired);
      }
    });

    const validationSchema = Yup.object().shape(schema);
    return validationSchema;
  };

  useEffect(() => {
    let questions = interventionDefinition.questions;
    let indicators = survey.surveyStoplightQuestions || [];
    if (indicators && Array.isArray(indicators)) {
      let indicatorsOptions =
        indicators.map((ind) => ({
          value: ind.codeName,
          label: ind.questionText,
        })) || [];
      questions = questions.map((question) => {
        if (question.codeName === 'stoplightIndicator') {
          question.options = indicatorsOptions;
        }
        return question;
      });
    }
    setQuestions(questions);
  }, []);

  const onSubmit = (values) => {
    let keys = Object.keys(values);

    let answers = [];
    keys.forEach((key) => {
      const otherQuestion = !!key.match(/^custom/g);
      const otherValue = values[`custom${capitalize(key)}`];
      let answer;

      if (otherQuestion) {
      } else if (Array.isArray(values[key])) {
        answer = {
          codeName: key,
          multipleValue: values[key].map((v) => v.value || v),
          multipleText: values[key].map((v) => v.label || v),
        };
      } else {
        answer = {
          codeName: key,
          value: values[key],
        };
      }

      if (otherValue) {
        answer = {
          ...answer,
          other: otherValue,
        };
      }

      answers[key] = answer;
    });

    let finalAnswers = [];
    keys.forEach((key) => {
      const otherQuestion = !!key.match(/^custom/g);
      let answer = answers[key];
      !otherQuestion && finalAnswers.push(answer);
    });

    let params = '';
    interventionDefinition.questions.forEach((question) => {
      params += `${question.codeName} `;
    });
    
    const payload = {
      id: finalAnswers[0].value,
      values: finalAnswers,
      interventionDefinition: interventionDefinition.id,
      snapshot: snapshot.id,
      relatedIntervention: interventionId ? interventionId:null,
      params,
    };
    console.log('payload', payload);

    submitIntervention(url[env], user.token, payload);
    navigation.goBack();
  };

  return (
    <Formik
      initialValues={buildInitialValuesForForm(
        interventionDefinition.questions,
        intervention
      )}
      enableReinitialize
      validationSchema={buildValidationSchemaForForm(questions)}
      onSubmit={onSubmit}>
      {(formik) => {
        return (
          <StickyFooter
            onContinue={formik.handleSubmit}
            continueLabel={i18n.t('general.continue')}>
            {questions.map((question, index) => {
              if (question.answerType === 'select') {
                return (
                  <React.Fragment key={question.codeName}>
                    <SelectWithFormik
                      t={t}
                      name={question.codeName}
                      label={question.shortName}
                      formik={formik}
                      question={question}
                      rawOptions={question.options || []}
                      value={
                        formik.values[question.codeName]
                          ? formik.values[question.codeName]
                          : ''
                      }
                      onChange={(e) => {}}
                    />
                  </React.Fragment>
                );
              }

              if (question.answerType === 'date') {
                return (
                  <React.Fragment key={question.codeName}>
                    <DateInput
                      required={question.required}
                      formikHandleError
                      validFutureDates={!question.coreQuestion}
                      label={question.shortName}
                      name={question.codeName}
                      onValidDate={(unix, id) => {
                        console.log('unix',unix)
                        console.log('id',question.codeName)
                        formik.setFieldValue(question.codeName, unix)
                      }
                        
                      }
                      setError={(isError) => {
                        console.log('isError',isError)
                        console.log('id',question.codeName)
                        formik.setFieldError(question.codeName, isError)
                      }
                      
                      }
                    />
                    {pathHasError(
                      question.codeName,
                      formik.touched,
                      formik.errors,
                    ) && (
                      <View style={{marginLeft: 30, marginTop: 10}}>
                        <Text style={{color: colors.red}}>
                          {' '}
                          {t('views.family.selectValidDate')}
                        </Text>
                      </View>
                    )}
                  </React.Fragment>
                );
              }

              if (question.answerType === 'multiselect') {
                return (
                  <React.Fragment key={question.codeName}>
                    <MultiSelectWithFormik
                      t={t}
                      name={question.codeName}
                      label={question.shortName}
                      formik={formik}
                      question={question}
                      rawOptions={question.options || []}
                      isDisabled={
                        question.codeName === 'stoplightIndicator' &&
                        formik.values.generalIntervention
                      }
                      values={
                        !!formik.values[question.codeName]
                          ? formik.values[question.codeName]
                          : []
                      }
                    />
                  </React.Fragment>
                );
              }

              if (question.answerType === 'checkbox') {
                return (
                  <React.Fragment key={question.codeName}>
                    <CheckboxWithFormik
                      t={t}
                      key={question.codeName}
                      label={question.shortName}
                      name={question.codeName}
                      rawOptions={question.options || []}
                      required={question.required}
                      question={question}
                      formik={formik}
                      onChange={(e) =>
                        formik.setFieldValue(question.codeName, e)
                      }
                    />
                    <OtherOptionInput
                      key={`custom${capitalize(question && question.codeName)}`}
                      dep={question.codeName}
                      fieldOptions={question.options || []}
                      target={`custom${capitalize(
                        question && question.codeName,
                      )}`}
                      formik={formik}
                      isMultiValue
                      question={question}
                      cleanUp={() =>
                        formik.setFieldValue(
                          `custom${capitalize(question.codeName)}`,
                          '',
                        )
                      }>
                      {(otherOption, value, formik, question) => {
                        if (otherOption === value && !!formik && !!question) {
                          return (
                            <InputWithFormik
                              question={question}
                              key={`custom${capitalize(
                                question && question.codeName,
                              )}`}
                              type="text"
                              formik={formik}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `custom${capitalize(question.codeName)}`,
                                  e,
                                )
                              }
                              label={t('views.family.other')}
                              name={`custom${capitalize(question.codeName)}`}
                            />
                          );
                        } else {
                          return null;
                        }
                      }}
                    </OtherOptionInput>
                  </React.Fragment>
                );
              }

              if (question.answerType === 'radio') {
                return (
                  <React.Fragment key={question.codeName}>
                    <RadioWithFormik
                      t={t}
                      key={question.codeName}
                      label={question.shortName}
                      name={question.codeName}
                      question={question}
                      formik={formik}
                      rawOptions={question.options || []}
                      onChange={() => {}}
                      // onChange={(e)=>{formik.setFieldValue(question.codeName,e)}}
                    />
                    <OtherOptionInput
                      key={`custom${capitalize(question.codeName)}`}
                      question={question}
                      dep={question.codeName}
                      fieldOptions={question.options || []}
                      formik={formik}
                      target={`custom${capitalize(question.codeName)}`}
                      cleanUp={() =>
                        formik.setFieldValue(
                          `custom${capitalize(question.codeName)}`,
                          '',
                        )
                      }>
                      {(otherOption, value, formik, question) => {
                        if (otherOption === value) {
                          return (
                            <InputWithFormik
                              question={question}
                              key={`custom${capitalize(question.codeName)}`}
                              type="text"
                              formik={formik}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `custom${capitalize(question.codeName)}`,
                                  e,
                                )
                              }
                              label={t('views.family.other')}
                              name={`custom${capitalize(question.codeName)}`}
                            />
                          );
                        } else {
                          return null;
                        }
                      }}
                    </OtherOptionInput>
                  </React.Fragment>
                );
              }

              if (question.answerType === 'boolean') {
                return (
                  <BooleanWithFormik
                    t={t}
                    key={question.codeName}
                    formik={formik}
                    label={question.shortName}
                    name={question.codeName}
                    question={question}
                    cleanUp={() => {
                      if (question.codeName === 'generalIntervention') {
                        formik.setFieldValue('stoplightIndicator', []);
                      }
                    }}
                  />
                );
              }
              if (question.answerType === 'text') {
                return (
                  <InputWithFormik
                    t={t}
                    key={question.codeName}
                    label={question.shortName}
                    formik={formik}
                    name={question.codeName}
                    question={question}
                    onChange={(e) => {
                      formik.setFieldValue(question.codeName, e);
                    }}
                    multiline
                  />
                );
              }

              return (
                <InputWithFormik
                  t={t}
                  key={question.codeName}
                  label={question.shortName}
                  formik={formik}
                  name={question.codeName}
                  question={question}
                  onChange={(e) => {
                    formik.setFieldValue(question.codeName, e);
                  }}
                />
              );
            })}
          </StickyFooter>
        );
      }}
    </Formik>
  );
};
const mapStateToProps = ({user, env, interventionDefinition}) => ({
  user,
  env,
  interventionDefinition,
});
const mapDispatchToProps = {
  submitIntervention,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Intervention),
);
