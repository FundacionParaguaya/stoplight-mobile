import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';

import Button from '../../components/Button';
import Decoration from '../../components/decoration/Decoration';
import RoundImage from '../../components/RoundImage';
import StickyFooter from '../../components/StickyFooter';
import globalStyles from '../../globalStyles';
import {updateDraft} from '../../redux/actions';
import {getTotalEconomicScreens} from './helpers';

export class BeginLifemap extends Component {
  survey = this.props.navigation.getParam('survey');
  draftId = this.props.navigation.getParam('draftId');

  // the draft is not mutated in this screen (only its progress),
  // we need it for progress bar
  draft = this.props.drafts.find(draft => draft.draftId === this.draftId);

  onPressBack = () => {
    const previousPage =
      this.survey.surveyEconomicQuestions &&
      this.survey.surveyEconomicQuestions.length
        ? 'SocioEconomicQuestion'
        : 'Location';

    this.props.navigation.replace(previousPage, {
      fromBeginLifemap: true,
      survey: this.survey,
      draftId: this.draftId,
    });
  };

  onContinue = () => {
    this.props.updateDraft({
      ...this.draft,
      stoplightSkipped: false,
    });
    this.draft.stoplightSkipped = false;
    this.props.navigation.navigate('Question', {
      step: 0,
      survey: this.survey,
      draftId: this.draftId,
    });
  };

  onSaveSnapshot = () => {
    console.log('Skipped Stoplight Section');
    console.log('Draft');
    console.log(this.draft);
    this.props.updateDraft({
      ...this.draft,
      stoplightSkipped: true,
    });
    this.draft.stoplightSkipped = true;

    if (this.survey.surveyConfig.pictureSupport) {
      this.props.navigation.replace('Picture', {
        survey: this.survey,
        draftId: this.draftId,
      });
    } else if (this.survey.surveyConfig.signSupport) {
      this.props.navigation.replace('Signin', {
        step: 0,
        survey: this.survey,
        draftId: this.draftId,
      });
    } else {
      this.props.navigation.navigate('Final', {
        fromBeginLifemap: true,
        survey: this.survey,
        draftId: this.draftId,
        draft: this.draft,
      });
    }
  };

  componentDidMount() {
    if (this.draft.progress.screen !== 'BeginLifemap') {
      this.props.updateDraft({
        ...this.draft,
        progress: {
          ...this.draft.progress,
          screen: 'BeginLifemap',
        },
      });
    }

    this.props.navigation.setParams({
      onPressBack: this.onPressBack,
    });
  }

  render() {
    const {t} = this.props;

    return (
      <StickyFooter
        onContinue={this.onContinue}
        continueLabel={
          this.survey.surveyConfig.stoplightOptional
            ? t('general.completeStoplight')
            : t('general.continue')
        }
        progress={
          ((this.draft.familyData.countFamilyMembers > 1 ? 4 : 3) +
            getTotalEconomicScreens(this.survey)) /
          this.draft.progress.total
        }>
        <View
          style={{
            ...globalStyles.containerNoPadding,
            padding: 0,
            paddingTop: 0,
          }}>
          <Text id="label" style={{...globalStyles.h3, ...styles.text}}>
            {!this.survey.surveyConfig.stoplightOptional
              ? t('views.lifemap.thisLifeMapHas').replace(
                  '%n',
                  this.survey.surveyStoplightQuestions.length,
                )
              : t('views.lifemap.thisLifeMapHasNoStoplight').replace(
                  '%n',
                  this.survey.surveyStoplightQuestions.length,
                )}
          </Text>

          <Decoration variation="terms">
            <RoundImage source="stoplight" />
          </Decoration>
        </View>
        <View style={{height: 50}} />
        {this.survey.surveyConfig.stoplightOptional && (
          <Button
            id="skipStoplight"
            style={{...styles.button, ...styles.skipButton}}
            handleClick={this.onSaveSnapshot}
            outlined
            text={t('general.closeAndSign')}
          />
        )}
      </StickyFooter>
    );
  }
}
const styles = StyleSheet.create({
  button: {width: '70%', alignSelf: 'center', marginTop: 20},
  skipButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
  },
  text: {
    textAlign: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30,
    paddingBottom: 30,
  },
});

BeginLifemap.propTypes = {
  t: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
};

const mapDispatchToProps = {
  updateDraft,
};

const mapStateToProps = ({drafts}) => ({drafts});

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(BeginLifemap),
);
