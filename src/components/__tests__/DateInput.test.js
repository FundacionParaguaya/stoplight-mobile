import React from 'react'
import { shallow } from 'enzyme'
import { View, Picker, StyleSheet, Text } from 'react-native'
import TextInput from '../TextInput'
import Select from '../Select'
import { DateInput } from '../DateInput'

const createTestProps = props => ({
  ...props,
  onValidDate: jest.fn(),
  detectError: jest.fn(),
  t: jest.fn(),
  label: 'Some label',
  field: 'dateOfBirth'
})

describe('DateInput Component', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps()
    wrapper = shallow(<DateInput {...props} />)
  })
  describe('rendering', () => {
    it('renders Text', () => {
      expect(wrapper.find(Text)).toHaveLength(1)
    })
    it('renders Select', () => {
      expect(wrapper.find(Select)).toHaveLength(1)
    })
    it('renders TextInput', () => {
      expect(wrapper.find(TextInput)).toHaveLength(2)
    })
    it('renders Text when there is an error', () => {
      wrapper.setState({ error: true })
      expect(wrapper.find(Text)).toHaveLength(2)
    })
  })
  describe('functionality', () => {
    it('has the correct label', () => {
      expect(
        wrapper
          .find(Text)
          .render()
          .text()
      ).toBe('Some label')
    })

    it('has correct initial state', () => {
      expect(wrapper.instance().state).toEqual({
        day: '',
        month: '',
        year: '',
        error: false
      })
    })
    it('changes day state when setDay is called', () => {
      wrapper
        .find(TextInput)
        .first()
        .props()
        .onChangeText('5')

      expect(wrapper.instance().state.day).toEqual('5')
    })
    it('changes month state when setMonth is called', () => {
      wrapper
        .find(Select)
        .props()
        .onChange('December')

      expect(wrapper.instance().state.month).toEqual('December')
    })
    it('changes year state when setYear is called', () => {
      wrapper
        .find(TextInput)
        .last()
        .props()
        .onChangeText('2015')

      expect(wrapper.instance().state.year).toEqual('2015')
    })
  })
  describe('Date validation', () => {
    it('calls validateDate when setDay is called', () => {
      const spy = jest.spyOn(wrapper.instance(), 'validateDate')
      wrapper
        .find(TextInput)
        .first()
        .props()
        .onChangeText('5')

      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('calls validateDate when setMonth is called', () => {
      const spy = jest.spyOn(wrapper.instance(), 'validateDate')
      wrapper
        .find(Select)
        .props()
        .onChange('December')

      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('calls validateDate when setYear is called', () => {
      const spy = jest.spyOn(wrapper.instance(), 'validateDate')
      wrapper
        .find(TextInput)
        .last()
        .props()
        .onChangeText('2015')

      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('sets error state to true if date is invalid', () => {
      wrapper
        .instance()
        .validateDate({ year: '12345', day: '123', month: 'January' })

      expect(wrapper.instance().state.error).toBe(true)
    })
    it('sets error state to false if date is valid', () => {
      wrapper.setState({ error: true })
      wrapper
        .instance()
        .validateDate({ year: '2018', day: '12', month: 'January' })

      expect(wrapper.instance().state.error).toBe(false)
    })
    it('calls detectError if date is invalid', () => {
      wrapper
        .instance()
        .validateDate({ year: '12345', day: '123', month: 'January' })

      expect(wrapper.instance().props.detectError).toHaveBeenCalledTimes(1)
    })
    it('calls detectError with first argument true if date is invalid', () => {
      wrapper
        .instance()
        .validateDate({ year: '12345', day: '123', month: 'January' })

      expect(wrapper.instance().props.detectError).toHaveBeenCalledTimes(1)
      expect(wrapper.instance().props.detectError).toHaveBeenCalledWith(
        true,
        'dateOfBirth'
      )
    })
    it('calls detectError with first argument false if date is invalid', () => {
      wrapper
        .instance()
        .validateDate({ year: '2018', day: '12', month: 'January' })

      expect(wrapper.instance().props.detectError).toHaveBeenCalledTimes(1)
      expect(wrapper.instance().props.detectError).toHaveBeenCalledWith(
        false,
        'dateOfBirth'
      )
    })
    it('calls onValidDate with a first argument unix value for the date if date is valid', () => {
      wrapper
        .instance()
        .validateDate({ year: '2018', day: '12', month: 'January' })

      expect(wrapper.instance().props.onValidDate).toHaveBeenCalledTimes(1)
    })
  })

  describe('Get correct values for props.value', () => {

    it('Get correct year', () => {
      props = createTestProps({ value: 1515708000 })
      wrapper = shallow(<DateInput {...props} />)

      expect(
        wrapper
          .find(TextInput)
          .last()
          .props().value
      ).toBe('2018')
    })

    it('Get correct month', () => {
      props = createTestProps({ value: 1515708000 })
      wrapper = shallow(<DateInput {...props} />)

      expect(wrapper.find(Select).props().value).toBe('January')
    })
  })
})
