// This is a modal + overlay that pops up from the bottom of the screen.
// This components is used in the indicators filters and select dropdowns.

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native'

export default class BottomModal extends Component {
  render() {
    const { isOpen, onRequestClose, children, onEmptyClose } = this.props
    return (
      <View>
        <Modal
          transparent={true}
          visible={isOpen}
          onRequestClose={onRequestClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.overlay,
              {
                backgroundColor: 'rgba(47,38,28, 0.2)'
              }
            ]}
          />
        </Modal>
        <Modal
          id="content"
          animationType="slide"
          transparent={true}
          visible={isOpen}
          onRequestClose={onRequestClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            id="overlay"
            style={styles.overlay}
            onPress={onEmptyClose}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
          />
          {children}
        </Modal>
      </View>
    )
  }
}

BottomModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onEmptyClose: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -200,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
