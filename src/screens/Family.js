import NetInfo from '@react-native-community/netinfo';
import MapboxGL from '@react-native-mapbox-gl/maps';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import uuid from 'uuid/v1';

import mapPlaceholderLarge from '../../assets/images/map_placeholder_1000.png';
import marker from '../../assets/images/marker.png';
import Button from '../components/Button';
import FamilyListItem from '../components/FamilyListItem';
import FamilyTab from '../components/FamilyTab';
import RoundImage from '../components/RoundImage';
import {url} from '../config';
import globalStyles from '../globalStyles';
import {
  createDraft,
  submitDraft,
  submitDraftWithImages,
  submitPriority,
} from '../redux/actions';
import {getTotalScreens} from '../screens/lifemap/helpers';
import colors from '../theme.json';
import OverviewComponent from './lifemap/Overview';
import {prepareDraftForSubmit} from './utils/helpers';
import ProjectsPopup from '../components/ProjectsPopup';
import {isPortrait} from '../responsivenessHelpers';
import family from '../../assets/images/family.png';
import ProfileImages from '../components/ProfileImages';

export class Family extends Component {
  unsubscribeNetChange;
  allowRetake = this.props.route.params.allowRetake;
  familyLifemap = this.props.route.params.familyLifemap;
  project = this.props.route.params.familyProject;
  isDraft = this.props.route.params.isDraft;
  familyId = this.props.route.params.familyId;
  // extract socio economic categories from snapshot
  socioEconomicCategories = [
    ...new Set(
      this.props.route.params.survey
        ? this.props.route.params.survey.surveyEconomicQuestions.map(
            (question) => question.topic,
          )
        : [],
    ),
  ];

  onPressBack = () => {
    this.state.fromDashboard
      ? this.props.navigation.replace('DrawerStack')
      : this.props.navigation.replace('Families');
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      activeTab: this.props.route.params.activeTab || 'Details',
      showSyncButton: false,
      openProjectModal: false,
      fromDashboard: this.props.route.params.fromDashboard || false,
    };
  }
  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.forceUpdate();
    });
    // // monitor for connection changes
    this.unsubscribeNetChange = NetInfo.addEventListener((state) => {
      this.setState({isOnline: state.isConnected});
      //Allow to show or hide retrySyn button
      this.setState({showSyncButton: this.availableForSync(state.isConnected)});
      //this.syncPriorities(isOnline)
    });

    // check if online first
    NetInfo.fetch().then((state) => {
      this.setState({isOnline: state.isConnected});
      //this.syncPriorities(state.isConnected)
    });

    this.props.navigation.setParams({
      onPressBack: this.onPressBack,
      withoutCloseButton: true,
    });
  }

  sendEmail = async (email) => {
    let url = `mailto:${email}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    }
  };
  callPhone = async (phone) => {
    let url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    }
  };
  handleResumeClick = () => {
    const {navigation} = this.props;

    navigation.replace(this.familyLifemap.progress.screen, {
      draftId: this.familyLifemap.draftId,
      survey: this.survey,
      step: this.familyLifemap.progress.step,
      socioEconomics: this.familyLifemap.progress.socioEconomics,
    });
  };

  survey = this.props.surveys.find(
    (item) => item.id === this.familyLifemap.surveyId,
  );

  retrySync = () => {
    const id = this.familyLifemap.draftId;

    if (this.state.loading) {
      return;
    }

    if (this.props.syncStatus.indexOf(id) === -1) {
      console.log('starting manual sync ', id);
      this.setState({loading: true});
      this.prepareDraftForSubmit();
    } else {
      console.log('Not available to sync, already enqueue');
    }
  };

  syncPriorities = (isOnline) => {
    if (isOnline) {
      const pendingPriorities = this.props.priorities.filter(
        (priority) =>
          priority.status == 'Pending Status' ||
          priority.status == 'Sync Error',
      );
      pendingPriorities.forEach((priority) => {
        let sanitazedPriority = priority;
        delete sanitazedPriority.status;
        this.props.submitPriority(
          url[this.props.env],
          this.props.user.token,
          sanitazedPriority,
        );
      });
    }
  };

  availableForSync = (isOnline) => {
    const id = this.familyLifemap.draftId;
    if (
      this.props.syncStatus.indexOf(id) === -1 &&
      isOnline &&
      this.props.route.params.familyLifemap.status === 'Pending sync'
    ) {
      console.log('Available for manual sync');
      return true;
    } else {
      console.log('Not available to sync, already enqueue');
      return false;
    }
  };
  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }
  prepareDraftForSubmit() {
    if (this.state.loading) {
      const draft = prepareDraftForSubmit(this.familyLifemap, this.survey);

      if (draft.pictures && draft.pictures.length > 0) {
        this.props.submitDraftWithImages(
          url[this.props.env],
          this.props.user.token,
          draft.draftId,
          {
            ...draft,
            //sendEmail: this.state.sendEmailFlag
          },
        );
      } else {
        this.props.submitDraft(
          url[this.props.env],
          this.props.user.token,
          draft.draftId,
          {
            ...draft,
            pictures: [],
          },
        );
      }

      setTimeout(() => {
        this.props.navigation.navigate('Dashboard');
      }, 500);
    } else {
      setTimeout(() => {
        this.prepareDraftForSubmit();
      }, 200);
    }
  }

  componentWillUnmount() {
    this.unsubscribeNetChange();
  }

  handleClickOnRetake() {
    if (
      !!this.props.projects &&
      this.props.projects.filter((project) => project.active === true).length >
        0
    ) {
      this.setState({openProjectModal: true});
    } else {
      this.retakeSurvey(this.survey);
    }
  }

  toggleProjectModal = () => {
    this.setState({openProjectModal: !this.state.openProjectModal});
  };

  retakeSurvey = (survey, project) => {
    const draftId = uuid();

    const regularDraft = {
      project: project,
      draftId,
      stoplightSkipped: false,
      sign: '',
      pictures: [],
      sendEmail: false,
      created: Date.now(),
      status: 'Draft',
      surveyId: survey.id,
      surveyVersionId: survey.surveyVersionId,
      economicSurveyDataList: [],
      indicatorSurveyDataList: [],
      priorities: [],
      achievements: [],
      progress: {
        screen: 'Terms',
        total: getTotalScreens(survey),
      },
      familyData: {
        familyId: this.familyId,
        countFamilyMembers: this.familyLifemap.familyData.familyMembersList
          .length,
        familyMembersList: this.familyLifemap.familyData.familyMembersList.map(
          (member) => {
            return {
              ...member,
              socioEconomicAnswers: [],
            };
          },
        ),
      },
    };

    // create the new draft in redux
    this.props.createDraft(regularDraft);

    this.setState({openProjectModal: false}, () =>
      this.props.navigation.navigate('Terms', {
        page: 'terms',
        survey: survey,
        draftId,
        project,
      }),
    );
  };
  render() {
    const {activeTab} = this.state;
    const {t, navigation} = this.props;
    const {familyData, pictures, sign} = this.familyLifemap;
    const stoplightSkipped = this.familyLifemap.stoplightSkipped;
    const {width, height} = Dimensions.get('window');

    const email =
      familyData &&
      familyData.familyMembersList &&
      familyData.familyMembersList.length &&
      !!familyData.familyMembersList[0].email &&
      familyData.familyMembersList[0].email !== null &&
      familyData.familyMembersList[0].email.length
        ? familyData.familyMembersList[0].email
        : false;

    const phone =
      familyData &&
      familyData.familyMembersList &&
      familyData.familyMembersList.length &&
      !!familyData.familyMembersList[0].phoneNumber &&
      familyData.familyMembersList[0].phoneNumber !== null &&
      familyData.familyMembersList[0].phoneNumber.length
        ? familyData.familyMembersList[0].phoneNumber
        : false;

    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.container}>
        <View style={styles.tabs}>
          <FamilyTab
            title={t('views.family.details')}
            onPress={() => this.setState({activeTab: 'Details'})}
            active={activeTab === 'Details'}
            full={stoplightSkipped ? true : false}
          />
          {!stoplightSkipped && (
            <FamilyTab
              title={t('views.family.lifemap')}
              onPress={() => this.setState({activeTab: 'LifeMap'})}
              active={activeTab === 'LifeMap'}
            />
          )}
        </View>

        {/* Details tab */}
        {activeTab === 'Details' ? (
          <ScrollView>
            <ProjectsPopup
              isOpen={this.state.openProjectModal}
              afterSelect={(selectedSurvey, project) => {
                this.retakeSurvey(selectedSurvey, project);
              }}
              toggleModal={this.toggleProjectModal}
              selectedSurvey={this.survey}
              onClose={this.toggleProjectModal}
              projects={
                !!this.props.projects &&
                this.props.projects.filter((project) => project.active === true)
              }
            />
            <View>
              {!!familyData.latitude &&
              !!familyData.longitude &&
              !!this.state.isOnline ? (
                // Load Map
                <View style={{marginTop: -50}}>
                  <View pointerEvents="none" style={styles.fakeMarker}>
                    <Image source={marker} />
                  </View>
                  <MapboxGL.MapView
                    style={{width: '100%', height: 189}}
                    logoEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    scrollEnabled={false}
                    pitchEnabled={false}
                    onPress={() => {
                      navigation.navigate('Location', {
                        readOnly: true,
                        survey: this.survey,
                        family: this.familyLifemap,
                      });
                    }}>
                    <MapboxGL.Camera
                      defaultSettings={{
                        centerCoordinate: [
                          +familyData.longitude || 0,
                          +familyData.latitude || 0,
                        ],
                        zoomLevel: 15,
                      }}
                      centerCoordinate={[
                        +familyData.longitude || 0,
                        +familyData.latitude || 0,
                      ]}
                      minZoomLevel={10}
                      maxZoomLevel={15}
                    />
                  </MapboxGL.MapView>
                </View>
              ) : (
                // Load Map Image
                <TouchableHighlight
                  onPress={() => {
                    navigation.navigate('Location', {
                      readOnly: true,
                      survey: this.survey,
                      family: this.familyLifemap,
                    });
                  }}>
                  <Image
                    style={styles.imagePlaceholder}
                    source={mapPlaceholderLarge}
                  />
                </TouchableHighlight>
              )}
              <View style={styles.faceIconWrapper}>
                <View style={[styles.icon, {marginTop: -16}]}>
                  {familyData.countFamilyMembers > 1 && (
                    <View style={styles.countCircleWrapper}>
                      <View style={styles.countCircle}>
                        <Text
                          style={[globalStyles.h4, {color: colors.lightdark}]}>
                          + {familyData.countFamilyMembers - 1}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Icon
                    name="face"
                    style={styles.faceIcon}
                    color={colors.grey}
                    size={60}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={globalStyles.h2}>
                  {this.props.route.params.familyName}
                </Text>
              </View>
            </View>
            {phone || email ? (
              <View style={styles.familiesIcon}>
                {email ? (
                  <View style={styles.familiesIconContainer}>
                    <Icon
                      onPress={() => this.sendEmail(email)}
                      name="email"
                      style={styles.familiesIconIcon}
                      size={35}
                    />
                  </View>
                ) : null}
                {phone ? (
                  <View style={styles.familiesIconContainer}>
                    <Icon
                      onPress={() => this.callPhone(phone)}
                      name="phone"
                      style={styles.familiesIconIcon}
                      size={35}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
            {this.project ? (
              <View style={styles.section}>
                <View style={styles.content}>
                  <Text style={globalStyles.h3}>{`${t('views.project')}: ${
                    this.project
                  }`}</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.section}>
              <View style={styles.content}>
                <Text style={[globalStyles.h3, {color: colors.lightdark}]}>
                  {t('views.familyMembers').toUpperCase()}
                </Text>
                <FlatList
                  data={familyData.familyMembersList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <FamilyListItem
                      icon
                      text={`${item.firstName} ${!index ? item.lastName : ''}`}
                      handleClick={() => {
                        if (!index) {
                          navigation.navigate('FamilyParticipant', {
                            survey: this.survey,
                            family: this.familyLifemap,
                            readOnly: true,
                          });
                        } else {
                          console.log(item);
                          navigation.navigate('FamilyMember', {
                            survey: this.survey,
                            readOnly: true,
                            member: item,
                          });
                        }
                      }}
                    />
                  )}
                />
              </View>
            </View>
            <View style={styles.section}>
              <View style={styles.content}>
                <Text style={[globalStyles.h3, {color: colors.lightdark}]}>
                  {t('views.family.household').toUpperCase()}
                </Text>
                <FamilyListItem
                  text={t('views.location')}
                  handleClick={() => {
                    navigation.navigate('Location', {
                      survey: this.survey,
                      readOnly: true,
                      family: this.familyLifemap,
                    });
                  }}
                />
                {!this.isDraft
                  ? this.socioEconomicCategories.map((item, index) => (
                      <FamilyListItem
                        key={item}
                        text={item}
                        handleClick={() => {
                          navigation.navigate('SocioEconomicQuestion', {
                            family: this.familyLifemap,
                            page: index,
                            readOnly: true,
                            survey: this.survey,
                            title: item,
                          });
                        }}
                      />
                    ))
                  : null}
              </View>
            </View>

            <ProfileImages isPictures images={pictures} />
            <ProfileImages isSign images={sign} />

            {!!this.allowRetake && !!this.survey && (
              <Button
                style={styles.buttonSmall}
                text={t('views.retakeSurvey')}
                handleClick={() => this.handleClickOnRetake()}
              />
            )}
          </ScrollView>
        ) : null}

        {/* Lifemap tab */}

        {activeTab === 'LifeMap' ? (
          <ScrollView id="lifemap">
            {this.isDraft ? (
              <View>
                <View style={styles.draftContainer}>
                  <Text
                    style={{
                      ...styles.lifemapCreated,
                      ...globalStyles.h2Bold,
                      fontSize: 16,
                      marginBottom: 10,
                      textAlign: 'center',
                      color: '#000000',
                    }}>{`${t('views.family.lifeMapCreatedOn')}: \n${moment(
                    this.familyLifemap.created,
                  ).format('MMM DD, YYYY')}`}</Text>
                  <RoundImage source="lifemap" />

                  {this.props.route.params.familyLifemap.status &&
                  this.props.route.params.familyLifemap.status === 'Draft' ? (
                    <Button
                      id="resume-draft"
                      style={{
                        marginTop: 20,
                      }}
                      colored
                      text={t('general.resumeDraft')}
                      handleClick={() => this.handleResumeClick()}
                    />
                  ) : (
                    <View>
                      <Text
                        style={{
                          ...globalStyles.h2Bold,
                          ...{
                            textAlign: 'center',
                          },
                        }}>
                        {t('views.family.lifeMapAfterSync')}
                      </Text>
                      {this.state.showSyncButton && (
                        <Button
                          id="retry"
                          style={styles.button}
                          loading={this.state.loading}
                          text={t('views.synced')}
                          handleClick={this.retrySync}
                        />
                      )}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <ScrollView>
                <Text
                  style={{...styles.lifemapCreated, ...globalStyles.h3}}>{`${t(
                  'views.family.created',
                )}:  ${moment(this.familyLifemap.created).format(
                  'MMM DD, YYYY',
                )}`}</Text>
                {this.project ? (
                  <View style={styles.section}>
                    <View style={styles.content}>
                      <Text style={globalStyles.h3}>{`${t('views.project')}: ${
                        this.project
                      }`}</Text>
                    </View>
                  </View>
                ) : null}
                <OverviewComponent
                  route={this.props.route}
                  readOnly
                  navigation={navigation}
                  familyLifemap={this.familyLifemap}
                  fromDashboard={this.state.fromDashboard}
                />
              </ScrollView>
            )}
          </ScrollView>
        ) : null}
      </ScrollView>
    );
  }
}

Family.propTypes = {
  surveys: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  t: PropTypes.func,
  submitDraft: PropTypes.func.isRequired,
  submitDraftWithImages: PropTypes.func.isRequired,
  env: PropTypes.string.isRequired,
  createDraft: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  syncStatus: PropTypes.array,
};

const styles = StyleSheet.create({
  familiesIconContainer: {
    backgroundColor: '#50AA47',
    width: 55,
    height: 55,
    borderRadius: 50,
    marginRight: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSmall: {
    alignSelf: 'center',
    marginVertical: 20,
    maxWidth: 400,
    backgroundColor: '#50AA47',
    paddingLeft: 20,
    paddingRight: 20,
  },
  button: {
    alignSelf: 'center',
    marginVertical: 20,
    width: '100%',
    maxWidth: 400,

    backgroundColor: colors.palered,
  },
  familiesIconIcon: {
    margin: 'auto',
    color: 'white',
  },
  familiesIcon: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  tabs: {
    display: 'flex',
    flexDirection: 'row',
    height: 55,
    borderBottomColor: colors.lightgrey,
    borderBottomWidth: 1,
  },
  faceIcon: {
    textAlign: 'center',
    paddingTop: 30,
    paddingBottom: 15,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  countCircleWrapper: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  countCircle: {
    width: 22,
    height: 22,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{translateX: 13}, {translateY: -13}],
  },
  content: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
  },
  draftContainer: {
    paddingHorizontal: 25,
    marginTop: 70,
  },
  lifemapCreated: {
    marginHorizontal: 25,
    marginTop: 15,
    marginBottom: -10,
    zIndex: 10,
  },
  fakeMarker: {
    zIndex: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 10, //raise the marker so it's point, not center, marks the location
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceIconWrapper: {
    width: 92,
    height: 92,
    borderRadius: 100,
    marginBottom: 10,
    marginTop: -65,
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  imagePlaceholder: {
    width: '100%',
    height: 139,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 3,
    paddingTop: '100%',
  },
});
const mapDispatchToProps = {
  submitDraft,
  submitDraftWithImages,
  createDraft,
  submitPriority,
};
const mapStateToProps = ({
  surveys,
  env,
  user,
  drafts,
  syncStatus,
  projects,
  priorities,
}) => ({
  surveys,
  env,
  user,
  drafts,
  syncStatus,
  projects,
  priorities,
});

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Family),
);
