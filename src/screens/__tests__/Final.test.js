import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, Text } from 'react-native'
import { Final } from '../lifemap/Final'
import RoundImage from '../../components/RoundImage'
import Button from '../../components/Button'
import LifemapVisual from '../../components/LifemapVisual'

const createTestProps = props => ({
  t: value => value,
  navigation: {
    navigate: jest.fn(),
    popToTop: jest.fn(),
    reset: jest.fn(),
    getParam: jest.fn(param => {
      if (param === 'draftId') {
        return 1
      }
    })
  },
  ...props
})

describe('Final Lifemap View when no questions are skipped', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps({
      drafts: [
        {
          draftId: 1,
          indicatorSurveyDataList: [
            { key: 'phoneNumber', value: 3 },
            { key: 'education', value: 1 }
          ]
        }
      ]
    })
    wrapper = shallow(<Final {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })
    it('renders RoundImage', () => {
      expect(wrapper.find(RoundImage)).toHaveLength(1)
    })
    it('renders Text', () => {
      expect(wrapper.find(Text)).toHaveLength(2)
    })
    it('renders LifemapVisual', () => {
      expect(wrapper.find(LifemapVisual)).toHaveLength(1)
    })
    it('renders Button', () => {
      expect(wrapper.find(Button)).toHaveLength(1)
    })
  })

  describe('functionality', () => {
    it('calls handleClick function when Button is clicked', () => {
      wrapper
        .find(Button)
        .props()
        .handleClick()
      expect(wrapper.instance().props.navigation.reset).toHaveBeenCalledTimes(1)
    })
  })
})
