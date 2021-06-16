import * as _ from 'lodash';

import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {getErrorLabelForPath, pathHasError} from './utils/form-utils';

import BottomModal from '../BottomModal';
import ListItem from '../ListItem';
import arrow from '../../../assets/images/selectArrow.png';
import colors from '../../theme.json';
import globalStyles from '../../globalStyles';
import {setListOfLabeles} from '../../screens/utils/accessibilityHelpers';

// import { getErrorLabelForPath, pathHasError } from '../utils/form-utils';

const SelectWithFormik = ({
  value,
  formik,
  name,
  label,
  readOnly,
  question,
  onChange,
  t,
  rawOptions,
}) => {
  let error = pathHasError(name, formik.touched, formik.errors);
  let helperText = getErrorLabelForPath(name, formik.touched, formik.errors, t);

  const {required, questionText} = question;
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    if (!readOnly) {
      setIsOpen(!isOpen);
    }
  };

  const text = value ? rawOptions.find((e) => e.value == value).text : '';
  if (readOnly && !value) {
    return <View />;
  }
  return (
    <TouchableHighlight
      underlayColor={'transparent'}
      activeOpacity={1}
      onPress={toggleDropdown}
      accessible={true}
      accessibilityLabel={`${questionText}${
        required ? t('validation.fieldIsRequiredAccessibilityLabel') : ''
      }`}>
      <View style={styles.wrapper}>
        <View
          style={[
            styles.container,
            !value && styles.withoutValue,
            error && styles.error,
            isOpen && styles.active,
          ]}>
          {!!value && (
            <Text
              style={[
                styles.title,
                isOpen &&
                  !error && {
                    color: colors.palegreen,
                  },
              ]}>{`${label ? label : questionText}${required && !readOnly ? ' *' : ''}`}</Text>
          )}
          <Text style={[styles.placeholder, error ? {color: colors.red} : {}]}>
            {value ? text : `${label ? label : questionText}${required ? ' *' : ''}`}
          </Text>
          {!readOnly ? <Image source={arrow} style={styles.arrow} /> : null}

          <BottomModal
            isOpen={isOpen}
            onRequestClose={toggleDropdown}
            onEmptyClose={toggleDropdown}>
            <View
              style={styles.dropdown}
              accessible={true}
              accessibilityLabel={setListOfLabeles(rawOptions)}>
              <ScrollView>
                <FlatList
                  style={styles.list}
                  data={rawOptions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <ListItem
                      underlayColor={'transparent'}
                      activeOpacity={1}
                      key={item.value}
                      onPress={() => {
                        formik.setFieldValue(name, item ? item.value : '');
                        onChange(item);
                        toggleDropdown();
                      }}>
                      <Text
                        style={[
                          styles.option,
                          value === item.value && styles.selected,
                        ]}
                        accessibilityLabel={`${item.text}`}>
                        {item.text}
                      </Text>
                    </ListItem>
                  )}
                  initialNumToRender={6}
                />
              </ScrollView>
            </View>
          </BottomModal>
        </View>
        {!!helperText && (
          <View style={{marginLeft: 30}}>
            <Text style={{color: colors.red}}>{helperText}</Text>
          </View>
        )}
      </View>
    </TouchableHighlight>
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
    paddingLeft: 15,
    paddingRight: 25,
    ...globalStyles.subline2,
    paddingTop: 20,
    minHeight: 50,
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
    paddingHorizontal: 5,
    fontSize: 14,
    ...globalStyles.subline2,
    color: colors.palegrey,
    // marginBottom: 10,
    zIndex: 100,
  },
});

export default SelectWithFormik;
