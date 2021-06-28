import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, Vibration, View} from 'react-native';

import Alert from '../../components/Alert'
import Button from '../../components/Button';
import Decoration from '../../components/decoration/Decoration';
import ExitDraftModal from '../../screens/modals/ExitDraftModal';
import NoProdWarning from '../../components/NoProdWarning';
import PropTypes from 'prop-types';
import RoundImage from '../../components/RoundImage';
import colors from '../../theme.json';
import globalStyles from '../../globalStyles';
import {withNamespaces} from 'react-i18next';

// this describes which screen comes after which
const navigationRules = {
  terms: {
    nextPage: 'Privacy',
    param: 'privacy',
  },
  privacy: {
    nextPage: 'FamilyParticipant',
  },
};

const VIBRATION_DURATION = 120

export class Terms extends Component {
  state = {
    open: false,
  };
  survey = this.props.route.params.survey;
  page = this.props.route.params.page;
  draftId = this.props.route.params.draftId;
  project = this.props.route.params.project;

  vibrate = () => {
    Vibration ? Vibration.vibrate(VIBRATION_DURATION) : null
  }

  onClickAgree = () => {
    this.vibrate();
    const {navigation} = this.props;
    navigation.navigate(navigationRules[this.page].nextPage, {
      page: navigationRules[this.page].param || null,
      survey: this.survey,
      draftId: this.draftId,
      project: this.project
    });
  };

  render() {
    const {t} = this.props;

    const page = this.page;

    return (
      <View style={{flex: 1}}>
        <ExitDraftModal
          isOpen={this.state.open}
          navigation={this.props.navigation}
          route={this.props.route}
          close={() => {
            this.setState({open: false});
          }}
        />

        <ScrollView
          style={globalStyles.background}
          contentContainerStyle={styles.contentContainer}>
          <View style={globalStyles.container}>
            <Decoration variation="terms">
              <RoundImage source="check" />
            </Decoration>
            <View style={styles.warningContainer}>
            <NoProdWarning />
            </View>
            

            <Text id="title" style={[globalStyles.h3Bold, styles.heading]}>
              {page === 'terms'
                ? this.survey.termsConditions.title
                : this.survey.privacyPolicy.title}
            </Text>

            <Text id="content" style={[globalStyles.subline, styles.content]}>
              {page === 'terms' &&
                this.survey.termsConditions.text &&
                this.survey.termsConditions.text.replace(/\\n/g, '\n')}
              {page !== 'terms' &&
                this.survey.privacyPolicy.text &&
                this.survey.privacyPolicy.text.replace(/\\n/g, '\n')}
            </Text>
          </View>
          <View style={styles.buttonsBar}>
            <Button
              id="dissagree"
              text={t('general.disagree')}
              underlined
              handleClick={() => this.setState({open: true})}
            />
            <Button
              id="agree"
              colored
              text={t('general.agree')}
              handleClick={this.onClickAgree}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  heading: {
    color: colors.dark,
    textAlign: 'center',
  },
  content: {
    marginTop: 25,
    textAlign: 'justify',
  },
  buttonsBar: {
    height: 50,
    marginTop: 50,
    marginBottom: -2,
    flexDirection: 'row',
  },
  warningContainer:{
    marginBottom: 10
  }
});

Terms.propTypes = {
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default withNamespaces()(Terms);
