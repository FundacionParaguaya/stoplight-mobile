import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import uuid from 'uuid/v1';

import Button from '../../components/Button';
import Decoration from '../../components/decoration/Decoration';
import DateInput from '../../components/form/DateInput';
import Select from '../../components/form/Select';
import TextInput from '../../components/form/TextInput';
import Popup from '../../components/Popup';
import StickyFooter from '../../components/StickyFooter';
import globalStyles from '../../globalStyles';
import {updateDraft} from '../../redux/actions';
import colors from '../../theme.json';
import {getTotalScreens, setValidationSchema} from './helpers';
import {calculateProgressBar} from '../utils/helpers';

export class FamilyMembersNames extends Component {
  survey = this.props.route.params.survey;
  readOnly = this.props.route.params.readOnly;
  draftId = this.props.route.params.draftId;

  requiredFields =
    (this.survey && this.survey.surveyConfig &&
      this.survey.surveyConfig.requiredFields &&
      this.survey.surveyConfig.requiredFields.primaryParticipant) ||
    null;

  state = {
    errors: [],
    showErrors: false,
    familyMembers: [],
    isOpen: false,
    deleteMembersContinue: false,
  };

  getDraft = () =>
    this.props.drafts.find((draft) => draft.draftId === this.draftId);

  setError = (error, field, memberId) => {
    const {errors} = this.state;
    let errorExists = false;
    for (let errorIndex in errors) {
      if (errors[errorIndex].memberId == memberId) {
        errorExists = true;
        break;
      }
    }

    if (!error) {
      this.setState({
       errors: errors.filter((item) => (
         (item.memberId !== memberId ) 
       || (item.memberId == memberId && item.field != field && field != null))),
      });
    } else if (error && !errorExists) {
      this.setState((previousState) => {
        return {
          ...previousState,
          errors: [...previousState.errors, {field, memberId}],
        };
      });
    }
  };

  validateForm = () => {
    if (this.state.errors.length ) {
      this.setState({
        showErrors: true,
      });
    } else {
      this.onContinue();
    }
  };

  onPressBack = () => {
    this.props.navigation.navigate('FamilyParticipant', {
      draftId: this.draftId,
      survey: this.survey,
    });
  };

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }
  deleteMember = function (index) {
    const draft = this.getDraft();

    let newArr = [...this.state.familyMembers];
    const memberUUID = newArr[index].uuid;
    this.setError(false,null,memberUUID)
    newArr.splice(index, 1);
    this.setState({
      familyMembers: newArr,
    });

    let familyMembersList = draft.familyData.familyMembersList;
    var newCount = draft.familyData.countFamilyMembers;

    if (
      familyMembersList.length < draft.familyData.countFamilyMembers ||
      familyMembersList.length == draft.familyData.countFamilyMembers
    ) {
      newCount -= 1;
    }
    familyMembersList.splice(index, 1);

    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        countFamilyMembers: newCount,
        familyMembersList,
      },
    });
  };

  onContinue = () => {
    const draft = this.getDraft();

    if (
      draft.familyData.familyMembersList.length >
      draft.familyData.countFamilyMembers
    ) {
      this.setState({
        isOpen: true,
        deleteMembersContinue: true,
      });
    } else {
      this.props.navigation.replace('Location', {
        draftId: this.draftId,
        survey: this.survey,
      });
    }
  };
  addMember = () => {
    const draft = this.getDraft();

    let newArr = [...this.state.familyMembers];
    let newUUid = uuid();
    newArr.push({firstParticipant: false, uuid: newUUid,socioEconomicAnswers: []});
    this.setState({
      familyMembers: newArr,
    });

    let familyMembersList = draft.familyData.familyMembersList;

    familyMembersList.push({firstParticipant: false, uuid: newUUid, socioEconomicAnswers: []});
    var familyMemberCount = draft.familyData.countFamilyMembers;

    if (
      draft.familyData.familyMembersList.length >
      draft.familyData.countFamilyMembers
    ) {
      familyMemberCount += 1;
    }
    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        countFamilyMembers: familyMemberCount,
        familyMembersList,
      },
    });
  };
  updateMember = (value, memberField, memberIndex) => {
    if (!memberField) {
      return;
    }

    const draft = this.getDraft();
    this.setState({
      familyMembers: Object.assign([], this.state.familyMembers, {
        [memberIndex]: {
          ...this.state.familyMembers[memberIndex],
          firstParticipant: false,
          [memberField]: value,
        },
      }),
    });

    this.props.updateDraft({
      ...draft,
      familyData: {
        ...draft.familyData,
        familyMembersList: Object.assign(
          [],
          draft.familyData.familyMembersList,
          {
            [memberIndex]: {
              ...draft.familyData.familyMembersList[memberIndex],
              firstParticipant: false,
              [memberField]: value,
            },
          },
        ),
      },
    });
  };

  componentDidMount() {
    const draft = this.getDraft();
    var familyMembers = [];

    for (var member in draft.familyData.familyMembersList) {
      draft.familyData.familyMembersList[member].uuid = uuid();
      draft.familyData.familyMembersList[member].socioEconomicAnswers = [];

      familyMembers.push(draft.familyData.familyMembersList[member]);
    }

    for (var memberIndex in familyMembers) {
      familyMembers[memberIndex].uuid = uuid();
      familyMembers[memberIndex].socioEconomicAnswers = [];
    }
    var haveMoreMembers =
      draft.familyData.familyMembersList.length >
      draft.familyData.countFamilyMembers;

    this.setState({
      familyMembers,
      isOpen: haveMoreMembers,
    });

    if (!this.readOnly && draft.progress.screen !== 'FamilyMembersNames') {
      this.props.updateDraft({
        ...draft,
        progress: {
          ...draft.progress,
          screen: 'FamilyMembersNames',
          total: getTotalScreens(this.survey),
        },
      });
    }

    this.props.navigation.setParams({
      onPressBack: this.onPressBack,
    })
  }

  render() {
    const {t} = this.props;
    const {showErrors} = this.state;
    const draft = this.getDraft();
    const {familyMembersList} = draft.familyData;

    return (
      <StickyFooter
        onContinue={this.validateForm}
        continueLabel={t('general.continue')}
        readOnly={!!this.readOnly}
        progress={calculateProgressBar({readOnly:this.readOnly,draft:draft,screen:2})}>
        <Popup
          isOpen={this.state.isOpen}
          onClose={() => this.setState({isOpen: false})}>
          <View style={{paddingVertical: 60}}>
            <View>
              <View>
                <Text style={styles.paragraph}>
                  {this.state.deleteMembersContinue
                    ? t('views.family.membersDontMatch')
                    : t('views.family.deleteMembers')}
                </Text>
              </View>

              <Button
                outlined
                borderColor={colors.palegreen}
                text={t('general.gotIt')}
                style={styles.closeButton}
                handleClick={() => this.setState({isOpen: false})}
              />
            </View>
          </View>
        </Popup>

        <Decoration variation="familyMemberNamesHeader">
          <View style={styles.circleContainer}>
            <Text style={styles.circle}>+{familyMembersList.length}</Text>
            <Icon
              name="face"
              color={colors.grey}
              size={61}
              style={styles.icon}
            />
          </View>
          <Text style={[globalStyles.h2Bold, styles.heading]}>
            {t('views.family.familyMembersHeading')}
          </Text>
        </Decoration>

        {this.state.familyMembers.map((item, i) => {
          if (!item.firstParticipant) {
            return (
              <View style={{marginBottom: 20}} key={`${item.uuid}`}>
                {/*  {i % 2 ? (
                  <Decoration variation="familyMemberNamesBody" />
                ) : null} */}
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                    marginBottom: 15,
                  }}>
                  <Icon name="face" color={colors.grey} size={22} />
                  <Text
                    style={{
                      ...globalStyles.h2Bold,
                      fontSize: 16,
                      color: colors.grey,
                      marginLeft: 5,
                    }}>
                    {`${t('views.family.familyMember')} ${i + 1}`}
                  </Text>

                  <TouchableHighlight
                    underlayColor={'transparent'}
                    activeOpacity={1}
                    onPress={() => this.deleteMember(i)}
                    accessible={true}
                    style={{marginLeft: 'auto'}}>
                    <View
                      style={{
                        borderColor: colors.palered,
                        borderRadius: 100,
                        borderWidth: 1.5,
                      }}>
                      <Icon name="remove" color={colors.palered} size={26} />
                    </View>
                  </TouchableHighlight>
                </View>
                <TextInput
                  id={item.uuid}
                  autoFocus={i === 0 && !item.firstName}
                  upperCase
                  //validation="string"
                  onChangeText={(value) =>
                    this.updateMember(value, 'firstName', i)
                  }
                  placeholder={`${t('views.family.firstName')}`}
                  initialValue={item.firstName || ''}
                  required={setValidationSchema(
                    this.requiredFields,
                    'firstName',
                    true,
                  )}
                  readOnly={!!this.readOnly}
                  showErrors={showErrors}
                  setError={(isError) =>
                    this.setError(isError, 'firstName', item.uuid)
                  }
                />
                <Select
                  onChange={(value) => this.updateMember(value, 'gender', i)}
                  label={t('views.family.gender')}
                  placeholder={t('views.family.selectGender')}
                  initialValue={item.gender || ''}
                  options={this.survey && this.survey.surveyConfig.gender}
                  required={setValidationSchema(
                    this.requiredFields,
                    'gender',
                    false,
                  )}
                  otherField={`${item.customGender}`}
                  otherPlaceholder={t('views.family.specifyGender')}
                  initialOtherValue={item.customGender || ''}
                  readOnly={!!this.readOnly}
                  showErrors={showErrors}
                />

                <DateInput
                  id={item.uuid}
                  label={t('views.family.dateOfBirth')}
                  onValidDate={(value) =>
                    this.updateMember(value, 'birthDate', i)
                  }
                  initialValue={item.birthDate}
                  required={setValidationSchema(
                    this.requiredFields,
                    'birthDate',
                    false,
                  )}
                  setError={(isError) => this.setError(isError, 'birthDate',item.uuid)}
                  readOnly={!!this.readOnly}
                  showErrors={showErrors}
                />
              </View>
            );
          }
        })}

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 25,
          }}>
          <View
            style={{
              borderColor: colors.green,
              borderRadius: 120,
              borderWidth: 2,
              marginBottom: 5,
            }}>
            <Icon
              onPress={() => this.addMember()}
              name="add"
              color={colors.green}
              size={22}
            />
          </View>
          <Text
            onPress={() => this.addMember()}
            style={{
              ...globalStyles.h2Bold,
              fontSize: 16,
              color: colors.green,
              marginLeft: 5,
            }}>
              {t('views.family.addNewMember')}
          </Text>
        </View>
      </StickyFooter>
    );
  }
}

const styles = StyleSheet.create({
  paragraph: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 22,
    color: `${colors.grey}`,
    marginBottom: 40,
    fontFamily: 'Poppins Medium',
  },
  icon: {
    alignSelf: 'center',
  },
  closeButton: {
    width: 120,
    alignSelf: 'center',
  },
  circleContainer: {
    // marginBottom: 10,
    marginTop: 20,
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    width: 22,
    height: 22,
    lineHeight: 22,
    left: '50%',
    textAlign: 'center',
    fontSize: 10,
    transform: [{translateX: 3}, {translateY: -3}],
    borderRadius: 50,
    backgroundColor: colors.lightgrey,
    zIndex: 1,
  },
  heading: {
    alignSelf: 'center',
    textAlign: 'center',
    paddingBottom: 25,
    paddingHorizontal: 20,
    color: colors.grey,
  },
});

FamilyMembersNames.propTypes = {
  drafts: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  updateDraft: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  updateDraft,
};

const mapStateToProps = ({drafts}) => ({drafts});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(FamilyMembersNames),
);
