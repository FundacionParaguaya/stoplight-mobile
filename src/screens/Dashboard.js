import React, { Component } from 'react'
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  FlatList,
  AsyncStorage
} from 'react-native'
import { withNamespaces } from 'react-i18next'
import PropTypes from 'prop-types'
import Button from '../components/Button'
import RoundImage from '../components/RoundImage'
import DraftListItem from '../components/DraftListItem'
import Loading from '../components/Loading'
import globalStyles from '../globalStyles'
import { connect } from 'react-redux'
import { loadFamilies, loadSnapshots, loadSurveys } from '../redux/actions'
import { url } from '../config'
import colors from '../theme.json'

export class Dashboard extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', 'Dashboard'),
      drawerLabel: navigation.getParam('title', 'Dashboard')
    }
  }

  state = {
    loadingTime: 'ok'
  }
  slowLoadingTimer
  clearTimers = () => {
    clearTimeout(this.slowLoadingTimer)
  }
  updateTitle = () =>
    this.props.navigation.setParams({
      title: this.props.t('views.dashboard')
    })
  componentDidMount() {
    AsyncStorage.getItem('userVisitedDashboard').then(
      value => (value === 'false' ? this.loadData() : null)
    )
    AsyncStorage.setItem('userVisitedDashboard', 'true')
    this.detectSlowLoading()
    this.updateTitle()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lng !== this.props.lng) {
      this.updateTitle()
    }
  }

  componentWillUnmount() {
    this.clearTimers()
  }

  loadData = () => {
    this.props.loadSnapshots(url[this.props.env], this.props.user.token)
    this.props.loadSurveys(url[this.props.env], this.props.user.token)
    this.props.loadFamilies(url[this.props.env], this.props.user.token)
  }

  detectSlowLoading = () => {
    this.slowLoadingTimer = setTimeout(
      () => this.setState({ loadingTime: 'slow' }),
      15000
    )
  }

  render() {
    const { t, navigation, drafts } = this.props
    return (
      <ScrollView style={globalStyles.background}>
        {this.props.offline.outbox.length &&
        navigation.getParam('firstTimeVisitor') ? (
          <Loading time={this.state.loadingTime} />
        ) : (
          <View>
            <View style={globalStyles.container}>
              <View>
                <Text
                  style={{
                    ...globalStyles.h3,
                    marginBottom: 33,
                    alignSelf: 'center'
                  }}
                >
                  {t('general.welcome')}!
                </Text>
              </View>
              <RoundImage source="family" />
              <Button
                text={t('views.createLifemap')}
                colored
                handleClick={() => navigation.navigate('Surveys')}
              />
            </View>
            <View style={styles.borderBottom}>
              <Text style={{ ...globalStyles.subline, ...styles.listTitle }}>
                {t('views.latestDrafts')}
              </Text>
            </View>
            <FlatList
              style={{ ...styles.background, paddingLeft: 25 }}
              data={drafts}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <DraftListItem
                  item={item}
                  handleClick={() =>
                    navigation.navigate('FamilyParticipant', {
                      draft: item.draftId
                    })
                  }
                />
              )}
            />
            {!drafts.length && (
              <Text
                id="no-drafts-message"
                style={{
                  ...globalStyles.subline,
                  textAlign: 'center',
                  marginTop: 10
                }}
              >
                {t('views.noDrafts')}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
  listTitle: {
    backgroundColor: colors.beige,
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
  loadFamilies: PropTypes.func.isRequired,
  loadSurveys: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  loadSnapshots: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  user: PropTypes.object.isRequired,
  offline: PropTypes.object,
  lng: PropTypes.string
}

const mapStateToProps = ({ env, user, drafts, offline, string }) => ({
  env,
  user,
  drafts,
  offline,
  string
})

const mapDispatchToProps = {
  loadFamilies,
  loadSnapshots,
  loadSurveys
}

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Dashboard)
)
