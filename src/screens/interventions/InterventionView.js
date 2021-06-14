import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {CheckBox} from 'react-native-elements';
import {Chip} from 'react-native-elements/dist/buttons/Chip';
import DateInput from '../../components/form/DateInput';
import TextInput from '../../components/form/TextInput';
import colors from '../../theme.json';
import {connect} from 'react-redux';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 15,
    paddingBottom: 0,
  },
  label: {
    color: colors.grey,
    fontWeight: 'normal',
  },
  multiSelectContainer: {
    paddingLeft: 15,
    paddingRight: 25,
    paddingTop: 20,
    minHeight: 50,
    width: '90%',
    alignSelf: 'center',
    //backgroundColor: colors.black,
    borderBottomColor: colors.black,

    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomColor: colors.grey,
  },
});

const InterventionView = ({route, interventionDefinition}) => {
  const [values, setValues] = useState([]);

  useEffect(() => {
    let interventionData = route.params.intervention;
    let snapshot = route.params.draft;
    let survey = route.params.survey;
    //let draft = route.params.
    console.log('data', interventionData);
    /*     console.log('snap', snapshot);
    console.log('survey', survey); */
    let values = [];

    console.log('type', typeof interventionData.id == 'string');

    if (typeof interventionData.id == 'string') {
      interventionDefinition.questions.forEach((question) => {
        let item;

        const element = interventionData.values.find(
          (el) => el.codeName === question.codeName,
        );

        let valueToAdd = '';

        if (question.answerType === 'checkbox') {
          //console.log('antes de cargado', element.multipleText.slice())
          let preJoinedArray = element.multipleText.slice();
          if (element.other) {
            preJoinedArray.push(element.other);
            console.log('cargado', preJoinedArray);
          }
          valueToAdd = preJoinedArray.join(',');
        }else if (question.answerType == 'radio') {
            valueToAdd =  element.other ? element.other : element.value;
        
        } else if (
          question.answerType === 'multiselect' &&
          question.codeName === 'stoplightIndicator' &&
          interventionData.values.find(
            (el) => el.codeName === 'generalIntervention',
          ) &&
          interventionData.values.find(
            (el) => el.codeName === 'generalIntervention',
          ).value === false
        ) {
          console.log('entre aca');
          let preJoinedArray = element.multipleText.slice().map((e, index) => {
            return {value: element.multipleValue[index], label: e};
          });
          valueToAdd = preJoinedArray;
        } else {
          if (element.value) {
            valueToAdd = element.value;
          }
        }
        item = {
          codeName: question.codeName,
          shortName: question.shortName,
          value: valueToAdd,
          answerType: question.answerType,
        };

        values.push(item);
      });
    }

    if (typeof interventionData.id === 'number')
      interventionDefinition.questions.forEach((question) => {
        /*       console.log('q', question); */
        //vaules = intervention[question.codeName] ? {codeName: question.codeName,value:intervention[question.codeName],answerType:question.answerType}:null
        if (interventionData[question.codeName]) {
          let item;
          if (
            question.answerType === 'multiselect' &&
            question.codeName === 'stoplightIndicator' &&
            !interventionData['generalIntervention']
          ) {
            const indicators = interventionData[question.codeName].map((el) => {
              const option = question.options.find((e) => e.value === el);
              return option;
            });
            item = {
              codeName: question.codeName,
              shortName: question.shortName,
              value: indicators,
              answerType: question.answerType,
            };
          } else {
            item = {
              codeName: question.codeName,
              shortName: question.shortName,
              value: interventionData[question.codeName],
              answerType: question.answerType,
            };
          }

          values.push(item);
        }
      });
    console.log('values', values);
    setValues(values);
  }, []);
  return (
    <ScrollView
      contentContainerStyle={{backgroundColor: colors.white, paddingTop: 20}}>
      {values.map((item) => {
        if (
          item.answerType == 'text' ||
          item.answerType == 'number' ||
          item.answerType == 'radio' ||
          item.answerType == 'checkbox' ||
          item.answerType == 'select'
        ) {
          return (
            <TextInput
              id={item.codeName}
              placeholder={item.shortName}
              readOnly={true}
              initialValue={item.value}
            />
          );
        }

        if (item.answerType === 'boolean' && item.value) {
          return (
            <CheckBox
              title={item.shortName}
              checked={item.value}
              iconType="material"
              checkedIcon="check-box"
              uncheckedIcon="check-box-outline-blank"
              checkedColor={colors.green}
              textStyle={[styles.label]}
              containerStyle={styles.containerStyle}
            />
          );
        }

        if (item.answerType === 'multiselect' && item.value.length > 0) {
          return (
            <>
              <View
                style={{
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,

                  paddingLeft: 11,
                  paddingTop: 6,
                  paddingBottom: 6,
                }}>
                <Text
                  style={{
                    color: colors.grey,
                    fontSize: 14,
                    fontWeight: 'normal',
                    marginLeft: 15,
                    borderBottomColor: colors.black,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}>
                  {item.shortName}
                </Text>
              </View>
              <View style={styles.multiSelectContainer}>
                {item.value.length > 0
                  ? item.value.map((value) => (
                      <Chip
                        title={value.label}
                        buttonStyle={{
                          backgroundColor: colors.grey,
                          marginBottom: 5,
                          marginRight: 5,
                        }}
                      />
                    ))
                  : null}
              </View>
            </>
          );
        }

        if (item.answerType == 'date') {
          return (
            <DateInput
              label={item.shortName}
              initialValue={item.value}
              readOnly
              onValidDate={() => {}}
            />
          );
        }
      })}
    </ScrollView>
  );
};

const mapStateToProps = ({interventionDefinition}) => ({
  interventionDefinition,
});

export default connect(mapStateToProps)(InterventionView);
