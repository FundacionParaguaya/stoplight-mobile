import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import IconButton from '../components/IconButton'

class CloseButton extends Component {
  handlePress = () => {
    const { navigation } = this.props
    const draft =
      navigation.state.params.getCurrentDraftState &&
      navigation.getParam('getCurrentDraftState')()
    const isNewDraft =
      navigation.state.params.isNewDraft && navigation.getParam('isNewDraft')

    // open the exit modal with the params it needs
    this.props.navigation.navigate('ExitDraftModal', {
      draft,
      isNewDraft
    })
  }
  render() {
    return (
      <View>
        {this.props.navigation.state.routeName !== 'Final' ? (
          <IconButton
            style={this.props.style}
            onPress={this.handlePress}
            icon="close"
            size={25}
            accessible={true}
            accessibilityLabel={'Exit'}
          />
        ) : null}
      </View>
    )
  }
}

CloseButton.propTypes = {
  style: PropTypes.object,
  navigation: PropTypes.object.isRequired
}
export default CloseButton
