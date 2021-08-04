import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/fr';

import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, {Component, useEffect, useRef, useState} from 'react';

import DrawerNavigator from './DrawerNavigator';
import LoadingScreen from '../screens/Loading';
import LoginScreen from '../screens/Login';
import {NavigationContainer} from '@react-navigation/native';
import PropTypes from 'prop-types';
import SplashScreen from 'react-native-splash-screen';
import {connect} from 'react-redux';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {getLocaleForLanguage} from '../utils';
import moment from 'moment';
import {setDimensions} from '../redux/actions';

// import RootStack from './stacks'
const Stack = createStackNavigator();

export const NavWrapper = ({hydration, lng, setDimensions}) => {
  const [loading, setLoading] = useState(true);
  const prevHydratationRef = useRef();
  const prevHydratation = !!prevHydratationRef && prevHydratationRef.current;

  const {width, height, scale} = useWindowDimensions();

  useEffect(() => {
    setDimensions({
      height,
      width,
      scale,
    });
  }, [width, height, scale]);

  useEffect(() => {
    setDimensions({
      height,
      width,
      scale,
    });
    moment.locale(getLocaleForLanguage(lng));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!prevHydratation && hydration) {
      SplashScreen.hide();
    }
  });
  prevHydratationRef.current = hydration;

  return hydration && !loading ? (
    <View style={styles.container} testID="app-container">
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            options={{headerShown: false, animationEnabled: false}}
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            options={{headerShown: false, animationEnabled: false}}
            name="Loading"
            component={LoadingScreen}
          />
          <Stack.Screen
            options={{headerShown: false, animationEnabled: false}}
            name="DrawerStack"
            component={DrawerNavigator}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  ) : (
    <View />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

NavWrapper.propTypes = {
  user: PropTypes.object.isRequired,
  sync: PropTypes.object.isRequired,
  hydration: PropTypes.bool.isRequired,
  setDimensions: PropTypes.func.isRequired,
};

const mapStateToProps = ({user, sync, dimensions, hydration, lng}) => ({
  user,
  sync,
  dimensions,
  hydration,
  lng,
});

const mapDispatchToProps = {
  setDimensions,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavWrapper);
