import { createStackNavigator } from 'react-navigation'
import SurveysView from '../../screens/Surveys'
import LifemapScreens from './LifemapScreens'
import { generateNavOptions } from './helpers'
import i18n from '../../i18n'

export default createStackNavigator({
  Surveys: {
    screen: SurveysView,
    navigationOptions: ({ navigation }) => ({
      title: i18n.t('views.createLifemap'),
      ...generateNavOptions({ navigation })
    })
  },
  ...LifemapScreens
})
