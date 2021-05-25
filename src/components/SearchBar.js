import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { TextInput, StyleSheet, View, I18nManager } from 'react-native'

import colors from '../theme.json'

class SearchBar extends Component {
  render() {
    const { style, onChangeText, onSubmit, value } = this.props
    return (
      <View style={[style, styles.search]}>
        <Icon name="search" size={24} />
        <TextInput
          id="search-bar"
          style={styles.input}
          placeholder={this.props.placeholder}
          onChangeText={text => onChangeText(text)}
          onEndEditing={onSubmit}
          value={value}
          autoCapitalize="none"
        />
      </View>
    )
  }
}

SearchBar.propTypes = {
  style: PropTypes.object,
  onChangeText: PropTypes.func,
  onSubmit: PropTypes.func,
  value: PropTypes.string,
  placeholder: PropTypes.string
}

export default SearchBar

const styles = StyleSheet.create({
  search: {
    alignItems: 'center',
    paddingHorizontal: 15.5,
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.lightgrey
  },
  input: {
    marginLeft: 18,
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 21,
    color: colors.lightdark,
    textAlign:I18nManager.isRTL ? 'right': 'left'
  }
})
