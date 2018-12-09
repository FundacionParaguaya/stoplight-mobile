import TermsView from '../../screens/lifemap/Terms'
import SocioEconomicQuestionView from '../../screens/lifemap/SocioEconomicQuestion'
import FinalView from '../../screens/lifemap/Final'
import FamilyParticipantView from '../../screens/lifemap/FamilyParticipant'
import FamilyMembersNamesView from '../../screens/lifemap/FamilyMembersNames'
import FamilyMembersGenderView from '../../screens/lifemap/FamilyMembersGender'
import FamilyMembersBirthdatesView from '../../screens/lifemap/FamilyMembersBirthdates'
import QuestionView from '../../screens/lifemap/Question'
import BeginLifemapView from '../../screens/lifemap/BeginLifemap'
import LocationView from '../../screens/lifemap/Location'
import SkippedView from '../../screens/lifemap/Skipped'
import OverviewView from '../../screens/lifemap/Overview'
import AddPriorityView from '../../screens/lifemap/AddPriority'
import AddAchievementView from '../../screens/lifemap/AddAchievement'
import DashboardView from '../../screens/Dashboard'
import i18n from '../../i18n'
import { generateNavOptions } from './helpers'

// Reusable object for all screens related to a draft
export default {
  Dashboard: {
    screen: DashboardView,
    navigationOptions: ({ navigation }) => generateNavOptions({ navigation })
  },
  Terms: {
    screen: TermsView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.termsConditions'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  Privacy: {
    screen: TermsView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.privacyPolicy'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  Location: {
    screen: LocationView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.location'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  SocioEconomicQuestion: {
    screen: SocioEconomicQuestionView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.socioEconomic'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  BeginLifemap: {
    screen: BeginLifemapView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.yourLifeMap'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  Question: {
    screen: QuestionView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.yourLifeMap'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  Skipped: {
    screen: SkippedView,
    navigationOptions: ({ navigation }) => ({
      title: 'Skipped indicators',
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  Overview: {
    screen: OverviewView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.yourLifeMap'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  AddPriority: {
    screen: AddPriorityView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.yourLifeMap'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  AddAchievement: {
    screen: AddAchievementView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.yourLifeMap'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  Final: {
    screen: FinalView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('general.thankYou'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  FamilyParticipant: {
    screen: FamilyParticipantView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.primaryParticipant'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  FamilyMembersNames: {
    screen: FamilyMembersNamesView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.familyMembers'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  FamilyMembersGender: {
    screen: FamilyMembersGenderView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.gender'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  },
  FamilyMembersBirthdates: {
    screen: FamilyMembersBirthdatesView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.birthDates'),
      ...generateNavOptions({ navigation, burgerMenu: false })
    })
  }
}
