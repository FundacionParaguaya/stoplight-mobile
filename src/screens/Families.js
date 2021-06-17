import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import React, { Component } from 'react';

import FamiliesListItem from '../components/FamiliesListItem';
import Icon from 'react-native-vector-icons/MaterialIcons'
import PropTypes from 'prop-types';
import SearchBar from '../components/SearchBar';
import { TouchableOpacity } from 'react-native-gesture-handler';
import colors from '../theme.json';
import { connect } from 'react-redux';
import globalStyles from '../globalStyles';
import { loadFamilies } from '../redux/actions';
import mapPlaceholderLarge from '../../assets/images/map_placeholder_1000.png';
import { replaceSpecialChars as sanitize } from '../utils';
import { setAccessibilityTextForFamilies } from '../screens/utils/accessibilityHelpers';
import { url } from '../config';
import { withNamespaces } from 'react-i18next';

export class Families extends Component {
  state = { search: '' };
  acessibleComponent = React.createRef();

  sortByName = (families) =>
    families.sort((a, b) => a.name.localeCompare(b.name));

  handleClickOnFamily = (family) => {
    this.props.navigation.replace('Family', {
      allowRetake: family.allowRetake,
      familyId: family.familyId,
      familyName: family.name,
      familyProject: family.project
        ? family.project.title
        : null,
      familyLifemap: family.snapshotList
        ? family.snapshotList[0]
        : family.draft,
      isDraft: !family.snapshotList,
      survey: this.props.surveys.find((survey) =>
        family.snapshotList
          ? survey.id === family.snapshotList[0].surveyId
          : survey.id === family.draft.surveyId,
      ),
    });
  };

  fetchFamilies = () => {
    let params = '';
    if(!!this.props.interventionDefinition) {
      this.props.interventionDefinition.questions.forEach(question => {
        params += `${question.codeName} `;
      });
    };
    this.props.loadFamilies(url[this.props.env], this.props.user.token, params);
  };

  render() {
    const { t, offline } = this.props;


    const families = [...sanitize(this.props.families)];

    const filteredFamilies = families.filter(
      (family) =>
        family.name.toLowerCase().includes(this.state.search.toLowerCase()) ||
        (family.code && family.code.includes(this.state.search)),
    );

    const screenAccessibilityContent = setAccessibilityTextForFamilies();

    const refreshingFamilies = !!offline.online &&
      !!offline.outbox.find(
        (item) => item.type === 'LOAD_FAMILIES',
      );

    return (
      <View
        style={[globalStyles.background, styles.container]}
        accessible={true}
        accessibilityLabel={screenAccessibilityContent}
        accessibilityLiveRegion="assertive">
        <View style={styles.imagePlaceholderContainer}>
          <View style={styles.searchContainer}>
            <SearchBar
              id="searchAddress"
              style={styles.search}
              placeholder={t('views.family.searchByName')}
              onChangeText={(search) => this.setState({ search })}
              value={this.state.search}
            />
          </View>
          <Image
            style={styles.imagePlaceholderTop}
            source={mapPlaceholderLarge}
          />
        </View>

        <View style={styles.bar}>
          <Text style={{ ...globalStyles.subline, ...styles.familiesCount }}>
            {filteredFamilies.length} {t('views.families').toLowerCase()}
          </Text>
          {offline.online &&
            <Icon
              onPress={this.fetchFamilies}
              disabled={refreshingFamilies}
              name="refresh"
              size={24}
              color={refreshingFamilies
                ? colors.lightgrey
                : colors.green}
            />
          }

        </View>

        <FlatList
          style={{ flex: 1 }}
          refreshing={refreshingFamilies}
          onRefresh={this.fetchFamilies}
          data={this.sortByName(filteredFamilies)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <FamiliesListItem
              error={t('views.family.error')}
              lng={this.props.lng}
              handleClick={() => this.handleClickOnFamily(item)}
              family={item}
            />
          )}
          initialNumToRender={7}
        />
      </View>
    );
  }
}

Families.propTypes = {
  families: PropTypes.array,
  surveys: PropTypes.array,
  drafts: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  loadFamilies: PropTypes.func.isRequired,
  env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
  user: PropTypes.object.isRequired,
  offline: PropTypes.object,
  t: PropTypes.func,
  lng: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  search: {
    width: '100%',
  },
  bar: {
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.primary,
  },
  searchContainer: {
    padding: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    top: '46%',
    position: 'absolute',
    zIndex: 10,
  },
  imagePlaceholderContainer: {
    position: 'relative',
    width: '100%',
    height: 139,
  },

  imagePlaceholderTop: {
    width: '100%',
    height: 139,
  },
  familiesCount: {
    fontWeight: '600',
  },
});

export const mapStateToProps = ({
  families,
  interventionDefinition,
  user,
  offline,
  env,
  surveys,
  drafts,
}) => ({
  families,
  interventionDefinition,
  user,
  offline,
  env,
  surveys,
  drafts,
});

const mapDispatchToProps = {
  loadFamilies,
};

export default withNamespaces()(
  connect(mapStateToProps, mapDispatchToProps)(Families),
);
