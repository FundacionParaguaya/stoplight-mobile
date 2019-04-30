import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet } from 'react-native'
import SliderItem from './SliderItem'
import colors from '../theme.json'
import { connect } from 'react-redux'
import Carousel from 'react-native-snap-carousel'

const slideColors = {
  1: 'red',
  2: 'gold',
  3: 'palegreen'
}

export class Slider extends Component {
  state = {
    selectedColor: colors.palegreen
  }

  getSelectedAnswer = value => {
    switch (value) {
      case 1:
        return 2
      case 2:
        return 1
      case 3:
        return 0
      default:
        return 0
    }
  }

  renderSlide = ({ item, index }) => {
    return (
      <View
        key={index}
        style={[
          styles.slideWrapper,
          { backgroundColor: colors[slideColors[item.value]] }
        ]}
      >
        <SliderItem
          slide={item}
          onPress={() => {
            this.props.selectAnswer(item.value)
            this.setState({
              selectedColor: colors[slideColors[item.value]]
            })
          }}
          value={this.props.value}
          bodyHeight={this.props.bodyHeight}
          dimensions={this.props.dimensions}
          portrait={this.props.portrait}
          tablet={this.props.tablet}
        />
      </View>
    )
  }

  render() {
    const { width } = this.props.dimensions
    const activeSlide = this.props.value
      ? this.getSelectedAnswer(this.props.value)
      : 0
    return (
      <View>
        <Carousel
          ref={c => this._carousel = c}
          data={this.props.slides}
          renderItem={this.renderSlide}
          sliderWidth={width}
          itemWidth={this.props.portrait ? width - 60 : width / 2 + 50}
          loop={true}
          inactiveSlideOpacity={1}
          activeSlideAlignment={'center'}
          loopClonesPerSide={10}
          firstItem={activeSlide}
          activeSlideOffset={50}
          inactiveSlideScale={1}
          slideStyle={{paddingHorizontal: 8}}
        />
      </View>
    )
  }
}

Slider.propTypes = {
  slides: PropTypes.array.isRequired,
  value: PropTypes.number,
  selectAnswer: PropTypes.func.isRequired,
  dimensions: PropTypes.object,
  bodyHeight: PropTypes.number.isRequired,
  tablet: PropTypes.bool,
  portrait: PropTypes.bool
}

const styles = StyleSheet.create({
  slideWrapper: {
    borderRadius: 3,
    paddingTop: 10
  }
})

const mapStateToProps = ({ dimensions }) => ({
  dimensions
})

export default connect(mapStateToProps)(Slider)
