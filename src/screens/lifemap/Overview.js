import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { connect } from 'react-redux';
import arrow from '../../../assets/images/selectArrow.png';
import BottomModal from '../../components/BottomModal';
import Button from '../../components/Button';
import FilterListItem from '../../components/FilterListItem';
import LifemapOverview from '../../components/LifemapOverview';
import LifemapVisual from '../../components/LifemapVisual';
import StickyFooter from '../../components/StickyFooter';
import globalStyles from '../../globalStyles';
import { updateDraft } from '../../redux/actions';
import { calculateProgressBar } from '../utils/helpers';
import colors from '../../theme.json';
import IndicatorsSummary from '../../components/IndicatorsSummary';

export class Overview extends Component {
  survey = this.props.route.params.survey;
  draftId = this.props.route.params.draftId || this.props.draftId;
  familyLifemap = this.props.route.params.familyLifemap;
  isResumingDraft = this.props.route.params.resumeDraft;
  readOnly = this.props.route.params.readOnly || false;
  state = {
    filterModalIsOpen: false,
    selectedFilter: false,
    filterLabel: false,
    tipIsVisible: false,
    syncPriorities: [],
  };

  getDraft = () =>
    this.props.drafts.find((draft) => draft.draftId === this.draftId);

  onPressBack = () => {
    const draft = !this.props.readOnly
      ? this.getDraft()
      : this.props.familyLifemap;
    const survey = this.survey;

    //If we do not arrive to this screen from the families screen
    if (!this.familyLifemap) {
      const skippedQuestions = draft.indicatorSurveyDataList.filter(
        (question) => question.value === 0,
      );

      if (this.isResumingDraft || this.props.fromDashboard) {
        this.props.navigation.replace('DrawerStack');
      } else if (skippedQuestions.length > 0) {
        this.props.navigation.navigate('Skipped', {
          draftId: draft.draftId,
          survey,
        });
      } else {
        this.props.navigation.navigate('Question', {
          step: this.survey.surveyStoplightQuestions.length - 1,
          draftId: this.draftId,
          survey,
        });
      }
    }
    // If we arrive to this screen from the families screen
    else {
      if (this.props.fromDashboard) {
        this.props.navigation.replace('DrawerStack');
      } else {
        this.props.navigation.replace('Families', {
          draftId: this.draftId,
          survey,
        });
      }
    }
  };

  navigateToScreen = (screen, indicator, indicatorText) => {
    this.props.navigation.navigate(screen, {
      survey: this.survey,
      indicator,
      indicatorText,
      draftId: this.draftId,
    });
  };

  toggleFilterModal = () => {
    this.setState({
      filterModalIsOpen: !this.state.filterModalIsOpen,
    });
  };

  selectFilter = (filter, filterLabel = false) => {
    this.setState({
      selectedFilter: filter,
      filterModalIsOpen: false,
      filterLabel: filterLabel,
    });
  };

  onContinue = () => {
    this.navigateToScreen('Priorities');
  };

  resumeDraft = () => {
    const draft = !this.props.readOnly
      ? this.getDraft()
      : this.props.familyLifemap;

    this.props.navigation.replace(draft.progress.screen, {
      resumeDraft: false,
      draftId: this.draftId,
      survey: this.survey,
      step: draft.progress.step,
    });
  };

  handleClickOnAddPriority = () => {
    this.props.navigation.navigate('SelectIndicatorPriority', {
      draft: !this.props.readOnly
        ? this.getDraft()
        : this.props.familyLifemap,
      survey: this.survey
    })
  };

  showAddPriority = () => {
    const draftData = !this.props.readOnly
      ? this.getDraft()
      : this.props.familyLifemap;

    return (!draftData.status || draftData.status === 'Pending sync') && this.survey
  }

  componentDidMount() {
    this.props.navigation.addListener(
      'focus',
      () => {
        this.forceUpdate();
      })
    const draft = (!this.props.readOnly)
      ? this.getDraft()
      : this.props.familyLifemap;


    this.props.navigation.setParams({
      onPressBack: this.onPressBack,
      withoutCloseButton: draft.draftId ? false : true,
    });

    if (!this.isResumingDraft && !this.familyLifemap) {
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          screen: 'Overview',
        },
      });
    }
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }

  render() {
    const { t } = this.props;
    const { filterModalIsOpen, selectedFilter, filterLabel } = this.state;
    const draft = (!this.props.readOnly
      || (this.props.familyLifemap.status == 'Pending sync'
        && this.draftId))
      ? this.getDraft()
      : this.props.familyLifemap;

    const snapPriorities = draft.priorities.map(
      (priority) => priority.indicator,
    ).concat(
      draft.indicatorSurveyDataList.filter(
        indicator => this.props.priorities.find(
          item => item.snapshotStoplightId == indicator.snapshotStoplightId)).map(
            priority => priority.key)).filter(
              (value, index, self) => self.indexOf(value) === index)
    const amoutPrioritiesAchievements = snapPriorities.length + draft.achievements.length

    return this.props.readOnly ? (
      <View style={[globalStyles.background, styles.contentContainer]}>
        <View style={styles.indicatorsContainer}>
          <LifemapVisual
            draftData={draft}
            syncPriorities={this.props.priorities}
            large={this.props.readOnly}
            extraLarge={!this.props.readOnly}
            questions={draft.indicatorSurveyDataList}
            priorities={draft.priorities}
            achievements={draft.achievements}
            questionsLength={this.survey ? this.survey.surveyStoplightQuestions.length : 0}
          />
        </View>

        {/*If we are in family/draft then show the questions.Else dont show them . This is requered for the families tab*/}
        <View>
          <View>
            {this.showAddPriority() && (
              <View style={styles.buttonContainer}>
                <Button
                  style={styles.buttonSmall}
                  text={t('views.family.addPriority')}
                  handleClick={this.handleClickOnAddPriority}
                />
              </View>
            )}
            <TouchableHighlight
              id="filters"
              underlayColor={'transparent'}
              activeOpacity={1}
              onPress={this.toggleFilterModal}
              accessible={true}>
              <View
                style={styles.listTitle}
                accessibilityLabel={
                  filterLabel || t('views.lifemap.allIndicators')
                }
                accessibilityHint="Double tap to open dropdown">
                <Text style={globalStyles.subline}>
                  {filterLabel || t('views.lifemap.allIndicators')}
                </Text>
                <Image source={arrow} style={styles.arrow} />
              </View>
            </TouchableHighlight>
            <LifemapOverview
              id="lifeMapOverview"
              syncPriorities={this.props.priorities}
              surveyData={this.survey ? this.survey.surveyStoplightQuestions : []}
              //readOnly
              draftData={draft}
              navigateToScreen={this.navigateToScreen}
              draftOverview={!this.isResumingDraft && !this.familyLifemap}
              selectedFilter={selectedFilter}
            />
          </View>


          {/* Filters modal */}
          <BottomModal
            isOpen={filterModalIsOpen}
            onRequestClose={this.toggleFilterModal}
            onEmptyClose={() => this.selectFilter(false)}>
            <View
              style={styles.dropdown}
              accessible={true}
              accessibilityLiveRegion="assertive">
              <Text style={[globalStyles.p, styles.modalTitle]}>
                {t('general.chooseView')}
              </Text>

              {/* All */}
              <View accessibilityLabel={t('views.lifemap.allIndicators')}>
                <FilterListItem
                  id="all"
                  onPress={() => this.selectFilter(false)}
                  color={'#EAD1AF'}
                  text={t('views.lifemap.allIndicators')}
                  amount={draft.indicatorSurveyDataList.length}
                />
              </View>

              {/* Green */}
              <View accessibilityLabel={t('views.lifemap.allIndicators')}>
                <FilterListItem
                  id="green"
                  onPress={() => this.selectFilter(3, t('views.lifemap.green'))}
                  color={colors.palegreen}
                  text={t('views.lifemap.green')}
                  amount={
                    draft.indicatorSurveyDataList.filter(
                      (item) => item.value === 3,
                    ).length
                  }
                />
              </View>

              {/* Yellow */}
              <View accessibilityLabel={t('views.lifemap.yellow')}>
                <FilterListItem
                  id="yellow"
                  onPress={() =>
                    this.selectFilter(2, t('views.lifemap.yellow'))
                  }
                  color={colors.gold}
                  text={t('views.lifemap.yellow')}
                  amount={
                    draft.indicatorSurveyDataList.filter(
                      (item) => item.value === 2,
                    ).length
                  }
                />
              </View>

              {/* Red */}
              <View accessibilityLabel={t('views.lifemap.red')}>
                <FilterListItem
                  id="red"
                  onPress={() => this.selectFilter(1, t('views.lifemap.red'))}
                  color={colors.red}
                  text={t('views.lifemap.red')}
                  amount={
                    draft.indicatorSurveyDataList.filter(
                      (item) => item.value === 1,
                    ).length
                  }
                />
              </View>

              {/* Priorities/achievements */}
              <View accessibilityLabel={t('views.lifemap.priorities')}>
                <FilterListItem
                  id="priorities"
                  onPress={() =>
                    this.selectFilter(
                      'priorities',
                      `${t('views.lifemap.priorities')} & ${t(
                        'views.lifemap.achievements',
                      )}`,
                    )
                  }
                  color={colors.blue}
                  text={`${t('views.lifemap.priorities')} & ${t(
                    'views.lifemap.achievements',
                  )}`}
                  amount={amoutPrioritiesAchievements}
                />
              </View>

              {/* Skipped */}
              <View accessibilityLabel={t('views.skippedIndicators')}>
                <FilterListItem
                  id="skipped"
                  onPress={() =>
                    this.selectFilter(0, t('views.skippedIndicators'))
                  }
                  color={colors.palegrey}
                  text={t('views.skippedIndicators')}
                  amount={
                    draft.indicatorSurveyDataList.filter(
                      (item) => item.value === 0,
                    ).length
                  }
                />
              </View>
            </View>
          </BottomModal>
        </View>
      </View>
    ) : (
        <StickyFooter
          continueLabel={t('general.continue')}
          onContinue={() => this.onContinue()}
          visible={!this.isResumingDraft && !this.familyLifemap}
          progress={!this.isResumingDraft && !this.familyLifemap ?
            calculateProgressBar({ readOnly: this.readOnly, draft: draft, isLast: true }) : 0
          }>
          {!this.props.readOnly ? (
            <View style={{ alignItems: 'center', }}>
              {draft.stoplightSkipped && <View style={{ paddingTop: 50 }} />}
              <Text style={[globalStyles.h2Bold, styles.heading]}>
                {!draft.stoplightSkipped && !this.isResumingDraft
                  ? t('views.lifemap.continueToSeeYourLifeMapAndCreatePriorities')
                  : t('views.lifemap.continueWithSurvey')}
              </Text>
            </View>
          ) : null}
          <View style={[globalStyles.background, styles.contentContainer]}>
            <View style={styles.indicatorsContainer}>
              {!draft.stoplightSkipped && (
                <LifemapVisual
                  large={this.props.readOnly}
                  extraLarge={!this.props.readOnly}
                  questions={draft.indicatorSurveyDataList}
                  priorities={draft.priorities}
                  achievements={draft.achievements}
                  questionsLength={this.survey.surveyStoplightQuestions.length}
                />
              )}
              {this.isResumingDraft ? (
                <Button
                  id="resume-draft"
                  style={{
                    marginTop: 20,
                  }}
                  colored
                  text={t('general.resumeDraft')}
                  handleClick={this.resumeDraft}
                />
              ) : null}
            </View>
          </View>
        </StickyFooter>
      );
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 20,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  listTitle: {
    backgroundColor: colors.primary,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  indicatorsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  arrow: {
    marginLeft: 7,
    marginTop: 3,
    width: 10,
    height: 5,
  },
  dropdown: {
    paddingVertical: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
  },
  modalTitle: {
    color: colors.grey,
    fontWeight: '300',
    marginBottom: 15,
    marginLeft: 16,
    textAlign:'left'
  },
  buttonSmall: {
    alignSelf: 'center',
    marginVertical: 20,
    maxWidth: 400,
    backgroundColor: '#50AA47',
    paddingLeft: 20,
    paddingRight: 20
  },
  buttonContainer: {
    backgroundColor: colors.primary,
  }

});

Overview.propTypes = {
  drafts: PropTypes.array.isRequired,
  updateDraft: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  familyLifemap: PropTypes.object,
};

const mapDispatchToProps = {
  updateDraft,
};

const mapStateToProps = ({ drafts, priorities }) => ({ drafts, priorities });

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Overview),
);
