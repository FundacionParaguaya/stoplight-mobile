import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withNamespaces} from 'react-i18next';
import {
  Image,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';

import Button from '../../components/Button';
import Decoration from '../../components/decoration/Decoration';
import RoundImage from '../../components/RoundImage';
import StickyFooter from '../../components/StickyFooter';
import globalStyles from '../../globalStyles';
import {updateDraft} from '../../redux/actions';
import colors from '../../theme.json';
import {getTotalEconomicScreens} from './helpers';

let options = {
  storageOptions: {skipBackup: true, path: 'images', multiple: true},
};
export class Picture extends Component {
  state = {
    pictures: [],
    showCamera: false,
    displayError: false,
  };

  survey = this.props.navigation.getParam('survey');
  draftId = this.props.navigation.getParam('draftId');

  // the draft is not mutated in this screen (only its progress),
  // we need it for progress bar
  draft = this.props.drafts.find(draft => draft.draftId === this.draftId);

  onPressBack = () => {
    const previousPage = this.draft.stoplightSkipped
      ? 'BeginLifemap'
      : 'Priorities';

    this.props.navigation.replace(previousPage, {
      survey: this.props.navigation.getParam('survey'),
      draftId: this.draftId,
    });
  };

  componentDidMount() {
    if (this.draft.progress.screen !== 'Picture') {
      let updatedDraft = this.draft;
      updatedDraft.progress.screen = 'Picture';
      this.props.updateDraft(updatedDraft);
    }
    this.setState({pictures: this.draft.pictures});

    this.props.navigation.setParams({
      onPressBack: this.onPressBack,
    });
  }

  openGallery = async function() {
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({
          pictures: [
            ...this.state.pictures,
            {
              // content: 'data:image/jpeg;base64,' + response.data,
              name: response.fileName,
              type: response.type,
              content: response.uri,
              size: response.fileSize,
            },
          ],
        });

        let updatedDraft = this.draft;
        let newArr = updatedDraft.pictures;

        newArr.push({
          // content: 'data:image/jpeg;base64,' + response.data,
          content: response.uri,
          name: response.fileName,
          type: response.type,
          size: response.fileSize,
        });
        updatedDraft.pictures = newArr;
        this.props.updateDraft(updatedDraft);
      }
    });
  };

  checkMaxLimit = function(pictures) {
    let size = 0;
    let marker = 1024; // Change to 1000 if required
    let maxSize = 10 * marker * marker; // 10MB limit
    pictures.forEach(element => {
      //console.log('picture', element)
      let pictureSize = element.size ? element.size : 0;

      if (pictureSize === 0) {
        console.log('---------Files size is cero----', element);
      }
      size = size + pictureSize;
    });
    console.log('Images checking limit are: ', pictures);
    console.log('total images size is: ', size);
    console.log('max size is: ', maxSize);
    if (size > maxSize) {
      return false;
    }
    return true;
  };

  removePicture = function(elem) {
    //remove picture from state

    let newState = this.state.pictures.filter(e => e.name != elem.name);

    let updatedDraft = this.draft;
    updatedDraft.pictures = newState ? newState : [];
    console.log('Draft beforee checking: ', this.draft);

    this.props.updateDraft(updatedDraft);
    this.setState({pictures: newState});

    console.log('checking file after removing: ', newState);
    if (this.checkMaxLimit([...newState])) {
      this.setState({displayError: false});
      console.log('show error');
    }
  };

  onContinue = function() {
    let survey = this.props.navigation.getParam('survey');
    console.log(this.draft);
    if (!this.checkMaxLimit([...this.state.pictures])) {
      this.setState({displayError: true});
      console.log('show error');
    } else if (survey.surveyConfig.signSupport) {
      this.props.navigation.replace('Signin', {
        step: 0,
        survey: survey,
        draftId: this.draftId,
      });
    } else {
      this.props.navigation.replace('Final', {
        fromBeginLifemap: true,
        survey: survey,
        draftId: this.draftId,
        draft: this.draft,
      });
    }
  };

  takePicture = async function() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        ImagePicker.launchCamera(options, response => {
          if (response.didCancel) {
            console.log('User cancelled photo picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            this.setState({
              pictures: [
                ...this.state.pictures,
                {
                  // content: 'data:image/jpeg;base64,' + response.data,
                  name: response.fileName,
                  type: response.type,
                  content: response.uri,
                  size: response.fileSize,
                },
              ],
            });

            let updatedDraft = this.draft;
            let newArr = updatedDraft.pictures;

            newArr.push({
              // content: 'data:image/jpeg;base64,' + response.data,
              content: response.uri,
              name: response.fileName,
              type: response.type,
              size: response.fileSize,
            });
            updatedDraft.pictures = newArr;
            this.props.updateDraft(updatedDraft);
          }
        });
      } else {
        alert('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  render() {
    const {t} = this.props;
    console.log(this.draft);
    return (
      <StickyFooter
        onContinue={() => this.onContinue(this.draft)}
        continueLabel={t('general.continue')}
        progress={
          ((this.draft.familyData.countFamilyMembers > 1 ? 4 : 3) +
            getTotalEconomicScreens(this.survey)) /
          this.draft.progress.total
        }>
        <View
          style={{
            ...globalStyles.container,
            padding: 0,
          }}>
          <View style={styles.container}>
            <ScrollView
              style={styles.scrollViewStyle}
              contentContainerStyle={styles.contentContainer}>
              {this.state.pictures.length ? (
                <View style={styles.mainImageContent}>
                  {this.state.pictures.map(e => (
                    <View
                      key={e.name}
                      style={styles.imageContainer}
                      onPress={() => this.removePicture(e)}>
                      <Image
                        key={e.content}
                        style={styles.picture}
                        source={{uri: e.content}}
                      />
                      <Text style={styles.centerText}>
                        {t('views.pictures.uploadedPicture')}
                      </Text>
                      {/* <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>{e.fileName}</Text>
                  </View> */}
                      <View style={styles.closeImageContainer}>
                        <Icon
                          style={styles.closeIconStyle}
                          onPress={() => this.removePicture(e)}
                          name="close"
                          size={20}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.ballsAndImageContainer}>
                  <Decoration variation="lifemap">
                    <RoundImage source="picture" />
                  </Decoration>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  id="camera_alt"
                  style={styles.button}
                  handleClick={() => this.takePicture()}
                  outlined
                  text={t('views.pictures.takeAPicture')}
                />

                <TouchableHighlight
                  id="location-not-listed-above"
                  underlayColor={'transparent'}
                  onPress={() => this.openGallery()}>
                  <Text style={styles.locationLink}>
                    {t('views.pictures.orUploadFromGalery')}
                  </Text>
                </TouchableHighlight>
                {this.state.displayError && (
                  <Text
                    style={{
                      paddingTop: 10,
                      paddingLeft: 30,
                      paddingRight: 30,
                      color: colors.red,
                    }}>
                    {t('views.pictures.limit')}
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </StickyFooter>
    );
  }
}

const styles = StyleSheet.create({
  closeImageContainer: {
    backgroundColor: 'rgba(225, 80, 77, 0.3)',
    borderRadius: 50,
    height: 30,
    width: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconStyle: {
    color: colors.error,

    fontSize: 25,
  },
  centerText: {fontSize: 20},

  mainImageContent: {
    marginRight: 25,
    marginLeft: 25,
    marginBottom: 20,
  },
  ballsAndImageContainer: {
    marginTop: 25,
    marginBottom: 25,
  },

  scrollViewStyle: {
    flex: 2,
  },
  container: {
    flex: 2,
  },
  picture: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {width: '49%', alignSelf: 'center', marginTop: 20},
  buttonContainer: {
    marginBottom: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationLink: {
    color: colors.green,
    textDecorationLine: 'underline',
    backgroundColor: 'transparent',
    marginTop: 35,
    fontSize: 17,
  },
});

Picture.propTypes = {
  t: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  drafts: PropTypes.array.isRequired,
};

const mapDispatchToProps = {
  updateDraft,
};

const mapStateToProps = ({drafts}) => ({drafts});

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Picture),
);
