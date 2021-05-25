import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableHighlight} from 'react-native';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateDraft} from '../../redux/actions';
import {withNamespaces} from 'react-i18next';
import StickyFooter from '../../components/StickyFooter';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Decoration from '../../components/decoration/Decoration';
import FilterListItem from '../../components/FilterListItem';
import LifemapOverview from '../../components/LifemapOverview';
import BottomModal from '../../components/BottomModal';
import arrow from '../../../assets/images/selectArrow.png';
import globalStyles from '../../globalStyles';
import colors from '../../theme.json';
import {prioritiesScreen} from '../../screens/utils/accessibilityHelpers';
import RoundImage from '../../components/RoundImage';
import IndicatorsSummary from '../../components/IndicatorsSummary';

export class Priorities extends Component {
  draftId = this.props.route.params.draftId;
  survey = this.props.route.params.survey;
  familyLifemap = this.props.route.params.familyLifemap;
  isResumingDraft = this.props.route.params.resumeDraft;

  state = {
    filterModalIsOpen: false,
    selectedFilter: false,
    filterLabel: false,
    tipIsVisible: false,
  };

  getDraft = () =>
    this.props.drafts.find((draft) => draft.draftId === this.draftId);

  onPressBack = () => {
    this.props.navigation.push('Overview', {
      resumeDraft: false,
      draftId: this.draftId,
      survey: this.survey,
    });
  };

  navigateToScreen = (screen, indicator, indicatorText) =>
    this.props.navigation.push(screen, {
      familyLifemap: this.getDraft(),
      survey: this.survey,
      indicator,
      indicatorText,
      draft: this.getDraft(),
    });

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

  getPotentialPrioritiesCount() {
    const draft = this.getDraft();
    return (
      draft &&
      draft.indicatorSurveyDataList &&
      draft.indicatorSurveyDataList.filter(
        (question) => question.value === 1 || question.value === 2,
      ).length
    );
  }

  getMandatoryPrioritiesCount() {
    const potentialPrioritiesCount = this.getPotentialPrioritiesCount() || 0;
    const mimimumPriorities =
      (this.survey && this.survey.minimumPriorities) || 0;

    return potentialPrioritiesCount > mimimumPriorities
      ? mimimumPriorities
      : potentialPrioritiesCount;
  }

  onTipClose = () => {
    this.setState({
      tipIsVisible: false,
    });
  };

  onContinue = (mandatoryPrioritiesCount, draft) => {
    if (mandatoryPrioritiesCount > draft.priorities.length) {
      this.setState({
        tipIsVisible: true,
      });
    } else {
      //If sign support, the go to sign view
      if (this.survey.surveyConfig.pictureSupport) {
        this.props.navigation.navigate('Picture', {
          survey: this.survey,
          draftId: this.draftId,
        });
      } else if (this.survey.surveyConfig.signSupport) {
        this.props.navigation.navigate('Signin', {
          step: 0,
          survey: this.survey,
          draftId: this.draftId,
        });
      } else {
        //TODO update according to suvey config
        this.navigateToScreen('Final');
      }
    }
  };

  getTipDescription = (mandatoryPrioritiesCount, tipValue) => {
    const {t} = this.props;
    const draft = this.getDraft();
    //no mandatory priotities
    if (tipValue) {
      return `${t('general.create')} ${
        mandatoryPrioritiesCount - draft.priorities.length
      } ${t('views.lifemap.priorities').toLowerCase()}!`;
    }
    if (
      !mandatoryPrioritiesCount ||
      mandatoryPrioritiesCount - draft.priorities.length <= 0
    ) {
      return t('views.lifemap.noPriorities');
      //only one mandatory priority
    } else if (mandatoryPrioritiesCount - draft.priorities.length === 1) {
      return t('views.lifemap.youNeedToAddPriotity');
    }
    //more than one mandatory priority
    else {
      return `${t('views.lifemap.youNeedToAddPriorities').replace(
        '%n',
        mandatoryPrioritiesCount - draft.priorities.length,
      )}!`;
    }
  };

  componentDidMount() {
    let draft = this.getDraft();
    // show priorities message if no priorities are made or they are not enough
    if (
      !draft.priorities.length ||
      this.getMandatoryPrioritiesCount(draft) > draft.priorities.length
    ) {
      if (this.getMandatoryPrioritiesCount(draft) != 0) {
        this.setState({
          tipIsVisible: true,
        });
      }
    }

    const family = this.props.families.find(
      (family) => family.familyId == draft.familyData.familyId,
    );
    if (!!family) {
      draft = {
        ...draft,
        previousIndicatorSurveyDataList:
          family.snapshotList[0].indicatorSurveyDataList,
        previousIndicatorPriorities: family.snapshotList[0].priorities,
        previousIndicatorAchievements: family.snapshotList[0].achievements,
      };
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          screen: 'Overview',
        },
      });
    }

    if (!this.isDraftResuming && !this.familyLifemap) {
      this.props.updateDraft({
        draft: {
          ...draft,
          progress: {
            ...draft.progress,
            screen: 'Overview',
          },
        },
      });

      this.props.navigation.setParams({
        onPressBack: this.onPressBack,
        withoutCloseButton: draft.draftId ? false : true,
      });
    }
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }

  render() {
    const {t} = this.props;
    const {filterModalIsOpen, selectedFilter, filterLabel} = this.state;
    let draft = this.getDraft();
    const mandatoryPrioritiesCount = this.getMandatoryPrioritiesCount(draft);
    const screenAccessibilityContent =
      prioritiesScreen(
        this.state.tipIsVisible,
        this.getTipDescription(mandatoryPrioritiesCount, true),
      ) || '';

    const family = this.props.families.find(
      (family) => family.familyId == draft.familyData.familyId,
    );
    if (!!family) {
      draft = {
        ...draft,
        previousIndicatorSurveyDataList:
          family.snapshotList[0].indicatorSurveyDataList,
        previousIndicatorPriorities: family.snapshotList[0].priorities,
        previousIndicatorAchievements: family.snapshotList[0].achievements,
      };
    }

    return (
      <StickyFooter
        continueLabel={t('general.continue')}
        onContinue={() => this.onContinue(mandatoryPrioritiesCount, draft)}
        style={{marginBottom: -20}}
        type={this.state.tipIsVisible ? 'tip' : 'button'}
        tipTitle={t('views.lifemap.toComplete')}
        onTipClose={this.onTipClose}
        tipDescription={this.getTipDescription(mandatoryPrioritiesCount, true)}>
        <View
          accessible={true}
          accessibilityLabel={`${screenAccessibilityContent}`}
          accessibilityLiveRegion="assertive">
          <View style={[globalStyles.background, styles.contentContainer]}>
            {/* <Text style={[globalStyles.h2Bold, styles.heading]}>
              {t('views.lifemap.nowLetsMakeSomePriorities')}
            </Text> */}

            <Decoration variation="priorities">
              <RoundImage source="stoplight" />
            </Decoration>
            <IndicatorsSummary
              containerStyle={{marginTop: 60, marginBottom: 10}}
              indicators={draft.indicatorSurveyDataList}
            />
            <View style={styles.subheading}>
              <Text style={[globalStyles.h3,{textAlign:'left'}]}>
                {t('views.lifemap.toCompleteLifemap')}
              </Text>
              <Text style={[globalStyles.h3,{textAlign:'left'}]}>
                {this.getTipDescription(mandatoryPrioritiesCount)}
              </Text>

              {/* Choose 5 indicators below and explain why they are important and
              what you will do to achive them! */}
            </View>
            <View>
              <TouchableHighlight
                id="filters"
                underlayColor={'transparent'}
                activeOpacity={1}
                onPress={this.toggleFilterModal}>
                <View style={styles.listTitle}>
                  <Text style={globalStyles.subline2}>
                    {filterLabel || t('views.lifemap.allIndicators')}
                  </Text>
                  <Image source={arrow} style={styles.arrow} />
                </View>
              </TouchableHighlight>
              {/* If we are in the draft then make the qustions clickable ,else dont make them clickable */}
              <LifemapOverview
                id="lifeMapOverview"
                surveyData={this.survey.surveyStoplightQuestions}
                draftData={draft}
                navigateToScreen={this.navigateToScreen}
                draftOverview={draft.status === 'Draft' ? true : false}
                selectedFilter={selectedFilter}
                isRetake={!!family}
              />
            </View>

            {/* Filters modal */}
            <BottomModal
              isOpen={filterModalIsOpen}
              onRequestClose={this.toggleFilterModal}
              onEmptyClose={() => this.selectFilter(false)}>
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
                  amount={draft.indicatorSurveyDataList.length}
                />

                {/* Green */}
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

                {/* Yellow */}
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

                {/* Red */}
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

                {/* Priorities/achievements */}
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
                  amount={draft.priorities.length + draft.achievements.length}
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
                    draft.indicatorSurveyDataList.filter(
                      (item) => item.value === 0,
                    ).length
                  }
                />
              </View>
            </BottomModal>
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
  infoPriorities: {
    fontSize: 19,
    textAlign: 'left',
  },
  arrow: {
    marginLeft: 7,
    marginTop: 3,
    width: 10,
    height: 5,
  },
  blueIcon: {
    borderRadius: 100,
    borderColor: colors.white,
    borderWidth: 1,
    zIndex: 10,
    backgroundColor: colors.blue,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '25deg'}],
  },
  dropdown: {
    paddingVertical: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading2: {
    color: colors.dark,
    textAlign: 'left',
  },
  heading: {
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  subheading: {
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    marginVertical: 10,
  },
  modalTitle: {
    color: colors.grey,
    fontWeight: '300',
    marginBottom: 15,
    marginLeft: 16,
    textAlign:'left'
  },
});

Priorities.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
  updateDraft: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  updateDraft,
};

const mapStateToProps = ({drafts, families}) => ({drafts, families});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Priorities),
);
