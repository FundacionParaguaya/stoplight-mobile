import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, Image, FlatList, Text } from 'react-native'
import { Overview } from '../lifemap/Overview'
import RoundImage from '../../components/RoundImage'
import Button from '../../components/Button'
import Tip from '../../components/Tip'
import LifemapVisual from '../../components/LifemapVisual'
import LifemapOverview from '../../components/LifemapOverview'

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
            { phone: 'phone' },
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
            { key: 'phone', value: 0 },
            { key: 'education', value: 3 }
          ]
        }
      ]
    })
    wrapper = shallow(<Overview {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(2)
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
        { key: 'phone', value: 0 }
      ])
    })
    it('has correct initial state', () => {
      expect(wrapper.instance().state).toEqual({ continueIsClicked: false })
    })

    it('changes state when contunue is clicked', () => {
      wrapper.instance().scroll = { scrollTo: jest.fn() }
      wrapper
        .find(Button)
        .props()
        .handleClick()
      expect(wrapper.instance().state).toEqual({ continueIsClicked: true })
    })
  })
})

describe('Overview Lifemap View when no questions are skipped', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps({
      drafts: [
        {
          draftId: 1,
          indicatorSurveyDataList: [
            { key: 'phone', value: 3 },
            { key: 'education', value: 1 }
          ]
        }
      ]
    })
    wrapper = shallow(<Overview {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(2)
    })
    it('renders LifemapVisual', () => {
      expect(wrapper.find(LifemapVisual)).toHaveLength(1)
    })
    it('renders LifemapOverview', () => {
      expect(wrapper.find(LifemapOverview)).toHaveLength(1)
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
      expect(
        wrapper.instance().props.navigation.navigate
      ).toHaveBeenCalledTimes(1)
    })
    it('passes the correct survey data to lifemap overview', () => {
      expect(wrapper.find(LifemapOverview).props().surveyData).toEqual([
        { phone: 'phone' },
        { education: 'education' },
        { c: 'c' }
      ])
    })
    it('passes the correct draft data to lifemap overview', () => {
      expect(wrapper.find(LifemapOverview).props().draftData).toEqual([
        { key: 'phone', value: 3 },
        { key: 'education', value: 1 }
      ])
    })
  })
})
