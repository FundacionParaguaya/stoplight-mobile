import React from 'react'
import { shallow } from 'enzyme'
import { ScrollView, TextInput, Text } from 'react-native'
import Button from '../../components/Button'
import { Login } from '../Login'
import Loading from '../../components/Loading'

const createTestProps = props => ({
  setEnv: jest.fn(),
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
    it('renders error message when user status is 401', async () => {
      props = createTestProps({ user: { status: 401 } })
      wrapper = shallow(<Login {...props} />)
      await wrapper.instance().onLogin()
      expect(wrapper.find(Text)).toHaveLength(5)
      expect(wrapper.find('#error-message')).toExist()
    })
    it('shows loading screen while loging in', () => {
      expect(wrapper.find(Loading)).toHaveLength(0)
      wrapper
        .find('#login-button')
        .props()
        .handleClick()

      expect(wrapper.find(Loading)).toHaveLength(1)
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

    it('sets the env to demo when username is demo', () => {
      wrapper
        .find('#username')
        .props()
        .onChangeText('demo')
      expect(wrapper.instance().props.setEnv).toHaveBeenCalledTimes(1)
      expect(wrapper.instance().props.setEnv).toHaveBeenCalledWith('demo')
    })

    it('clicking login calls login action', () => {
      wrapper
        .find('#login-button')
        .props()
        .handleClick()
      expect(wrapper.instance().props.login).toHaveBeenCalledTimes(1)
    })

    it('calls check connectivity function', () => {
      const spy = jest.spyOn(wrapper.instance(), 'checkConnectivity')
      wrapper.instance().checkConnectivity()
      expect(spy).toHaveBeenCalledTimes(1)
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
      expect(wrapper.instance().state.error).toBe(false)
    })
    it('sets the correct connectivity state when offline', async () => {
      wrapper.instance().setConnectivityState(false)
      wrapper.update()
      expect(wrapper.instance().state.connection).toBe(false)
      expect(wrapper.instance().state.error).toBe('No connection')
    })
    it('changes error state to correct message when user status is 401', async () => {
      props = createTestProps({ user: { status: 401 } })
      wrapper = shallow(<Login {...props} />)
      await wrapper.instance().checkConnectivity()
      await wrapper.instance().onLogin()
      expect(wrapper.instance().state.error).toBe('Wrong username or password')
    })
    it('changes error state to false when user status is 200', async () => {
      props = createTestProps({ user: { status: 200 } })
      wrapper = shallow(<Login {...props} />)
      await wrapper.instance().checkConnectivity()
      await wrapper.instance().onLogin()
      expect(wrapper.instance().state.error).toBe(false)
    })
  })
})
