import { createStackNavigator, createAppContainer } from 'react-navigation'
import DrawerNavigator from './DrawerNavigator'
import ExitDraftPopup from '../screens/modals/ExitDraftModal'
import LoginView from '../screens/Login'
import LoadingView from '../screens/Loading'

const LoginStack = createStackNavigator(
  {
    Login: { screen: LoginView },
    Loading: { screen: LoadingView }
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none',
    transitionConfig: () => ({
      screenInterpolator: () => null,
      transitionSpec: {
        duration: 0
      }
    })
  }
)

export const DrawerNavigation = createStackNavigator(
  {
    DrawerStack: { screen: DrawerNavigator },
    ExitDraftModal: {
      screen: ExitDraftPopup
    }
  },
  {
    initialRouteName: 'DrawerStack',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'rgba(47,38,28, 0.2)',
      opacity: 1
    },
    transitionConfig: () => ({
      screenInterpolator: () => null,
      transitionSpec: {
        duration: 0
      }
    })
  }
)

const MainNavigator = createStackNavigator(
  {
    loginStack: { screen: LoginStack },
    drawerStack: { screen: DrawerNavigation }
  },
  {
    // Default config for all screens
    headerMode: 'none',
    initialRouteName: 'drawerStack',
    transitionConfig: () => ({
      screenInterpolator: () => null,
      transitionSpec: {
        duration: 0
      }
    })
  }
)

export default createAppContainer(MainNavigator)
