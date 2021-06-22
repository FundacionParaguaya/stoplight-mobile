import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/fr';

import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import ListItem from '../components/ListItem';
import PropTypes from 'prop-types';
import colors from '../theme.json';
import {getLocaleForLanguage} from '../utils';
import globalStyles from '../globalStyles';
import moment from 'moment';
import {withNamespaces} from 'react-i18next';

const styles = StyleSheet.create({
  content: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
    flex: 1,
  },
  listItem: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: colors.palegrey,
    borderBottomWidth: 1,
    paddingVertical:10
  },
  listItemContainer: {
    alignItems: 'baseline',
    flexDirection: 'column',
    flexWrap: 'wrap',
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  label: {
    borderRadius: 5,
    alignSelf: 'flex-start',
    height: 25,
    paddingLeft: 5,
    paddingRight: 5,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 5,
    marginRight: 5,
  },
  errorLabel: {
    borderRadius: 5,
    alignSelf: 'flex-start',
    height: 25,
    paddingLeft: 5,
    paddingRight: 5,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 5,
    marginRight: 5,
    backgroundColor: colors.red,
    color: 'white',
  },
});

const InterventionList = ({
  interventionsData,
  handleGoIntervention,
  handleAddIntervention,
  syncInterventions,
  snapshot,
  t,
  lang,
}) => {
  const [expandedIndex, setExpandedIndex] = useState();

  let interventions = [];

  const setStatusTitle = (status) => {
    switch (status) {
      case 'Pending Status':
        return t('views.family.syncPendingIntervention');
      case 'Sync Error':
        return t('views.family.syncErrorIntervention');
      case 'Synced':
        return t('views.family.syncComplete');
      default:
        return '';
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 'Pending Status':
        return colors.palegold;
      case 'Sync Error':
        return colors.error;
      case 'Synced':
        return colors.green;
      default:
        return colors.palegrey;
    }
  };

  let originalInterventions = [];
  interventionsData &&
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
          inter =
            interventionsData &&
            interventionsData.find((int) => int.id === inter.intervention.id);
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
    .filter(
      (syncIntervention) =>
        syncIntervention.snapshot === snapshot &&
        interventionsData &&
        interventionsData.findIndex(
          (i) => i.interventionName === syncIntervention.id,
        ) < 0,
    )
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
          originalInterventions[ogId].relatedInterventions.push(intervention);
        }
      }
    });

  interventions = originalInterventions || [];

  return (
    <View style={styles.content}>
      {interventions.map((intervention, index) => (
        <React.Fragment key={index}>
          <ListItem
            key={index}
            style={styles.listItem}
            onPress={() => handleGoIntervention(intervention)}>
            <View style={styles.listItemContainer}>
              <Text style={{...globalStyles.p}}>
                {intervention.interventionName
                  ? intervention.interventionName
                  : intervention.id}
              </Text>

              {intervention.status && intervention.status != 'Synced' && (
                <Text
                  style={{
                    ...styles.label,
                    backgroundColor: getColor(intervention.status),
                    color:
                      intervention.status === 'Pending Status'
                        ? colors.black
                        : colors.white,
                  }}>
                  {setStatusTitle(intervention.status)}
                </Text>
              )}

              {intervention.status == 'Synced' && (
                <View style={{...styles.container }}>
                  <Icon name="check" size={20} color={colors.green} />
                  <Text id="completed" style={{color: colors.green}}>
                    {t('views.family.syncComplete')}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text style={{color: colors.lightdark}}>
                {moment
                  .unix(
                    intervention.interventionDate
                      ? intervention.interventionDate
                      : intervention.values.find(
                          (e) => e.codeName === 'interventionDate',
                        ).value,
                  )
                  .locale(getLocaleForLanguage(lang))
                  .format('MMM DD, YYYY')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 5,
                }}>
                {!intervention.status && (
                  <Icon
                    name="playlist-add"
                    size={23}
                    color={colors.lightdark}
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
                        color={colors.lightdark}
                        onPress={() => {
                          setExpandedIndex(null);
                        }}
                      />
                    ) : (
                      <Icon
                        name="expand-more"
                        size={23}
                        color={colors.lightdark}
                        onPress={() => setExpandedIndex(index)}
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          </ListItem>
          {expandedIndex === index && (
            <>
              {intervention.relatedInterventions.map((intervention, index) => (
                <ListItem
                  key={index}
                  style={styles.listItem}
                  onPress={() => handleGoIntervention(intervention)}>
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

                    {intervention.status == 'Synced' && (
                      <View style={{...styles.container }}>
                        <Icon name="check" size={20} color={colors.green} />
                        <Text id="completed" style={{color: colors.green}}>
                          {t('views.family.syncComplete')}
                        </Text>
                      </View>
                    )}
                  </View>
                </ListItem>
              ))}
            </>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

InterventionList.propTypes = {
  interventionsData: PropTypes.array,
  handleGoIntervention: PropTypes.func,
  handleAddIntervention: PropTypes.func,
  syncInterventions: PropTypes.array,
  snapshot: PropTypes.number,
  t: PropTypes.func,
  lang: PropTypes.string,
};

export default withNamespaces()(InterventionList);
