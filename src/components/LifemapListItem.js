import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, View } from 'react-native'
import ListItem from './ListItem'

import colors from '../theme.json'
import globalStyles from '../globalStyles'
class LifemapListItem extends Component {
  render() {
    return (
      <ListItem style={{ ...styles.listItem }} onPress={this.props.handleClick}>
        <View style={styles.listItemContainer}>
          <Text style={{ ...globalStyles.p, ...styles.p }}>
            {this.props.name}
          </Text>
        </View>
      </ListItem>
    )
  }
}

LifemapListItem.propTypes = {
  name: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  listItem: {
    height: 95,
    paddingLeft: 25,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  listItemContainer: {
    height: 95,
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1,
    marginLeft: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1
  },
  p: {
    paddingRight: 20,
    alignSelf: 'center'
  }
})

export default LifemapListItem
