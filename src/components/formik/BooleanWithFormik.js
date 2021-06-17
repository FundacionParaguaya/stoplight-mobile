import React from 'react';
import {CheckBox} from 'react-native-elements';
import {StyleSheet, Text, View} from 'react-native';
import colors from '../../theme.json';
import { getErrorLabelForPath, pathHasError } from './utils/form-utils';
import * as _ from 'lodash';
import { withNamespaces } from 'react-i18next';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 15,
    paddingBottom: 0,
  },
  label: {
    color: colors.grey,
    fontWeight: 'normal',
  },
});

const BooleanWithFormik = ({
  formik, 
  label,
  cleanUp= () => {},
  name,
  question,
  t
}) => {
  const value = _.get(formik.values,name) || false;
  const error = pathHasError(name, formik.touched, formik.errors);
  const helperText = getErrorLabelForPath(
    name, 
    formik.touched,
    formik.errors,
    t
  );
  const { required, questionText } = question;
  const onChange = (v) => {
    formik.setFieldValue(name, !value);
    cleanUp();
  };

  const onBlur = () => formik.setFieldTouched(name);
  return (<>
    <CheckBox
      title={`${label}`}
      containerStyle={styles.containerStyle}
      checked={value}
      textStyle={[styles.label]}
      iconType="material"
      checkedColor={colors.green}
      checkedIcon="check-box"
      uncheckedIcon="check-box-outline-blank"

      onPress={() => onChange()}
    />
    {error && !!helperText ? (
      <View style={{ marginLeft: 30}}>
        <Text style={{ color: colors.red}}> {helperText}</Text>
      </View>
    ) : null }
    </>

  );
};

export default withNamespaces()( BooleanWithFormik);
