import { StyleSheet, Text, View } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons'
import ListItem from '../ListItem';
import React from 'react';
import colors from '../../theme.json';
import globalStyles from '../../globalStyles';
import { withNamespaces } from 'react-i18next'

const styles = StyleSheet.create({
    view: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 20,
    },
    listItem: {
        minHeight: 80,
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between'
    },
    borderBottom: {
        borderBottomColor: colors.lightgrey,
        borderBottomWidth: 1,

    },
    error: {
        backgroundColor: colors.palered,
        color: colors.white
    },
    pending: {
        backgroundColor: colors.palegold,
        color: colors.black
    },
    label: {
        borderRadius: 5,
        alignSelf: 'flex-start',
        minWidth: 120,
        height: 25,
        paddingLeft: 5,
        paddingRight: 5,
        textAlign: 'center',
        marginTop: 5,
        marginRight: 5

    },
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icon: { transform: [{ rotate: '90deg' }], marginRight: 10 },

})

const SyncItem = ({
    title,
    subtitle,
    status,
    t
}) => {
    return (
        <ListItem
            style={{ ...styles.listItem, ...styles.borderBottom }}
            disabled={true}
        >
            <View style={styles.view}>
                <View>
                    <Text style={globalStyles.p}>{title}</Text>
                    <Text style={globalStyles.p}>{subtitle}</Text>
                    {status == 'Pending Status' &&
                        <Text style={[styles.label, styles.pending]}>{t('draftStatus.syncPending')}</Text>
                    }
                    {status == 'Sync Error' &&
                        <Text style={[styles.label, styles.error]}>{t('draftStatus.syncError')}</Text>
                    }
                </View>
            </View>

        </ListItem>
    )
}

export default withNamespaces()(SyncItem);