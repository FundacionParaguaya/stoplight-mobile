import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  Vibration,
  View,
} from 'react-native';
import React, {Component, createRef} from 'react';

import PropTypes from 'prop-types';
import SliderItem from './SliderItem';
import {Tooltip} from 'react-native-elements';
import colors from '../theme.json';
import {isPortrait} from '../responsivenessHelpers';

const VIBRATION_DURATION = 120;

const slideColors = {
  1: 'red',
  2: 'gold',
  3: 'palegreen',
};

export class Slider extends Component {
  _isMounted = false;
  _timer;
  _tooltipRef = createRef();

  state = {
    selectedColor: colors.palegreen,
    anim: new Animated.Value(0),
  };

  componentDidMount() {
    this._isMounted = true;
    const {width, height} = Dimensions.get('window');

    const value = (value) => {
      switch (value) {
        case 1:
          return 2;
        case 2:
          return 1;
        case 3:
          return 0;
        default:
          return 0;
      }
    };

    this.animate();

    const visibleTooltip = this.canShowTooltip(this.props.step, width, height);
    if (visibleTooltip) {
      setTimeout(() => {
        this._tooltipRef.current.toggleTooltip();
      }, 100);
    }

    if (value(this.props.value)) {
      this._timer = setTimeout(() => {
        if (this.scrollView) {
          this.scrollView.scrollTo({
            x: (width - (1 / 10) * width) * value(this.props.value),
            animated: true,
          });
        }
      }, 1);
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
    this._isMounted = false;
  }

  onSlidePress = (slide) => {
    this.vibrate();
    this.props.selectAnswer(slide.value);
    if (this._isMounted) {
      this.setState({
        selectedColor: colors[slideColors[slide.value]],
      });
    }
  };
  animate = () => {
    Animated.sequence([
      Animated.timing(this.state.anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.anim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.anim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.anim, {
        toValue: 0.5,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  canShake = (index, width, height) => {
    if (this.props.step < 2 && index === 1 && isPortrait({width, height})) {
      return true;
    }
    return false;
  };

  canShowTooltip = (step, width, height) => {
    if (
      this.props.allowInteractiveHelp &&
      step < 2 &&
      isPortrait({width, height})
    ) {
      return true;
    }
    return false;
  };

  vibrate = () => {
    Vibration ? Vibration.vibrate(VIBRATION_DURATION) : null;
  };

  render() {
    const {tooltipText} = this.props;
    const {width, height} = Dimensions.get('window');
    const spin = this.state.anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '2deg'],
    });
    return (
      <View>
        <Tooltip
          withOverlay={false}
          withPointer={false}
          ref={this._tooltipRef}
          height={50}
          popover={<Text style={{color: 'white'}}>{tooltipText}</Text>}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          snapToInterval={width - (1 / 10) * width}
          contentContainerStyle={{
            width: isPortrait({width, height}) ? '280%' : '90%',
            flexGrow: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: '0.66%',
          }}
          ref={(ref) => {
            this.scrollView = ref;
          }}>
          {this.props.slides.map((slide, i) => (
            <Animated.View
              key={i}
              style={[
                {  
                  width: '33%',
                  backgroundColor: colors[slideColors[slide.value]],
                },
                this.canShake(i, width, height) && {
                  transform: [{rotate: spin}],
               }
              ]}>
              <SliderItem
                slide={slide}
                onPress={() => this.onSlidePress(slide)}
                value={this.props.value}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

Slider.propTypes = {
  slides: PropTypes.array.isRequired,
  value: PropTypes.number,
  selectAnswer: PropTypes.func.isRequired,
  step: PropTypes.number,
};

export default Slider;
