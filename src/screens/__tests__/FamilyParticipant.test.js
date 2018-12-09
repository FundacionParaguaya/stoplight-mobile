import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView } from 'react-native'
import { FamilyParticipant } from '../lifemap/FamilyParticipant'
import Select from '../../components/Select'
import DateInput from '../../components/DateInput'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import draft from '../__mocks__/draftMock.json'

const createTestProps = props => ({
  t: value => value,
  createDraft: jest.fn(),
  deleteDraft: jest.fn(),
  addSurveyFamilyMemberData: jest.fn(),
  navigation: {
    navigate: jest.fn(),
    getParam: param => (param === 'draft' ? null : 1),
    setParams: jest.fn(),
    reset: jest.fn()
  },
  drafts: [draft],
  surveys: [
    {
      id: 1,
      title: 'Dev Demo',
      survey_version_id: 2,
      surveyConfig: {
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
  ],
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

      it('sets proper surveyId when there is no draft', () => {
        expect(wrapper.instance().surveyId).toBe(1)
      })

      it('sets survey with surveyConfig', () => {
        expect(wrapper.instance().survey.id).toBe(1)
        expect(wrapper.instance().survey.title).toBe('Dev Demo')
        expect(wrapper.instance().survey.surveyConfig).toEqual(
          expect.any(Object)
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
            getParam: param => (param === 'draft' ? 4 : 1),
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

      it('sets proper surveyId when there is a draft', () => {
        expect(wrapper.instance().surveyId).toBe(1)
      })

      it('does not create a new draft on componentDidMount if such exists', () => {
        expect(wrapper.instance().props.createDraft).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('rendering', () => {
    it('renders base ScrollView', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })
    it('renders TextInput', () => {
      expect(wrapper.find(TextInput)).toHaveLength(5)
    })
    it('renders Select', () => {
      expect(wrapper.find(Select)).toHaveLength(3)
    })
    it('renders DateInput', () => {
      expect(wrapper.find(DateInput)).toHaveLength(1)
    })
    it('renders continue draft button', () => {
      expect(wrapper.find(Button)).toHaveLength(1)
    })

    it('sets proper TextInput value from draft', () => {
      const props = createTestProps({
        navigation: {
          navigate: jest.fn(),
          getParam: param => (param === 'draft' ? 4 : 1),
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
    it('calls addSurveyFamilyMemberData on input change', () => {
      wrapper
        .find(TextInput)
        .first()
        .props()
        .onChangeText()

      expect(
        wrapper.instance().props.addSurveyFamilyMemberData
      ).toHaveBeenCalledTimes(1)
    })
    it('calls addSurveyFamilyMemberData on select change', () => {
      wrapper
        .find(Select)
        .first()
        .props()
        .onChange()

      expect(
        wrapper.instance().props.addSurveyFamilyMemberData
      ).toHaveBeenCalledTimes(1)
    })

    it('calls addSurveyFamilyMemberData on valid date input', () => {
      wrapper
        .find(DateInput)
        .props()
        .onValidDate('January 21 1999')
      expect(
        wrapper.instance().props.addSurveyFamilyMemberData
      ).toHaveBeenCalledTimes(1)
    })

    it('calls navigator function on pressing Continue button', () => {
      wrapper
        .find(Button)
        .props()
        .handleClick()
      expect(
        wrapper.instance().props.navigation.navigate
      ).toHaveBeenCalledTimes(1)
    })

    it('detects an error', () => {
      wrapper.instance().detectError(true, 'phoneNumber')
      expect(wrapper.instance().errorsDetected).toEqual(['phoneNumber'])
    })

    it('detects when the error is corrected', () => {
      wrapper.setState({ errorsDetected: ['phoneNumber'] })
      wrapper.instance().detectError(false, 'phoneNumber')
      expect(wrapper.instance().errorsDetected).toEqual([])
    })
    it('deletes draft if first time in participant screen', () => {
      const props = createTestProps({
        navigation: {
          navigate: jest.fn(),
          getParam: param => (param === 'deleteDraft' ? true : 4),
          setParams: jest.fn(),
          reset: jest.fn(),
          state: {
            params: {
              deleteDraft: true
            }
          }
        },
        ...props
      })
      wrapper.instance().componentDidUpdate(props)

      expect(wrapper.instance().props.deleteDraft).toHaveBeenCalledTimes(1)
    })

    it('doesn\'t delete draft if visiting from Dashboard', () => {
      const props = createTestProps({
        navigation: {
          navigate: jest.fn(),
          getParam: param => (param === 'deleteDraft' ? false : 4),
          setParams: jest.fn(),
          reset: jest.fn(),
          state: {
            params: {
              deleteDraft: false
            }
          }
        },
        ...props
      })
      wrapper.instance().componentDidUpdate(props)

      expect(wrapper.instance().props.deleteDraft).toHaveBeenCalledTimes(0)
    })
  })
})
