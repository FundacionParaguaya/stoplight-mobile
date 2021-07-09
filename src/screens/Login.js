import {
  AppState,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import InternalStorageFullModal, {
  MINIMUM_REQUIRED_STORAGE_SPACE_500_MB,
} from './modals/InternalStorageFullModal';
import React, {Component} from 'react';
import {
  login,
  setDimensions,
  setDownloadMapsAndImages,
  setEnv,
} from '../redux/actions';

import Button from '../components/Button';
import {CheckBox} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Linking } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import NotificationModal from '../components/NotificationModal';
import PropTypes from 'prop-types';
import RNFetchBlob from 'rn-fetch-blob';
import VersionCheck from 'react-native-version-check';
import colors from '../theme.json';
import {connect} from 'react-redux';
import {getDeviceLanguage} from '../utils';
import globalStyles from '../globalStyles';
import i18n from 'i18next';
import logo from '../../assets/images/logo.png';
import {url} from '../config';
import {withNamespaces} from 'react-i18next';

// get env
const nodeEnv = process.env;

export class Login extends Component {
  // unsubscribeNetChange;
  state = {
    username: '',
    password: '',
    error: false,
    error2: false,
    connection: false,
    loading: false,
    syncMaps: true,
    syncImages: true,
    syncAudios: true,
    appState: AppState.currentState,
    notEnoughStorageSpace: false,
    showPassword: false,
    needUpdate: false,
  };
  componentDidMount() {
    this.props.navigation.addListener('didFocus', () => {
      const lng = getDeviceLanguage();
      i18n.changeLanguage(lng);
    });

    VersionCheck.needUpdate().then((res) => {
      if (res.isNeeded) {
        this.setState({needUpdate: true});
        setTimeout(() => {
          Linking.openURL(res.storeUrl)
        },4000)
      }
    });

    // if use has logged in navigate to Loading
    if (this.props.user.token) {
      this.props.navigation.navigate('Loading');
    } else {
      AppState.addEventListener('change', this.handleAppStateChange);
      this.setDimensions();

      // check connection
      NetInfo.fetch().then((state) =>
        this.setConnectivityState(state.isConnected),
      );
      this.unsubscribeNetChange = NetInfo.addEventListener((state) => {
        this.setConnectivityState(state.isConnected);
      });
    }
  }

  setConnectivityState = (isConnected) => {
    isConnected
      ? this.setState({connection: true, error: ''})
      : this.setState({connection: false, error: 'No connection'});
  };

  setDimensions = () => {
    const {width, height, scale} = this.props.dimensions;
    const screenDimensions = Dimensions.get('window');

    if (
      width !== screenDimensions.width ||
      height !== screenDimensions.height ||
      scale !== screenDimensions.scale
    ) {
      this.props.setDimensions({
        height: screenDimensions.height,
        width: screenDimensions.width,
        scale: screenDimensions.scale,
      });
    }
  };

  checkDevOption = (devProp) => {
    this.setState({
      [devProp]: !this.state[devProp],
    });
  };

  onLogin = async () => {
    if (!(await this.isStorageSpaceEnough())) {
      this.setState({notEnoughStorageSpace: true});
      return;
    }

    this.setState({
      loading: true,
      error: false,
      error2: false,
    });
    this.props.setDownloadMapsAndImages({
      downloadMaps: this.state.syncMaps,
      downloadImages: this.state.syncImages,
      downloadAudios: this.state.syncAudios,
    });
    let env = this.state.username.trim() === 'demo' ? 'demo' : 'production';
    let username = this.state.username.trim();
    let envCheck = this.state.username.trim().substring(0, 2);

    if (envCheck === 't/' || envCheck === 'd/' || envCheck === 'p/') {
      if (envCheck === 't/') {
        env = 'testing';
      } else if (envCheck === 'd/') {
        env = 'demo';
      } else if (envCheck === 'p/') {
        env = 'production';
      }

      username = this.state.username
        .trim()
        .substring(2, this.state.username.trim().length);
    }

    this.props.setEnv(env);
    this.props.login(username, this.state.password, url[env]).then(() => {
      if (this.props.user.status === 401) {
        this.setState({
          loading: false,
        });
        this.setState({error: 'Wrong username or password'});
      } else if (
        this.props.user.role !== 'ROLE_SURVEY_USER' &&
        this.props.user.role !== 'ROLE_SURVEY_TAKER' &&
        this.props.user.role !== 'ROLE_SURVEY_USER_ADMIN'
      ) {
        this.setState({
          loading: false,
        });
        this.setState({error: 'Wrong username or password'});
      } else {
        this.setState({
          loading: false,
        });
        this.props.navigation.navigate('Loading');
      }
    });
  };

  handleAppStateChange = (nextAppState) =>
    this.setState({appState: nextAppState});

  isStorageSpaceEnough = async () => {
    const freeSpace = await RNFetchBlob.fs.df();

    return (
      Number(freeSpace.internal_free) > MINIMUM_REQUIRED_STORAGE_SPACE_500_MB
    );
  };

  retryLogIn = () => this.setState({notEnoughStorageSpace: false});

  handleShowPassword = () =>
    this.setState({showPassword: !this.state.showPassword});

  componentWillUnmount() {
    if (this.unsubscribeNetChange) {
      this.unsubscribeNetChange();
    }
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  render() {
    const {t} = this.props;
    const {needUpdate} = this.state;

    return (
      <React.Fragment>
        <NotificationModal
          isOpen={needUpdate}
          label={t('general.attention')}
          subLabel={t('general.updateApp')}
        />
        <View key={this.state.appState} style={globalStyles.container}>
          <ScrollView style={globalStyles.content}>
            {this.state.notEnoughStorageSpace && !this.state.error ? (
              <InternalStorageFullModal
                retryLogIn={this.retryLogIn}
                isOpen={!!this.state.notEnoughStorageSpace}
              />
            ) : (
              <View>
                <Image style={styles.logo} source={logo} />
                <Text style={globalStyles.h1}>{t('views.login.welcome')}</Text>
                <Text
                  style={{
                    ...globalStyles.h4,
                    marginBottom: 64,
                    color: colors.lightdark,
                  }}>
                  {t('views.login.letsGetStarted')}
                </Text>

                <View
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}>
                  <Text style={globalStyles.h5}>
                    {t('views.login.username')}
                  </Text>
                </View>
                <TextInput
                  id="username"
                  testID="username-input"
                  autoCapitalize="none"
                  style={{
                    ...styles.input,
                    borderColor: this.state.error
                      ? colors.red
                      : colors.palegreen,
                  }}
                  onChangeText={(username) => this.setState({username})}
                />
                <View
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}>
                  <Text style={globalStyles.h5}>
                    {t('views.login.password')}
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.passwordContainer,
                    borderColor: this.state.error
                      ? colors.red
                      : colors.palegreen,
                    marginBottom: this.state.error ? 0 : 25,
                  }}>
                  <TextInput
                    id="password"
                    testID="password-input"
                    secureTextEntry={this.state.showPassword ? false : true}
                    autoCapitalize="none"
                    style={{
                      ...styles.inputPassword,
                    }}
                    onChangeText={(password) => this.setState({password})}
                  />
                  <Icon
                    name={this.state.showPassword ? 'eye' : 'eye-off'}
                    size={21}
                    style={styles.icon}
                    color={colors.lightdark}
                    onPress={this.handleShowPassword}
                  />
                </View>

                {this.state.error ? (
                  <Text
                    id="error-message"
                    style={{...globalStyles.tag, ...styles.error}}>
                    {this.state.error}
                  </Text>
                ) : (
                  <View />
                )}
                {this.state.error2 ? (
                  <Text
                    id="error-message"
                    style={{
                      ...globalStyles.tag,
                      ...styles.error,
                      marginTop: -6,
                    }}>
                    {this.state.error2}
                  </Text>
                ) : (
                  <View />
                )}
                {this.state.loading ? (
                  <Button
                    style={{
                      maxWidth: 400,
                      width: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                    id="login-button"
                    handleClick={() => this.onLogin()}
                    text={t('views.login.loggingIn')}
                    disabled={true}
                    colored
                  />
                ) : (
                  <Button
                    style={{
                      maxWidth: 400,
                      width: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                    id="login-button"
                    testID="login-button"
                    handleClick={() => this.onLogin()}
                    text={t('views.login.buttonText')}
                    colored
                    disabled={
                      this.state.error === 'No connection' ? true : false
                    }
                  />
                )}
                {nodeEnv.NODE_ENV === 'development' && (
                  <View style={{marginTop: 20}}>
                    <Text>Dev options</Text>
                    <CheckBox
                      containerStyle={styles.checkbox}
                      onPress={() => this.checkDevOption('syncMaps')}
                      title="Sync maps?"
                      checked={this.state.syncMaps}
                      textStyle={styles.checkboxText}
                    />
                    <CheckBox
                      containerStyle={styles.checkbox}
                      onPress={() => this.checkDevOption('syncImages')}
                      title="Sync images?"
                      checked={this.state.syncImages}
                      textStyle={styles.checkboxText}
                    />
                    <CheckBox
                      containerStyle={styles.checkbox}
                      onPress={() => this.checkDevOption('syncAudios')}
                      title="Sync Audios?"
                      checked={this.state.syncAudios}
                      textStyle={styles.checkboxText}
                    />
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </React.Fragment>
    );
  }
}

Login.propTypes = {
  setEnv: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  setDimensions: PropTypes.func.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  navigation: PropTypes.object.isRequired,
  setDownloadMapsAndImages: PropTypes.func.isRequired,
  dimensions: PropTypes.object,
  user: PropTypes.object.isRequired,
  t: PropTypes.func,
};

const styles = StyleSheet.create({
  input: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 400,
    width: '100%',
    fontSize: 16,
    fontFamily: 'Roboto',
    borderWidth: 1,
    borderRadius: 2,
    height: 48,
    marginBottom: 25,
    padding: 15,
    paddingBottom: 12,
    color: colors.lightdark,
    backgroundColor: colors.white,
  },
  inputPassword: {
    borderWidth: 0,
    color: colors.lightdark,
    width: '90%',
    maxWidth: 380,
  },
  passwordContainer: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 2,
    height: 48,
    paddingHorizontal: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  icon: {
    marginBottom: 4,
    marginRight: 10,
  },
  checkbox: {
    marginLeft: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  checkboxText: {
    fontWeight: 'normal',
  },
  logo: {width: 42, height: 42, marginBottom: 8},
  error: {
    color: colors.red,
    lineHeight: 15,
    marginBottom: 10,
    marginLeft: 'auto',
    width: 400,
    marginTop: 10,
    marginRight: 'auto',
  },
});

const mapStateToProps = ({env, user, dimensions}) => ({
  env,
  user,
  dimensions,
});

const mapDispatchToProps = {
  setEnv,
  login,
  setDimensions,
  setDownloadMapsAndImages,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Login),
);
