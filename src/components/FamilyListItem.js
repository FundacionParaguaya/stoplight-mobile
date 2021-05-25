import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Text, StyleSheet, View, I18nManager} from 'react-native';
import ListItem from './ListItem';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../theme.json';
import globalStyles from '../globalStyles';

class FamilyListItem extends Component {
  render() {
    return (
      <ListItem style={{...styles.listItem}} onPress={this.props.handleClick}>
        {this.props.icon ? (
          <Icon
            name="face"
            style={styles.faceIcon}
            color={colors.grey}
            size={25}
          />
        ) : null}
        <View style={styles.listItemContainer}>
          <Text style={{...globalStyles.p, ...styles.p}}>
            {this.props.text}
          </Text>
        </View>
        <Icon style={{transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]}} name="navigate-next" size={23} color={colors.grey} />
      </ListItem>
    );
  }
}

FamilyListItem.propTypes = {
  icon: PropTypes.bool,
  text: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  listItem: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: colors.palegrey,
    borderBottomWidth: 1,
  },
  faceIcon: {
    marginRight: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },

  p: {
    paddingRight: 20,
    alignSelf: 'center',
  },
});

export default FamilyListItem;
