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
import {Chip} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import ListItem from '../ListItem';
import arrow from '../../../assets/images/selectArrow.png';
import colors from '../../theme.json';
import {element} from 'prop-types';
import globalStyles from '../../globalStyles';

const MultiSelectWithFormik = ({
  values,
  formik,
  name,
  label,
  question,
  onChange,
  rawOptions,
  isDisabled,
  t,
}) => {
  const error = pathHasError(name, formik.touched, formik.errors);
  const helperText = getErrorLabelForPath(
    name,
    formik.touched,
    formik.errors,
    t,
  );
  const {required} = question;
  const [isOpen, setIsOpen] = useState(false);

  const selectableElements =  formik.values[name] ? rawOptions.filter(
    (option) => !formik.values[name].find((el) => el.value == option.value),
  ): rawOptions;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (e) => {
    formik.setFieldValue(name, [...formik.values[name], e]);
  };

  const removeElement = (e) => {
    const elements = formik.values[name].filter(
      (data) => data.value !== e.value,
    );
    formik.setFieldValue(name, elements);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, !values.lenght && styles.withoutValue]}>
        {!!values.lenght && (
          <Text style={[styles.title]}>{`${label}${required ? '*' : ''}`}</Text>
        )}

        <View style={[styles.placeholder, error ? {color: colors.red} : {}]}>
          {}
          {values.length ?
            values.map((el) => (
              <Chip
                title={el.label}
                buttonStyle={{
                  backgroundColor: colors.grey,
                  marginBottom: 5,
                }}
                icon={{
                  name: 'close',
                  type: 'font-awesome',
                  size: 20,
                  color: 'white',
                }}
                iconRight
                onPress={() => removeElement(el)}
              />
            )): <Text style={[styles.placeholderText,  error ? {color: colors.red} : {}]}> {`${label}${required ? ' *' : ''}`}</Text>}
        </View>
        <TouchableHighlight
          underlay={'transparent'}
          disabled={isDisabled}
          activeOpacity={1}
          onPress={toggleDropdown}
          accessible={true}
          style={{
            position: 'absolute',
            right: 5,
            //top:'50%',
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40,
          }}
          //style={styles.arrow}
        >
          {<Image source={arrow} style={styles.arrow} />}
        </TouchableHighlight>

        <BottomModal
          isOpen={isOpen}
          onRequestClose={toggleDropdown}
          onEmptyClose={toggleDropdown}>
          <View style={styles.dropdown} accessible={true}>
            <ScrollView>
              <FlatList
                style={styles.list}
                data={selectableElements}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={6}
                renderItem={({item}) => (
                  <ListItem
                    underlayColor={'transparent'}
                    activeOpacity={1}
                    key={item.value}
                    onPress={() => {
                      handleChange(item);
                      toggleDropdown();
                    }}>
                    <Text style={[styles.option]}>{item.label}</Text>
                  </ListItem>
                )}
              />
            </ScrollView>
          </View>
        </BottomModal>
        
      </View>
      {!!helperText && (
          <View style={{marginLeft: 30, marginTop:10}}>
            <Text style={{color: colors.red}}>{helperText}</Text>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
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
  withoutValue: {
    backgroundColor: colors.primary,
    minHeight: 65,
  },
  arrow: {
    width: 10,
    height: 5,
  },
  title: {
    paddingHorizontal: 5,
    fontSize: 14,
    ...globalStyles.subline2,
    color: colors.palegrey,
    zIndex: 100,
  },
  placeholder: {
    paddingLeft: 15,
    paddingRight: 25,
    paddingTop: 20,
    minHeight: 50,
    width: '80%',

    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  placeholderText: {
    ...globalStyles.subline2,
  }, 
  option: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 25,
    color: '#4a4a4a',
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
});

export default MultiSelectWithFormik;
