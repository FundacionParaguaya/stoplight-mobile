import {StyleSheet, Text, View} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import React from 'react';
import colors from '../theme.json';
import globalStyles from '../globalStyles';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 25,
    borderRadius: 4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  message: {
    ...globalStyles.subline,
    maxWidth: '90%',
    paddingHorizontal: 10,
  },
});

const defineColor = (severity) => {
  switch (severity) {
    case 'warning':
      return colors.lightwarning;
    default:
      return colors.lightwarning;
  }
};

const defineColorIcon = (severity) => {
  switch (severity) {
    case 'warning':
      return colors.warning;
    default:
      return colors.warning;
  }
};

const defaultIconMapping = {
  warning: <Icon name="report-problem" size={24} color={colors.warning} />,
};

const Alert = ({message, icon, severity = 'warning', onClose}) => {
  return (
    <View
      style={{
        backgroundColor: defineColor(severity),
        ...styles.container,
      }}>
      <View style={styles.innerContainer}>
        {icon !== false && defaultIconMapping[severity]}
        <Text style={styles.message}>{message}</Text>
      </View>
      {onClose ? (
        <Icon
          name="close"
          size={24}
          color={defineColorIcon(severity)}
          onPress={onClose}
        />
      ) : null}
    </View>
  );
};

Alert.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.bool,
  severity:  PropTypes.string,
  onClose: PropTypes.func
}


export default Alert;
