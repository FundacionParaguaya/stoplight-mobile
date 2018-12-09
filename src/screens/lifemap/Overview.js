import React, { Component } from 'react'
import {
  StyleSheet,
  ScrollView,
  Image,
  View,
  FlatList,
  Text
} from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'

import Tip from '../../components/Tip'
import SkippedListItem from '../../components/SkippedListItem'

import RoundImage from '../../components/RoundImage'
import LifemapVisual from '../../components/LifemapVisual'
import Button from '../../components/Button'
import LifemapOverview from '../../components/LifemapOverview'
import globalStyles from '../../globalStyles'
import colors from '../../theme.json'

export class Overview extends Component {
  state = {
    continueIsClicked: false
  }

  draftId = this.props.navigation.getParam('draftId')

  survey = this.props.navigation.getParam('survey')
  indicatorsArray = this.survey.surveyStoplightQuestions.map(
    item => item.codeName
  )
  clickContinue = () => {
    this.scroll.scrollTo({ x: 0, y: 0, animated: false })
    this.setState({ continueIsClicked: true })
  }

  navigateToScreen = (screen, indicator) =>
    this.props.navigation.navigate(screen, {
      draftId: this.draftId,
      survey: this.survey,
      indicator
    })

  render() {
    const { t } = this.props
    const draft = this.props.drafts.filter(
      item => item.draftId === this.draftId
    )[0]

    const skippedQuestions = draft.indicatorSurveyDataList.filter(
      question => question.value === 0
    )
    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}
        ref={c => {
          this.scroll = c
        }}
      >
        {skippedQuestions.length > 0 && !this.state.continueIsClicked ? (
          <ScrollView
            style={globalStyles.background}
            contentContainerStyle={styles.contentContainer}
          >
            <Image
              style={styles.image}
              source={require('../../../assets/images/skipped.png')}
            />

            <FlatList
              style={{ ...styles.background, paddingLeft: 25 }}
              data={skippedQuestions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <SkippedListItem
                  item={
                    this.survey.surveyStoplightQuestions.filter(
                      question => question.codeName === item.key
                    )[0].questionText
                  }
                  handleClick={() =>
                    this.props.navigation.push('Question', {
                      draftId: this.draftId,
                      survey: this.survey,
                      step: this.indicatorsArray.indexOf(item.key),
                      skipped: true
                    })
                  }
                />
              )}
            />
            <View style={{ height: 50, marginTop: 20 }}>
              <Button
                colored
                text={t('general.continue')}
                handleClick={() => this.clickContinue()}
              />
            </View>
            <Tip
              title={t('views.lifemap.youSkipped')}
              description={t('views.lifemap.whyNotTryAgain')}
            />
          </ScrollView>
        ) : (
          <ScrollView
            style={globalStyles.background}
            contentContainerStyle={styles.contentContainer}
          >
            <View>
              <View
                style={{
                  ...globalStyles.container,
                  paddingTop: 20
                }}
              >
                <LifemapVisual data={draft.indicatorSurveyDataList} />
              </View>
              <View>
                <Text style={{ ...globalStyles.subline, ...styles.listTitle }}>
                  {t('views.lifemap.allIndicators')}
                </Text>
                <LifemapOverview
                  surveyData={this.survey.surveyStoplightQuestions}
                  draftData={draft.indicatorSurveyDataList}
                  navigateToScreen={this.navigateToScreen}
                />
              </View>
            </View>
            <View style={{ height: 50 }}>
              <Button
                colored
                text={t('general.continue')}
                handleClick={() => this.navigateToScreen('Final')}
              />
            </View>
          </ScrollView>
        )}
      </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
  image: { alignSelf: 'center', marginVertical: 50 },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  text: {
    textAlign: 'center'
  },
  listTitle: {
    backgroundColor: colors.beige,
    height: 45,
    lineHeight: 45,
    flex: 1,
    textAlign: 'center'
  }
})

Overview.propTypes = {
  t: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired
}

const mapStateToProps = ({ drafts }) => ({
  drafts
})

export default withNamespaces()(connect(mapStateToProps)(Overview))
