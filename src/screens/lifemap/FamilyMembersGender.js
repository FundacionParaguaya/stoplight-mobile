import React, { Component } from 'react'
import { ScrollView, StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'

import { addSurveyFamilyMemberData } from '../../redux/actions'

import globalStyles from '../../globalStyles'
import Button from '../../components/Button'
import Select from '../../components/Select'

export class FamilyMembersGender extends Component {
  draftId = this.props.navigation.getParam('draftId')
  survey = this.props.navigation.getParam('survey')

  state = { errorsDetected: [] }

  handleClick() {
    this.props.navigation.navigate('FamilyMembersBirthdates', {
      draftId: this.draftId,
      survey: this.survey
    })
  }

  getFieldValue = (draft, field) => {
    if (!draft) {
      return
    }
    return draft.familyData[field]
  }

  detectError = (error, field) => {
    if (error && !this.state.errorsDetected.includes(field)) {
      this.setState({ errorsDetected: [...this.state.errorsDetected, field] })
    } else if (!error) {
      this.setState({
        errorsDetected: this.state.errorsDetected.filter(item => item !== field)
      })
    }
  }

  addFamilyMemberGender(gender, index) {
    this.props.addSurveyFamilyMemberData({
      id: this.draftId,
      index,
      payload: {
        gender
      }
    })
  }

  gender = this.survey.surveyConfig.gender
  render() {
    const { t } = this.props
    const draft = this.props.drafts.filter(
      draft => draft.draftId === this.draftId
    )[0]

    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={{ ...globalStyles.container, padding: 0 }}>
          {draft.familyData.familyMembersList.slice(1).map((item, i) => (
            <View key={i}>
              <Text
                style={{
                  ...globalStyles.h3,
                  paddingHorizontal: 20,
                  marginTop: 15,
                  marginBottom: -10
                }}
              >
                {item.firstName}
              </Text>
              <Select
                field={i.toString()}
                onChange={text => this.addFamilyMemberGender(text, i + 1)}
                label={t('general.gender')}
                placeholder={t('general.selectGender')}
                value={
                  (this.getFieldValue(draft, 'familyMembersList')[i + 1] || {})
                    .gender || ''
                }
                detectError={this.detectError}
                data={this.gender}
              />
            </View>
          ))}
        </View>

        <View style={{ height: 50, marginTop: 30 }}>
          <Button
            colored
            text={t('general.continue')}
            disabled={!!this.state.errorsDetected.length}
            handleClick={() => this.handleClick()}
          />
        </View>
      </ScrollView>
    )
  }
}
const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
})

FamilyMembersGender.propTypes = {
  t: PropTypes.func.isRequired,
  drafts: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  addSurveyFamilyMemberData: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  addSurveyFamilyMemberData
}

const mapStateToProps = ({ drafts }) => ({
  drafts
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FamilyMembersGender)
)
