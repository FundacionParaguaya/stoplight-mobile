import React, { Component } from 'react'
import { StyleSheet, Text, TouchableHighlight } from 'react-native'

import PropTypes from 'prop-types'
import colors from '../theme.json'
import globalStyles from '../globalStyles'

class FamilyTab extends Component {
  render() {
    let width = '33%'
    if(this.props.full && this.props.interventionSkipped){
      width = '100%'
    }else if (!this.props.full && this.props.interventionSkipped ){
      width= '50%'
    }
    

    return (
      <TouchableHighlight
        style={{
          ...styles.tab,
          width: width,
          ...(this.props.active ? styles.activeTab : {})
        }}
        onPress={this.props.onPress}
        underlayColor={colors.white}
      >
        <Text numberOfLines={1} style={globalStyles.h3}>{this.props.title}</Text>
      </TouchableHighlight>
    )
  }
}

FamilyTab.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  active: PropTypes.bool,
  full: PropTypes.bool,
  interventionSkipped: PropTypes.bool
}

export default FamilyTab

const styles = StyleSheet.create({
  tab: {
    //width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeTab: { borderBottomColor: colors.grey, borderBottomWidth: 3 }
})
