import React, { Component } from 'react'
import { StyleSheet, ScrollView, View, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'
import Decoration from '../../components/decoration/Decoration'
import globalStyles from '../../globalStyles'
import RoundImage from '../../components/RoundImage'
import Button from '../../components/Button'
import StickyFooter from '../../components/StickyFooter'
import { addDraftProgress } from '../../redux/actions'

export class BeginLifemap extends Component {
  survey = this.props.navigation.getParam('survey')
  draftId = this.props.navigation.getParam('draftId')
  numberOfQuestions = this.survey.surveyStoplightQuestions.length

  componentDidMount() {
    this.props.addDraftProgress(this.draftId, {
      screen: 'BeginLifemap'
    })

    this.props.navigation.setParams({
      onPressBack: this.onPressBack
    })
  }

  onPressBack = () => {
    const draft = this.getDraft()

    this.props.addDraftProgress(this.draftId, {
      current: draft.progress.current - 1
    })

    this.props.navigation.replace('SocioEconomicQuestion', {
      draftId: this.draftId,
      survey: this.survey,
      fromBeginLifemap: true
    })
  }

  getDraft = () =>
    this.props.drafts.find(draft => draft.draftId === this.draftId)

  handleClick = () => {
    const draft = this.getDraft()

    this.props.addDraftProgress(this.draftId, {
      current: draft.progress.current + 1
    })

    this.props.navigation.navigate('Question', {
      draftId: this.props.navigation.getParam('draftId'),
      survey: this.survey,
      step: 0
    })
  }

  render() {
    const { t } = this.props
    const draft = this.getDraft()
    return (
      <StickyFooter
        handleClick={this.handleClick}
        continueLabel={t('general.continue')}
        progress={draft ? draft.progress.current / draft.progress.total : 0}
      >
        <View
          style={{
            ...globalStyles.container,
            padding: 0
          }}
        >
          <Text style={{ ...globalStyles.h3, ...styles.text }}>
            {t('views.lifemap.thisLifeMapHas').replace(
              '%n',
              this.numberOfQuestions
            )}
          </Text>
          <Decoration variation="terms">
            <RoundImage source="stoplight" />
          </Decoration>
        </View>
        <View style={{ height: 50 }} />
      </StickyFooter>
    )
  }
}
const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 80,
    paddingBottom: 30
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
})

BeginLifemap.propTypes = {
  t: PropTypes.func.isRequired,
  surveys: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  addDraftProgress: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired
}

const mapDispatchToProps = {
  addDraftProgress
}

const mapStateToProps = ({ surveys, drafts }) => ({
  surveys,
  drafts
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BeginLifemap)
)
