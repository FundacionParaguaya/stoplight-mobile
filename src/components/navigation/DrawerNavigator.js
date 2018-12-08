import React from 'react'
import { createDrawerNavigator } from 'react-navigation'
import { Image, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import DrawerContentComponent from './DrawerContent'
import SyncStack from './SyncStack'
import FamiliesStack from './FamiliesStack'
import LifemapStack from './LifemapStack'
import DashboardStack from './DashboardStack'
import Icon from 'react-native-vector-icons/MaterialIcons'
import i18n from '../../i18n'
import colors from '../../theme.json'
import dashboardIcon from '../../../assets/images/icon_dashboard.png'
import familyNavIcon from '../../../assets/images/icon_family_nav.png'

// Separate component for the icon next to each nav link as color and size are
// the same for each.
const DrawerIcon = ({ name, rotate }) => (
  <Icon
    name={name}
    color={colors.palegreen}
    size={24}
    style={rotate ? styles.rotate : {}}
  />
)

DrawerIcon.propTypes = {
  name: PropTypes.string.isRequired,
  rotate: PropTypes.bool
}

// the drawer navigation menu
export default createDrawerNavigator(
  {
    Dashboard: {
      screen: DashboardStack,
      navigationOptions: {
        drawerLabel: i18n.t('views.dashboard'),
        drawerIcon: <Image source={dashboardIcon} />
      }
    },
    Surveys: {
      screen: LifemapStack,
      navigationOptions: {
        drawerLabel: i18n.t('views.createLifemap'),
        drawerIcon: <DrawerIcon name="swap-calls" rotate={true} />
      }
    },
    Families: {
      screen: FamiliesStack,
      navigationOptions: {
        drawerIcon: <Image source={familyNavIcon} />
      }
    },
    Sync: {
      screen: SyncStack,
      navigationOptions: {
        drawerIcon: <DrawerIcon name="sync" />
      }
    }
  },
  {
    contentComponent: DrawerContentComponent,
    contentOptions: {
      labelStyle: {
        fontFamily: 'Poppins',
        fontWeight: '600',
        fontSize: 14,
        color: colors.palegreen
      },
      iconContainerStyle: {
        opacity: 1,
        marginRight: 0
      },
      activeBackgroundColor: colors.palebeige,
      activeTintColor: colors.palegreen,
      itemsContainerStyle: {
        marginVertical: 0
      }
    },
    initialRouteName: 'Dashboard',
    drawerWidth: 304
  }
)

const styles = StyleSheet.create({
  rotate: {
    transform: [{ rotate: '90deg' }]
  }
})
