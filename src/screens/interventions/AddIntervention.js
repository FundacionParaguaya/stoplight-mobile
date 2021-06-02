import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {Form, Formik} from 'formik';
import StickyFooter from '../../components/StickyFooter';
import i18n from '../../i18n';

import {connect} from 'react-redux';
import InputWithFormik from '../../components/formik/InputWithFormik';
import SelectWithFormik from '../../components/formik/SelectWithFormik';
import {withNamespaces} from 'react-i18next';
import DateInput from '../../components/form/DateInput';
import BooleanWithFormik from '../../components/formik/BooleanWithFormik';
import CheckboxWithFormik from '../../components/formik/CheckboxWithFormik';
import InputWithDep from '../../components/formik/InputWithDep';
import RadioWithFormik from '../../components/formik/RadioWithFormik';
import OtherOptionInput from '../../components/OtherOptionInput';
import {capitalize} from 'lodash';
import MultiSelectWithFormik from '../../components/formik/MultiSelectWithFormik';

const AddIntervention = ({t, interventionDefinition,route }) => {
  const [questions, setQuestions] = useState([]);
  const survey= route.params.survey;
  const buildInitialValuesForForm = (questions) => {
    const initialValue = {};
    questions.forEach((question) => {
      initialValue[question.codeName] = '';

      if (question.answerType === 'boolean') {
        initialValue[question.codeName] = false;
      }
    });
    return initialValue;
  };

  useEffect(() => {
    let questions = interventionDefinition.questions;
    let indicators = survey.surveyStoplightQuestions || [];
    if(indicators && Array.isArray(indicators)) {
      console.log('ind', indicators)
      let indicatorsOptions = indicators.map(ind => ({ value: ind.codeName, text: ind.questionText })) || [];
      questions = questions.map(question => {
        if(question.codeName === 'stoplightIndicator') {
          question.options = indicatorsOptions;
        }
        return question;
      })
    }
    setQuestions(questions);
   
  },[])



  return (
    <Formik
      initialValues={buildInitialValuesForForm(
        interventionDefinition.questions,
      )}
      //initualValues={buildInitialValuesForForm(question, draft)}
      enableReinitialize
      //validationSchema={buildValidationSchemaForForm(questions)}
      onSubmit={(values) => {
        //onSubmit(values);
      }}>
      {(formik) => {
        return (
          <StickyFooter continueLabel={i18n.t('general.continue')}>
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
                  <DateInput
                    required={true}
                    label={question.shortName}
                    name={question.codeName}
                    // showErrors = {showErrors}
                    // setError={(isError) => setError(isError,question.codeName)}
                    onValidDate={(unix, id) => formik.setFieldValue(id, unix)}
                    setError={(isError) =>
                      formik.setFieldError(question.codeName)
                    }
                  />
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
                      rawOptions={question.options || []}
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
                  //<React.Fragment key={question.codeName}>
                  <>
                    <CheckboxWithFormik
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
                  </>
                );
              }

              if (question.answerType === 'radio') {
                return (
                  <React.Fragment key={question.codeName}>
                    <RadioWithFormik
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
                        console.log('otherOption', otherOption);
                        console.log('value', value);
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
                    key={question.codeName}
                    formik={formik}
                    label={question.shortName}
                    name={question.codeName}
                    question={question}
                  />
                );
              }
              if (question.answerType === 'text') {
                return (
                  <InputWithFormik
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
            })}
          </StickyFooter>
        );
      }}
    </Formik>
  );
};
const mapStateToProps = ({interventionDefinition}) => ({
  interventionDefinition,
});

export default withNamespaces()(connect(mapStateToProps)(AddIntervention));
