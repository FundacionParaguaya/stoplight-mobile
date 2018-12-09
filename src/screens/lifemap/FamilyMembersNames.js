import React, { Component } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'

import { addSurveyData, addSurveyFamilyMemberData } from '../../redux/actions'

import globalStyles from '../../globalStyles'
import Button from '../../components/Button'
import Select from '../../components/Select'
import TextInput from '../../components/TextInput'

export class FamilyMembersNames extends Component {
  draftId = this.props.navigation.getParam('draftId')
  survey = this.props.navigation.getParam('survey')

  state = { errorsDetected: [] }

  handleClick(draft) {
    this.getFieldValue(draft, 'countFamilyMembers') > 1
      ? this.props.navigation.navigate('FamilyMembersGender', {
          draftId: this.draftId,
          survey: this.survey
        })
      : this.props.navigation.navigate('Location', {
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

  addFamilyCount = (text, field) => {
    this.props.addSurveyData(this.draftId, 'familyData', {
      [field]: text
    })
  }

  addFamilyMemberName(name, index) {
    this.props.addSurveyFamilyMemberData({
      id: this.draftId,
      index,
      payload: {
        firstName: name
      }
    })
  }

  render() {
    const { t } = this.props
    const draft = this.props.drafts.filter(
      draft => draft.draftId === this.draftId
    )[0]

    const emptyRequiredFields =
      draft.familyData.familyMembersList.filter(item => item.firstName === '')
        .length !== 0 ||
      !draft.familyData.countFamilyMembers ||
      draft.familyData.countFamilyMembers >
        draft.familyData.familyMembersList.length

    const isButtonEnabled =
      !emptyRequiredFields && !this.state.errorsDetected.length

    const familyMembersCount = draft.familyData.countFamilyMembers
      ? Array(draft.familyData.countFamilyMembers - 1)
          .fill()
          .map((item, index) => index)
      : []

    return (
      <ScrollView
        style={globalStyles.background}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={{ ...globalStyles.container, padding: 0 }}>
          <Select
            required
            onChange={this.addFamilyCount}
            label={t('views.family.peopleLivingInThisHousehold')}
            placeholder={t('views.family.peopleLivingInThisHousehold')}
            field="countFamilyMembers"
            value={this.getFieldValue(draft, 'countFamilyMembers') || ''}
            detectError={this.detectError}
            data={Array(10)
              .fill()
              .map((item, index) => ({
                text: `${index + 1}`,
                value: index + 1
              }))}
          />
          <TextInput
            validation="string"
            field=""
            onChangeText={() => {}}
            placeholder={t('views.family.primaryParticipant')}
            value={draft.familyData.familyMembersList[0].firstName}
            required
            readonly
            detectError={this.detectError}
          />
          {familyMembersCount.map((item, i) => (
            <TextInput
              key={i}
              validation="string"
              field={i.toString()}
              onChangeText={text => this.addFamilyMemberName(text, i + 1)}
              placeholder={t('views.family.name')}
              value={
                (this.getFieldValue(draft, 'familyMembersList')[i + 1] || {})
                  .firstName || ''
              }
              required
              detectError={this.detectError}
            />
          ))}
        </View>

        <View style={{ height: 50, marginTop: 30 }}>
          <Button
            colored
            text={t('general.continue')}
            disabled={!isButtonEnabled}
            handleClick={() => this.handleClick(draft)}
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

FamilyMembersNames.propTypes = {
  drafts: PropTypes.array,
  t: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  addSurveyData: PropTypes.func.isRequired,
  addSurveyFamilyMemberData: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  addSurveyData,
  addSurveyFamilyMemberData
}

const mapStateToProps = ({ drafts }) => ({
  drafts
})

export default withNamespaces()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FamilyMembersNames)
)
