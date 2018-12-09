import React from 'react'

import { shallow } from 'enzyme'
import { TouchableOpacity, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import DraftListItem from '../DraftListItem'

const createTestProps = props => ({
  handleClick: jest.fn(),
  item: {
    draftId: 1,
    status: 'In progress',
    familyData: {
      familyMembersList: [
        {
          firstName: 'Juan', //mandatory
          lastName: 'Perez' //mandatory
        }
      ]
    },
    created: 1539971763946
  },
  ...props
})

describe('DraftListItem Component', () => {
  let wrapper
  let props
  beforeEach(() => {
    props = createTestProps()
    wrapper = shallow(<DraftListItem {...props} />)
  })

  describe('rendering', () => {
    it('renders <TouchableOpacity />', () => {
      expect(wrapper.find(TouchableOpacity)).toHaveLength(1)
    })
    it('renders <View />', () => {
      expect(wrapper.find(View)).toHaveLength(1)
    })
    it('renders <Text />', () => {
      expect(wrapper.find(Text)).toHaveLength(3)
    })
    it('renders <Icon />', () => {
      expect(wrapper.find(Icon)).toHaveLength(1)
    })
    it('renders the correct date in first Text component', () => {
      expect(
        wrapper
          .find(Text)
          .first()
          .props().children
      ).toEqual('Oct, 19 2018')
    })
    it('renders the correct name in last Text component', () => {
      expect(
        wrapper
          .find(Text)
          .at(1)
          .props().children
      ).toEqual(['Juan', ' ', 'Perez'])
    })
  })
  describe('functionality', () => {
    it('should call handleClick onPress', () => {
      wrapper
        .find(TouchableOpacity)
        .props()
        .onPress()
      expect(wrapper.instance().props.handleClick).toHaveBeenCalledTimes(1)
    })
    it('disables link when status is Synced', () => {
      props = createTestProps({
        item: {
          status: 'Synced',
          familyData: {
            familyMembersList: [
              {
                firstName: 'Juan', //mandatory
                lastName: 'Perez' //mandatory
              }
            ]
          }
        }
      })
      wrapper = shallow(<DraftListItem {...props} />)
      expect(wrapper.find(TouchableOpacity).props().disabled).toBe(true)
      expect(wrapper.find(Icon)).toHaveLength(0)
    })

    it('disables link when status is Pending', () => {
      props = createTestProps({
        item: {
          status: 'Pending sync',
          familyData: {
            familyMembersList: [
              {
                firstName: 'Juan', //mandatory
                lastName: 'Perez' //mandatory
              }
            ]
          }
        }
      })
      wrapper = shallow(<DraftListItem {...props} />)
      expect(wrapper.find(TouchableOpacity).props().disabled).toBe(true)
      expect(wrapper.find(Icon)).toHaveLength(0)
    })
    it('enables link when status is Error', () => {
      props = createTestProps({
        item: {
          status: 'Sync error',
          familyData: {
            familyMembersList: [
              {
                firstName: 'Juan', //mandatory
                lastName: 'Perez' //mandatory
              }
            ]
          }
        }
      })
      wrapper = shallow(<DraftListItem {...props} />)

      expect(wrapper.find(TouchableOpacity).props().disabled).toBe(false)
      expect(wrapper.find(Icon)).toHaveLength(1)
    })
  })
})
