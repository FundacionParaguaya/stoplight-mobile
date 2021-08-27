import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import React, {Component} from 'react';

import Decoration from '../components/decoration/Decoration';
import LifemapListItem from '../components/LifemapListItem';
import ProjectsPopup from '../components/ProjectsPopup';
import PropTypes from 'prop-types';
import RoundImage from '../components/RoundImage';
import colors from '../theme.json';
import {connect} from 'react-redux';
import {createDraft} from '../redux/actions';
import {getTotalScreens} from '../screens/lifemap/helpers';
import globalStyles from '../globalStyles';
import uuid from 'uuid/v1';
import {withNamespaces} from 'react-i18next';

export class Surveys extends Component {
  acessibleComponent = React.createRef();
  state = {
    openProjectModal: false,
    selectedSurvey: null,
  };
  // if not undefined, it means is a retake flow
  familyLifeMap = this.props.route.params && this.props.route.params.familyLifeMap
    ? this.props.route.params.familyLifeMap
    : null;
  surveyId =  this.props.route.params && !!this.props.route.params.survey
    ? this.props.route.params.survey.id
    : null;

  componentDidMount() {
    // focuses component on render for device to begin talking
    if (UIManager.AccessibilityEventTypes) {
      UIManager.sendAccessibilityEvent(
        findNodeHandle(this.acessibleComponent.current),
        UIManager.AccessibilityEventTypes.typeViewFocused,
      );
    }
  }

  handleClickOnSurvey = survey => {
    if (
      !!this.props.projects &&
      this.props.projects.filter(project => project.active === true).length > 0
    ) {
      this.setState({openProjectModal: true, selectedSurvey: survey});
    } else {
      this.loadSurveyById(survey);
    }
  };

  toggleProjectModal = () => {
    this.setState({openProjectModal: !this.state.openProjectModal});
  };

  loadSurveyById = (survey, project) => {

    if (this.familyLifeMap) {
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
          familyId: this.familyLifeMap.familyId,
          countFamilyMembers: this.familyLifeMap.familyMembersList.length,
          familyMembersList: this.familyLifeMap.familyMembersList.map(
            member => {
              return {
                ...member,
                documentType: survey.id === this.surveyId ? member.documentType : '',
                documentNumber: survey.id === this.surveyId ? member.documentNumber : '',
                gender: survey.id === this.surveyId ? member.gender : '',
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
    } else {
      this.setState(
        {openProjectModal: false},
        this.props.navigation.navigate('Terms', {
          page: 'terms',
          survey,
          project,
        }),
      );
    }
  };

  render() {
    const {t} = this.props;
    return (
      <ScrollView
        ref={this.acessibleComponent}
        accessible={true}
        style={{...globalStyles.container, padding: 0}}>
        <ProjectsPopup
          isOpen={this.state.openProjectModal}
          afterSelect={this.loadSurveyById}
          toggleModal={this.toggleProjectModal}
          selectedSurvey={this.state.selectedSurvey}
          onClose={this.toggleProjectModal}
          projects={
            !!this.props.projects &&
            this.props.projects.filter(project => project.active === true)
          }
        />
        <Decoration variation="lifemap">
          <RoundImage source="surveys" />
        </Decoration>

        <FlatList
          style={styles.list}
          data={this.props.surveys}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={globalStyles.h3}>{t('views.noSurveys')}</Text>
            </View>
          }
          renderItem={({item}) => (
            <LifemapListItem
              name={item.title}
              handleClick={() => this.handleClickOnSurvey(item)}
            />
          )}
          initialNumToRender={5}
        />
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  list: {
    borderTopColor: colors.lightgrey,
    borderTopWidth: 1,
    paddingBottom: 60,
  },
  emptyContainer: {
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

Surveys.propTypes = {
  surveys: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  lng: PropTypes.string,
  t: PropTypes.func,
};

const mapStateToProps = ({surveys, projects}) => ({
  surveys,
  projects,
});

const mapDispatchToProps = {
  createDraft,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Surveys),
);
