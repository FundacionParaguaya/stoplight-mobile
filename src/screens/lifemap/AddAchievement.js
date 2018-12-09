import React, { Component } from 'react'
import { ScrollView, StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { withNamespaces } from 'react-i18next'

import { addSurveyPriorityAcheivementData } from '../../redux/actions'

import globalStyles from '../../globalStyles'
import colors from '../../theme.json'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'

export class AddAchievement extends Component {
  state = {
    reason: '',
    roadmap: '',
    indicator: this.props.navigation.getParam('indicator')
  }
  componentDidMount() {
    const draft = this.getDraft()
    const achievement = this.getAchievementValue(draft)
    console.log(achievement)
    this.setState(achievement)
  }

  getDraft = () =>
    this.props.drafts.filter(
      draft => draft.draftId === this.props.navigation.getParam('draftId')
    )[0]

  addAchievement = () =>
    this.props.addSurveyPriorityAcheivementData({
      id: this.props.navigation.getParam('draftId'),
      category: 'achievements',
      payload: this.state
    })

  getAchievementValue = draft => {
    const achievement = draft.achievements.filter(
      achievement =>
        achievement.indicator === this.props.navigation.getParam('indicator')
    )
    return achievement[0] ? achievement[0] : {}
  }

  render() {
    const { t } = this.props
    const draft = this.getDraft()
    const achievement = this.getAchievementValue(draft)

    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}
      >
        <View>
          <View
            style={{
              ...globalStyles.container,
              flexDirection: 'row'
            }}
          >
            <Icon
              name="stars"
              color={colors.blue}
              size={17}
              style={{ marginRight: 10, marginLeft: -10 }}
            />
            <Text style={globalStyles.h3}>
              {t('views.lifemap.achievement')}
            </Text>
          </View>
          <TextInput
            field=""
            onChangeText={text => this.setState({ reason: text })}
            placeholder={
              this.state.reason ? '' : t('views.lifemap.writeYourAnswerHere')
            }
            label={t('views.lifemap.howDidYouGetIt')}
            value={achievement ? achievement.reason : ''}
            multiline
          />
          <TextInput
            label={t('views.lifemap.whatDidItTakeToAchieveThis')}
            onChangeText={text => this.setState({ roadmap: text })}
            placeholder={
              this.state.roadmap ? '' : t('views.lifemap.writeYourAnswerHere')
            }
            value={achievement ? achievement.roadmap : ''}
            multiline
          />
        </View>
        <View style={{ height: 50 }}>
          <Button
            colored
            text={t('general.save')}
            handleClick={() => this.addAchievement()}
          />
        </View>
      </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
})

AddAchievement.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  addSurveyPriorityAcheivementData: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired
}

const mapDispatchToProps = {
  addSurveyPriorityAcheivementData
}

const mapStateToProps = ({ drafts }) => ({
  drafts
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AddAchievement)
)
