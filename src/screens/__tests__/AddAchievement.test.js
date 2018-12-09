import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, Text } from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons'

import { AddAchievement } from '../lifemap/AddAchievement'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'

const createTestProps = props => ({
  t: value => value,
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    getParam: jest.fn(param => (param === 'indicator' ? 'income' : 2))
  },
  addSurveyPriorityAcheivementData: jest.fn(),
  drafts: [
    {
      draftId: 2,
      surveyId: 1,
      achievements: []
    }
  ],
  ...props
})

describe('AddAchievement View', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps()
    wrapper = shallow(<AddAchievement {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })
    it('renders Icon', () => {
      expect(wrapper.find(Icon)).toHaveLength(1)
    })
    it('renders Text', () => {
      expect(wrapper.find(Text)).toHaveLength(2)
    })
    it('renders Button', () => {
      expect(wrapper.find(Button)).toHaveLength(1)
    })
  })

  describe('functionality', () => {
    it('has correct initial state', () => {
      expect(wrapper.instance().state).toEqual({
        action: '',
        roadmap: '',
        indicator: 'income'
      })
    })

    it('records action to state', () => {
      wrapper
        .find(TextInput)
        .first()
        .props()
        .onChangeText('Some action')
      expect(wrapper.instance().state.action).toEqual('Some action')
    })
    it('records roadmap to state', () => {
      wrapper
        .find(TextInput)
        .last()
        .props()
        .onChangeText('Some roadmap')
      expect(wrapper.instance().state.roadmap).toEqual('Some roadmap')
    })

    it('saves the achievement', () => {
      wrapper
        .find(Button)
        .props()
        .handleClick()

      expect(
        wrapper.instance().props.addSurveyPriorityAcheivementData
      ).toHaveBeenCalledTimes(1)
    })
  })
})
