import React from 'react';
import {View, StyleSheet, Text, Platform} from 'react-native';
import {withNamespaces} from 'react-i18next';
import Popup from '../../components/Popup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../theme.json';
import PropTypes from 'prop-types';

const DownloadModal = ({isOpen, onClose,title, subtitle}) => {
  return (
    <Popup
      style={{alignItems: 'center', justifyContent: 'center'}}
      isOpen={isOpen}
      onClose={() => onClose()}>
      <View>
        <Icon
          style={styles.closeIconStyle}
          size={20}
          name="close"
          onPress={() => onClose()}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}> {subtitle}</Text>
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  closeIconStyle: {
    color: colors.palegreen,
    fontSize: 24,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    maxHeight: 180,
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Poppins SemiBold',
      },
    }),
    fontWeight: 'normal',
    color: colors.lightdark,
    fontSize: 24,
    marginBottom: 25,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.lightdark,
    marginTop: 25,
    marginBottom: 16,
    textAlign: 'left',
  },
});

DownloadModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  t: PropTypes.func,
};

export default withNamespaces()(DownloadModal);
