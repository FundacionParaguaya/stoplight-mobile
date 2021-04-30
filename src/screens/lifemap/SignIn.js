import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {Image, StyleSheet, Text, Vibration, View} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import {connect} from 'react-redux';

import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import {updateDraft} from '../../redux/actions';
import {getTotalEconomicScreens} from './helpers';
import colors from '../../theme.json';
import {calculateProgressBar} from '../utils/helpers';

const VIBRATION_DURATION = 120

export class SigIn extends Component {
  survey = this.props.route.params.survey;
  draftId = this.props.route.params.draftId;

  // the draft is not mutated in this screen (only its progress),
  // we need it for progress bar
  draft = this.props.drafts.find((draft) => draft.draftId === this.draftId);

  isEmpty = true;

  displaySign = false;

  displayError = false;

  setEmpty = (isEmpty) => {
    this.isEmpty = isEmpty;
  };

  setDisplay = (displaySign) => {
    this.displaySign = displaySign;
  };

  setDisplayErr = (displayError) => {
    this.displayError = displayError;
  };

  onPressBack = () => {
    if (this.survey.surveyConfig.pictureSupport) {
      this.props.navigation.replace('Picture', {
        survey: this.survey,
        draftId: this.draftId,
      });
    } else {
      this.props.navigation.goBack();
    }
  };

  componentDidMount() {
    if (this.draft.progress.screen !== 'Signin') {
      let updatedDraft = this.draft;
      updatedDraft.progress.screen = 'Signin';
      this.props.updateDraft(updatedDraft);
    }
    if (this.draft.sign) {
      this.setEmpty(false);
      this.setDisplay(true);
    }

    this.props.navigation.setParams({
      onPressBack: this.onPressBack,
    });
  }

  vibrate = () => {
    Vibration ? Vibration.vibrate(VIBRATION_DURATION) : null
  }

  handleContinue = () => {
    this.vibrate();
    if (this.sign && !this.isEmpty) {
      this.sign.saveImage();
    }
    if (!this.isEmpty) {
      this.props.navigation.push('Final', {
        familyLifemap: this.draft,
        draft: this.draft,
        draftId: this.draftId,
        survey: this.survey,
      });
    } else {
      this.setDisplayErr(true);
      this.onClear();
    }
  };

  _onSaveEvent(result) {
    let updatedDraft = this.draft;
    updatedDraft.sign = 'data:image/png;base64,' + result.encoded;
    this.updateDraft(updatedDraft);
    this.setDisplayErr(false);
  }

  _onDragEvent() {
    this.setEmpty(false);
  }

  onClear = () => {
    this.setEmpty(true);
    this.setDisplay(false);
    this.setDisplayErr(true);
    this.sign && this.sign.resetImage();
    let updatedDraft = this.draft;
    updatedDraft.sign = '';
    this.props.updateDraft(updatedDraft);
  };

  render() {
    const {t} = this.props;
    if (this.draft.sign) {
      this.setEmpty(false);
      this.setDisplay(true);
    }
    console.log('signin');
    console.log(this.draft);
    return (
      <View style={styles.contentContainer}>
        <ProgressBar
          progress={
            calculateProgressBar({readOnly:this.readOnly,draft:this.draft,skipQuestions:true})  
          }
          currentScreen={'Signin'}
        />
        <View style={{...styles.iconPriorityBorder}} variant="stretch">
          <Image
            style={{...styles.iconPriority}}
            source={require('../../../assets/images/pen_icon.png')}
          />
        </View>
        {this.displaySign ? (
          <Image
            style={[{margin: 10}, styles.container]}
            source={{uri: this.draft.sign}}
          />
        ) : (
          <View style={[{flex: 2, margin: 10}, styles.container]}>
            <SignatureCapture
              style={[styles.container]}
              key={'sign'}
              ref={(r) => {
                this.sign = r;
              }}
              onSaveEvent={this._onSaveEvent}
              onDragEvent={this._onDragEvent}
              saveImageFileInExtStorage={false}
              showNativeButtons={false}
              showTitleLabel={false}
              draft={this.draft}
              updateDraft={this.props.updateDraft}
              setEmpty={this.setEmpty}
              setDisplay={this.setDisplay}
              setDisplayErr={this.setDisplayErr}
            />
          </View>
        )}
        {this.displayError ? (
          <Text style={{marginLeft: 30, color: colors.red}}>
            {t('views.sign.emptyError')}
          </Text>
        ) : null}
        <View style={styles.buttonsBar}>
          <Button
            id="erase"
            text={t('views.sign.erase')}
            underlined
            handleClick={this.onClear}
          />
          <Button
            id="continue"
            colored
            text={t('general.continue')}
            handleClick={this.handleContinue}
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  iconPriorityBorder: {
    backgroundColor: '#FFFFFF',
    minWidth: 90,
    minHeight: 90,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-2%',
    position: 'relative',
  },
  container: {
    flex: 1,
    height: 900,
    borderColor: '#309E43',
    borderWidth: 1,
    borderRadius: 1,
  },
  iconPriority: {
    height: 40,
    width: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  buttonsBar: {
    height: 50,
    marginTop: 40,
    marginBottom: -2,
    flexDirection: 'row',
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});

SigIn.propTypes = {
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
  connect(mapStateToProps, mapDispatchToProps)(SigIn),
);
