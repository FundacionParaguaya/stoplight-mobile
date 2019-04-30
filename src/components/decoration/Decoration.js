import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet } from 'react-native'
import Orb from './Orb'
import colors from '../../theme.json'

export default class Decoration extends Component {
  render() {
    const { variation } = this.props
    return (
      <View style={styles.container}>
        {variation === 'lifemap' && (
          <View>
            <View style={[styles.ballsContainer, { zIndex: 3 }]}>
              <View>
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: 50, y: -95 }}
                />
              </View>
            </View>
            <View style={[styles.ballsContainer, { zIndex: 1 }]}>
              <View>
                <Orb
                  size={25}
                  color={colors.palered}
                  position={{ x: -93, y: -86 }}
                />
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: -180, y: 0 }}
                />
                <Orb
                  size={45}
                  color={colors.palegreen}
                  position={{ x: 165, y: -100 }}
                />
                <Orb
                  size={45}
                  color={colors.palegreen}
                  position={{ x: -35, y: 30 }}
                />
                <Orb
                  size={15}
                  color={colors.palered}
                  position={{ x: 120, y: 40 }}
                />
              </View>
            </View>
            <View style={styles.childContainer}>{this.props.children}</View>
          </View>
        )}
        {variation === 'familyMemberNamesHeader' && (
          <View style={{ zIndex: -1, marginTop: -15 }}>
            <View style={[styles.ballsContainer, { zIndex: 1 }]}>
              <View>
                <Orb
                  size={30}
                  color={colors.palered}
                  position={{ x: -110, y: -45 }}
                />
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: -196, y: 60 }}
                />
                <Orb
                  size={45}
                  color={colors.palegreen}
                  position={{ x: 155, y: -38 }}
                />
                <Orb
                  size={20}
                  color={colors.palered}
                  position={{ x: 130, y: 68 }}
                />
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: 40, y: -60 }}
                />
              </View>
            </View>
            <View style={styles.childContainer}>{this.props.children}</View>
          </View>
        )}
        {variation === 'familyMemberNamesBody' && (
          <View style={{ zIndex: -1 }}>
            <View style={[styles.ballsContainer, { zIndex: -1 }]}>
              <View>
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: -200, y: 210 }}
                />
                <Orb
                  size={45}
                  color={colors.palegreen}
                  position={{ x: 155, y: 100 }}
                />
                <Orb
                  size={45}
                  color={colors.palegreen}
                  position={{ x: -60, y: 255 }}
                />
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: 50, y: 110 }}
                />
                <Orb
                  size={15}
                  color={colors.palered}
                  position={{ x: 125, y: 220 }}
                />
              </View>
            </View>
          </View>
        )}
        {variation === 'primaryParticipant' && (
          <View style={{ zIndex: -1 }}>
            <View style={[styles.ballsContainer, { zIndex: 1 }]}>
              <View>
                <Orb
                  size={15}
                  color={colors.palered}
                  position={{ x: 155, y: 40 }}
                />
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: -180, y: 15 }}
                />
                <Orb
                  size={25}
                  color={colors.palered}
                  position={{ x: -115, y: -45 }}
                />
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: 50, y: -55 }}
                />
                <Orb
                  size={45}
                  color={colors.palegreen}
                  position={{ x: 155, y: -55 }}
                />
              </View>
            </View>
            <View style={styles.childContainer}>{this.props.children}</View>
          </View>
        )}
        {variation === 'terms' && (
          <View>
            <View style={[styles.ballsContainer, { zIndex: 3 }]}>
              <View>
                <Orb
                  size={35}
                  color={colors.palegold}
                  position={{ x: 45, y: -100 }}
                />
              </View>
            </View>
            <View style={[styles.ballsContainer, { zIndex: 1 }]}>
              <View>
                <Orb
                  size={25}
                  color={colors.palered}
                  position={{ x: -100, y: -90 }}
                />
                <Orb
                  size={45}
                  color={colors.palegreen}
                  position={{ x: -45, y: 35 }}
                />
                <Orb
                  size={15}
                  color={colors.palegreen}
                  position={{ x: 120, y: -40 }}
                />
              </View>
            </View>
            <View style={styles.childContainer}>{this.props.children}</View>
          </View>
        )}
        {!variation && (
          <View>
            <View style={[styles.ballsContainer, { zIndex: 1 }]}>
              <View>
                <Orb
                  animated
                  size={35}
                  color={colors.gold}
                  position={{ x: 90, y: -100 }}
                />
                <Orb
                  animated
                  size={25}
                  color={colors.red}
                  position={{ x: -100, y: -90 }}
                />
                <Orb
                  animated
                  size={35}
                  color={colors.gold}
                  position={{ x: -160, y: 0 }}
                />
                <Orb
                  animated
                  size={45}
                  color={colors.gold}
                  position={{ x: 160, y: -40 }}
                />
                <Orb
                  animated
                  size={45}
                  color={colors.red}
                  position={{ x: -50, y: 60 }}
                />
                <Orb
                  animated
                  size={15}
                  color={colors.red}
                  position={{ x: 120, y: 40 }}
                />
              </View>
            </View>
            <View style={styles.childContainer}>{this.props.children}</View>
          </View>
        )}
      </View>
    )
  }
}

Decoration.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  variation: PropTypes.string
}

const styles = StyleSheet.create({
  ballsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  childContainer: {
    zIndex: 2
  }
})
