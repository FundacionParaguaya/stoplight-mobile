import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import ListItem from '../components/ListItem';
import colors from '../theme.json';
import globalStyles from '../globalStyles';
import {withNamespaces} from 'react-i18next';

const styles = StyleSheet.create({
  content: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
    flex: 1
  },
  listItem: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: colors.palegrey,
    borderBottomWidth: 1,
  },
  listItemContainer: {
    alignItems: 'baseline',
    flexDirection: 'column',
    flexWrap: 'wrap',
    flex: 1,
  },
  p: {
    paddingRight: 20,
    alignSelf: 'center',
  },
  completeLabel: {
    marginTop: 5,
    backgroundColor: colors.palegreen,
    paddingHorizontal: 10,
    marginHorizontal: 2,
    borderRadius: 10,
    color: 'white',
    alignSelf: 'flex-start',
  },
  pendingLabel: {
    marginTop: 5,
    backgroundColor: colors.grey,
    paddingHorizontal: 10,
    marginHorizontal: 2,
    borderRadius: 10,
    color: 'white',
    alignSelf: 'flex-start',
  },
  errorLabel: {
    marginTop: 5,
    backgroundColor: colors.red,
    paddingHorizontal: 10,
    marginHorizontal: 2,
    borderRadius: 10,
    color: 'white',
    alignSelf: 'flex-start',
  },
});

const InterventionList = ({
  interventionsData,
  handleGoIntervention,
  handleAddIntervention,
  syncInterventions,
  snapshot,
  t,
}) => {
  const [expandedIndex, setExpandedIndex] = useState();

  let interventions = []

  let originalInterventions = [];
  interventionsData.forEach((intervention) => {
    //if the intervention it's not associated with another it's an original one
    if (!intervention.intervention) {
      originalInterventions.push({
        ...intervention,
        relatedInterventions: [],
      });
    } else {
      let inter = intervention;
      let ogId = originalInterventions.findIndex(
        (oi) => !!oi.intervention && oi.intervention.id === inter.id,
      );
      // cycle used to associated a related intervention with it's original one
      // it was originally possible thought that interventions could have a tree format
      while (ogId < 0) {
        // eslint-disable-next-line no-loop-func
        inter = interventionsData.find(
          (int) => int.id === inter.intervention.id,
        );
        // eslint-disable-next-line no-loop-func
        ogId = originalInterventions.findIndex(
          // eslint-disable-next-line no-loop-func
          (oi) =>
            (inter.intervention && oi.id === inter.intervention.id) ||
            oi.id === inter.id,
        );
        if (!inter) break;
      }
      if (ogId >= 0)
        originalInterventions[ogId].relatedInterventions.push(intervention);
    }
  });

  syncInterventions
    .filter((syncIntervention) => (syncIntervention.snapshot === snapshot ) && (interventionsData.findIndex( i => i.interventionName === syncIntervention.id) < 0))
    .forEach((intervention) => {
      if (!intervention.relatedIntervention) {
        originalInterventions.push({
          ...intervention,
          relatedInterventions: [],
        });
      } else {
        const ogId = originalInterventions.findIndex(
          (oi) => oi.id === intervention.relatedIntervention,
        );
        if (ogId >= 0) {
          originalInterventions[ogId].relatedInterventions.push(
            intervention,
          );
        }
      }
    });

  interventions =  originalInterventions || [];

  return (
    <View style={styles.content}>
      {interventions.map((intervention, index) => (
        <>
          <ListItem key={index} style={styles.listItem} onPress={() => handleGoIntervention(intervention)}>
            <View style={styles.listItemContainer}>
              <Text style={{...globalStyles.p}}>
                {intervention.interventionName ? intervention.interventionName: intervention.id}
              </Text>
              {intervention.status === 'Sync Error' && (
                <Text style={styles.errorLabel}>
                  {t('views.family.syncErrorIntervention')}
                </Text>
              )}
              {intervention.status === 'Pending Status' && (
                <Text style={styles.pendingLabel}>
                  {t('views.family.syncPendingIntervention')}
                </Text>
              )}

              {intervention.status === 'Synced' && (
                <Text style={styles.completeLabel}>
                  {' '}
                  {t('views.family.syncComplete')}
                </Text>
              )}
            </View>
            {(!intervention.status) && (
              <Icon
                name="playlist-add"
                size={23}
                color={colors.grey}
                onPress={() => {
                  handleAddIntervention(intervention.id);
                }}
              />
            )}

            {intervention.relatedInterventions.length > 0 && (
              <>
                {expandedIndex === index ? (
                  <Icon
                    name="expand-less"
                    size={23}
                    color={colors.grey}
                    onPress={() => {
                      setExpandedIndex(null);
                    }}
                  />
                ) : (
                  <Icon
                    name="expand-more"
                    size={23}
                    color={colors.grey}
                    onPress={() => setExpandedIndex(index)}
                  />
                )}
              </>
            )}
          </ListItem>
          {expandedIndex === index && (
            <>
              {intervention.relatedInterventions.map((intervention ,index) => (
                <ListItem key={index} style={styles.listItem}>
                  <View style={{...styles.listItemContainer, paddingLeft: 20}}>
                    <Text style={{...globalStyles.p}}>
                      {intervention.interventionName
                        ? intervention.interventionName
                        : intervention.id}
                    </Text>
                    {intervention.status === 'Sync Error' && (
                      <Text style={styles.errorLabel}>
                        {t('views.family.syncErrorIntervention')}
                      </Text>
                    )}
                    {intervention.status === 'Pending Status' && (
                      <Text style={styles.pendingLabel}>
                        {t('views.family.syncPendingIntervention')}
                      </Text>
                    )}

                    {intervention.status === 'Synced' && (
                      <Text style={styles.completeLabel}>
                        {t('views.family.syncComplete')}
                      </Text>
                    )}
                  </View>
                </ListItem>
              ))}
            </>
          )}
        </>
      ))}
    </View>
  );
};

export default withNamespaces()(InterventionList);
