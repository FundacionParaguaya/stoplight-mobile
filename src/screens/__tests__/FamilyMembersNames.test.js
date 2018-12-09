import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView } from 'react-native'
import { FamilyMembersNames } from '../lifemap/FamilyMembersNames'

import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import Select from '../../components/Select'

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
      economicSurveyDataList: [
        { key: 'educationPersonMostStudied', value: 'SCHOOL-COMPLETE' },
        { key: 'receiveStateIncome', value: 'NO' },
        { key: 'currency', value: 'GBP/Pound Sterling' },
        { key: 'areaOfResidence', value: 'URBAN' }
      ],

      indicatorSurveyDataList: [
        { key: 'insurance', value: 1 },
        { key: 'entertainmentAndRecreation', value: 3 },
        { key: 'stableHousing', value: 2 }
      ],
      familyData: {
        countFamilyMembers: 2,
        familyMembersList: [
          {
            firstName: 'Juan',
            lastName: 'Perez'
          },
          {
            firstName: 'Ana'
          }
        ]
      }
    }
  ],
  addSurveyData: jest.fn(),
  addSurveyFamilyMemberData: jest.fn(),
  ...props
})

describe('FamilyMembersNames View', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps()
    wrapper = shallow(<FamilyMembersNames {...props} />)
  })
  describe('rendering', () => {
    it('renders ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })

    it('renders Button', () => {
      expect(wrapper.find(Button)).toHaveLength(1)
    })
    it('renders Select', () => {
      expect(wrapper.find(Select)).toHaveLength(1)
    })
    it('renders TextInput', () => {
      expect(wrapper.find(TextInput)).toHaveLength(2)
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
  it('gives Select the proper value', () => {
    expect(wrapper.find(Select).props().value).toBe(2)
  })
  it('makes first TextInput is readonly', () => {
    expect(
      wrapper
        .find(TextInput)
        .first()
        .props().readonly
    ).toBe(true)
  })
  it('gets first Input value from draft', () => {
    expect(
      wrapper
        .find(TextInput)
        .first()
        .props().value
    ).toBe('Juan')
  })
  it('gets second Input value from draft', () => {
    expect(
      wrapper
        .find(TextInput)
        .last()
        .props().value
    ).toBe('Ana')
  })

  it('calls addFamilyMemberName on input change', () => {
    const spy = jest.spyOn(wrapper.instance(), 'addFamilyMemberName')

    wrapper
      .find(TextInput)
      .last()
      .props()
      .onChangeText('hi')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('enables Button when all fields are filled', () => {
    expect(
      wrapper
        .find(Button)
        .last()
        .props().disabled
    ).toBe(false)
  })
  it('disables Button when no count is selected', () => {
    const props = createTestProps({
      drafts: [
        {
          draftId: 4,
          familyData: {
            familyMembersList: [
              {
                firstName: 'Juan',
                lastName: 'Perez',
                socioEconomicAnswers: [
                  {
                    key: 'educationPersonMostStudied',
                    value: 'SCHOOL-COMPLETE'
                  },
                  { key: 'receiveStateIncome', value: 'NO' }
                ]
              }
            ]
          }
        }
      ]
    })
    wrapper = shallow(<FamilyMembersNames {...props} />)
    expect(
      wrapper
        .find(Button)
        .last()
        .props().disabled
    ).toBe(true)
  })
  it('disables Button when no name is inputed', () => {
    const props = createTestProps({
      drafts: [
        {
          draftId: 4,
          personal_survey_data: {
            firstName: 'Jane'
          },
          familyData: {
            countFamilyMembers: 2,
            familyMembersList: [
              {
                firstName: 'Juan'
              },
              {
                firstName: ''
              }
            ]
          }
        }
      ]
    })
    wrapper = shallow(<FamilyMembersNames {...props} />)
    expect(
      wrapper
        .find(Button)
        .last()
        .props().disabled
    ).toBe(true)
  })
})
