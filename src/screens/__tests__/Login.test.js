import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, TextInput, Text } from 'react-native'
import Button from '../../components/Button'
import { Login } from '../Login'

const createTestProps = props => ({
  setEnv: jest.fn(),
  setSyncedState: jest.fn(),
  setDimensions: jest.fn(),
  login: jest.fn(() => new Promise(resolve => resolve(true))),
  env: 'production',
  user: { status: null },
  navigation: {
    navigate: arg => arg
  },
  ...props
})

describe('Login View', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps()
    wrapper = shallow(<Login {...props} />)

    wrapper.setState({ preparingScreen: false })
  })

  describe('rendering', () => {
    it('renders <ScrollView />', () => {
      expect(wrapper.find(ScrollView)).toHaveLength(1)
    })

    it('renders minimal login UI: <TextInput /> and <Button />', () => {
      expect(wrapper.find(TextInput)).toHaveLength(2)
      expect(wrapper.find(Text)).toHaveLength(4)
      expect(wrapper.find(Button)).toExist()
    })

    it('has proper initial state', () => {
      expect(wrapper).toHaveState({
        username: '',
        password: '',
        error: false,
        connection: false
      })
    })

    it('call setDimensions on mount', () => {
      expect(wrapper.instance().props.setDimensions).toHaveBeenCalledTimes(1)
    })

    it('renders error message when user status is 401', async () => {
      props = createTestProps({ user: { status: 401 } })
      wrapper = shallow(<Login {...props} />)
      await wrapper.instance().onLogin()
      expect(wrapper.find(Text)).toHaveLength(5)
      expect(wrapper.find('#error-message')).toExist()
    })
  })

  describe('functionality', () => {
    it('typing in credentials changes state', () => {
      wrapper
        .find('#username')
        .props()
        .onChangeText('Joe')

      wrapper
        .find('#password')
        .props()
        .onChangeText('Foo')

      expect(wrapper).toHaveState({
        username: 'Joe',
        password: 'Foo'
      })
    })

    it('clicking login calls login action', () => {
      wrapper
        .find('#login-button')
        .props()
        .handleClick()
      expect(wrapper.instance().props.login).toHaveBeenCalledTimes(1)
    })

    it('calls set connectivity state function', async () => {
      const spy = jest.spyOn(wrapper.instance(), 'setConnectivityState')
      wrapper.instance().setConnectivityState()
      wrapper.update()
      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('sets the correct connectivity state when online', async () => {
      wrapper.instance().setConnectivityState(true)
      wrapper.update()
      expect(wrapper.instance().state.connection).toBe(true)
      expect(wrapper.instance().state.error).toBe('')
    })
    it('sets the correct connectivity state when offline', async () => {
      wrapper.instance().setConnectivityState(false)
      wrapper.update()
      expect(wrapper.instance().state.connection).toBe(false)
      expect(wrapper.instance().state.error).toBe('No connection')
    })
  })
})
