import React from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Platform
} from 'react-native'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/MaterialIcons'

import colors from '../../theme.json'
import Popup from '../Popup'
import Button from '../Button'
import globalStyles from '../../globalStyles'
import i18n from '../../i18n'

// Each of the major views has a stack that needs the same nav options.
// These options handle the header styles and menu icon.
export const generateNavOptions = ({ navigation, burgerMenu = true }) => ({
  headerTitleStyle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
    marginLeft: 35
  },
  headerStyle: {
    height: 66,
    backgroundColor: colors.beige
  },
  headerLeftContainerStyle: {
    marginLeft: 19
  },
  headerRightContainerStyle: {
    marginRight: -16
  },
  headerRight: !burgerMenu ? (
    <View>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => {
          navigation.setParams({ modalOpen: true })

          // delete draft if first time visiting FamilyParticipant for
          // this life map
          if (
            navigation.state.routeName === 'FamilyParticipant' &&
            !navigation.getParam('draft')
          ) {
            navigation.setParams({ deleteDraft: true })
          }
        }}
      >
        <Icon name="close" size={25} color={colors.lightdark} />
      </TouchableOpacity>
      <Popup
        isOpen={navigation.getParam('modalOpen')}
        onClose={() => navigation.setParams({ modalOpen: false })}
      >
        {navigation.state.routeName === 'Terms' ||
        navigation.state.routeName === 'Privacy' ||
        (navigation.state.routeName === 'FamilyParticipant' &&
          !navigation.getParam('draft')) ? (
          <View>
            <Text style={[globalStyles.centerText, globalStyles.h3]}>
              {navigation.state.routeName === 'FamilyParticipant'
                ? i18n.t('views.modals.lifeMapWillNotBeSaved')
                : i18n.t('views.modals.weCannotContinueToCreateTheLifeMap')}
            </Text>
            <Text style={[globalStyles.centerText, styles.subline]}>
              {i18n.t('views.modals.areYouSureYouWantToExit')}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={[globalStyles.centerText, globalStyles.h3]}>
              {i18n.t('views.modals.yourLifemapIsNotComplete')}
            </Text>
            <Text style={[globalStyles.centerText, styles.subline]}>
              {i18n.t('views.modals.thisWillBeSavedAsADraft')}
            </Text>
          </View>
        )}

        <View style={styles.buttonBar}>
          <Button
            outlined
            text={i18n.t('general.yes')}
            style={{ width: 107 }}
            handleClick={() => {
              if (
                navigation.state.routeName === 'FamilyParticipant' &&
                !navigation.getParam('draft')
              ) {
                navigation.setParams({ deleteDraft: true })
              } else {
                navigation.reset([
                  NavigationActions.navigate({ routeName: 'Dashboard' })
                ])
              }
            }}
          />
          <Button
            outlined
            text={i18n.t('general.no')}
            style={{ width: 107 }}
            handleClick={() => navigation.setParams({ modalOpen: false })}
          />
        </View>
      </Popup>
    </View>
  ) : (
    ''
  ),
  headerLeft: burgerMenu ? (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => navigation.toggleDrawer()}
    >
      <Icon name="menu" size={30} color={colors.lightdark} />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => navigation.goBack()}
    >
      <Icon name="arrow-back" size={25} color={colors.lightdark} />
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  touchable: {
    justifyContent: 'center',
    width: 60,
    height: 60
  },
  subline: {
    marginTop: 15,
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '500'
      },
      android: {
        fontFamily: 'Poppins Medium'
      }
    }),
    fontSize: 16,
    lineHeight: 20,
    color: colors.grey
  },
  buttonBar: {
    flexDirection: 'row',
    marginTop: 33,
    justifyContent: 'space-between'
  }
})
