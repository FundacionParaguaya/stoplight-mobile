import React from 'react'
import { shallow } from 'enzyme'
import { StatusBar } from 'react-native'
import { NavWrapper } from '../NavWrapper'
import { LoginStack, AppStack } from '../navigation'
import Loading from '../Loading'
import * as store from '../../redux/store'
import colors from '../../theme.json'

jest.useFakeTimers()

const createTestProps = props => ({
  user: { token: '' },
  ...props
})

describe('Navigation Wrapper', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps()
    wrapper = shallow(<NavWrapper {...props} />)
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('before rehydration', () => {
    it('displaye status bar with contrasting colors', () => {
      expect(wrapper.find(StatusBar)).toHaveProp({
        backgroundColor: colors.palebeige,
        barStyle: 'dark-content'
      })
    })
    it('checks for store hydration on mount', () => {
      expect(wrapper).toHaveState({
        rehydrated: false
      })
      const spy = jest.spyOn(wrapper.instance(), 'checkHydration')
      wrapper.instance().componentDidMount()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('renders ActivityIndicator if store is not hydrated', () => {
      expect(wrapper.find(Loading)).toHaveLength(1)
    })
  })

  describe('after rehydration', () => {
    beforeEach(() => {
      /* eslint-disable import/namespace */
      store.getHydrationState = () => true
      /* eslint-enable import/namespace */
      props = createTestProps()
      wrapper = shallow(<NavWrapper {...props} />)
    })

    it('sets proper state if store is rehydrated', () => {
      expect(wrapper).toHaveState({
        rehydrated: true
      })
    })

    it('renders <LoginStack /> stack if no token is available', () => {
      expect(wrapper.find(LoginStack)).toHaveLength(1)
    })

    it('renders <AppStack /> stack if there is a token in the store', () => {
      const props = createTestProps({ user: { token: '34423' }, ...props })
      const wrapper = shallow(<NavWrapper {...props} />)
      expect(wrapper.find(AppStack)).toHaveLength(1)
    })
    it('clears timers on unmount', () => {
      const spy = jest.spyOn(wrapper.instance(), 'clearTimers')

      wrapper.unmount()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
