import React, { Component } from 'react'
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  FlatList,
  UIManager,
  findNodeHandle
} from 'react-native'
import { Sentry } from 'react-native-sentry'
import { AndroidBackHandler } from 'react-navigation-backhandler'
import { withNamespaces } from 'react-i18next'
import PropTypes from 'prop-types'
import Button from '../components/Button'
import Decoration from '../components/decoration/Decoration'
import RoundImage from '../components/RoundImage'
import DraftListItem from '../components/DraftListItem'
import globalStyles from '../globalStyles'
import { connect } from 'react-redux'
import colors from '../theme.json'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export class Dashboard extends Component {
  acessibleComponent = React.createRef()
  state = {
    green: 0,
    yellow: 0,
    red: 0
  }

  navigateToPendingSync = draft => {
    const { firstName, lastName } = draft.familyData.familyMembersList[0]

    this.props.navigation.navigate('Family', {
      familyName: `${firstName} ${lastName}`,
      familyLifemap: draft,
      isDraft: true,
      survey: this.props.surveys.find(survey => survey.id === draft.surveyId),
      activeTab: 'LifeMap'
    })
  }

  navigateToDraft = draft => {
    const survey = this.props.surveys.find(
      survey => survey.id === draft.surveyId
    )

    if (
      draft.progress.screen === 'Question' ||
      draft.progress.screen === 'Skipped' ||
      draft.progress.screen === 'Final' ||
      draft.progress.screen === 'Overview'
    ) {
      this.props.navigation.navigate('Overview', {
        resumeDraft: true,
        draft,
        survey
      })
    } else
      this.props.navigation.navigate(draft.progress.screen, {
        draft,
        survey,
        step: draft.progress.step,
        socioEconomics: draft.progress.socioEconomics
      })
  }
  navigateToSynced = item => {
    this.props.navigation.navigate('Family', {
      familyName: item.familyData.familyMembersList[0].firstName,
      familyLifemap: item,
      draftId: item.draftId,
      isDraft: !item,
      survey: this.props.surveys.find(survey =>
        item ? survey.id === item.surveyId : null
      )
    })
  }
  handleClickOnListItem = item => {
    switch (item.status) {
      case 'Pending sync':
        this.navigateToPendingSync(item)
        break
      case 'Synced':
        this.navigateToSynced(item)
        break
      default:
        this.navigateToDraft(item)
    }
  }

  navigateToCreateLifemap = () => {
    this.props.navigation.navigate('Surveys')
  }

  componentDidMount() {
    const { surveys, families, images } = this.props.sync
    if (!this.props.user.token) {
      this.props.navigation.navigate('Login')
    } else if (!surveys || !families || images.total !== images.synced) {
      this.props.navigation.navigate('Loading')
    } else {
      if (UIManager.AccessibilityEventTypes) {
        setTimeout(() => {
          UIManager.sendAccessibilityEvent(
            findNodeHandle(this.acessibleComponent.current),
            UIManager.AccessibilityEventTypes.typeViewFocused
          )
        }, 1)
      }

      // set sentry login details
      Sentry.setUserContext({
        username: this.props.user.username,
        extra: {
          env: this.props.env
        }
      })
    }
  }

  render() {
    const { t, drafts } = this.props

    return (
      <AndroidBackHandler onBackPress={() => true}>
        <View style={globalStyles.ViewMainContainer}>
          <ScrollView
            contentContainerStyle={
              drafts.length
                ? globalStyles.ScrollMainContainerNotCentered
                : globalStyles.ScrollMainContainerCentered
            }
          >
            <View ref={this.acessibleComponent} accessible={true}>
              <View>
                <View
                  style={
                    drafts.length
                      ? globalStyles.container
                      : globalStyles.containerNoPadding
                  }
                >
                  <View
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Decoration>
                      <RoundImage source="family" />
                    </Decoration>
                    <View style={styles.familiesIcon}>
                      <Icon
                        name="face"
                        style={styles.familiesIconIcon}
                        size={60}
                      />
                    </View>

                    <Text style={{ ...styles.familiesCount }}>
                      {this.props.families.length} {t('views.families')}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '100%',
                      paddingHorizontal: 10,
                      flexDirection: 'row',
                      justifyContent: 'space-around'
                    }}
                  >
                    <View style={styles.circleAndTextContainer}>
                      <View style={styles.circleContainer}>
                        <View style={styles.circleGreen} />
                      </View>
                      {/* <Text style={styles.numberIndicator}>{green}</Text> */}
                      <Text style={styles.colorIndicator}>Green</Text>
                    </View>

                    <View style={styles.circleAndTextContainer}>
                      <View style={styles.circleContainer}>
                        <View style={styles.circleYellow} />
                      </View>
                      {/* <Text style={styles.numberIndicator}>{yellow}</Text> */}
                      <Text style={styles.colorIndicator}>Yellow</Text>
                    </View>

                    <View style={styles.circleAndTextContainer}>
                      <View style={styles.circleContainer}>
                        <View style={styles.circleRed} />
                      </View>
                      {/* <Text style={styles.numberIndicator}>{red}</Text> */}
                      <Text style={styles.colorIndicator}>Red</Text>
                    </View>
                  </View>

                  <Button
                    style={{
                      marginTop: 20,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      width: '100%',
                      maxWidth: 400
                    }}
                    id="create-lifemap"
                    text={t('views.createLifemap')}
                    colored
                    handleClick={this.navigateToCreateLifemap}
                  />
                </View>
                {drafts.length ? (
                  <View style={styles.borderBottom}>
                    <Text
                      style={{ ...globalStyles.subline, ...styles.listTitle }}
                    >
                      {t('views.latestDrafts')}
                    </Text>
                  </View>
                ) : null}
                <FlatList
                  style={{ ...styles.background }}
                  data={drafts.slice().reverse()}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <DraftListItem
                      item={item}
                      handleClick={this.handleClickOnListItem}
                      lng={this.props.lng}
                    />
                  )}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </AndroidBackHandler>
    )
  }
}
const styles = StyleSheet.create({
  colorIndicator: {
    fontFamily: 'Poppins SemiBold',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 10
  },
  circleAndTextContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleGreen: {
    backgroundColor: colors.palegreen,
    width: 50,
    height: 50,
    borderRadius: 50
  },
  circleYellow: {
    backgroundColor: colors.palegold,
    width: 35,
    height: 35,
    borderRadius: 50
  },
  circleRed: {
    backgroundColor: colors.palered,
    width: 20,
    height: 20,
    borderRadius: 50
  },
  familiesIconIcon: {
    margin: 'auto'
  },
  familiesIcon: {
    top: 120,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'white',
    width: 80,
    height: 80,
    borderRadius: 50
  },
  familiesCount: {
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'Poppins SemiBold',
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  listTitle: {
    backgroundColor: colors.primary,
    height: 41,
    lineHeight: 41,
    flex: 1,
    textAlign: 'center'
  },
  borderBottom: {
    marginTop: 20,
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1
  }
})

Dashboard.propTypes = {
  navigation: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  user: PropTypes.object.isRequired,
  nav: PropTypes.object,
  offline: PropTypes.object,
  lng: PropTypes.string.isRequired,
  surveys: PropTypes.array,
  sync: PropTypes.object,
  families: PropTypes.array
}

export const mapStateToProps = ({
  env,
  user,
  drafts,
  offline,
  string,
  surveys,
  families,
  nav,
  sync
}) => ({
  env,
  user,
  drafts,
  offline,
  string,
  surveys,
  families,
  nav,
  sync
})

const mapDispatchToProps = {}

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Dashboard)
)
