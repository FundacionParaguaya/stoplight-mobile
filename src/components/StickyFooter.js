import {Keyboard, ScrollView, StyleSheet, Vibration, View} from 'react-native';
import React, {Component} from 'react';

import Button from './Button';
import ProgressBar from './ProgressBar';
import PropTypes from 'prop-types';
import Tip from './Tip';
import globalStyles from '../globalStyles';
const VIBRATION_DURATION = 120

export default class StickyFooter extends Component {
  state = {
    continueVisible: true,
  };
  toggleContinue = (continueVisible) => {
    this.setState({
      continueVisible,
    });
  };
  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
      this.toggleContinue(false),
    );
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      this.toggleContinue(true),
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  setMarginTop = () => {
    let marginTop;
    if (!!this.props.progress && this.props.currentScreen !== 'Question') {
      marginTop = -20;
    } else {
      marginTop = 0;
    }
    return marginTop;
  };

  vibrate = () => {
    Vibration ? Vibration.vibrate(VIBRATION_DURATION) : null
  }

  render() {
    return (
      <View
        style={[
          globalStyles.background,
          !!this.props.currentScreen && this.props.currentScreen === 'Question'
            ? {paddingTop: 15}
            : {...styles.contentContainer},
          {marginTop: this.setMarginTop()},
          {flex: 1},
        ]}>
        {!!this.props.progress && (
          <ProgressBar
            progress={this.props.progress}
            currentScreen={this.props.currentScreen || ''}
          />
        )}
        {this.props.fullHeight ? (
          <View
            style={{width: '100%', flexGrow: 2, marginTop: -15}}
            keyboardShouldPersistTaps={'handled'}>
            {this.props.children}
          </View>
        ) : (
          <ScrollView keyboardShouldPersistTaps="always">
            {this.props.children}
          </ScrollView>
        )}

        {!this.props.readOnly &&
        this.props.visible &&
        this.state.continueVisible ? (
          <View>
            {/* i have changed the height to 61 because there was a weird whitespace if we dont have the progress bar */}
            {this.props.type === 'button' ? (
              <View style={{height: 61}}>
                <Button
                  id="continue"
                  colored
                  text={this.props.continueLabel || ''}
                  handleClick={
                    (() => {
                      this.vibrate();
                      this.props.onContinue();
                    }
                    ) || (() => {})}
                />
              </View>
            ) : (
              <Tip
                visible={this.props.tipIsVisible}
                title={this.props.tipTitle}
                onTipClose={this.props.onTipClose}
                description={this.props.tipDescription}
              />
            )}
          </View>
        ) : null}
      </View>
    );
  }
}

StickyFooter.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  onContinue: PropTypes.func,
  visible: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool,
  continueLabel: PropTypes.string,
  type: PropTypes.oneOf(['button', 'tip']),
  tipTitle: PropTypes.string,
  tipIsVisible: PropTypes.bool,
  fullHeight: PropTypes.bool,
  tipDescription: PropTypes.string,
  onTipClose: PropTypes.func,
  progress: PropTypes.number,
  currentScreen: PropTypes.string,
};

StickyFooter.defaultProps = {
  type: 'button',
  visible: true,
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 20,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});
