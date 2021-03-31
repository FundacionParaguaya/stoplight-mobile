import NetInfo from '@react-native-community/netinfo';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { StackActions } from '@react-navigation/native';
import {
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
  View,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import Button from '../../components/Button';
import LifemapVisual from '../../components/LifemapVisual';
import RoundImage from '../../components/RoundImage';
import { url } from '../../config';
import globalStyles from '../../globalStyles';
import {
  setDraftToPending,
  updateDraft
} from '../../redux/actions';
import EmailSentModal from '../modals/EmailSentModal';
import WhatsappSentModal from '../modals/WhatsappSentModal';
import { prepareDraftForSubmit } from '../utils/helpers';
import Bugsnag from '@bugsnag/react-native';

import {
  buildPDFOptions,
  buildPrintOptions,
  getReportTitle,
} from '../utils/pdfs';

export class Final extends Component {
  unsubscribeNetChange;
  survey = this.props.route.params.survey;
  draft = this.props.route.params.draft;
  state = {
    loading: false,
    downloading: false,
    printing: false,
    sendingEmail: false,
    sendingWhatsapp: false,
    modalOpen: false,
    whatsappModalOpen: false,
    mailSentError: false,
    whatsappSentError: false,
    connection: false,
    disabled: false,
    sendEmailFlag: false,
    whatsappNotification: false,
  };

  

  onPressBack = () => {
    //If sign support, the go to sign view
    if (this.survey.surveyConfig.signSupport) {
      this.props.navigation.navigate('Signin', {
        step: 0,
        survey: this.survey,
        draftId: this.draft.draftId,
      });
    } else if (this.survey.surveyConfig.pictureSupport) {
      this.props.navigation.navigate('Picture', {
        survey: this.survey,
        draftId: this.draft.draftId,
      });
    } else {
      //TODO check picture upload config
      if (this.draft.stoplightSkipped) {
        this.props.navigation.navigate('BeginLifemap', {
          survey: this.survey,
          draftId: this.draftId,
        });
      } else {
        this.props.navigation.replace('Priorities', {
          resumeDraft: false,
          draftId: this.draft.draftId,
          survey: this.survey,
        });
      }
    }
  };

  saveDraft = () => {
    this.setState({
      loading: true,
    });
    const updatedDraft = {
      ...this.draft,
      sendEmail: this.state.sendEmailFlag,
      whatsappNotification: this.state.whatsappNotification,
    }
    this.props.updateDraft(updatedDraft);
    this.prepareDraftForSubmit();
  };

  getProperSourceForOS(source) {
    return Platform.OS === 'android' ? 'file://' + source : '' + source
  }

  prepareDraftForSubmit() {
    if (this.state.loading) {
      let draftToLog = prepareDraftForSubmit(this.draft, this.survey);
      delete draftToLog["previousIndicatorSurveyDataList"];
      delete draftToLog["previousIndicatorPriorities"];
      delete draftToLog["previousIndicatorAchievements"];

      try {
        Bugsnag.notify(`Save Draft`, event => {
          event.addMetadata('draft', { draft: draftToLog });
          event.addMetadata('env', { env: this.props.env }),
            event.addMetadata('url', { url: url[this.props.env] })
          event.addMetadata('user', { user: this.props.user })
        });
      } catch (e) {
        console(e)
      }

      const draft = JSON.parse(JSON.stringify(draftToLog))

      this.props.setDraftToPending(draft.draftId);

      setTimeout(() => {
        this.props.navigation.dispatch(StackActions.replace('DrawerStack'));
      }, 500);
    } else {
      setTimeout(() => {
        this.prepareDraftForSubmit();
      }, 200);
    }
  }

  async exportPDF() {
    this.setState({ downloading: true });
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
      const fileName = getReportTitle(this.draft);
      const filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.pdf`;
      const pdfOptions = buildPDFOptions(
        this.draft,
        this.survey,
        this.props.lng || 'en',
        this.getProperSourceForOS(`${RNFetchBlob.fs.dirs.DocumentDir}/${this.props.user.organization.logoUrl.replace(/https?:\/\//, '')}`)
      );
      const pdf = await RNHTMLtoPDF.convert(pdfOptions);
      RNFetchBlob.fs
        .cp(pdf.filePath, filePath)
        .then(() =>
          RNFetchBlob.android.addCompleteDownload({
            title: `${fileName}.pdf`,
            description: 'Download complete',
            mime: 'application/pdf',
            path: filePath,
            showNotification: true,
          }),
        )
        .then(() =>
          RNFetchBlob.fs.scanFile([{ path: filePath, mime: 'application/pdf' }]),
        );

      this.setState({ downloading: false, filePath: pdf.filePath });
    } catch (error) {
      alert(error);
    }
  }

  async print() {
    this.setState({ printing: true });
    const options = buildPrintOptions(
      this.draft,
      this.survey,
      this.props.lng || 'en',
    );
    try {
      await RNPrint.print(options);
      this.setState({ printing: false });
    } catch (error) {
      alert(error);
    }
  }

  sendMailToUser() {
    this.setState({ sendingEmail: true, sendEmailFlag: true });

    setTimeout(() => {
      this.setState({ sendingEmail: false, modalOpen: true });
    }, 300);
  }

  sendWhatsappToUser() {
    this.setState({ sendingWhatsapp: true, whatsappNotification: true });

    setTimeout(() => {
      this.setState({ sendingWhatsapp: false, whatsappModalOpen: true });
    }, 300);
  }

  handleCloseModal = () =>
    this.setState({ modalOpen: false, whatsappModalOpen: false });

  setConnectivityState = (isConnected) => {
    isConnected
      ? this.setState({ connection: true, error: '' })
      : this.setState({ connection: false, error: 'No connection' });
  };

  shouldComponentUpdate() {
    return this.props.navigation.isFocused();
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onPressBack: this.onPressBack,
    });
    NetInfo.fetch().then((state) =>
      this.setConnectivityState(state.isConnected),
    );
    this.unsubscribeNetChange = NetInfo.addEventListener((state) => {
      this.setConnectivityState(state.isConnected);
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeNetChange) {
      this.unsubscribeNetChange();
    }
  }

  render() {
    const { t } = this.props;
    const {
      familyData: { familyMembersList },
    } = this.draft;

    const userEmail =
      !!familyMembersList &&
      familyMembersList.length &&
      familyMembersList.find((user) => user.email);

    const userTelephone =
      !!familyMembersList &&
      familyMembersList.length &&
      familyMembersList.find((user) => user.phoneNumber);

    const stoplightSkipped = this.draft.stoplightSkipped;
    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}>
        <View
          style={{
            ...globalStyles.container,
          }}>
          <Text style={{ ...globalStyles.h1, ...styles.text }}>
            {t('views.lifemap.great')}
          </Text>
          <Text
            style={{
              ...globalStyles.h3,
              ...styles.text,
              paddingBottom: 30,
            }}>
            {t('views.lifemap.youHaveCompletedTheLifemap')}
          </Text>
          <RoundImage source="partner" />
          {!stoplightSkipped && (
            <LifemapVisual
              bigMargin
              questions={this.draft.indicatorSurveyDataList}
              questionsLength={this.survey.surveyStoplightQuestions.length}
              priorities={this.draft.priorities}
              achievements={this.draft.achievements}
            />
          )}

          {!stoplightSkipped && (
            <View style={styles.buttonBar}>
              <Button
                id="download"
                style={styles.button}
                handleClick={this.exportPDF.bind(this)}
                icon="cloud-download"
                outlined
                text={t('general.download')}
                loading={this.state.downloading}
              />
              <Button
                id="print"
                style={styles.button}
                handleClick={this.print.bind(this)}
                icon="print"
                outlined
                text={t('general.print')}
                loading={this.state.printing}
              />
              {userEmail && (
                <Button
                  id="email"
                  style={{ ...styles.button, ...styles.emailButton }}
                  handleClick={this.sendMailToUser.bind(this)}
                  icon="email"
                  outlined
                  text={t('general.sendEmail')}
                  loading={this.state.sendingEmail}
                  disabled={this.state.disabled}
                />
              )}
              {userTelephone && (
                <Button
                  id="whatsapp"
                  style={{ ...styles.button, ...styles.emailButton }}
                  handleClick={this.sendWhatsappToUser.bind(this)}
                  outlined
                  communityIcon="whatsapp"
                  text={t('general.sendWhatsapp')}
                  loading={this.state.sendingWhatsapp}
                  disabled={this.state.disabled}
                />
              )}
            </View>
          )}
          <EmailSentModal
            close={this.handleCloseModal}
            isOpen={this.state.modalOpen}
            error={this.state.mailSentError}
            userIsOnline={this.state.connection}
          />
          <WhatsappSentModal
            close={this.handleCloseModal}
            isOpen={this.state.whatsappModalOpen}
            error={this.state.whatsappSentError}
            userIsOnline={this.state.connection}
          />
        </View>
        <View style={{ height: 50 }}>
          <Button
            id="save-draft"
            colored
            loading={this.state.loading}
            text={t('general.finish')}
            handleClick={this.saveDraft}
          />
        </View>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  text: {
    textAlign: 'center',
  },
  buttonBar: {
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  button: { width: '49%', alignSelf: 'center', marginTop: 20 },

  emailButton: {
    marginTop: 7,
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
  },
});

Final.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  updateDraft: PropTypes.func.isRequired,
  setDraftToPending: PropTypes.func.isRequired,
  env: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  lng: PropTypes.string.isRequired,
};

const mapStateToProps = ({ env, user }) => ({
  env,
  user,
});
const mapDispatchToProps = {
  setDraftToPending,
  updateDraft,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Final),
);
