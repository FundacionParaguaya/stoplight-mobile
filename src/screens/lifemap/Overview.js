import React, { Component } from 'react'
import { StyleSheet, View, Text, Image, TouchableHighlight } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'
import { addDraftProgress } from '../../redux/actions'
import StickyFooter from '../../components/StickyFooter'
import LifemapVisual from '../../components/LifemapVisual'
import Button from '../../components/Button'
import FilterListItem from '../../components/FilterListItem'
import LifemapOverview from '../../components/LifemapOverview'
import BottomModal from '../../components/BottomModal'
import arrow from '../../../assets/images/selectArrow.png'
import globalStyles from '../../globalStyles'
import colors from '../../theme.json'

export class Overview extends Component {
  state = {
    filterModalIsOpen: false,
    selectedFilter: false,
    filterLabel: false,
    tipIsVisible: true
  }
  draftId = this.props.navigation.getParam('draftId')
  familyLifemap = this.props.familyLifemap
  survey = this.props.navigation.getParam('survey')
  resumeDraft = this.props.navigation.getParam('resumeDraft')
  componentDidMount() {
    const data = this.familyLifemap
      ? this.familyLifemap
      : this.props.drafts.find(item => item.draftId === this.draftId)
    const mandatoryPrioritiesCount = this.getMandatoryPrioritiesCount(data)
    if (
      !mandatoryPrioritiesCount ||
      mandatoryPrioritiesCount - data.priorities.length <= 0
    ) {
      this.setState({ tipIsVisible: false })
    }
    if (!this.resumeDraft && !this.familyLifemap) {
      this.props.addDraftProgress(this.draftId, {
        screen: 'Overview'
      })

      this.props.navigation.setParams({
        onPressBack: this.onPressBack,
        withoutCloseButton: this.draftId ? false : true
      })
    }
  }

  onPressBack = () => {
    //If we do not arrive to this screen from the families screen
    if (!this.familyLifemap) {
      const draft = this.getDraft()
      const skippedQuestions = draft.indicatorSurveyDataList.filter(
        question => question.value === 0
      )
      this.props.addDraftProgress(this.draftId, {
        current: draft.progress.current - 1
      })
      // If there are no skipped questions
      if (skippedQuestions.length > 0) {
        this.props.navigation.navigate('Skipped', {
          draftId: this.draftId,
          survey: this.survey
        })
      } else
        this.props.navigation.navigate('Question', {
          draftId: this.draftId,
          survey: this.survey,
          step: this.survey.surveyStoplightQuestions.length - 1
        })
    }
    // If we arrive to this screen from the families screen
    else this.props.navigation.navigate('Families')
  }

  navigateToScreen = (screen, indicator, indicatorText) =>
    this.props.navigation.navigate(screen, {
      draftId: this.draftId,
      familyLifemap: this.familyLifemap,
      survey: this.survey,
      indicator,
      indicatorText
    })

  shouldComponentUpdate() {
    return this.props.navigation.isFocused()
  }

  toggleFilterModal = () => {
    this.setState({
      filterModalIsOpen: !this.state.filterModalIsOpen
    })
  }

  selectFilter = (filter, filterLabel = false) => {
    this.setState({
      selectedFilter: filter,
      filterModalIsOpen: false,
      filterLabel: filterLabel
    })
  }

  getPotentialPrioritiesCount(draft) {
    return draft.indicatorSurveyDataList.filter(
      question => question.value === 1 || question.value === 2
    ).length
  }

  getMandatoryPrioritiesCount(draft) {
    const potentialPrioritiesCount = this.getPotentialPrioritiesCount(draft)

    return potentialPrioritiesCount > this.survey.minimumPriorities
      ? this.survey.minimumPriorities
      : potentialPrioritiesCount
  }

  onTipClose = () => {
    this.setState({
      tipIsVisible: false
    })
  }

  handleContinue = (mandatoryPrioritiesCount, draft) => {
    if (mandatoryPrioritiesCount > draft.priorities.length) {
      this.setState({
        tipIsVisible: true
      })
    } else {
      this.navigateToScreen('Final')
    }
  }

  getDraft = () => this.props.drafts.find(item => item.draftId === this.draftId)

  render() {
    const { t } = this.props
    const { filterModalIsOpen, selectedFilter, filterLabel } = this.state
    const data = this.familyLifemap
      ? this.familyLifemap
      : this.props.drafts.find(item => item.draftId === this.draftId)

    const mandatoryPrioritiesCount = this.getMandatoryPrioritiesCount(data)

    const tipIsVisible = !this.resumeDraft && this.state.tipIsVisible
    const getTipDescription = () => {
      //no mandatory priotities
      if (
        !mandatoryPrioritiesCount ||
        mandatoryPrioritiesCount - data.priorities.length <= 0
      ) {
        return `${t('general.create')} ${t(
          'views.lifemap.priorities'
        ).toLowerCase()}!`
        //only one mandatory priority
      } else if (mandatoryPrioritiesCount - data.priorities.length === 1) {
        return t('views.lifemap.youNeedToAddPriotity')
      }
      //more than one mandatory priority
      else {
        return `${t('general.create')} ${mandatoryPrioritiesCount -
          data.priorities.length} ${t(
          'views.lifemap.priorities'
        ).toLowerCase()}!`
      }
    }

    return (
      <StickyFooter
        continueLabel={t('general.continue')}
        handleClick={() => this.handleContinue(mandatoryPrioritiesCount, data)}
        visible={!this.resumeDraft && !this.familyLifemap}
        type={tipIsVisible ? 'tip' : 'button'}
        tipTitle={t('views.lifemap.toComplete')}
        onTipClose={this.onTipClose}
        tipDescription={getTipDescription()}
      >
        <View style={[globalStyles.background, styles.contentContainer]}>
          <View style={styles.indicatorsContainer}>
            <LifemapVisual
              large
              questions={data.indicatorSurveyDataList}
              priorities={data.priorities}
              achievements={data.achievements}
              questionsLength={this.survey.surveyStoplightQuestions.length}
            />
            {this.resumeDraft ? (
              <Button
                id="resume-draft"
                style={{
                  marginTop: 20
                }}
                colored
                text={t('general.resumeDraft')}
                handleClick={() => {
                  this.props.navigation.replace(data.progress.screen, {
                    draftId: this.draftId,
                    survey: this.survey,
                    step: data.progress.step,
                    socioEconomics: data.progress.socioEconomics
                  })
                }}
              />
            ) : null}
          </View>
          <View>
            <TouchableHighlight
              id="filters"
              underlayColor={'transparent'}
              activeOpacity={1}
              onPress={this.toggleFilterModal}
            >
              <View style={styles.listTitle}>
                <Text style={globalStyles.subline}>
                  {filterLabel || t('views.lifemap.allIndicators')}
                </Text>
                <Image source={arrow} style={styles.arrow} />
              </View>
            </TouchableHighlight>
            <LifemapOverview
              surveyData={this.survey.surveyStoplightQuestions}
              draftData={data}
              navigateToScreen={this.navigateToScreen}
              draftOverview={!!this.draftId}
              selectedFilter={selectedFilter}
            />
          </View>

          {/* Filters modal */}
          <BottomModal
            isOpen={filterModalIsOpen}
            onRequestClose={this.toggleFilterModal}
            onEmptyClose={() => this.selectFilter(false)}
          >
            <View style={styles.dropdown}>
              <Text style={[globalStyles.p, styles.modalTitle]}>
                {t('general.chooseView')}
              </Text>

              {/* All */}
              <FilterListItem
                id="all"
                onPress={() => this.selectFilter(false)}
                color={'#EAD1AF'}
                text={t('views.lifemap.allIndicators')}
                amount={data.indicatorSurveyDataList.length}
              />

              {/* Green */}
              <FilterListItem
                id="green"
                onPress={() => this.selectFilter(3, t('views.lifemap.green'))}
                color={colors.green}
                text={t('views.lifemap.green')}
                amount={
                  data.indicatorSurveyDataList.filter(item => item.value === 3)
                    .length
                }
              />

              {/* Yellow */}
              <FilterListItem
                id="yellow"
                onPress={() => this.selectFilter(2, t('views.lifemap.yellow'))}
                color={colors.gold}
                text={t('views.lifemap.yellow')}
                amount={
                  data.indicatorSurveyDataList.filter(item => item.value === 2)
                    .length
                }
              />

              {/* Red */}
              <FilterListItem
                id="red"
                onPress={() => this.selectFilter(1, t('views.lifemap.red'))}
                color={colors.red}
                text={t('views.lifemap.red')}
                amount={
                  data.indicatorSurveyDataList.filter(item => item.value === 1)
                    .length
                }
              />

              {/* Priorities/achievements */}
              <FilterListItem
                id="priorities"
                onPress={() =>
                  this.selectFilter(
                    'priorities',
                    `${t('views.lifemap.priorities')} & ${t(
                      'views.lifemap.achievements'
                    )}`
                  )
                }
                color={colors.blue}
                text={`${t('views.lifemap.priorities')} & ${t(
                  'views.lifemap.achievements'
                )}`}
                amount={data.priorities.length + data.achievements.length}
              />

              {/* Skipped */}
              <FilterListItem
                id="skipped"
                onPress={() =>
                  this.selectFilter(0, t('views.skippedIndicators'))
                }
                color={colors.palegrey}
                text={t('views.skippedIndicators')}
                amount={
                  data.indicatorSurveyDataList.filter(item => item.value === 0)
                    .length
                }
              />
            </View>
          </BottomModal>
        </View>
      </StickyFooter>
    )
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 20,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  listTitle: {
    backgroundColor: colors.primary,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  indicatorsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25
  },
  arrow: {
    marginLeft: 7,
    marginTop: 3,
    width: 10,
    height: 5
  },
  dropdown: {
    paddingVertical: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white
  },
  modalTitle: {
    color: colors.grey,
    fontWeight: '300',
    marginBottom: 15,
    marginLeft: 16
  }
})

const mapDispatchToProps = {
  addDraftProgress
}

Overview.propTypes = {
  t: PropTypes.func.isRequired,
  drafts: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  familyLifemap: PropTypes.object,
  addDraftProgress: PropTypes.func.isRequired
}

const mapStateToProps = ({ drafts }) => ({
  drafts
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Overview)
)
