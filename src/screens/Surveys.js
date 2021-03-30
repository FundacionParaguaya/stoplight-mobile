import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  UIManager,
  findNodeHandle,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import globalStyles from '../globalStyles';
import RoundImage from '../components/RoundImage';
import LifemapListItem from '../components/LifemapListItem';
import Decoration from '../components/decoration/Decoration';
import colors from '../theme.json';
import ProjectsPopup from '../components/ProjectsPopup';

export class Surveys extends Component {
  acessibleComponent = React.createRef();
  state = {
    openProjectModal: false,
    selectedSurvey: null,
  };

  componentDidMount() {
    // focuses component on render for device to begin talking
    if (UIManager.AccessibilityEventTypes) {
      setTimeout(() => {
        UIManager.sendAccessibilityEvent(
          findNodeHandle(this.acessibleComponent.current),
          UIManager.AccessibilityEventTypes.typeViewFocused,
        );
      }, 1);
    }
  }

  handleClickOnSurvey = (survey) => {
    if (
      !!this.props.projects &&
      this.props.projects.filter((project) => project.active === true).length >
        0
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
    this.setState(
      {openProjectModal: false},
      this.props.navigation.navigate('Terms', {
        page: 'terms',
        survey,
        project,
      }),
    );
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
            this.props.projects.filter((project) => project.active === true)
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

const mapDispatchToProps = {};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Surveys),
);
