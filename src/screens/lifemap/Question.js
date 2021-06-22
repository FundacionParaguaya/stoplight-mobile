import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Audio from '../../components/Audio';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconButton from '../../components/IconButton';
import Orientation from 'react-native-orientation-locker';
import Popup from '../../components/Popup';
import PropTypes from 'prop-types';
import RNFetchBlob from 'rn-fetch-blob'
import SliderComponent from '../../components/Slider';
import StickyFooter from '../../components/StickyFooter';
import {calculateProgressBar} from '../utils/helpers';
import colors from '../../theme.json';
import { connect } from 'react-redux';
import { getTotalEconomicScreens } from './helpers';
import globalStyles from '../../globalStyles';
import { updateDraft } from '../../redux/actions';
import { withNamespaces } from 'react-i18next';

let dirs = RNFetchBlob.fs.dirs

export class Question extends Component {
  step = this.props.route.params.step;
  survey = this.props.route.params.survey;
  draftId = this.props.route.params.draftId;
  answeringSkipped = this.props.route.params.answeringSkipped;

  indicators = this.props.route.params.survey.surveyStoplightQuestions;
  indicator = this.indicators[this.step];

  slides = this.indicator.stoplightColors;
  readOnly = this.props.route.params.readOnly;

  state = {
    showDefinition: false,
  };

  getDraft = () =>
    this.props.drafts.find((draft) => draft.draftId === this.draftId);

  getFieldValue = (field) => {
    const draft = this.getDraft();

    const indicatorObject =
      draft && draft.indicatorSurveyDataList
        ? draft.indicatorSurveyDataList.find((item) => item.key === field)
        : null;
    if (indicatorObject) {
      return indicatorObject.value;
    }
  };

  selectAnswer = (answer = 0) => {
    const draft = this.getDraft();

    const skippedQuestions = draft.indicatorSurveyDataList.filter(
      (question) => question.value === 0,
    );
    const fieldValue = this.getFieldValue(this.indicator.codeName);

    let updatedIndicators;

    if (
      draft.indicatorSurveyDataList.find(
        (item) => item.key === this.indicator.codeName,
      )
    ) {
      updatedIndicators = draft.indicatorSurveyDataList.map((item) => {
        if (item.key === this.indicator.codeName) {
          return { ...item, value: answer };
        } else {
          return item;
        }
      });
    } else {
      updatedIndicators = [
        ...draft.indicatorSurveyDataList,
        { key: this.indicator.codeName, value: answer },
      ];
    }

    let updatedDraft = {
      ...draft,
      indicatorSurveyDataList: updatedIndicators,
    };

    //When the user changes the answer of a question
    if (fieldValue !== answer) {
      //If the indicator is green or skipped

      if (answer === 3 || answer === 0) {
        //delete priority
        updatedDraft = {
          ...draft,
          indicatorSurveyDataList: updatedIndicators,
          priorities: [
            ...draft.priorities.filter(
              (item) => item.indicator !== this.indicator.codeName,
            ),
          ],
        };
      }
      //If indicator is yellow, red or skipped
      if (answer < 3) {
        //Delete achievements
        updatedDraft = {
          ...draft,
          indicatorSurveyDataList: updatedIndicators,
          achievements: [
            ...draft.achievements.filter(
              (item) => item.indicator !== this.indicator.codeName,
            ),
          ],
        };
      }
    }

    this.props.updateDraft(updatedDraft);

    // after updating the draft, navigate based on navigation state
    if (this.step + 1 < this.indicators.length && !this.answeringSkipped) {
      return this.props.navigation.replace('Question', {
        step: this.step + 1,
        draftId: this.draftId,
        survey: this.survey,
      });
    } else if (this.step + 1 >= this.indicators.length && answer === 0) {
      return this.props.navigation.replace('Skipped', {
        draftId: this.draftId,
        survey: this.survey,
      });
    } else if (
      (this.answeringSkipped &&
        skippedQuestions.length === 1 &&
        answer !== 0) ||
      skippedQuestions.length === 0
    ) {
      return this.props.navigation.replace('Overview', {
        resumeDraft: false,
        draftId: this.draftId,
        survey: this.survey,
      });
    } else {
      return this.props.navigation.replace('Skipped', {
        draftId: this.draftId,
        survey: this.survey,
      });
    }
  };

  onPressBack = () => {
    // navigate back to skipped questions if answering one,
    // otherwise to the expected screen in the lifemap flow
    if (this.answeringSkipped) {
      this.props.navigation.navigate('Skipped', {
        draftId: this.draftId,
        survey: this.survey,
      });
    } else if (this.step > 0) {
      this.props.navigation.replace('Question', {
        step: this.step - 1,
        draftId: this.draftId,
        survey: this.survey,
      });
    } else {
      this.props.navigation.navigate('BeginLifemap', {
        draftId: this.draftId,
        survey: this.survey,
      });
    }
  };

  toggleDefinitionWindow = (stateWindow) => {
    this.setState({
      showDefinition: stateWindow,
    });
  };

  async componentDidMount() {
    Orientation.lockToLandscape(); //this will lock the view to Portrait
    const draft = this.getDraft();

    this.props.updateDraft({
      ...draft,
      progress: {
        ...draft.progress,
        screen: 'Question',
        step: this.step,
      },
    });

    this.props.navigation.setParams({
      onPressBack: this.onPressBack
    });
  }

  componentWillUnmount() {
    Orientation.unlockAllOrientations();
  }

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }

  render() {
    const draft = this.getDraft();
    // added a popup component to the Question.js instead of adding it to the
    // modals folder because it is really smol and does not do much

    const { t, user } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <StickyFooter
          visible={false}
          readOnly
          progress={
            calculateProgressBar({readOnly:this.readOnly,draft:draft,screen:getTotalEconomicScreens(this.survey) + 6 + this.step})
          }
          currentScreen="Question">
          {this.state.showDefinition ? (
            <Popup
              modifiedPopUp
              definition
              isOpen={this.state.showDefinition}
              onClose={() => this.toggleDefinitionWindow(false)}>
              <Icon
                style={styles.closeIconStyle}
                onPress={() => this.toggleDefinitionWindow(false)}
                name="close"
                size={20}
              />
              <Text
                style={{
                  ...globalStyles.h3Bold,
                  textAlign: 'center',
                  marginBottom: 20,
                }}>
                {t('views.lifemap.indicatorDefinition')}
              </Text>
              <Text
                id="definition"
                style={{
                  fontSize: 16,
                }}>
                {this.indicator.definition || null}
              </Text>
            </Popup>
          ) : null}

          <SliderComponent
            slides={this.slides}
            value={this.getFieldValue(this.indicator.codeName)}
            selectAnswer={this.selectAnswer}
          />

          <View style={styles.skip}>
            {this.indicator.definition ? (
              <Icon
                id="show-definition"
                onPress={() => this.toggleDefinitionWindow(true)}
                name="info"
                color={colors.palegrey}
                size={40}
                style={{
                  color: colors.palegreen,
                  position: 'absolute',
                  top: 10,
                  left: 2
                }}
              />
            ) : null}
            
            {user.interactive_help &&  this.indicator && this.indicator.questionAudio &&
              <Audio  audioId ={this.indicator.id} url={this.indicator.questionAudio} 
              containerStyles={{
                position: 'absolute',
                flexDirection:'row',
                alignItems:'center',
               
                paddingRight:5,
                top: 10,
                left: 42,
            }}
              styles={{
                color: colors.palegreen,
              }}
              labelStyle={globalStyles.h4}
            />
            }
            


            {this.indicator.required ? (
              <Text>{t('views.lifemap.responseRequired')}</Text>
            ) : (
                <IconButton
                  text={t('views.lifemap.skipThisQuestion')}
                  textStyle={styles.link}
                  onPress={() => this.selectAnswer(0)}
                />
              )}
          </View>
        </StickyFooter>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  closeIconStyle: {
    color: colors.palegreen,
    marginLeft: 'auto',
    fontSize: 35,
  },
  skip: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    marginBottom: 120,
  },
  link: {
    color: colors.palegreen,
  },
});

Question.propTypes = {
  drafts: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  dimensions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  updateDraft: PropTypes.func.isRequired,
};

const mapStateToProps = ({ dimensions, drafts, user }) => ({
  dimensions,
  drafts,
  user
});

const mapDispatchToProps = { updateDraft };

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Question),
);
