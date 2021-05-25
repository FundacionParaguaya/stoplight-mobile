import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CheckBox} from 'react-native-elements';
import * as _ from 'lodash';
import {get} from 'lodash';
import colors from '../../theme.json';
import globalStyles from '../../globalStyles';
import {getErrorLabelForPath, pathHasError} from './utils/form-utils';

const removeByIndex = (array, index) => {
  const prior = array.slice(0, index);
  const following = array.slice(index + 1);
  return [...prior, ...following];
};
const CheckboxWithFormik = ({
  question,
  name,
  readOnly,
  t,
  formik,
  rawOptions,
  onChange,
}) => {
  const values = get(formik.values, name) || [];
  const error = pathHasError(name, formik.touched, formik.errors);
  const helperText = getErrorLabelForPath(
    name,
    formik.touched,
    formik.errors,
    t,
  );

  const {required, questionText} = question;
  const handleChange = (e) => {
    const index = values.indexOf(e);
    if (index === -1) {
      return onChange([...values, e]);
    }
    return onChange(removeByIndex(values, index));
  };

  if (readOnly && !values.length) {
    return <View />;
  }

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.placeholder,
          error ? {color: colors.red} : {},
        ]}>{`${questionText}${required && !readOnly ? ' *' : ''}`}</Text>
      {rawOptions.map((option, i) => (
        <CheckBox
          key={i}
          onPress={!readOnly ? () => handleChange(option.value) : null}
          title={option.text}
          iconType="material"
          checkedColor={colors.green}
          checkedIcon="check-box"
          uncheckedIcon="check-box-outline-blank"
          checked={values.indexOf(option.value) !== -1}
          containerStyle={styles.containerStyle}
          textStyle={[styles.label]}
          accessibilityLabel={`${option.text}${
            !!helperText && !values.indexOf(option.value) !== -1 ? ' *' : ''
          } ${values.indexOf(option.value) !== -1 ? 'checked' : 'unchecked'}`}
        />
      ))}
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
    marginBottom: 20
  },
  label: {
    color: colors.grey,
    fontWeight: 'normal',
  },
  placeholder: {
    paddingLeft: 15,
    paddingRight: 25,
    ...globalStyles.subline2,
    // lineHeight: 50,
    marginBottom: -9,
    paddingTop: 20,
    minHeight: 50,
    textAlign:'left'
  },
  containerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
});

export default CheckboxWithFormik;
