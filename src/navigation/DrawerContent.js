import React, {Component} from 'react';
import {
  ScrollView,
  Image,
  Text,
  StyleSheet,
  View,
  Platform,
  NativeModules,
  I18nManager
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {withNamespaces} from 'react-i18next';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import globalStyles from '../globalStyles';
import IconButton from '../components/IconButton';
import i18n from '../i18n';
import colors from '../theme.json';
import {switchLanguage, logout} from '../redux/actions';
import LogoutPopup from './LogoutPopup';
import dashboardIcon from '../../assets/images/icon_dashboard.png';
import familyNavIcon from '../../assets/images/icon_family_nav.png';
import {isPortrait, isTablet} from '../responsivenessHelpers';

// Component that renders the drawer menu content. DrawerItems are the links to
// the given views.
export class DrawerContent extends Component {
  state = {
    logoutModalOpen: false,
    checkboxesVisible: false,
    ckeckedBoxes: 0,
    showErrors: false,
    logingOut: false,
    activeTab: 'Dashboard',
    drawerContentWidth: 304,
  };

  changeLanguage = (lng) => {
    console.log('lng',lng)
   
    i18n.changeLanguage(lng).then(()=> {
      if(i18n.language === 'ar' && this.props.lang !== 'ar' ) {
        console.log('true')
        I18nManager.forceRTL(true)
      }else {
        console.log('false')
        I18nManager.forceRTL(false)
      }
    }); // change the currently uses i18n language
    this.props.switchLanguage(lng); // set the redux language for next app use
    this.props.navigation.closeDrawer(); // close drawer
  };
  logUserOut = () => {
    const {checkboxesVisible, ckeckedBoxes} = this.state;

    // allow the user to logout only if he checks all boxes
    if (!checkboxesVisible || (checkboxesVisible && ckeckedBoxes === 4)) {
      NativeModules.DeleteModule.deleteCache();
    } else {
      this.setState({
        showErrors: true,
      });
    }
  };
  showCheckboxes = () => {
    this.setState({
      checkboxesVisible: true,
    });
  };
  onPressCheckbox = (state) => {
    const {ckeckedBoxes} = this.state;
    this.setState({
      ckeckedBoxes: state ? ckeckedBoxes + 1 : ckeckedBoxes - 1,
    });
  };
  navigateToScreen = (screen) => {
    // navigation comes from react-navigation, nav comes from redux
    const {navigation} = this.props;

    this.setState({activeTab: screen});
    navigation.closeDrawer();
    navigation.navigate(screen);
  };

  onLayout = (e) => {
    this.setState({
      drawerContentWidth: e.nativeEvent.layout.width,
    });
  };

  openLogoutModal = () => {
    this.props.navigation.closeDrawer();
    this.setState({logoutModalOpen: true});
  };

  closeLogoutModal = () => {
    this.setState({
      checkboxesVisible: false,
      showErrors: false,
      ckeckedBoxes: 0,
      logoutModalOpen: false,
    });
  };

  render() {
    const {lng, user, navigation, dimensions} = this.props;
    const {
      checkboxesVisible,
      showErrors,
      logingOut,
      drawerContentWidth,
    } = this.state;
    const unsyncedDrafts = this.props.drafts.filter(
      (draft) => draft.status !== 'Synced',
    ).length;

    const landscape = !!dimensions && !isPortrait(dimensions);
    const phone = !!dimensions && !isTablet(dimensions);

    return (
      <ScrollView
        contentContainerStyle={[landscape && phone ? {} : styles.container]}
        onLayout={this.onLayout}>
        <View>
          <Image
            style={{height: 172, width: drawerContentWidth}}
            source={require('../../assets/images/navigation_image.png')}
          />
          {/* Language Switcher */}
          <View style={styles.languageSwitch}>
            <IconButton
              id="en"
              onPress={() => this.changeLanguage('en')}
              text="ENG"
              textStyle={[
                globalStyles.h3,
                lng === 'en' ? styles.whiteText : styles.greyText,
              ]}
              accessible={true}
              accessibilityLabel={'change to English'}
            />
            <Text style={[globalStyles.h3, styles.whiteText]}>
              {'  '}|{'  '}
            </Text>
            <IconButton
              id="es"
              onPress={() => this.changeLanguage('es')}
              text="ESP"
              textStyle={[
                globalStyles.h3,
                lng === 'es' ? styles.whiteText : styles.greyText,
              ]}
              accessible={true}
              accessibilityLabel={'change to Spanish'}
            />
            <Text style={[globalStyles.h3, styles.whiteText]}>
              {'  '}|{'  '}
            </Text>
            <IconButton
              id="pt"
              onPress={() => this.changeLanguage('pt')}
              text="PRT"
              textStyle={[
                globalStyles.h3,
                lng === 'pt' ? styles.whiteText : styles.greyText,
              ]}
              accessible={true}
              accessibilityLabel={'change to Portugues'}
            />
            <Text style={[globalStyles.h3, styles.whiteText]}>
            {'  '}|{'  '}
            </Text>
            <IconButton
              id="ht"
              onPress={()=> this.changeLanguage('ht')}
              text="HT"
              textStyle={[
                globalStyles.h3,
                lng === 'ht' ? styles.whiteText : styles.greyText,
              ]}
              accessible={true}
              accessibilityLabel={'change to Creole'}
            />
              <Text style={[globalStyles.h3, styles.whiteText]}>
            {'  '}|{'  '}
            </Text>
            <IconButton
              id="ar"
              onPress={()=> this.changeLanguage('ar')}
              text="AR"
              textStyle={[
                globalStyles.h3,
                lng === 'ar' ? styles.whiteText : styles.greyText,
              ]}
              accessible={true}
              accessibilityLabel={'change to Arabic'}
            />
          </View>
          <Text
            id="username"
            style={[styles.username, globalStyles.h3, styles.whiteText]}>
            {user.username}
          </Text>
          <Text style={[styles.appversion, globalStyles.h4, styles.whiteText]}>
            Version {DeviceInfo.getVersion()}
          </Text>
          {/* Links */}
        </View>
        <View style={styles.itemsContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
            }}>
            <View>
              <IconButton
                id="dashboard"
                style={{
                  ...styles.navItem,
                  backgroundColor:
                    this.state.activeTab === 'Dashboard'
                      ? colors.primary
                      : null,
                }}
                onPress={() => this.navigateToScreen('Dashboard')}
                imageSource={dashboardIcon}
                text={i18n.t('views.home')}
                textStyle={styles.label}
              />
              <IconButton
                id="surveys"
                style={{
                  ...styles.navItem,
                  backgroundColor:
                    this.state.activeTab === 'Surveys' ? colors.primary : null,
                }}
                onPress={() => this.navigateToScreen('Surveys')}
                icon="swap-calls"
                size={20}
                textStyle={styles.label}
                text={i18n.t('views.createLifemap')}
              />
              {this.props.user.role !== 'ROLE_SURVEY_TAKER' && (
                <IconButton
                  id="families"
                  style={{
                    ...styles.navItem,
                    backgroundColor:
                      this.state.activeTab === 'Families'
                        ? colors.primary
                        : null,
                  }}
                  onPress={() => this.navigateToScreen('Families')}
                  imageSource={familyNavIcon}
                  size={20}
                  text={i18n.t('views.families')}
                  textStyle={styles.label}
                />
              )}
              <IconButton
                id="sync"
                style={{
                  ...styles.navItem,
                  backgroundColor:
                    this.state.activeTab === 'Sync' ? colors.primary : null,
                }}
                onPress={() => this.navigateToScreen('Sync')}
                icon="sync"
                size={20}
                text={i18n.t('views.synced')}
                textStyle={styles.label}
                badge
              />
            </View>
          </ScrollView>
        </View>
        {/* Logout button */}
        <IconButton
          id="logout"
          style={styles.navItem}
          onPress={this.openLogoutModal}
          communityIcon="login-variant"
          size={20}
          textStyle={styles.label}
          text={i18n.t('views.logout.logout')}
        />
        {/* Logout popup */}
        <LogoutPopup
          isOpen={this.state.logoutModalOpen}
          checkboxesVisible={checkboxesVisible}
          showErrors={showErrors}
          navigation={navigation}
          unsyncedDrafts={unsyncedDrafts}
          logUserOut={this.logUserOut}
          showCheckboxes={this.showCheckboxes}
          onPressCheckbox={this.onPressCheckbox}
          logingOut={logingOut}
          onModalClose={this.closeLogoutModal}
        />
      </ScrollView>
    );
  }
}

DrawerContent.propTypes = {
  lng: PropTypes.string,
  switchLanguage: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  dimensions: PropTypes.object.isRequired,
  sync: PropTypes.object.isRequired,
};

const mapStateToProps = ({env, user, drafts, dimensions, sync}) => ({
  env,
  user,
  drafts,
  dimensions,
  sync,
});

const mapDispatchToProps = {
  switchLanguage,
  logout,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(DrawerContent),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  itemsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  greyText: {
    color: colors.palegrey,
  },
  whiteText: {
    color: colors.white,
  },
  languageSwitch: {
    flexDirection: 'row',
    position: 'absolute',
    top: 40,
    left: 16,
  },
  username: {
    position: 'absolute',
    top: 119,
    left: 16,
  },
  appversion: {
    position: 'absolute',
    top: 139,
    left: 16,
    fontSize: 12,
  },
  navItem: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingBottom: 15,
    paddingTop: 15,
  },
  label: {
    marginLeft: 20,

    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Poppins SemiBold',
      },
    }),
    fontSize: 14,
    color: colors.palegreen,
  },
});
