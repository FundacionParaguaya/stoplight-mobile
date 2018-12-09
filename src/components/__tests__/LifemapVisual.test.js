import React from 'react'
import { shallow } from 'enzyme'
import Icon from 'react-native-vector-icons/MaterialIcons'
import colors from '../../theme.json'
import LifemapVisual from '../LifemapVisual'

const createTestProps = props => ({
  ...props,
  questions: [
    { key: 'phoneNumber', value: 0 },
    { key: 'income', value: 3 },
    { key: 'electricity', value: 2 },
    { key: 'water', value: 1 }
  ],
  priorities: [{ indicator: 'water' }],
  achievements: [{ indicator: 'income' }]
})

describe('LifemapVisual Component', () => {
  let wrapper

  beforeEach(() => {
    const props = createTestProps()
    wrapper = shallow(<LifemapVisual {...props} />)
  })
  describe('rendering', () => {
    it('renders the appropriate number of icons', () => {
      expect(wrapper.find(Icon)).toHaveLength(6)
    })
    it('renders red color', () => {
      expect(
        wrapper
          .find(Icon)
          .at(0)
          .props().color
      ).toEqual(colors.palegrey)
    })
    it('renders green color', () => {
      expect(
        wrapper
          .find(Icon)
          .at(2)
          .props().color
      ).toEqual(colors.green)
    })

    it('renders yellow color', () => {
      expect(
        wrapper
          .find(Icon)
          .at(3)
          .props().color
      ).toEqual(colors.gold)
    })

    it('renders grey color', () => {
      expect(
        wrapper
          .find(Icon)
          .at(5)
          .props().color
      ).toEqual(colors.red)
    })
  })
})
