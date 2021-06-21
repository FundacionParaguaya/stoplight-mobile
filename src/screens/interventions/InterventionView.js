import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {CheckBox} from 'react-native-elements';
import {Chip} from 'react-native-elements/dist/buttons/Chip';
import DateInput from '../../components/form/DateInput';
import PropTypes from 'prop-types';
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

    let values = [];
    if (interventionData.status) {
      interventionDefinition.questions.forEach((question) => {
        let item;

        const element = interventionData.values.find(
          (el) => el.codeName === question.codeName,
        );

        let valueToAdd = '';

       

        if (question.answerType === 'checkbox') {
          let preJoinedArray = element.multipleText.slice();
          if (element.other) {
            preJoinedArray.push(element.other);
          }
          valueToAdd = preJoinedArray.join(',');
        }else if(question.answerType === 'select') {
          valueToAdd = element.other ? element.other : element.value;
        } else if (question.answerType == 'radio') {
          valueToAdd = element.other ? element.other : element.value;
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
    } else {
      interventionDefinition.questions.forEach((question) => {
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
            }).filter(item => item !== undefined);
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
    }

    setValues(values);
  }, []);
  return (
    <ScrollView
      contentContainerStyle={{backgroundColor: colors.white, paddingTop: 20}}>
      {values.map((item, index) => {
        if (
          item.answerType == 'text' ||
          item.answerType == 'number' ||
          item.answerType == 'radio' ||
          item.answerType == 'checkbox' ||
          item.answerType == 'select'
        ) {
          return (
            <TextInput
              key={index}
              id={item.codeName}
              placeholder={item.shortName}
              readOnly={true}
              initialValue={item.value}
              onChangeText={() =>{}}
            />
          );
        }

        if (item.answerType === 'boolean' && item.value) {
          return (
            <CheckBox
              key={index}
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
            <React.Fragment key={index}>
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
                  ? item.value.map((value, index) => (
                      <Chip
                        key={index}
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
            </React.Fragment>
          );
        }

        if (item.answerType == 'date') {
          return (
            <DateInput
              key={index}
              label={item.shortName}
              initialValue={item.value || null}
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

InterventionView.propTypes = {
  route: PropTypes.object.isRequired,
  interventionDefinition: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(InterventionView);
