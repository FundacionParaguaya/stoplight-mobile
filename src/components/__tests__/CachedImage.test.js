import React from 'react'
import { shallow } from 'enzyme'
import { Image, Platform } from 'react-native'
import { CachedImage } from '../CachedImage'

const createTestProps = props => ({
  ...props,
  source: 'some.url.png'
})

describe('CachedImage', () => {
  let wrapper
  let props
  describe('while checking net state', () => {
    beforeEach(() => {
      props = createTestProps()
      wrapper = shallow(<CachedImage {...props} />)
    })
    it('has proper initial state', () => {
      expect(wrapper).toHaveState({
        source: 'some.url.png'
      })
    })
  })
  describe('after net check', () => {
    beforeEach(async () => {
      props = createTestProps()
      wrapper = shallow(<CachedImage {...props} />)
      await wrapper.instance().componentDidMount()
    })

    it('renders <Image />', () => {
      expect(wrapper.find(Image)).toHaveLength(1)
    })

    it('sets proper source based on OS', () => {
      expect(wrapper.instance().getProperSourceForOS('some.url.png')).toEqual(
        Platform.OS === 'android' ? 'file://some.url.png' : 'some.url.png'
      )
      expect(wrapper.find(Image)).toHaveProp('source', {
        uri:
          Platform.OS === 'android' ? 'file://some.url.png' : 'foo/some.url.png'
      })
    })

    it('applies cached url of image is in cache', async () => {
      await wrapper.instance().updateSource(false)

      expect(wrapper).toHaveState({
        source: 'foo/some.url.png'
      })
    })
  })
})
