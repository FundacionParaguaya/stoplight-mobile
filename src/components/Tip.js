import React, { Component } from 'react'
import { StyleSheet, Text, View, Modal } from 'react-native'
import PropTypes from 'prop-types'

import Button from './Button'
import colors from '../theme.json'
import globalStyles from '../globalStyles'
import i18n from '../i18n'

class Tip extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tipVisible: true
    }
  }

  hideTip() {
    this.setState({ tipVisible: false })
  }

  render() {
    return (
      <Modal
        transparent={true}
        visible={this.state.tipVisible}
        onRequestClose={this.hideTip}
        animationType="slide"
      >
        <View style={styles.container}>
          <View style={styles.tipview}>
            <Text
              style={{
                ...globalStyles.h3,
                ...styles.text
              }}
            >
              {this.props.title}
            </Text>
            <Text
              style={{
                ...globalStyles.p,
                ...styles.text
              }}
            >
              {this.props.description}
            </Text>
            <View
              style={{
                height: 48
              }}
            >
              <Button
                text={i18n.t('general.gotIt')}
                icon="done"
                handleClick={() => this.hideTip()}
              />
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}

Tip.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  tipview: {
    width: '100%',
    backgroundColor: colors.palegreen,
    padding: 25
  },
  text: {
    marginBottom: 16,
    color: colors.white,
    alignSelf: 'center'
  }
})

export default Tip
