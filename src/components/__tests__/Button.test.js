import React from 'react'

import { shallow } from 'enzyme'
import { TouchableOpacity, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Button from '../Button'
import colors from '../../theme.json'

const createTestProps = props => ({
  ...props,
  handleClick: jest.fn(),
  text: 'Some button text'
})

describe('Button Component', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps()
    wrapper = shallow(<Button {...props} />)
  })
  describe('rendering', () => {
    it('renders <TouchableOpacity />', () => {
      expect(wrapper.find(TouchableOpacity)).toHaveLength(1)
    })

    it('renders <Text />', () => {
      expect(wrapper.find(Text)).toHaveLength(1)
    })
    it('renders <Icon /> when icon property is defined', () => {
      props = { ...props, icon: 'add' }
      wrapper = shallow(<Button {...props} />)
      expect(wrapper.find(Icon)).toHaveLength(1)
    })
    it('does not render <Icon /> when icon property is not defined', () => {
      expect(wrapper.find(Icon)).toHaveLength(0)
    })
    it('has proper backgroundColor and text color when passed colored = true', () => {
      props = createTestProps({
        colored: true
      })
      wrapper = shallow(<Button {...props} />)

      expect(
        wrapper.find(TouchableOpacity).props().style[1].backgroundColor
      ).toBe(colors.palegreen)

      expect(wrapper.find(Text).props().style[1].color).toBe(colors.white)
    })
  })
  describe('functionality', () => {
    it('should call handleClick onPress', () => {
      wrapper
        .find(TouchableOpacity)
        .props()
        .onPress()

      expect(wrapper.instance().props.handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
