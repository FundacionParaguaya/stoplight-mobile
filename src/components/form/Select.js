import countries from 'localized-countries';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';

import arrow from '../../../assets/images/selectArrow.png';
import globalStyles from '../../globalStyles';
import i18n from '../../i18n';
import {setListOfLabeles} from '../../screens/utils/accessibilityHelpers';
import colors from '../../theme.json';
import BottomModal from '../BottomModal';
import ListItem from '../ListItem';
import TextInput from './TextInput';

const countryList = countries(require('localized-countries/data/en')).array();

class Select extends Component {
  state = {
    radioOptions: [],
    isOpen: false,
    errorMsg: '',
    radioChecked: null,
    showOther: false,
    countries: [],
  };

  toggleDropdown = () => {
    if (!this.props.readOnly) {
      this.setState({
        isOpen: !this.state.isOpen,
      });
    }
  };

  validateInput = (value, isOtherOption) => {
    const valueKey = this.props.radio ? 'radioChecked' : 'value';
    this.setState({
      [valueKey]: value,
      isOpen: false,
      showOther: isOtherOption,
    });
    if (this.props.required && !value) {
      this.handleError(i18n.t('validation.fieldIsRequired'));
      this.setState({
        errorMsg: i18n.t('validation.fieldIsRequired'),
      });
    } else {
      this.setState({
        errorMsg: null,
      });

      if (typeof this.props.setError === 'function' && this.props.id) {
        this.props.setError(false, this.props.id, this.props.memberIndex);
      }
      this.props.onChange(value, this.props.id, isOtherOption);
    }
  };

  onChangeOther = (otherValue) => {
    this.setState({
      otherValue,
    });
    this.props.onChange(otherValue, this.props.otherField);
  };

  handleError(errorMsg) {
    if (typeof this.props.setError === 'function') {
      this.props.setError(true, this.props.id, this.props.memberIndex);
    }
    this.props.onChange('', this.props.id);
    this.setState({
      errorMsg,
    });
  }

  generateRadioOptions() {
    this.setState({
      radioOptions: this.props.options.map((item) => ({
        label: item.text,
        value: item.value,
        otherOption: item.otherOption,
      })),
    });
  }

  generateCountriesList() {
    const {countriesOnTop, defaultCountry} = this.props;

    let countriesArr = countryList.slice();

    const firstCountry = defaultCountry
      ? countryList.find((item) => item.code === defaultCountry)
      : null;

    // Add default country to the beginning of the list
    countriesArr.unshift(firstCountry);

    if (countriesOnTop) {
      countriesOnTop.forEach((e) => {
        countriesArr.unshift({
          code: e.text,
          label: e.value,
        });
      });
    }

    // Add prefer not to say answer at the end of the list
    countriesArr.push({code: 'NONE', label: 'I prefer not to say'});

    this.setState({
      countries: [...new Set(countriesArr)],
    });
  }

  componentDidMount() {
    // generate countries list if this is a county select
    if (this.props.countrySelect) {
      this.generateCountriesList();
    }

    if (this.props.radio) {
      this.generateRadioOptions();
      this.setState({
        radioChecked: this.props.initialValue,
      });
    }

    // on mount of new Select and if the passed showErrors value is true validate
    if (this.props.showErrors) {
      this.validateInput(this.props.initialValue || '');
    }
    // on mount validate empty required fields with out showing an errors message

    if (
      typeof this.props.setError === 'function' &&
      this.props.required &&
      !this.props.initialValue
    ) {
      this.props.setError(true, this.props.id, this.props.memberIndex);
    }

    if (this.props.initialOtherValue) {
      this.setState({
        showOther: true,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.showErrors !== this.props.showErrors) {
      this.validateInput(this.props.initialValue || '');
    }
  }

  componentWillUnmount() {
    if (this.props.cleanErrorsOnUnmount) {
      this.props.cleanErrorsOnUnmount(this.props.id, this.props.memberIndex);
    }
  }

  render() {
    const {errorMsg, isOpen, showOther, radioOptions, countries} = this.state;
    // if(!errorMsg && this.props.showErrors &&)
    const {
      initialValue,
      placeholder,
      required,
      options,
      countrySelect,
      readOnly,
      initialOtherValue,
      otherPlaceholder,
    } = this.props;

    let text = '';
    if (countrySelect && countries.find((item) => item.code === initialValue)) {
      text = countries.find((item) => item.code === initialValue).label;
    } else if (
      !countrySelect &&
      options.find((item) => item.value === initialValue)
    ) {
      text = options.find((item) => item.value === initialValue).text;
    }

    return readOnly && !this.props.initialValue ? null : (
      <View>
        <TouchableHighlight
          underlayColor={'transparent'}
          activeOpacity={1}
          onPress={this.toggleDropdown}
          accessible={true}
          accessibilityLabel={`${placeholder}${
            required
              ? i18n.t('validation.fieldIsRequiredAccessibilityLabel')
              : ''
          }`}>
          <View style={styles.wrapper}>
            {this.props.radio ? (
              <RadioForm formHorizontal={true} animation={false}>
                <View
                  style={{
                    width: '100%',
                    paddingHorizontal: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                  }}>
                  {radioOptions.map((option, i) => {
                    if (readOnly) {
                      if (this.state.radioChecked === option.value) {
                        return (
                          <View key={i} style={{marginRight: 'auto'}}>
                            <View style={styles.radioButtonContainer}>
                              <RadioButton labelHorizontal={true}>
                                <RadioButtonInput
                                  disabled={true}
                                  obj={option}
                                  index={i}
                                  isSelected={
                                    this.state.radioChecked === option.value
                                  }
                                  borderWidth={2}
                                  buttonInnerColor={colors.palegreen}
                                  buttonOuterColor={
                                    this.state.radioChecked === option.value
                                      ? colors.palegreen
                                      : colors.palegrey
                                  }
                                  buttonSize={12}
                                  buttonOuterSize={20}
                                  buttonStyle={{}}
                                  onPress={() => {}}
                                />
                                <RadioButtonLabel
                                  onPress={() => {}}
                                  obj={option}
                                  index={i}
                                  labelHorizontal={true}
                                  labelStyle={{
                                    fontSize: 17,
                                    color: '#4a4a4a',
                                  }}
                                  labelWrapStyle={{marginLeft: -4}}
                                />
                              </RadioButton>
                            </View>
                          </View>
                        );
                      }
                    } else {
                      return (
                        <View style={styles.radioButtonContainer}>
                          <RadioButton labelHorizontal={true} key={i}>
                            <RadioButtonInput
                              obj={option}
                              index={i}
                              isSelected={initialValue === option.value}
                              onPress={() =>
                                this.validateInput(
                                  option.value,
                                  option.otherOption,
                                )
                              }
                              borderWidth={2}
                              buttonInnerColor={colors.palegreen}
                              buttonOuterColor={
                                initialValue === option.value
                                  ? colors.palegreen
                                  : colors.palegrey
                              }
                              buttonSize={12}
                              buttonOuterSize={20}
                              buttonStyle={{}}
                            />
                            <RadioButtonLabel
                              obj={option}
                              index={i}
                              labelHorizontal={true}
                              onPress={() =>
                                this.validateInput(
                                  option.value,
                                  option.otherOption,
                                )
                              }
                              labelStyle={{
                                fontSize: 17,
                                color: '#4a4a4a',
                                textAlign:'left'
                              }}
                              labelWrapStyle={{
                                marginLeft: -4,
                              }}
                            />
                          </RadioButton>
                        </View>
                      );
                    }
                  })}
                </View>
              </RadioForm>
            ) : (
              <View
                style={[
                  styles.container,
                  !initialValue && styles.withoutValue,
                  errorMsg && styles.error,
                  isOpen && styles.active,
                ]}>
                {!!initialValue && (
                  <Text
                    style={[
                      styles.title,
                      isOpen &&
                        !errorMsg && {
                          color: colors.palegreen,
                        },
                    ]}>{`${placeholder}${
                    required && !readOnly ? ' *' : ''
                  }`}</Text>
                )}
                <Text
                  style={[
                    styles.placeholder,
                    errorMsg ? {color: colors.red} : {},
                  ]}>
                  {initialValue
                    ? text
                    : `${placeholder}${required ? ' *' : ''}`}
                </Text>
                {!readOnly ? (
                  <Image source={arrow} style={styles.arrow} />
                ) : null}

                <BottomModal
                  isOpen={isOpen}
                  onRequestClose={this.toggleDropdown}
                  onEmptyClose={() => {
                    this.validateInput('');
                    this.toggleDropdown();
                  }}>
                  <View
                    style={styles.dropdown}
                    accessible={true}
                    accessibilityLabel={setListOfLabeles(
                      countrySelect ? countries : options,
                    )}>
                    {countrySelect ? (
                      <ScrollView>
                        <FlatList
                          style={styles.list}
                          data={countries}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({item}) => (
                            <ListItem
                              key={item.code}
                              onPress={() => {
                                this.validateInput(item.code);
                              }}>
                              <Text
                                style={[
                                  styles.option,
                                  initialValue === item.code && styles.selected,
                                ]}
                                accessibilityLabel={`${item.label}`}>
                                {item.label}
                              </Text>
                            </ListItem>
                          )}
                          initialNumToRender={6}
                        />
                      </ScrollView>
                    ) : (
                      <ScrollView>
                        <FlatList
                          style={styles.list}
                          data={options}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({item}) => (
                            <ListItem
                              underlayColor={'transparent'}
                              activeOpacity={1}
                              key={item.value}
                              onPress={() => {
                                this.validateInput(
                                  item.value,
                                  item.otherOption,
                                );
                              }}>
                              <Text
                                style={[
                                  styles.option,
                                  initialValue === item.value &&
                                    styles.selected,
                                ]}
                                accessibilityLabel={`${item.text}`}>
                                {item.text}
                              </Text>
                            </ListItem>
                          )}
                          initialNumToRender={6}
                        />
                      </ScrollView>
                    )}
                  </View>
                </BottomModal>
              </View>
            )}

            {/* Error message */}
            {!!errorMsg && (
              <View style={{marginLeft: 30}}>
                <Text style={{color: colors.red, textAlign:'left'}}>{errorMsg}</Text>
              </View>
            )}
          </View>
        </TouchableHighlight>
        {/* Other field */}
        {showOther && (
          <TextInput
            id={this.props.otherField || 'otherField'}
            onChangeText={this.onChangeOther}
            readOnly={readOnly}
            placeholder={otherPlaceholder}
            initialValue={initialOtherValue}
          />
        )}
      </View>
    );
  }
}

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
    ...globalStyles.subline,
    // lineHeight: 50,
    paddingTop: 20,
    minHeight: 50,
    textAlign:'left'
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
    textAlign:'left'
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
    textAlign:'left'
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
    textAlign:'left'
  },
});

Select.propTypes = {
  id: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialOtherValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string.isRequired,
  otherPlaceholder: PropTypes.string,
  radio: PropTypes.bool,
  otherField: PropTypes.string,
  defaultCountry: PropTypes.string,
  countrySelect: PropTypes.bool,
  readOnly: PropTypes.bool,
  showErrors: PropTypes.bool,
  countriesOnTop: PropTypes.array,
  required: PropTypes.bool,
  setError: PropTypes.func,
  memberIndex: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  cleanErrorsOnUnmount: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};

export default Select;
