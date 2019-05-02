import React from 'react'
import { shallow } from 'enzyme'
import { FamilyParticipant } from '../lifemap/FamilyParticipant'
import Select from '../../components/Select'
import DateInputComponent from '../../components/DateInput'
import TextInput from '../../components/TextInput'
import draft from '../__mocks__/draftMock.json'
import StickyFooter from '../../components/StickyFooter'

const createTestProps = props => ({
  t: value => value,
  updateNav: jest.fn(),
  createDraft: jest.fn(),
  deleteDraft: jest.fn(),
  nav: {
    survey: {
      id: 1,
      title: 'Dev Demo',
      survey_version_id: 2,
      surveyStoplightQuestions: [],
      surveyConfig: {
        surveyLocation: { country: 'BG' },
        gender: [
          {
            text: 'Female',
            value: 'F'
          },
          {
            text: 'Male',
            value: 'M'
          },
          {
            text: 'Prefer not to disclose',
            value: 'O'
          }
        ],
        documentType: [
          {
            text: 'National Insurance Number',
            value: 'NATIONALINSURANCE'
          },
          {
            text: 'Organisation Reference Number',
            value: 'ORGANISATIONALREFERENCENUMBER'
          },
          {
            text: 'Other identification',
            value: 'OTHER'
          }
        ]
      }
    }
  },
  addSurveyFamilyMemberData: jest.fn(),
  addDraftProgress: jest.fn(),
  addSurveyData: jest.fn(),
  removeFamilyMembers: jest.fn(),
  navigation: {
    navigate: jest.fn(),
    getParam: jest.fn(param => {
      if (param === 'draftId' || param === 'family') {
        return null
      } else {
        return 1
      }
    }),
    setParams: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn()
  },
  drafts: [draft],
  env: 'development',
  user: {
    token: ''
  },
  ...props
})

describe('Family Participant View', () => {
  let wrapper
  beforeEach(() => {
    const props = createTestProps()
    wrapper = shallow(<FamilyParticipant {...props} />)
  })

  describe('lifecycle', () => {
    describe('no saved draft', () => {
      it('creates universally unique draft identifier if there is no draftId', () => {
        expect(wrapper.instance().draftId).toEqual(
          expect.stringMatching(/[a-z0-9_.-].*/)
        )
      })

      it('creates a new draft on componentDidMount if such does not exist', () => {
        expect(wrapper.instance().props.createDraft).toHaveBeenCalledTimes(1)
      })
    })

    describe('created from a draft', () => {
      beforeEach(() => {
        const props = createTestProps({
          navigation: {
            navigate: jest.fn(),
            getParam: jest.fn(param => {
              if (param === 'draftId') {
                return 4
              } else {
                return null
              }
            }),
            setParams: jest.fn(),
            reset: jest.fn()
          },
          ...props
        })
        wrapper = shallow(<FamilyParticipant {...props} />)
      })

      it('sets draftId', () => {
        expect(wrapper.instance().draftId).toBe(4)
      })

      it('does not create a new draft on componentDidMount if such exists', () => {
        expect(wrapper.instance().props.createDraft).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('rendering', () => {
    it('renders the continue button with proper label', () => {
      expect(wrapper.find(StickyFooter)).toHaveProp({
        continueLabel: 'general.continue'
      })
    })
    it('renders TextInput', () => {
      expect(wrapper.find(TextInput)).toHaveLength(5)
    })
    it('renders Select', () => {
      expect(wrapper.find(Select)).toHaveLength(4)
    })
    it('renders DateInput', () => {
      expect(wrapper.find(DateInputComponent)).toHaveLength(1)
    })

    it('country select has preselected default country', () => {
      expect(wrapper.find('#country')).toHaveProp({ value: 'BG' })
    })

    it('sets proper TextInput value from draft', () => {
      const props = createTestProps({
        navigation: {
          navigate: jest.fn(),
          getParam: jest.fn(param => {
            if (param === 'draftId') {
              return 4
            } else {
              return null
            }
          }),
          setParams: jest.fn(),
          reset: jest.fn()
        },
        ...props
      })
      wrapper = shallow(<FamilyParticipant {...props} />)

      expect(
        wrapper
          .find(TextInput)
          .first()
          .props().value
      ).toBe('Juan')
    })
  })

  describe('functionality', () => {
    ////no idea how to avoid these tests

    // it('calls addSurveyFamilyMemberData on input change', () => {
    //   wrapper
    //     .find(TextInput)
    //     .first()
    //     .props()
    //     .onChangeText()

    //   expect(
    //     wrapper.instance().props.addSurveyFamilyMemberData
    //   ).toHaveBeenCalledTimes(1)
    // })
    // it('calls addSurveyFamilyMemberData on select change', () => {
    //   wrapper
    //     .find(Select)
    //     .first()
    //     .props()
    //     .onChange()

    //   expect(
    //     wrapper.instance().props.addSurveyFamilyMemberData
    //   ).toHaveBeenCalledTimes(1)
    // })

    // it('calls addSurveyFamilyMemberData on valid date input', () => {
    //   wrapper
    //     .find(DateInputComponent)
    //     .props()
    //     .onValidDate('January 21 1999')
    //   expect(
    //     wrapper.instance().props.addSurveyFamilyMemberData
    //   ).toHaveBeenCalledTimes(1)
    // })

    it('detects an error', () => {
      wrapper.instance().detectError(true, 'phoneNumber')
      expect(wrapper.instance().errorsDetected).toEqual(['phoneNumber'])
    })

    it('detects when the error is corrected', () => {
      wrapper.setState({ errorsDetected: ['phoneNumber'] })
      wrapper.instance().detectError(false, 'phoneNumber')
      expect(wrapper.instance().errorsDetected).toEqual([])
    })
  })
})

describe('Family Member Count Functionality', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps({
      navigation: {
        navigate: jest.fn(),
        getParam: jest.fn(param => {
          if (param === 'draftId') {
            return 4
          } else {
            return null
          }
        }),
        setParams: jest.fn(),
        reset: jest.fn(),
        isFocused: jest.fn()
      },
      drafts: [
        {
          draftId: 4,
          surveyId: 1,
          progress: {
            current: 2,
            total: 40
          },
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
      ]
    })
    wrapper = shallow(<FamilyParticipant {...props} />)
  })
  it('gives Select the proper value', () => {
    expect(wrapper.find('#familyMembersCount').props().value).toBe(2)
  })
  it('changes family members count', () => {
    wrapper
      .find('#familyMembersCount')
      .props()
      .onChange(4, 'familyMembersCount')

    expect(wrapper.instance().props.addSurveyData).toHaveBeenCalledTimes(1)
    expect(wrapper.instance().props.addSurveyData).toHaveBeenCalledWith(
      4,
      'familyData',
      {
        familyMembersCount: 4
      }
    )
  })
  it('remove excess family members when count is lowered', () => {
    wrapper
      .find('#familyMembersCount')
      .props()
      .onChange(1, 'familyMembersCount')

    expect(wrapper.instance().props.removeFamilyMembers).toHaveBeenCalledTimes(
      1
    )
    expect(wrapper.instance().props.removeFamilyMembers).toHaveBeenCalledWith(
      4,
      1
    )
  })
})

describe('Render optimization', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps()
    wrapper = shallow(<FamilyParticipant {...props} />)
  })
  it('checks if screen is focused before updating', () => {
    wrapper.setProps({
      drafts: [...wrapper.instance().props.drafts, { draftId: 5 }]
    })
    expect(wrapper.instance().props.navigation.isFocused).toHaveBeenCalledTimes(
      1
    )
  })
  it('updates screen if focused', () => {
    wrapper.setProps({
      drafts: [...wrapper.instance().props.drafts, { draftId: 5 }]
    })
    expect(wrapper.instance().props.drafts[1]).toEqual({ draftId: 5 })
  })
  it('does not update screen if not focused', () => {
    wrapper.setProps({
      drafts: [...wrapper.instance().props.drafts, { draftId: 5 }]
    })
    props = createTestProps({
      navigation: { ...props.navigation, isFocused: jest.fn(() => false) }
    })
    wrapper = shallow(<FamilyParticipant {...props} />)
    expect(wrapper.instance().props.drafts[1]).toBeFalsy()
  })
})
