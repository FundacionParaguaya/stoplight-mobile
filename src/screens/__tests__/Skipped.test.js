import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, Image, FlatList } from 'react-native'
import { Skipped } from '../lifemap/Skipped'
import Button from '../../components/Button'
import Tip from '../../components/Tip'

const createTestProps = props => ({
  t: value => value,
  navigation: {
    navigate: jest.fn(),
    getParam: jest.fn(param => {
      if (param === 'draftId') {
        return 1
      }
      if (param === 'survey') {
        return {
          id: 2,
          title: 'Other survey',
          surveyStoplightQuestions: [
            { phoneNumber: 'phoneNumber' },
            { education: 'education' },
            { c: 'c' }
          ]
        }
      }
    })
  },
  ...props
})

describe('Skipped Questions View when questions are skipped', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps({
      drafts: [
        {
          draftId: 1,
          indicatorSurveyDataList: [
            { key: 'phoneNumber', value: 0 },
            { key: 'education', value: 3 }
          ]
        }
      ]
    })
    wrapper = shallow(<Skipped {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })
    it('renders Image', () => {
      expect(wrapper.find(Image)).toHaveLength(1)
    })

    it('rendersFlatList', () => {
      expect(wrapper.find(FlatList)).toHaveLength(1)
    })
    it('renders Tip', () => {
      expect(wrapper.find(Tip)).toHaveLength(1)
    })
    it('renders Button', () => {
      expect(wrapper.find(Button)).toHaveLength(1)
    })
  })
  describe('functionality', () => {
    it('passess the correct data to FlatList', () => {
      expect(wrapper.find(FlatList).props().data).toEqual([
        { key: 'phoneNumber', value: 0 }
      ])
    })

    it('calls navigation', () => {
      wrapper
        .find(Button)
        .props()
        .handleClick()
      expect(
        wrapper.instance().props.navigation.navigate
      ).toHaveBeenCalledTimes(1)
    })
  })
})
