import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import globalStyles from '../globalStyles';
import AddPriorityAndAchievementModal from '../screens/modals/AddPriorityAndAchievementModal';
import LifemapOverviewListItem from './LifemapOverviewListItem';
import { useIsFocused } from '@react-navigation/native';



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  dimension: { ...globalStyles.h3, marginHorizontal: 20, marginVertical: 10, textAlign:'left' },
});

const LifemapOverview = ({
  surveyData,
  draftData,
  selectedFilter,
  syncPriorities,
  isRetake,
  readOnly,
  draftOverview
}) => {
  const dimensions = surveyData.map((item) => item.dimension);
  const [addAchievementOrPriority, setAddAchievementOrPriority] = useState(false);
  const [indicator, setIndicator] = useState('');
  const [color, setColor] = useState(0);
  const [indicatorText, setIndicatorText] = useState('');
  const isFocused = useIsFocused();

  const getColor = (codeName, previous) => {
    let indicator;

    if (draftData && draftData.indicatorSurveyDataList && !previous) {
      indicator = draftData.indicatorSurveyDataList.find(
        (item) => item.key === codeName,
      )
    } else if (draftData && draftData.previousIndicatorSurveyDataList && previous) {
      indicator = draftData.previousIndicatorSurveyDataList.find(
        (item) => item.key === codeName,
      )
    } else {
      indicator = null;
    }

    if (indicator) {
      return indicator.value;
    } else {
      return;
    }
  };

  const handleClick = (color, indicator, indicatorText) => {
    setAddAchievementOrPriority(true);
    setIndicator(indicator);
    setColor(color);
    setIndicatorText(indicatorText);
  }

  const onClose = () => {
    setAddAchievementOrPriority(false);
  };


  const filterByDimension = (item) =>
    surveyData.filter((indicator) => {
      const colorCode = getColor(indicator.codeName);
      if (selectedFilter === false) {
        return indicator.dimension === item && typeof colorCode === 'number';
      } else if (selectedFilter === 'priorities') {
        const priorities = draftData.priorities.map(
          (priority) => priority.indicator,
        );
        // Concact priorities of the family values with the priorities in added after last sync, remove duplicated entries if happens
        const snapPriorities = priorities.concat(
          draftData.indicatorSurveyDataList.filter(
            indicator => syncPriorities && syncPriorities.find(
              item => item.snapshotStoplightId == indicator.snapshotStoplightId )).map(
                priority => priority.key).filter(
                  (value,index,self)=>self.indexOf(value) === index))
   
        const achievements = draftData.achievements.map(
          (priority) => priority.indicator,
        );

        return (
          indicator.dimension === item &&
          (snapPriorities.includes(indicator.codeName) ||
            achievements.includes(indicator.codeName))
        );
      } else {
        return (
          indicator.dimension === item &&
          typeof colorCode === 'number' &&
          colorCode === selectedFilter
        );
      }
    });

  const checkSyncPriorityStatus = (codeName, prioritiesForSync, status) => {
    let indicator;
    let syncStatus = false;
    if (draftData && draftData.indicatorSurveyDataList && prioritiesForSync) {
      indicator = draftData.indicatorSurveyDataList.find(item =>
        item.key == codeName && item.snapshotStoplightId
      );
      if(indicator && indicator.snapshotStoplightId) {
        syncStatus = prioritiesForSync.
        filter(priority => priority.status == status).
        find(priority =>
          priority.snapshotStoplightId == indicator.snapshotStoplightId
        );
      }
     
      return syncStatus;
    }
    return syncStatus;
  };

  const priorities = draftData.priorities.map(
    (priority) => priority.indicator,
  );
  const achievements = draftData.achievements.map(
    (priority) => priority.indicator,
  );

  const previousPriorities = draftData.previousIndicatorPriorities && draftData.previousIndicatorPriorities.map(
    (priority) => priority.indicator,
  );

  const previousIndicatorAchievements = draftData.previousIndicatorAchievements && draftData.previousIndicatorAchievements.map(
    (priority) => priority.indicator,
  );



  return (
    <View style={styles.container}>
      { isFocused && <>
        {/* I am also passing the color because i have to visually display the circle color */}
        {addAchievementOrPriority ? (
          <AddPriorityAndAchievementModal
            readOnly = {!draftOverview }
            onClose={onClose}
            color={color}
            draft={draftData}
            indicator={indicator}
            indicatorText={indicatorText}
          />
        ) : null}
        {[...new Set(dimensions)].map((item,index) => (
          <View key={index}>
            {filterByDimension(item).length ? (
              <Text style={styles.dimension}>{item.toUpperCase()}</Text>
            ) : null}
            {filterByDimension(item).map((indicator) => (
              <LifemapOverviewListItem
                key={indicator.questionText}
                name={indicator.questionText}
                color={getColor(indicator.codeName)}
                errorPrioritySync={checkSyncPriorityStatus(indicator.codeName, syncPriorities, 'Sync Error')}
                pendingPrioritySync={checkSyncPriorityStatus(indicator.codeName, syncPriorities, 'Pending Status')}
                readOnly={readOnly}
                draftOverview={draftOverview}
                priority={priorities.includes(indicator.codeName) || checkSyncPriorityStatus(indicator.codeName, syncPriorities, 'Synced')}
                achievement={achievements.includes(indicator.codeName)}
                previousColor={getColor(indicator.codeName, true)}
                previousPriority={previousPriorities && previousPriorities.includes(indicator.codeName)}
                previousAchievement={previousIndicatorAchievements && previousIndicatorAchievements.includes(indicator.codeName)}
                isRetake={isRetake}
                handleClick={() =>
                  handleClick(
                    getColor(indicator.codeName),
                    indicator.codeName,
                    indicator.questionText,
                  )
                }
              />
            ))}
          </View>
        ))}

      </>}
    </View>


  )
}

LifemapOverview.propTypes = {
  surveyData: PropTypes.array.isRequired,
  draftData: PropTypes.object.isRequired,
  draftOverview: PropTypes.bool,
  selectedFilter: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
    PropTypes.string,
  ]),
};


export default LifemapOverview;
