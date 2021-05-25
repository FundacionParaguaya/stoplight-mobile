import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Input} from 'react-native-elements';
import * as _ from 'lodash';
import {getErrorLabelForPath, pathHasError} from './utils/form-utils';

import colors from '../../theme.json';
import globalStyles from '../../globalStyles';

const InputWithFormik = ({
  question,
  name,
  readOnly,
  t,
  formik,
  lng,
  label,
  onChange,
}) => {
  const [status, setStatus] = useState('blur');
  const {required, questionText} = question;
  const value = _.get(formik.values, name) || '';
  const error = pathHasError(name, formik.touched, formik.errors);
  const helperText = getErrorLabelForPath(
    name,
    formik.touched,
    formik.errors,
    t,
  );
  useEffect(() => {
    if (error && status != 'error') {
      setStatus('error');
    }
  }, [error]);

  const defineTextColor = (status) => {
    switch (status) {
      case 'active':
        return colors.palegreen;
      case 'blur':
        return colors.palegrey;
      case 'error':
        return colors.red;
      default:
        return colors.palegrey;
    }
  };

  if (readOnly && !value) {
    return <View />;
  }

  let showPlaceholder = status === 'blur' && !value;
  let placeholder = label ? label : questionText;
  return (
    <View
      style={{
        marginHorizontal: 5,
        marginBottom: -7,
        // marginTop: status == 'blur' ? -22 : 0,
      }}
      accessible={true}
      accessibilityLabel={`${placeholder} ${
        required && !placeholder && !readOnly
          ? t('validation.fieldIsRequiredAccessibilityLabel')
          : ''
      }`}>
      {!showPlaceholder && placeholder && (
        <View style={{marginBottom: -20, marginHorizontal: 10}}>
          <Text
            style={{
              ...styles.label,
              color: defineTextColor(status),
            }}
            accessibilityLabel={`${placeholder} ${
              required && !placeholder && !readOnly
                ? t('validation.fieldIsRequiredAccessibilityLabel')
                : ''
            }`}>
            {`${placeholder} ${required && !readOnly ? '*' : ''}`}
            {'\n'}
          </Text>
        </View>
      )}

      <Input
        name={name}
        id={name}
        keyboardType={question.answerType == 'number' ? 'numeric' : null}
        blurOnSubmit
        disabled={readOnly}
        value={value}
        onChangeText={(value) => {
          let finalValue;
          if (question.answerType == 'number') {
            finalValue = value
              .replace(/[,.]/g, '')
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, lng === 'en' ? '$1,' : '$1.');
          } else {
            finalValue = value;
          }
          if (finalValue && status == 'error') {
            setStatus('active');
          }
          formik.setFieldValue(name, finalValue);
          onChange(finalValue);
        }}
        onFocus={() => {
          let newStatus = error ? 'error' : 'active';
          setStatus(newStatus);
        }}
        onBlur={() => {
          if (error) {
            setStatus('error');
          } else {
            let newStatus = value ? 'filled' : 'blur';
            setStatus(newStatus);
          }

          formik.setFieldTouched(name);
        }}
        placeholder={
          showPlaceholder ? `${placeholder} ${required ? '*' : ''}` : ''
        }
        inputContainerStyle={{
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: !value
            ? styles[status].backgroundColor
            : colors.white,
          borderBottomColor: styles[status].borderBottomColor,
          paddingLeft: 11,
          paddingTop: 2,
          
        }}
        inputStyle={{
          ...globalStyles.subline2,
          fontFamily: 'Roboto',
          paddingRight: 30,
          minHeight: 58,
          textAlign: 'right'
          
        }}
        editable={!readOnly}
        multiline={true}
        importantForAccessibility="no-hide-descendants"
      />

      {status === 'error' && helperText && (
        <View
          id="errorWrapper"
          style={{marginLeft: 25, marginBottom: 12, marginTop: -20}}>
          <Text style={{color: colors.red}}>{helperText}</Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    color: colors.grey,
    marginHorizontal: 5,

    justifyContent: 'center',
    minHeight: 65,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  label: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    ...globalStyles.subline2,
  },
  inputTextUpperCase: {
    textTransform: 'capitalize',
    fontSize: 14,
  },
  inputText: {
    fontSize: 14,
  },
  activeInput: {
    height: 50,
  },
  blur: {
    backgroundColor: colors.primary,
    borderBottomColor: colors.grey,
  },
  filled: {
    backgroundColor: colors.white,
    borderBottomColor: colors.grey,
  },
  active: {
    backgroundColor: colors.white,
    borderBottomColor: colors.palegreen,
  },
  error: {
    backgroundColor: colors.white,
    borderBottomColor: colors.red,
  },
  text: {
    marginLeft: 15,
    position: 'relative',
    // top: 10,
    minHeight: 30,
    zIndex: 100,
  },
});

export default InputWithFormik;
