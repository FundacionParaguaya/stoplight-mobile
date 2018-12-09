import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, Text } from 'react-native'
import { BeginLifemap } from '../lifemap/BeginLifemap'
import RoundImage from '../../components/RoundImage'
import Button from '../../components/Button'

const createTestProps = props => ({
  t: value => value,
  navigation: {
    navigate: jest.fn(),
    getParam: jest.fn(() => ({
      id: 2,
      title: 'Other survey',
      surveyStoplightQuestions: [{ a: 'a' }, { b: 'b' }, { c: 'c' }]
    }))
  },
  ...props
})

describe('BeginLifemap View', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps()
    wrapper = shallow(<BeginLifemap {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })
    it('renders RoundImage', () => {
      expect(wrapper.find(RoundImage)).toHaveLength(1)
    })
    it('renders Text', () => {
      expect(wrapper.find(Text)).toHaveLength(1)
    })
    it('renders Button', () => {
      expect(wrapper.find(Button)).toHaveLength(1)
    })
  })

  describe('functionality', () => {
    it('calculates correctly the number of questions', () => {
      expect(wrapper.instance().numberOfQuestions).toEqual(3)
    })
  })
})
