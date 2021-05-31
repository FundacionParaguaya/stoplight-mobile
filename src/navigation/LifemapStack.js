import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import colors from '../theme.json';
import FamilyView from '../screens/Family';
import FamiliesView from '../screens/Families';
import FamilyParticipantView from '../screens/lifemap/FamilyParticipant';
import FamilyMembersNamesView from '../screens/lifemap/FamilyMembersNames';
import LocationView from '../screens/lifemap/Location';
import SurveysView from '../screens/Surveys';
import BeginLifemapView from '../screens/lifemap/BeginLifemap';
import TermsView from '../screens/lifemap/Terms';
import SocioEconomicQuestionView from '../screens/lifemap/SocioEconomicQuestion';
import QuestionView from '../screens/lifemap/Question';
import SignIn from '../screens/lifemap/SignIn';
import Picture from '../screens/lifemap/Picture';
import FamilyMemberView from '../screens/lifemap/FamilyMember';
import FinalView from '../screens/lifemap/Final';
import OverviewView from '../screens/lifemap/Overview';
import PrioritiesView from '../screens/lifemap/Priorities';
import SkippedView from '../screens/lifemap/Skipped';
import AddIntervention from '../screens/interventions/AddIntervention';

import CloseButton from './CloseButton';
import Title from './Title';
import CustomHeaderSurvey from './CustomHeaderSurvey';
import {generateNavStyles, addMenuIcon} from './helpers';
import SelectIndicatorPriorityView from '../screens/lifemap/SelectIndicatorPriority';


const Stack = createStackNavigator();
export default LifemapStack = ({navigation}) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#009387',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen
      name="Surveys"
      component={SurveysView}
      options={({route, navigation}) => ({
        headerTitle: (props) => <Title title="views.createLifemap" />,
        ...generateNavStyles({navigation, route}),
        headerLeft: () => addMenuIcon(navigation),
      })}
    />
    <Stack.Screen
      name="Terms"
      component={TermsView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.termsConditions"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Privacy"
      component={TermsView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.privacyPolicy"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="FamilyParticipant"
      component={FamilyParticipantView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.primaryParticipant"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="FamilyMembersNames"
      component={FamilyMembersNamesView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.familyMembers"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Location"
      component={LocationView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.location"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="SocioEconomicQuestion"
      component={SocioEconomicQuestionView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Text
              accessibilityLiveRegion="assertive"
              style={[styles.headerTitleStyle]}>
              {route.params.title}
            </Text>
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="BeginLifemap"
      component={BeginLifemapView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <CustomHeaderSurvey
              route={route}
              navigation={navigation}
              separatorScreen={true}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="Picture"
      component={Picture}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.pictures.uploadPictures"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Signin"
      component={SignIn}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.sign.signHere"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Question"
      component={QuestionView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerHeight: route.params.navigationHeight
          ? route.params.navigationHeight - 20
          : 66,
        headerTitle: (props) => {
          return <CustomHeaderSurvey navigation={navigation} route={route} />;
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Skipped"
      component={SkippedView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return (
            <Title
              title="views.skippedIndicators"
              accessibilityAssertiveType="none"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="Overview"
      component={OverviewView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return (
            <CustomHeaderSurvey
              route={route}
              navigation={navigation}
              overview={true}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="Priorities"
      component={PrioritiesView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return (
            <Title
              title="views.yourLifeMap"
              accessibilityAssertiveType="none"
              style={{marginLeft: 20}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Final"
      component={FinalView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return <Title title="general.thankYou" style={{marginLeft: 20}} />;
        },
      })}
    />
    <Stack.Screen
      name="FamilyMember"
      component={FamilyMemberView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
      })}
    />
  </Stack.Navigator>
);

export const FamiliesStack = (propz) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#009387',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <Stack.Screen
      name="Families"
      component={FamiliesView}
      options={({route, navigation}) => ({
        headerShown: true,
        headerTitle: (props) => (
          <Title title="views.families" accessibilityAssertiveType="none" />
        ),
        ...generateNavStyles({navigation, route}),
        headerLeft: () => addMenuIcon(navigation),
      })}
    />
    <Stack.Screen
      name="Family"
      component={FamilyView}
      options={({route, navigation}) => ({
        headerTitle: (props) => {
          return (
            <Title
              title={
                route && route.params && route.params.familyName
                  ? route.params.familyName
                  : propz.route.state.routes[1].params &&
                    propz.route.state.routes[1].params.familyName &&
                    propz.route.state.routes[1].params.familyName
              }
              accessibilityAssertiveType="none"
            />
          );
        },

        ...generateNavStyles({navigation, route}),
      })}
    />

    <Stack.Screen
      name="SelectIndicatorPriority"
      component={SelectIndicatorPriorityView}
      options = {({ route, navigation }) => ({
        headerTitle: (props) => {
          return (
            <Title
              title={route && route.params && route.params.familyName
                ? route.params.familyName
                : ''
              }
              accessibilityAssertiveType="none"
            />
          )
        },
        ...generateNavStyles({navigation, route })
      })}

    />

    <Stack.Screen
      name="AddIntervention"
      component={AddIntervention}
      options = {({ route, navigation }) =>({
        headerTitle: (props) => {
          return(
            <Title
              title={route && route.params && route.params.familyName ? route.params.familyName: '' }
              accessibilityAssertiveType="none"
            />
          )
        },
        ...generateNavStyles({navigation, route})
      })}
    />
    <Stack.Screen
      name="Surveys"
      component={SurveysView}
      options={({route, navigation}) => ({
        headerTitle: (props) => <Title title="views.createLifemap" />,
        ...generateNavStyles({navigation, route}),
        headerLeft: () => addMenuIcon(navigation),
      })}
    />
    <Stack.Screen
      name="Terms"
      component={TermsView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.termsConditions"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Privacy"
      component={TermsView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.privacyPolicy"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="FamilyParticipant"
      component={FamilyParticipantView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.primaryParticipant"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="FamilyMembersNames"
      component={FamilyMembersNamesView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.familyMembers"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Location"
      component={LocationView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.location"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="SocioEconomicQuestion"
      component={SocioEconomicQuestionView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Text
              accessibilityLiveRegion="assertive"
              style={[styles.headerTitleStyle]}>
              {route.params.title}
            </Text>
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="BeginLifemap"
      component={BeginLifemapView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <CustomHeaderSurvey
              route={route}
              navigation={navigation}
              separatorScreen={true}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="Picture"
      component={Picture}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.pictures.uploadPictures"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Signin"
      component={SignIn}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return (
            <Title
              title="views.sign.signHere"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Question"
      component={QuestionView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerHeight: route.params.navigationHeight
          ? route.params.navigationHeight - 20
          : 66,
        headerTitle: (props) => {
          return <CustomHeaderSurvey navigation={navigation} route={route} />;
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Skipped"
      component={SkippedView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return (
            <Title
              title="views.skippedIndicators"
              accessibilityAssertiveType="none"
              style={{marginLeft: 'auto', marginRight: 'auto'}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="Overview"
      component={OverviewView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return (
            <CustomHeaderSurvey
              route={route}
              navigation={navigation}
              overview={true}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />

    <Stack.Screen
      name="Priorities"
      component={PrioritiesView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return (
            <Title
              title="views.lifemap.priorities"
              accessibilityAssertiveType="none"
              style={{marginLeft: 20}}
            />
          );
        },
        headerRight: (props) => {
          return !route.params || !route.params.family ? (
            <CloseButton
              navigation={navigation}
              route={route}
              style={styles.touchable}
            />
          ) : (
            <View />
          );
        },
      })}
    />
    <Stack.Screen
      name="Final"
      component={FinalView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),

        headerTitle: (props) => {
          return <Title title="general.thankYou" style={{marginLeft: 20}} />;
        },
      })}
    />
    <Stack.Screen
      name="FamilyMember"
      component={FamilyMemberView}
      options={({route, navigation}) => ({
        ...generateNavStyles({navigation, route, shadowHeader: false}),
        headerTitle: (props) => {
          return <Title title={route.params.title} />;
        },
      })}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  touchable: {
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
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
    marginLeft: 'auto',
    marginRight: 'auto',
    color: colors.black,
  },
});
