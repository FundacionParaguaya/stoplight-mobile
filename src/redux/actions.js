// Login

export const SET_LOGIN_STATE = 'SET_LOGIN_STATE'
export const USER_LOGOUT = 'USER_LOGOUT'

export const login = (username, password, env) => dispatch =>
  fetch(
    `${env}/oauth/token?username=${username}&password=${password}&grant_type=password`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic bW9iaWxlQ2xpZW50SWQ6bW9iaWxlQ2xpZW50U2VjcmV0'
      }
    }
  )
    .then(data => {
      if (data.status !== 200) {
        dispatch({
          role: null,
          type: SET_LOGIN_STATE,
          token: null,
          status: data.status,
          username: null
        })
        throw new Error()
      } else return data.json()
    })
    .then(data => {
      dispatch({
        role: data.user.authorities ? data.user.authorities[0].authority : null,
        type: SET_LOGIN_STATE,
        token: data.access_token,
        status: 200,
        username: data.user.username
      })
    })
    .catch(e => e)

export const logout = () => ({
  type: USER_LOGOUT
})

// Download images/maps

export const SET_DOWNLOADMAPSIMAGES = 'SET_DOWNLOADMAPSIMAGES'

export const setDownloadMapsAndImages = downloadMapsAndImages => ({
  type: SET_DOWNLOADMAPSIMAGES,
  downloadMapsAndImages
})

// Dimensions

export const SET_DIMENSIONS = 'SET_DIMENSIONS'

export const setDimensions = dimensions => ({
  type: SET_DIMENSIONS,
  dimensions
})

// Environment

export const SET_ENV = 'SET_ENV'

export const setEnv = env => ({
  type: SET_ENV,
  env
})

// Surveys

export const LOAD_SURVEYS = 'LOAD_SURVEYS'
export const LOAD_SURVEYS_COMMIT = 'LOAD_SURVEYS_COMMIT'
export const LOAD_SURVEYS_ROLLBACK = 'LOAD_SURVEYS_ROLLBACK'

export const loadSurveys = (env, token) => ({
  type: LOAD_SURVEYS,
  env,
  token,
  meta: {
    offline: {
      effect: {
        url: `${env}/graphql`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json;charset=utf8'
        },
        body: JSON.stringify({
          query:
            'query { surveysByUser { title id createdAt description minimumPriorities privacyPolicy { title  text } termsConditions{ title text }  surveyConfig { documentType {text value} requiredFields{primaryParticipant, familyMember} gender { text value} surveyLocation { country latitude longitude}  offlineMaps { from, to, center, name } }  surveyEconomicQuestions { questionText codeName answerType topic required forFamilyMember options {text value conditions{codeName, type, values, operator, valueType, showIfNoData}}, conditions{codeName, type, value, operator}, conditionGroups{groupOperator, joinNextGroup, conditions{codeName, type, value, operator}} } surveyStoplightQuestions { questionText codeName definition dimension id stoplightColors { url value description } required } } }'
        })
      },
      commit: { type: LOAD_SURVEYS_COMMIT },
      rollback: { type: LOAD_SURVEYS_ROLLBACK }
    }
  }
})

// Families

export const LOAD_FAMILIES = 'LOAD_FAMILIES'
export const LOAD_FAMILIES_COMMIT = 'LOAD_FAMILIES_COMMIT'
export const LOAD_FAMILIES_ROLLBACK = 'LOAD_FAMILIES_ROLLBACK'

export const loadFamilies = (env, token) => ({
  type: LOAD_FAMILIES,
  env,
  token,
  meta: {
    offline: {
      effect: {
        url: `${env}/graphql`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json;charset=utf8'
        },
        body: JSON.stringify({
          query:
            'query { familiesNewStructure {familyId name code snapshotList { surveyId createdAt familyData { familyMembersList { birthCountry birthDate documentNumber documentType email familyId firstName firstParticipant gender id lastName memberIdentifier phoneNumber socioEconomicAnswers { key value}  }  countFamilyMembers latitude longitude country accuracy } economicSurveyDataList { key value multipleValue } indicatorSurveyDataList { key value } achievements { action indicator roadmap } priorities { action estimatedDate indicator reason } } } }'
        })
      },
      commit: { type: LOAD_FAMILIES_COMMIT },
      rollback: { type: LOAD_FAMILIES_ROLLBACK }
    }
  }
})

// Drafts

export const CREATE_DRAFT = 'CREATE_DRAFT'
export const UPDATE_DRAFT = 'UPDATE_DRAFT'
export const DELETE_DRAFT = 'DELETE_DRAFT'
export const ADD_SURVEY_DATA_CHECKBOX = 'ADD_SURVEY_DATA_CHECKBOX'
export const ADD_SURVEY_DATA = 'ADD_SURVEY_DATA'
export const SUBMIT_DRAFT = 'SUBMIT_DRAFT'
export const SUBMIT_DRAFT_COMMIT = 'SUBMIT_DRAFT_COMMIT'
export const SUBMIT_DRAFT_ROLLBACK = 'SUBMIT_DRAFT_ROLLBACK'

export const createDraft = payload => ({
  type: CREATE_DRAFT,
  payload
})

export const updateDraft = (id, payload) => ({
  type: UPDATE_DRAFT,
  id,
  payload
})

export const deleteDraft = id => ({
  type: DELETE_DRAFT,
  id
})

export const addSurveyDataCheckBox = (id, category, payload) => ({
  type: ADD_SURVEY_DATA_CHECKBOX,
  category,
  id,
  payload
})
export const addSurveyData = (id, category, payload) => ({
  type: ADD_SURVEY_DATA,
  category,
  id,
  payload
})

export const submitDraft = (env, token, id, payload) => {
  const sanitizedSnapshot = { ...payload }
  let { economicSurveyDataList } = payload
  const validEconomicIndicator = ec =>
    ec.value !== null && ec.value !== undefined && ec.value !== ''
  economicSurveyDataList = economicSurveyDataList.filter(validEconomicIndicator)
  sanitizedSnapshot.economicSurveyDataList = economicSurveyDataList
  sanitizedSnapshot.familyData.familyMembersList.forEach(member => {
    let { socioEconomicAnswers = [] } = member
    socioEconomicAnswers = socioEconomicAnswers.filter(validEconomicIndicator)
    // eslint-disable-next-line no-param-reassign
    member.socioEconomicAnswers = socioEconomicAnswers
  })
  return {
    type: SUBMIT_DRAFT,
    env,
    token,
    id,
    payload,

    meta: {
      offline: {
        effect: {
          url: `${env}/graphql`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json;charset=utf8'
          },
          body: JSON.stringify({
            query:
              'mutation addSnapshot($newSnapshot: NewSnapshotDTOInput) {addSnapshot(newSnapshot: $newSnapshot)  { surveyId surveyVersionId snapshotStoplightAchievements { action indicator roadmap } snapshotStoplightPriorities { reason action indicator estimatedDate } family { familyId } user { userId  username } indicatorSurveyDataList {key value} economicSurveyDataList {key value multipleValue} familyDataDTO { latitude longitude accuracy familyMemberDTOList { firstName lastName socioEconomicAnswers {key value } } } } }',
            variables: { newSnapshot: sanitizedSnapshot }
          })
        },
        commit: {
          type: SUBMIT_DRAFT_COMMIT,
          meta: {
            id,
            sanitizedSnapshot
          }
        },
        rollback: {
          type: SUBMIT_DRAFT_ROLLBACK,
          meta: {
            id,
            sanitizedSnapshot
          }
        }
      }
    }
  }
}

// Language
export const SWITCH_LANGUAGE = 'SWITCH_LANGUAGE'

export const switchLanguage = language => ({
  type: SWITCH_LANGUAGE,
  language
})

// Store Hydration
export const SET_HYDRATED = 'SET_HYDRATED'

export const setHydrated = () => ({
  type: SET_HYDRATED
})

// Sync
export const SET_SYNCED_ITEM_TOTAL = 'SET_SYNCED_ITEM_TOTAL'
export const SET_SYNCED_ITEM_AMOUNT = 'SET_SYNCED_ITEM_AMOUNT'
export const SET_SYNCED_STATE = 'SET_SYNCED_STATE'
export const RESET_SYNCED_STATE = 'RESET_SYNCED_STATE'

export const setSyncedItemTotal = (item, amount) => ({
  type: SET_SYNCED_ITEM_TOTAL,
  item,
  amount
})

export const setSyncedItemAmount = (item, amount) => ({
  type: SET_SYNCED_ITEM_AMOUNT,
  item,
  amount
})

export const setSyncedState = (item, value) => ({
  type: SET_SYNCED_STATE,
  item,
  value
})

export const setAppVersion = value => ({
  type: SET_SYNCED_STATE,
  item: 'appVersion',
  value
})

export const resetSyncState = () => ({
  type: RESET_SYNCED_STATE
})

// NAV
export const UPDATE_NAV = 'UPDATE_NAV'

export const updateNav = (item, value) => ({
  type: UPDATE_NAV,
  item,
  value
})
