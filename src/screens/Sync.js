import {
  ActivityIndicator,
  FlatList,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import React, {Component} from 'react';
import {
  createDraft,
  submitDraft,
  submitDraftWithImages,
  submitIntervention,
  submitPriority,
} from '../redux/actions';
import {fakeSurvey, prepareDraftForSubmit} from './utils/helpers';

import Button from '../components/Button';
import DownloadPopup from '../screens/modals/DownloadModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PhoneNumberUtil} from 'google-libphonenumber';
import PropTypes from 'prop-types';
import RNFetchBlob from 'rn-fetch-blob';
import SyncInProgress from '../components/sync/SyncInProgress';
import SyncIntervention from '../components/sync/SyncItem';
import SyncItem from '../components/sync/SyncItem';
import SyncListItem from '../components/sync/SyncListItem';
import SyncOffline from '../components/sync/SyncOffline';
import SyncPriority from '../components/sync/SyncPriority';
import SyncRetry from '../components/sync/SyncRetry';
import SyncUpToDate from '../components/sync/SyncUpToDate';
import colors from '../theme.json';
import {connect} from 'react-redux';
import globalStyles from '../globalStyles';
import {screenSyncScreenContent} from '../screens/utils/accessibilityHelpers';
import {url} from '../config';
import uuid from 'uuid/v1';
import {withNamespaces} from 'react-i18next';

// get env
const nodeEnv = process.env;

export class Sync extends Component {
  acessibleComponent = React.createRef();
  state = {
    loadingSync: false,
    surveysCount: null,
    openDownloadModal: false,
    existPspFolder: false,
  };
  navigateToDraft = (draft) => {
    if (
      draft.progress.screen !== 'Question' &&
      draft.progress.screen !== 'Skipped' &&
      draft.progress.screen !== 'Final' &&
      draft.progress.screen !== 'Overview'
    ) {
      this.props.navigation.navigate('Surveys', {
        screen: draft.progress.screen,
        params: {
          draftId: draft.draftId,
          survey: this.props.surveys.find(
            (survey) => survey.id === draft.surveyId,
          ),
          step: draft.progress.step,
          socioEconomics: draft.progress.socioEconomics,
        },
      });
    } else
      this.props.navigation.navigate('Surveys', {
        screen: 'Overview',
        params: {
          draftId: draft.draftId,
          survey: this.props.surveys.find(
            (survey) => survey.id === draft.surveyId,
          ),
          resumeDraft: true,
        },
      });
  };

  retrySubmittingAllPriorities = () => {
    const prioritiesWithError = this.props.priorities.filter(
      (priority) => priority.status == 'Sync Error',
    );

    prioritiesWithError.forEach((priority) => {
      let sanitazedPriority = priority;
      delete sanitazedPriority.status;
      this.props.submitPriority(
        url[this.props.env],
        this.props.user.token,
        sanitazedPriority,
      );
    });
  };

  retrySubmit = () => {
    this.retrySubmittingAllPriorities();
  };

  retrySubmitInterventions = () => {
    const interventionsWithError = this.props.interventions
      .filter((intervention) => intervention.status == 'Sync Error')
      .slice();

    interventionsWithError.forEach((i) => {
      this.props.submitIntervention(
        url[this.props.env],
        this.props.user.token,
        i,
      );
    });
  };

  getFamilyNameIntervention = (snapshot) => {
    const family = this.props.families.find((family) =>
      family.snapshotList.find((snap) => snap.id == snapshot),
    );

    if (!!family && family.name) {
      return family.name;
    }
    return '';
  };

  getFamilyName = (snapshotStoplightId) => {
    let indicator;
    let familyName;

    this.props.families.forEach((family) => {
      let snapShotData =
        family.snapshotList.length > 0
          ? family.snapshotList[family.snapshotList.length - 1]
          : family.snapshotList[0];
      !indicator
        ? (indicator = snapShotData.indicatorSurveyDataList.find(
            (item) => item.snapshotStoplightId === snapshotStoplightId,
          ))
        : null;

      !familyName && indicator ? (familyName = family.name) : null;
    });
    if (familyName) {
      return familyName;
    } else {
      return;
    }
  };

  getIndicator = (snapshotStoplightId) => {
    let indicator = null;
    let surveyIndicator = null;

    this.props.families.forEach((family) => {
      let snapShotData =
        family.snapshotList.length > 0
          ? family.snapshotList[family.snapshotList.length - 1]
          : family.snapshotList[0];

      if (!indicator) {
        indicator = snapShotData.indicatorSurveyDataList.find(
          (item) => item.snapshotStoplightId === snapshotStoplightId,
        );
        indicator
          ? (indicator = {...indicator, surveyId: snapShotData.surveyId})
          : null;
      }
    });

    const surveyData = this.props.surveys.find(
      (survey) => survey.id == indicator.surveyId,
    );
    !surveyIndicator
      ? (surveyIndicator = surveyData.surveyStoplightQuestions.find(
          (item) => item.codeName == indicator.key,
        ))
      : null;
    if (surveyIndicator) {
      return surveyIndicator.questionText;
    }
    return;
  };

  componentDidMount() {
    if (UIManager.AccessibilityEventTypes) {
      setTimeout(() => {
        UIManager.sendAccessibilityEvent(
          findNodeHandle(this.acessibleComponent.current),
          UIManager.AccessibilityEventTypes.typeViewFocused,
        );
      }, 1);
    }
  }

  onClickGenerate = async () => {
    if (this.state.surveysCount == null) return;

    const draftId = uuid();
    let i = 0;
    while (i < parseInt(this.state.surveysCount, 10)) {
      this.props.createDraft(fakeSurvey(draftId, Date.now()));
      i++;
    }
  };

  async exportJSON() {
    this.setState({loadingSync: true});
    const permissionsGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Permission to save file into the file storage',
        message:
          'The app needs access to your file storage so you can download the file',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (permissionsGranted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error();
    }

    try {
      const fileName = `BackupFile_${
        this.props.user ? this.props.user.username : 'user'
      }_${new Date().getTime() / 1000}`;
      let filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.json`;
      const pendingDraft = this.props.drafts.filter(
        (draft) =>
          draft.status == 'Pending sync' || draft.status == 'Pending images',
      );
      const errorStatus = this.props.drafts.filter(
        (draft) => draft.status == 'Sync error',
      );

      const rootDir = RNFetchBlob.fs.dirs.DownloadDir.replace('/Download', '');
      const existPspFolder = await RNFetchBlob.fs.isDir(`${rootDir}/Psp`);
      const existDownloadFolder = await RNFetchBlob.fs.isDir(
        RNFetchBlob.fs.dirs.DownloadDir,
      );

      if (!existDownloadFolder && !existPspFolder) {
        await RNFetchBlob.fs.mkdir(`${rootDir}/Psp`);
        filePath = `${rootDir}/Psp/${fileName}.json`;
      }

      if (existPspFolder) {
        filePath = `${rootDir}/Psp/${fileName}.json`;
      }

      let sanitizedPendingDrafts = [];
      let sanitizedErrorDrafts = [];

      pendingDraft.forEach((draft) => {
        const survey = this.props.surveys.find((el) => el.id == draft.surveyId);
        let sanitizedDraft;
        try {
          let formattedDraft = prepareDraftForSubmit(draft, survey);
          delete formattedDraft['previousIndicatorSurveyDataList'];
          delete formattedDraft['previousIndicatorPriorities'];
          delete formattedDraft['previousIndicatorAchievements'];
          delete formattedDraft['progress'];
          formattedDraft = JSON.parse(JSON.stringify(formattedDraft));
          sanitizedDraft = this.prepareSubmitDraft(formattedDraft);
        } catch (error) {
          sanitizedDraft = draft;
        }

        sanitizedPendingDrafts.push(sanitizedDraft);
      });

      errorStatus.forEach((draft) => {
        const survey = this.props.surveys.find((el) => el.id == draft.surveyId);
        let sanitizedDraft;
        try {
          let formattedDraft = prepareDraftForSubmit(draft, survey);
          delete formattedDraft['previousIndicatorSurveyDataList'];
          delete formattedDraft['previousIndicatorPriorities'];
          delete formattedDraft['previousIndicatorAchievements'];
          delete formattedDraft['progress'];
          formattedDraft = JSON.parse(JSON.stringify(formattedDraft));
          sanitizedDraft = this.prepareSubmitDraft(formattedDraft);
        } catch (error) {
          sanitizedDraft = draft;
        }
        sanitizedErrorDrafts.push(sanitizedDraft);
      });

      const json = {
        user: this.props.user,
        pendingStatus: sanitizedPendingDrafts,
        errorStatus: sanitizedErrorDrafts,
        env: this.props.env,
      };
      await RNFetchBlob.fs.createFile(filePath, JSON.stringify(json), 'utf8');
      this.toggleDownloadModal();
      if ((!existDownloadFolder && !existPspFolder) || existPspFolder) {
        this.setState({existPspFolder: true});
      } else {
        this.setState({existPspFolder: false});
      }

      this.setState({loadingSync: false});
    } catch (error) {
      console.log(error);
    }
  }

  formatPhone = (code, phone) => {
    if (code && phone && phone.length > 0) {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const international = '+' + code + ' ' + phone;
      let phoneNumber = phoneUtil.parse(international, code);
      phone = phoneNumber.getNationalNumber();
    }
    return phone;
  };

  prepareSubmitDraft(payload) {
    console.log('----Calling Submit Draft----');
    const sanitizedSnapshot = {...payload};

    let {economicSurveyDataList} = payload;

    const validEconomicIndicator = (ec) =>
      (ec.value !== null && ec.value !== undefined && ec.value !== '') ||
      (!!ec.multipleValue && ec.multipleValue.length > 0);

    economicSurveyDataList = economicSurveyDataList.filter(
      validEconomicIndicator,
    );
    sanitizedSnapshot.economicSurveyDataList = economicSurveyDataList;
    sanitizedSnapshot.familyData.familyMembersList.forEach((member) => {
      let {socioEconomicAnswers = []} = member;
      delete member.memberIdentifier;
      delete member.id;
      delete member.familyId;
      delete member.uuid;

      member.phoneNumber = this.formatPhone(
        member.phoneCode,
        member.phoneNumber,
      );
      socioEconomicAnswers = socioEconomicAnswers.filter(
        validEconomicIndicator,
      );
      // eslint-disable-next-line no-param-reassign
      member.socioEconomicAnswers = socioEconomicAnswers;
    });
    return sanitizedSnapshot;
  }

  toggleDownloadModal = () => {
    this.setState({openDownloadModal: !this.state.openDownloadModal});
  };
  render() {
    const {drafts, offline, priorities, interventions, t} = this.props;
    console.log('interventions', interventions);
    const lastSync = drafts.reduce(
      (lastSynced, item) =>
        item.syncedAt > lastSynced ? item.syncedAt : lastSynced,
      0,
    );

    const pendingDrafts = drafts.filter(
      (draft) =>
        draft.status == 'Pending sync' || draft.status == 'Pending images',
    );

    const draftsWithError = drafts.filter(
      (draft) => draft.status === 'Sync error',
    );

    const list = drafts.filter(
      (draft) =>
        draft.status === 'Sync error' ||
        draft.status === 'Pending sync' ||
        draft.status == 'Pending images',
    );

    const prioritiesWithError = priorities.filter(
      (priority) => priority.status == 'Sync Error',
    );
    const pendingPriorities = priorities.filter(
      (priority) => priority.status == 'Pending Status',
    );
    const prioritiesPendingOrError = priorities.filter(
      (priority) =>
        priority.status == 'Pending Status' || priority.status == 'Sync Error',
    );

    const interventionsWithError = interventions.filter(
      (intervention) => intervention.status === 'Sync Error',
    );

    const pendingInterventions = interventions.filter(
      (intervention) => intervention.status === 'Pending Status',
    );

    const interventionsPendingOrError = interventions.filter(
      (intervention) =>
        intervention.status === 'Pending Status' ||
        intervention.status === 'Sync Error',
    );

    const screenAccessibilityContent = screenSyncScreenContent(
      offline,
      pendingDrafts,
      draftsWithError,
      lastSync,
    );

    return (
      <ScrollView
        style={styles.view}
        contentContainerStyle={[globalStyles.container, {flex: 0}]}>
        <DownloadPopup
          isOpen={this.state.openDownloadModal}
          onClose={this.toggleDownloadModal}
          title={t('views.modals.finishDownload')}
          subtitle={t('views.modals.subtitleFinishDownload')}
          folder={this.state.existPspFolder ? 'Psp' : 'Download'}
        />
        {nodeEnv.NODE_ENV === 'development' && (
          <View
            style={{
              height: 120,
              alignSelf: 'stretch',
              marginBottom: 30,
              alignItems: 'center',
            }}>
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder={'Surveys Count'}
              onChangeText={(surveysCount) => this.setState({surveysCount})}
              style={{
                ...styles.input,
                borderColor: colors.palegreen,
              }}
              autoCapitalize="none"
            />

            <Button
              colored
              style={{
                maxWidth: 200,
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
              text={'Generate Surveys'}
              handleClick={() => this.onClickGenerate()}
            />
          </View>
        )}

        <View
          ref={this.acessibleComponent}
          accessible={true}
          accessibilityLabel={screenAccessibilityContent}>
          {offline.online &&
          !pendingDrafts.length &&
          !draftsWithError.length &&
          !prioritiesWithError.length &&
          !pendingPriorities.length &&
          !interventionsWithError.length &&
          !pendingInterventions.length ? (
            <SyncUpToDate date={lastSync} lng={this.props.lng} />
          ) : null}

          {!offline.online ? (
            <SyncOffline
              pendingDraftsLength={
                pendingDrafts.length + pendingPriorities.length
              }
            />
          ) : null}
        </View>
        {list.length ? (
          <View style={styles.downloadContainer}>
            <Text style={styles.download}>{t('views.sync.download')}</Text>
            {this.state.loadingSync ? (
              <ActivityIndicator size="small" color={colors.lightdark} />
            ) : (
              <Icon
                name="cloud-download"
                size={24}
                color={colors.lightdark}
                onPress={() => this.exportJSON()}
              />
            )}
          </View>
        ) : null}
        {list.length ? (
          <>
            <Text style={[globalStyles.h3Bold, {marginTop: 20}]}>
              {t('views.sync.families')}
            </Text>
            <FlatList
              style={{minHeight: 80,  marginBottom: 25}}
              data={list}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <SyncListItem
                  item={item}
                  status={item.status}
                  lng={this.props.lng}
                  handleClick={() => this.navigateToDraft(item)}
                  errors={item.errors || []}
                />
              )}
            />
          </>
        ) : null}

        {prioritiesPendingOrError.length ? (
          <>
            <Text style={[globalStyles.h3Bold, {marginTop: 10}]}>
              {t('views.lifemap.priorities')}
            </Text>
            <FlatList
              style={{minHeight: 80,  marginBottom: 10}}
              data={prioritiesPendingOrError}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <SyncItem
                  name={this.getIndicator(item.snapshotStoplightId)}
                  subtitle={this.getFamilyName(item.snapshotStoplightId)}
                  status={item.status}
                />
              )}
            />
          </>
        ) : null}
        {offline.online && prioritiesWithError.length ? (
          <SyncRetry
            withError={prioritiesWithError.length}
            retrySubmit={this.retrySubmit}
            type={'priority'}
          />
        ) : null}
        {offline.online && pendingPriorities.length ? (
          <SyncInProgress
            pendingDraftsLength={pendingPriorities.length}
            initial={pendingPriorities.length + prioritiesWithError.length}
          />
        ) : null}

        {interventionsPendingOrError.length ? (
          <React.Fragment>
            <Text style={[globalStyles.h3Bold, {marginTop: 10}]}>
              {t('views.family.interventions')}
            </Text>
            <FlatList
              style={{minHeight: 80,  marginBottom: 10}}
              data={interventionsPendingOrError}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <SyncItem
                  title={item.values[0].value}
                  subtitle={this.getFamilyNameIntervention(item.snapshot)}
                  status={item.status}
                />
              )}
            />
          </React.Fragment>
        ) : null}

        {offline.online && interventionsWithError.length ? (
          <SyncRetry
            withError={interventionsWithError.length}
            retrySubmit={this.retrySubmitInterventions}
            type={'intervention'}
          />
        ) : null}
        {offline.online && pendingInterventions.length ? (
          <SyncInProgress
            pendingDraftsLength={pendingInterventions.length}
            initial={
              pendingInterventions.length + interventionsWithError.length
            }
          />
        ) : null}
      </ScrollView>
    );
  }
}

Sync.propTypes = {
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
  offline: PropTypes.object.isRequired,
  lng: PropTypes.string.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  user: PropTypes.object.isRequired,
  surveys: PropTypes.array,
  submitDraft: PropTypes.func.isRequired,
  submitDraftWithImages: PropTypes.func.isRequired,
  priorities: PropTypes.array,
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: colors.white,
  },
  downloadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  input: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 400,
    width: '100%',
    fontSize: 16,
    fontFamily: 'Roboto',
    borderWidth: 1,
    borderRadius: 2,
    height: 48,
    marginBottom: 25,
    padding: 15,
    paddingBottom: 12,
    color: colors.lightdark,
    backgroundColor: colors.white,
  },
  download: {
    marginRight: 10,
    color: colors.lightdark,
  },
});

const mapStateToProps = ({
  drafts,
  offline,
  env,
  user,
  surveys,
  priorities,
  families,
  survey,
  language,
  interventions,
}) => ({
  drafts,
  offline,
  env,
  user,
  surveys,
  priorities,
  families,
  survey,
  language,
  interventions,
});

const mapDispatchToProps = {
  createDraft,
  submitDraft,
  submitDraftWithImages,
  submitPriority,
  submitIntervention,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Sync),
);
