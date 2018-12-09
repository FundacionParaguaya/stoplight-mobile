import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, Text } from 'react-native'
import { FamilyMembersBirthdates } from '../lifemap/FamilyMembersBirthdates'

import Button from '../../components/Button'
import DateInput from '../../components/DateInput'

const createTestProps = props => ({
  t: value => value,
  navigation: {
    getParam: jest.fn(param => (param === 'draftId' ? 4 : null)),
    navigate: jest.fn()
  },
  drafts: [
    {
      draftId: 4,
      surveyId: 1,
      economicSurveyDataList: [],
      indicatorSurveyDataList: [],
      familyData: {
        countFamilyMembers: 2,
        familyMembersList: [
          {
            firstName: 'Juan',
            lastName: 'Perez'
          },
          {
            firstName: 'Ana',
            gender: 'F',
            birthDate: 1515708000
          }
        ]
      }
    }
  ],
  addSurveyFamilyMemberData: jest.fn(),
  ...props
})

describe('FamilyMembersBirthDates View', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps()
    wrapper = shallow(<FamilyMembersBirthdates {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })

    it('renders Button', () => {
      expect(wrapper.find(Button)).toHaveLength(1)
    })
    it('renders DateInput', () => {
      expect(wrapper.find(DateInput)).toHaveLength(1)
    })
    it('renders Text', () => {
      expect(wrapper.find(Text)).toHaveLength(1)
    })
  })

  describe('functionality', () => {
    it('calls navigate function when button is pressed', () => {
      wrapper
        .find(Button)
        .props()
        .handleClick()

      expect(
        wrapper.instance().props.navigation.navigate
      ).toHaveBeenCalledTimes(1)
    })
  })
  it('gives DateInput the proper value', () => {
    expect(wrapper.find(DateInput).props().value).toBe(1515708000)
  })

  it('calls addFamilyMemberBirthdate on valid date', () => {
    const spy = jest.spyOn(wrapper.instance(), 'addFamilyMemberBirthdate')

    wrapper
      .find(DateInput)
      .last()
      .props()
      .onValidDate()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('enables Button by default', () => {
    expect(
      wrapper
        .find(Button)
        .last()
        .props().disabled
    ).toBe(false)
  })
  it('disables Button when an error occurs', () => {
    wrapper.instance().errorsDetected = ['error']
    wrapper.setState({ errorsDetected: ['error'] })

    expect(
      wrapper
        .find(Button)
        .last()
        .props().disabled
    ).toBe(true)
  })
})
