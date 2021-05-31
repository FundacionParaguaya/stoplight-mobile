import React, {useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import * as _ from 'lodash';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import {getErrorLabelForPath, pathHasError} from './utils/form-utils';
import globalStyles from '../../globalStyles';

import colors from '../../theme.json';

const RadioWithFormik = ({
  label,
  onChange,
  name,
  readOnly,
  rawOptions,
  formik,
  question,
  t,
}) => {
  const value = _.get(formik.values, name) || '';

  const error = pathHasError(name, formik.touched, formik.errors);
  const helperText = getErrorLabelForPath(
    name,
    formik.touched,
    formik.errors,
    t,
  );

  const {required, questionText} = question;
  if (readOnly && !value) {
    return <View />;
  }
  return (
    <View>
      <Text
        style={[
          styles.placeholder,
          error ? {color: colors.red} : {},
        ]}>{`${label ? label : questionText}${required && !readOnly ? ' *' : ''}`}</Text>

      <RadioForm formHorizontal={true} animation={false}>
        <View
          style={{
            width: '100%',
            paddingHorizontal: 10,
            flexDirection: 'row',
            justifyContent: readOnly ? 'flex-start' : 'space-around',
            flexWrap: 'wrap',
          }}>
          {rawOptions.map((option, i) => {
            if (readOnly && option.value != value) {
              return;
            }

            return (
              <View key={i} style={styles.radioButtonContainer}>
                <RadioButton labelHorizontal={true} key={i}>
                  <RadioButtonInput
                    obj={{label: option.text, value: option.value}}
                    index={i}
                    isSelected={value === option.value}
                    onPress={
                      option.value != value
                        ? () => {
                            formik.setFieldValue(name, option.value);
                            onChange(option.value);
                          }
                        : () => {}
                    }
                    borderWidth={2}
                    buttonInnerColor={colors.palegreen}
                    buttonOuterColor={
                      value === option.value
                        ? colors.palegreen
                        : colors.palegrey
                    }
                    buttonSize={12}
                    buttonOuterSize={20}
                  />
                  <RadioButtonLabel
                    obj={{label: option.text, value: option.value}}
                    index={i}
                    labelHorizontal={true}
                    onPress={
                      option.value != value
                        ? () => {
                            formik.setFieldValue(name, option.value);
                            onChange(option.value);
                          }
                        : () => {}
                    }
                    labelStyle={{
                      fontSize: 14,
                      color: '#4a4a4a',
                    }}
                    labelWrapStyle={{
                      marginLeft: -4,
                    }}
                  />
                </RadioButton>
              </View>
            );
          })}
        </View>
      </RadioForm>
      {error && !!helperText ? (
        <View style={{marginLeft: 30}}>
          <Text style={{color: colors.red}}>{helperText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  radioButtonContainer: {
    minWidth: 102,
    borderRadius: 16,
    backgroundColor: colors.primary,
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    paddingLeft: 9,
    paddingRight: 10,
    marginBottom: 10,
  },
  container: {
    borderBottomWidth: 1,
    marginHorizontal: 15,
    justifyContent: 'center',
    minHeight: 65,
    paddingBottom: 6,
    borderBottomColor: colors.grey,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.white,
  },
  placeholder: {
    paddingLeft: 20,
    paddingRight: 25,
    ...globalStyles.subline2,
    // lineHeight: 50,
    marginBottom: 3,
    paddingTop: 20,
    minHeight: 50,
    fontSize: 16,
  },
  withoutValue: {
    backgroundColor: colors.primary,
    minHeight: 65,
  },
  dropdown: {
    paddingVertical: 15,
    maxHeight: 360,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
  },
  option: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 25,
    color: '#4a4a4a',
  },
  arrow: {
    width: 10,
    height: 5,
    position: 'absolute',
    right: 13,
    top: '50%',
  },
  active: {
    backgroundColor: colors.white,
    borderBottomColor: colors.palegreen,
  },
  error: {
    backgroundColor: colors.white,
    borderBottomColor: colors.red,
  },
  selected: {
    backgroundColor: colors.lightgrey,
  },
  title: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.palegrey,
    // marginBottom: 10,
    zIndex: 100,
  },
});
export default RadioWithFormik;
