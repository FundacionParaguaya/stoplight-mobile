import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import colors from '../theme.json'
import Image from './CachedImage'
import globalStyles from '../globalStyles'

const slideColors = {
  1: 'red',
  2: 'gold',
  3: 'palegreen'
}

export default class SliderItem extends Component {
  state = {
    pressed: false,
    textContentHeight: 0
  }
  togglePressedState = pressed => {
    this.setState({
      pressed
    })
  }
  calculateTextContentHeight = event => {
    this.setState({ textContentHeight: event.nativeEvent.layout.height })
  }

  render() {
    const { slide, value, bodyHeight, portrait, tablet } = this.props
    const slideHeight =
      !tablet && !portrait
        ? bodyHeight - 70
        : tablet && portrait
        ? bodyHeight - 160
        : bodyHeight - 100
    const imageHeight = !tablet && !portrait ? bodyHeight / 3 : bodyHeight / 2
    const textAreaHeight = slideHeight - imageHeight // - 30 is margin top on image + icon
    return (
      <TouchableHighlight
        activeOpacity={1}
        underlayColor={'transparent'}
        style={[styles.slide, { height: slideHeight }]}
        onPress={this.props.onPress}
        onHideUnderlay={() => this.togglePressedState(false)}
        onShowUnderlay={() => this.togglePressedState(true)}
        accessibilityLabel={value === slide.value ? 'selected' : 'deselected'}
        accessibilityHint={slide.description}
      >
        <View>
          <Image
            source={slide.url}
            style={[
              {
                ...styles.image,
                height: imageHeight
              },
              !tablet && !portrait ? { marginTop: 5 } : { marginTop: 10 }
            ]}
          />

          <View
            id="icon-view"
            style={[
              {
                ...styles.iconBig,
                backgroundColor: colors[slideColors[slide.value]],
                opacity: value === slide.value || this.state.pressed ? 1 : 0
              },
              tablet && portrait
                ? styles.tickIconTabletSizes
                : styles.tickIconDefaultSizes
            ]}
          >
            <Icon name="done" size={47} color={colors.white} />
          </View>

          <View
            style={[
              portrait ? { height: textAreaHeight } : {},
              tablet && !portrait ? styles.textVertical : { paddingBottom: 15 }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                height: this.state.textContentHeight,
                paddingBottom: 50
              }}
            >
              <Text
                onPress={this.props.onPress}
                onLayout={event => this.calculateTextContentHeight(event)}
                style={[
                  {
                    ...globalStyles.p,
                    ...styles.text,
                    color: slide.value === 2 ? colors.black : colors.white
                  },
                  tablet ? styles.textTablet : styles.textPhone
                ]}
              >
                {slide.description}
              </Text>
            </ScrollView>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

SliderItem.propTypes = {
  onPress: PropTypes.func,
  slide: PropTypes.object.isRequired,
  value: PropTypes.number,
  dimensions: PropTypes.object,
  bodyHeight: PropTypes.number.isRequired,
  tablet: PropTypes.bool,
  portrait: PropTypes.bool
}

const styles = StyleSheet.create({
  slide: {
    width: '100%'
  },
  text: {
    color: colors.white,
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: 'Poppins',
    alignSelf: 'center'
  },
  textVertical: {
    paddingTop: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: '100%',
    borderRadius: 3
  },
  iconBig: {
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  tickIconTabletSizes: {
    width: 150,
    height: 150,
    marginTop: -60,
    marginBottom: -50
  },
  tickIconDefaultSizes: {
    width: 80,
    height: 80,
    marginTop: -40,
    marginBottom: -20
  },
  textTablet: {
    lineHeight: 30,
    fontSize: 22,
    paddingRight: 40,
    paddingLeft: 40
  },
  textPhone: {
    paddingRight: 15,
    paddingLeft: 15
  }
})
