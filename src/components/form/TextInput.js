import PropTypes from 'prop-types';
import React, {Component} from 'react';
import { I18nManager } from 'react-native';
import {StyleSheet, Text, View, Keyboard} from 'react-native';
import {Input} from 'react-native-elements';

import validator from 'validator';

import globalStyles from '../../globalStyles';
import i18n from '../../i18n';
import colors from '../../theme.json';

const validName = /^[a-zA-Z._-\s{1}\u00C6\u00D0\u018E\u018F\u0190\u0194\u0132\u014A\u0152\u1E9E\u00DE\u01F7\u021C\u00E6\u00F0\u01DD\u0259\u025B\u0263\u0133\u014B\u0153\u0138\u017F\u00DF\u00FE\u01BF\u021D\u0104\u0181\u00C7\u0110\u018A\u0118\u0126\u012E\u0198\u0141\u00D8\u01A0\u015E\u0218\u0162\u021A\u0166\u0172\u01AFY\u0328\u01B3\u0105\u0253\u00E7\u0111\u0257\u0119\u0127\u012F\u0199\u0142\u00F8\u01A1\u015F\u0219\u0163\u021B\u0167\u0173\u01B0y\u0328\u01B4\u00C1\u00C0\u00C2\u00C4\u01CD\u0102\u0100\u00C3\u00C5\u01FA\u0104\u00C6\u01FC\u01E2\u0181\u0106\u010A\u0108\u010C\u00C7\u010E\u1E0C\u0110\u018A\u00D0\u00C9\u00C8\u0116\u00CA\u00CB\u011A\u0114\u0112\u0118\u1EB8\u018E\u018F\u0190\u0120\u011C\u01E6\u011E\u0122\u0194\u00E1\u00E0\u00E2\u00E4\u01CE\u0103\u0101\u00E3\u00E5\u01FB\u0105\u00E6\u01FD\u01E3\u0253\u0107\u010B\u0109\u010D\u00E7\u010F\u1E0D\u0111\u0257\u00F0\u00E9\u00E8\u0117\u00EA\u00EB\u011B\u0115\u0113\u0119\u1EB9\u01DD\u0259\u025B\u0121\u011D\u01E7\u011F\u0123\u0263\u0124\u1E24\u0126I\u00CD\u00CC\u0130\u00CE\u00CF\u01CF\u012C\u012A\u0128\u012E\u1ECA\u0132\u0134\u0136\u0198\u0139\u013B\u0141\u013D\u013F\u02BCN\u0143N\u0308\u0147\u00D1\u0145\u014A\u00D3\u00D2\u00D4\u00D6\u01D1\u014E\u014C\u00D5\u0150\u1ECC\u00D8\u01FE\u01A0\u0152\u0125\u1E25\u0127\u0131\u00ED\u00ECi\u00EE\u00EF\u01D0\u012D\u012B\u0129\u012F\u1ECB\u0133\u0135\u0137\u0199\u0138\u013A\u013C\u0142\u013E\u0140\u0149\u0144n\u0308\u0148\u00F1\u0146\u014B\u00F3\u00F2\u00F4\u00F6\u01D2\u014F\u014D\u00F5\u0151\u1ECD\u00F8\u01FF\u01A1\u0153\u0154\u0158\u0156\u015A\u015C\u0160\u015E\u0218\u1E62\u1E9E\u0164\u0162\u1E6C\u0166\u00DE\u00DA\u00D9\u00DB\u00DC\u01D3\u016C\u016A\u0168\u0170\u016E\u0172\u1EE4\u01AF\u1E82\u1E80\u0174\u1E84\u01F7\u00DD\u1EF2\u0176\u0178\u0232\u1EF8\u01B3\u0179\u017B\u017D\u1E92\u0155\u0159\u0157\u017F\u015B\u015D\u0161\u015F\u0219\u1E63\u00DF\u0165\u0163\u1E6D\u0167\u00FE\u00FA\u00F9\u00FB\u00FC\u01D4\u016D\u016B\u0169\u0171\u016F\u0173\u1EE5\u01B0\u1E83\u1E81\u0175\u1E85\u01BF\u00FD\u1EF3\u0177\u00FF\u0233\u1EF9\u01B4\u017A\u017C\u017E\u1E93]+$/;

class TextInput extends Component {
  state = {
    status: this.props.initialValue ? 'filled' : 'blur',
    text: this.props.initialValue || '',
    errorMsg: null,
    hasError: false,
  };

  onFocus = () => {
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        this.onEndEditing();
      },
    );
    this.setState({
      status: 'active',
    });
  };

  onEndEditing = () => {
    const {text} = this.state;
    this.setState({
      text: text.trim(),
      status: text ? 'filled' : 'blur',
    });

    this.props.validation || this.props.required
      ? this.validateInput(text.trim())
      : '';
    this.keyboardDidHideListener.remove();
    // this is the only place we change the actual redux state
    // this.props.onChangeText(this.state.text.trim(), this.props.id)
  };

  defineTextColor = (status) => {
    switch (status) {
      case 'active':
        return colors.palegreen;
      case 'blur':
        return colors.grey;
      case 'error':
        return colors.red;
      default:
        return colors.grey;
    }
  };

  onChangeText = (text) => {
    if (this.props.keyboardType === 'numeric' && text) {
      //i have to remove the comas before adding the commas with Intl.NumberFormat. eg  if i add a number to a number with commas (102,313,212) then it will result to NaN so i have to remove  the commas first (102313212) and then use Intl.NumberFormat
      this.setState({
        text: text
          .replace(/[,.]/g, '')
          .replace(
            /(\d)(?=(\d{3})+(?!\d))/g,
            this.props.lng === 'en' ? '$1,' : '$1.',
          ),
      });
    } else {
      this.setState({text});
    }
    if (this.props.required) {
      if (!text && !this.state.hasError) {
        this.setErr(text);
        this.setState({hasError: true});
      } else if (this.state.hasError) {
        this.setErr(text);
        this.setState({hasError: false});
      }
    }
    this.props.onChangeText(text.trim(), this.props.id);
  };
  setErr(text) {
    this.setState({
      text: text.trim(),
      status: text ? 'filled' : 'blur',
    });

    this.validateInput(text.trim());
  }
  handleError(errorMsg) {
    if (this.props.setError) {
      this.props.setError(true);
    }

    this.setState({
      status: 'error',
      errorMsg,
    });
  }

  validateInput(text) {
    if (this.props.required && !text) {
      return this.handleError(i18n.t('validation.fieldIsRequired'));
    }
    if (this.props.validation === 'long-string' && text.length > 250) {
      return this.handleError(i18n.t('validation.lessThan250Characters'));
    }
    if (this.props.validation !== 'long-string' && text.length > 50) {
      return this.handleError(i18n.t('validation.lessThan50Characters'));
    }
    if (
      this.props.validation === 'email' &&
      !validator.isEmail(text) &&
      !validator.isEmpty(text)
    ) {
      return this.handleError(i18n.t('validation.validEmailAddress'));
    }

    if (
      this.props.validation === 'string' &&
      !validName.test(text) &&
      !validator.isEmpty(text)
    ) {
      return this.handleError(i18n.t('validation.alphabeticCharacters'));
    }
    if (
      this.props.validation === 'phoneNumber' &&
      (!this.props.phoneValidation(text) ||
        !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(text)) &&
      !validator.isEmpty(text)
    ) {
      return this.handleError(i18n.t('validation.validPhoneNumber'));
    }

    if (this.props.setError) {
      this.props.setError(false);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.showErrors !== this.props.showErrors) {
      this.validateInput(this.state.text || '');
    }
  }

  componentDidMount() {
    // on mount validate empty required fields without showing an errors message
    if (
      this.props.required &&
      !this.props.initialValue &&
      this.props.setError
    ) {
      this.props.setError(true);
    }
  }

  render() {
    const {text, errorMsg} = this.state;
    const {
      label,
      placeholder,
      required,
      readOnly,
      multiline,
      autoFocus,
      upperCase,
    } = this.props;
    const status = this.props.status || this.state.status;

    let showPlaceholder = status === 'blur' && !text;
    if (readOnly && !text) {
      return <View />;
    }
    return (
      <View>
        {/* {label && (
          <Text
            style={styles.label}
            accessibilityLabel={`${label} ${
              required && !readOnly
                ? i18n.t('validation.fieldIsRequiredAccessibilityLabel')
                : ''
            }`}>{`${label}${required && !readOnly ? ' *' : ''}`}</Text>
        )} */}
        <View
          style={{
            marginHorizontal: 5,
            marginBottom: -8,
            marginTop: status == 'blur' ? -22 : 0,
          }}
          accessible={true}
          accessibilityLabel={`${placeholder} ${
            required && !label && !readOnly
              ? i18n.t('validation.fieldIsRequiredAccessibilityLabel')
              : ''
          }`}>
          {/* {!showPlaceholder && !label ? (
            <Text
              id="topLabel"
              style={{
                ...styles.text,
                color: this.defineTextColor(status),
              }}
              accessibilityLabel={`${placeholder} ${
                required && !label && !readOnly
                  ? i18n.t('validation.fieldIsRequiredAccessibilityLabel')
                  : ''
              }`}>
              {`${placeholder} ${required && !label && !readOnly ? '*' : ''}`}
              {'\n'}
            </Text>
          ) : (
            <View />
          )} */}
          <Input
            labelStyle={{
              color: this.defineTextColor(status),
              fontSize: 14,
              fontWeight: 'normal',
              marginLeft: 15,
              borderBottomColor: colors.black,
              textAlign:'left'
            }}
            autoFocus={autoFocus}
            keyboardType={showPlaceholder ? null : this.props.keyboardType}
            autoCapitalize={upperCase ? 'sentences' : 'none'}
            blurOnSubmit
            onBlur={this.onEndEditing}
            onFocus={this.onFocus}
            onChangeText={this.onChangeText}
            label={
              !showPlaceholder && !label
                ? `${placeholder} ${required && !label && !readOnly ? '*' : ''}`
                : ''
            }
            placeholderTextColor={colors.grey}
            placeholder={
              showPlaceholder
                ? `${placeholder} ${required && !label ? '*' : ''}`
                : ''
            }
            inputContainerStyle={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor: styles[status].backgroundColor,
              borderBottomColor: styles[status].borderBottomColor,
              paddingLeft: 11,
              paddingTop: status == 'blur' ? 6 : 0,
              paddingBottom: 6,
            }}
            inputStyle={[
              styles.inputStyle,
              !showPlaceholder ? styles.activeInput : {},
            ]}
            editable={!readOnly}
            multiline={multiline}
            importantForAccessibility="no-hide-descendants">
            <Text style={{color: this.defineTextColor(status)}}>{text}</Text>
          </Input>
        </View>
        {status === 'error' && errorMsg && (
          <View
            id="errorWrapper"
            style={{marginLeft: 30, marginBottom: 12, marginTop: -12}}>
            <Text style={{color: colors.red, textAlign:'left'}}>{errorMsg}</Text>
          </View>
        )}
      </View>
    );
  }
}
/* eslint-disable react-native/no-unused-styles */
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    ...globalStyles.subline,
  },
  inputStyle: {
    ...globalStyles.subline,
    fontFamily: 'Roboto',
    paddingRight: 30,
    fontSize: 14,
    textAlign: I18nManager.isRTL ? 'right': 'left'
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

TextInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  initialValue: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  onChangeText: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  upperCase: PropTypes.bool,
  multiline: PropTypes.bool,
  showErrors: PropTypes.bool,
  lng: PropTypes.string,
  keyboardType: PropTypes.string,
  phoneValidation: PropTypes.func,
  validation: PropTypes.oneOf([
    'email',
    'string',
    'phoneNumber',
    'number',
    'long-string',
  ]),
  status: PropTypes.oneOf(['blur', 'error', 'active', 'filled']),
  setError: PropTypes.func,
};

export default TextInput;
