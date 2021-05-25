import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import colors from '../theme.json';
import IconButton from '../components/IconButton';

import BackButton from './BackButton';
import i18n from '../i18n';
import { I18nManager } from 'react-native';

// Each of the major views has a stack that needs the same nav options.
// These options handle the header styles and menu icon.
export const generateNavStyles = ({
  navigation,
  route,
  shadowHeader = true,
  headerHeight = 66,
}) => ({
  headerTitleStyle: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
      },
      android: {
        fontFamily: 'Poppins SemiBold',
      },
    }),
    fontSize: 18,
    fontWeight: '200',
    lineHeight: 26,
    marginLeft: shadowHeader ? 20 : 'auto',
    marginRight: shadowHeader ? 0 : 'auto',
  },
  cardStyle: false,
  animationEnabled: false,
  headerStyle: {
    height: headerHeight,
    backgroundColor: colors.white,
    elevation: shadowHeader ? 1 : 0,
    shadowOpacity: shadowHeader ? 1 : 0,
  },
  headerLeftContainerStyle: {
    marginLeft: 19,
  },
  headerRightContainerStyle: {
    marginRight: I18nManager.isRTL ? 16 : -16 ,
  },
  headerLeft: () => {
    return (
      <BackButton
        navigation={navigation}
        route={route}
        style={[styles.touchable,{transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]}]}
      />
    );
  },
  // empty view to help center titles where there is no close icon
  // headerRight: <View style={{width: 25}} />,
});

export const addMenuIcon = (navigation) => {
  return (
    <IconButton
      style={styles.touchable}
      onPress={() => navigation.toggleDrawer()}
      icon="menu"
      size={30}
      badge
      accessible={true}
      accessibilityLabel={i18n.t('general.navigation')}
    />
  );
};

const styles = StyleSheet.create({
  touchable: {
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
});
