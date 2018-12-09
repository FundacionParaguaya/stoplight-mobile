import React from 'react'
import { shallow } from 'enzyme'
import { Text } from 'react-native'
import { FormInput, FormValidationMessage } from 'react-native-elements'

import TextInput from '../TextInput'

const createTestProps = props => ({
  ...props,
  onChangeText: jest.fn(),
  detectError: jest.fn(),
  label: 'Some label',
  value: '',
  field: 'phoneNumber'
})

describe('TextInput Component', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps()
    wrapper = shallow(<TextInput {...props} />)
  })
  describe('rendering', () => {
    it('renders FormInput', () => {
      expect(wrapper.find(FormInput)).toHaveLength(1)
    })
    it('renders Text', () => {
      expect(wrapper.find(Text)).toHaveLength(2)
    })
    it('renders FormValidationMessage when there is an error', () => {
      wrapper.setState({ status: 'error', errorMsg: 'error' })
      expect(wrapper.find(FormValidationMessage)).toHaveLength(1)
    })
  })
  describe('functionality', () => {
    it('has the correct label', () => {
      expect(
        wrapper
          .find(Text)
          .first()
          .render()
          .text()
      ).toBe('Some label')
    })

    it('calls onChangeText when text is changed', () => {
      const spy = jest.spyOn(wrapper.instance(), 'onChangeText')
      wrapper
        .find(FormInput)
        .props()
        .onChangeText('Changed text')

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('has correct initial state', () => {
      expect(wrapper.instance().state).toEqual({
        text: '',
        status: 'blur',
        errorMsg: null
      })
    })

    it('changes text state when onChangeText is called', () => {
      wrapper
        .find(FormInput)
        .props()
        .onChangeText('Changed text')

      expect(wrapper.instance().state.text).toEqual('Changed text')
    })

    it('changes state to active when onFocus is called', () => {
      wrapper
        .find(FormInput)
        .props()
        .onFocus()

      expect(wrapper.instance().state.status).toEqual('active')
    })

    it('changes state to blur when onBlur is called', () => {
      wrapper.setState({ status: 'active' })
      wrapper
        .find(FormInput)
        .props()
        .onBlur()
      expect(wrapper.instance().state.status).toEqual('blur')
    })
  })
  describe('Input validation', () => {
    it('shows correct error message when input is required but empty', () => {
      props = createTestProps({ required: true, validation: 'string' })
      wrapper = shallow(<TextInput {...props} />)
      wrapper.setState({ status: 'error' })

      wrapper
        .find(FormInput)
        .props()
        .onBlur()

      expect(
        wrapper
          .find(FormValidationMessage)
          .render()
          .text()
      ).toBe('This field is required')
    })
  })

  it('shows correct error message when validation is email', () => {
    props = createTestProps({ required: true, validation: 'email' })
    wrapper = shallow(<TextInput {...props} />)
    wrapper.setState({ status: 'error', text: 'not an email' })

    wrapper
      .find(FormInput)
      .props()
      .onBlur()

    expect(
      wrapper
        .find(FormValidationMessage)
        .render()
        .text()
    ).toBe('Please enter a valid email address')
  })

  it('shows correct error message when validation is phoneNumber', () => {
    props = createTestProps({ required: true, validation: 'phoneNumber' })
    wrapper = shallow(<TextInput {...props} />)
    wrapper.setState({ status: 'error', text: 'not a phoneNumber' })

    wrapper
      .find(FormInput)
      .props()
      .onBlur()

    expect(
      wrapper
        .find(FormValidationMessage)
        .render()
        .text()
    ).toBe('Please enter a valid phone number')
  })

  it('shows correct error message when validation is number', () => {
    props = createTestProps({ required: true, validation: 'number' })
    wrapper = shallow(<TextInput {...props} />)
    wrapper.setState({ status: 'error', text: 'not a number' })

    wrapper
      .find(FormInput)
      .props()
      .onBlur()

    expect(
      wrapper
        .find(FormValidationMessage)
        .render()
        .text()
    ).toBe('Please enter a valid number')
  })

  it('calls function detectError when handleError is called', () => {
    wrapper.instance().handleError()
    expect(wrapper.instance().props.detectError).toHaveBeenCalledTimes(1)
  })
})
