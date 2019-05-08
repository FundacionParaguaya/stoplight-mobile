import { combineReducers } from 'redux'
import { Sentry } from 'react-native-sentry'
// import devDrafts from './dev/drafts.json'
import {
  SET_LOGIN_STATE,
  USER_LOGOUT,
  SET_ENV,
  LOAD_SURVEYS_COMMIT,
  LOAD_FAMILIES_COMMIT,
  CREATE_DRAFT,
  ADD_SURVEY_DATA,
  ADD_SURVEY_PRIORITY_ACHEIVEMENT_DATA,
  DELETE_SURVEY_PRIORITY_ACHEIVEMENT_DATA,
  ADD_SURVEY_FAMILY_MEMBER_DATA,
  REMOVE_FAMILY_MEMBERS,
  DELETE_DRAFT,
  ADD_DRAFT_PROGRESS,
  SUBMIT_DRAFT,
  SUBMIT_DRAFT_COMMIT,
  SUBMIT_DRAFT_ROLLBACK,
  SWITCH_LANGUAGE,
  SET_HYDRATED,
  SET_SYNCED_ITEM_TOTAL,
  SET_SYNCED_ITEM_AMOUNT,
  SET_SYNCED_STATE,
  RESET_SYNCED_STATE,
  SET_DIMENSIONS,
  UPDATE_NAV
} from './actions'

//Login

export const user = (
  state = { token: null, status: null, username: null },
  action
) => {
  switch (action.type) {
    case SET_LOGIN_STATE:
      return {
        status: action.status,
        token: action.token,
        username: action.username
      }
    case USER_LOGOUT:
      return {
        status: null,
        token: null,
        username: null
      }
    default:
      return state
  }
}

//Environment

export const env = (state = 'production', action) => {
  switch (action.type) {
    case SET_ENV:
      return action.env
    default:
      return state
  }
}

//Dimensions

export const dimensions = (state = { width: null, height: null }, action) => {
  switch (action.type) {
    case SET_DIMENSIONS:
      return action.dimensions
    default:
      return state
  }
}

//Surveys
export const surveys = (state = [], action) => {
  switch (action.type) {
    case LOAD_SURVEYS_COMMIT:
      return action.payload.data.surveysByUser
    default:
      return state
  }
}

//Families
export const families = (state = [], action) => {
  switch (action.type) {
    case LOAD_FAMILIES_COMMIT:
      return action.payload.data.familiesNewStructure
    default:
      return state
  }
}

//Drafts
const nodeEnv = process.env
export const drafts = (state = [], action) => {
  switch (action.type) {
    case CREATE_DRAFT:
      return [...state, { ...action.payload, status: 'Draft' }]

    case ADD_SURVEY_PRIORITY_ACHEIVEMENT_DATA:
      return state.map(draft => {
        // if this is the draft we are editing
        if (draft.draftId === action.id) {
          const draftCategory = draft[action.category]
          const item = draftCategory.filter(
            item => item.indicator === action.payload.indicator
          )[0]
          // If item exists update it
          if (item) {
            const index = draftCategory.indexOf(item)
            return {
              ...draft,
              [action.category]: [
                ...draftCategory.slice(0, index),
                action.payload,
                ...draftCategory.slice(index + 1)
              ]
            }
          } else {
            // If item does not exist create it
            return {
              ...draft,
              [action.category]: [...draftCategory, action.payload]
            }
          }
        } else {
          return draft
        }
      })
    case DELETE_SURVEY_PRIORITY_ACHEIVEMENT_DATA:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
              ...draft,
              [action.category]: [
                ...draft[action.category].filter(
                  item => item.indicator !== action.indicator
                )
              ]
            }
          : draft
      )
    case ADD_SURVEY_DATA:
      return state.map(draft => {
        // if this is the draft we are editing
        if (draft.draftId === action.id) {
          const draftCategory = draft[action.category]
          if (Array.isArray(draftCategory)) {
            // if category is an Array
            const item = draftCategory.filter(
              item => item.key === Object.keys(action.payload)[0]
            )[0]
            if (Object.keys(action.payload).length === 2) {
              if (item) {
                const index = draftCategory.indexOf(item)
                return {
                  ...draft,
                  [action.category]: [
                    ...draftCategory.slice(0, index),
                    {
                      key: Object.keys(action.payload)[0],
                      value: Object.values(action.payload)[0],
                      other: Object.values(action.payload)[1]
                    },
                    ...draftCategory.slice(index + 1)
                  ]
                }
              }
            } else {
              if (item) {
                // if item exists in array update it
                const index = draftCategory.indexOf(item)
                return {
                  ...draft,
                  [action.category]: [
                    ...draftCategory.slice(0, index),
                    {
                      key: Object.keys(action.payload)[0],
                      value: Object.values(action.payload)[0]
                    },
                    ...draftCategory.slice(index + 1)
                  ]
                }
              } else {
                // if item is not in array push it
                return {
                  ...draft,
                  [action.category]: [
                    ...draftCategory,
                    {
                      key: Object.keys(action.payload)[0],
                      value: Object.values(action.payload)[0]
                    }
                  ]
                }
              }
            }
          } else {
            // if category is an Object
            const payload = action.payload
            return {
              ...draft,
              [action.category]: {
                ...draftCategory,
                ...payload
              }
            }
          }
        } else return draft
      })

    case ADD_SURVEY_FAMILY_MEMBER_DATA:
      return state.map(draft => {
        // if this is the draft we are editing
        if (draft.draftId === action.id) {
          const familyMember = draft.familyData.familyMembersList[action.index]

          if (action.isSocioEconomicAnswer) {
            if (familyMember.socioEconomicAnswers) {
              // if its a socio economic edition
              const item = familyMember.socioEconomicAnswers.filter(
                item => item.key === Object.keys(action.payload)[0]
              )[0]

              if (item) {
                // if updating an existing answer
                const index = familyMember.socioEconomicAnswers.indexOf(item)

                return {
                  ...draft,
                  familyData: {
                    ...draft.familyData,
                    familyMembersList: [
                      ...draft.familyData.familyMembersList.slice(
                        0,
                        action.index
                      ),
                      {
                        ...familyMember,
                        socioEconomicAnswers: [
                          ...familyMember.socioEconomicAnswers.slice(0, index),
                          {
                            key: Object.keys(action.payload)[0],
                            value: Object.values(action.payload)[0]
                          },
                          ...familyMember.socioEconomicAnswers.slice(index + 1)
                        ]
                      },
                      ...draft.familyData.familyMembersList.slice(
                        action.index + 1
                      )
                    ]
                  }
                }
              } else {
                // if adding a new answer
                return {
                  ...draft,
                  familyData: {
                    ...draft.familyData,
                    familyMembersList: [
                      ...draft.familyData.familyMembersList.slice(
                        0,
                        action.index
                      ),
                      {
                        ...familyMember,
                        socioEconomicAnswers: [
                          ...familyMember.socioEconomicAnswers,
                          {
                            key: Object.keys(action.payload)[0],
                            value: Object.values(action.payload)[0]
                          }
                        ]
                      },
                      ...draft.familyData.familyMembersList.slice(
                        action.index + 1
                      )
                    ]
                  }
                }
              }
            } else {
              // adding socioEconomicAnswers for the first time
              return {
                ...draft,
                familyData: {
                  ...draft.familyData,
                  familyMembersList: [
                    ...draft.familyData.familyMembersList.slice(
                      0,
                      action.index
                    ),
                    {
                      ...familyMember,
                      socioEconomicAnswers: [
                        {
                          key: Object.keys(action.payload)[0],
                          value: Object.values(action.payload)[0]
                        }
                      ]
                    },
                    ...draft.familyData.familyMembersList.slice(
                      action.index + 1
                    )
                  ]
                }
              }
            }
          } else {
            // NON SOCIO ECONOMIC ANSSER
            if (typeof action.index !== 'undefined') {
              // if family member exists
              const payload = action.payload
              return {
                ...draft,
                familyData: {
                  ...draft.familyData,
                  familyMembersList: [
                    ...draft.familyData.familyMembersList.slice(
                      0,
                      action.index
                    ),
                    {
                      ...familyMember,
                      ...payload
                    },
                    ...draft.familyData.familyMembersList.slice(
                      action.index + 1
                    )
                  ]
                }
              }
            } else {
              // if family member doesn't exists
              const payload = action.payload
              return {
                ...draft,
                familyData: {
                  ...draft.familyData,
                  familyMembersList: [
                    ...draft.familyData.familyMembersList,
                    ...payload
                  ]
                }
              }
            }
          }
        } else {
          return draft
        }
      })

    case REMOVE_FAMILY_MEMBERS:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
              ...draft,
              familyData: {
                ...draft.familyData,
                familyMembersList: draft.familyData.familyMembersList.filter(
                  (item, index) => index < action.afterIndex
                )
              }
            }
          : draft
      )

    case SUBMIT_DRAFT:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
              ...draft,
              status: 'Pending sync'
            }
          : draft
      )
    case ADD_DRAFT_PROGRESS:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
              ...draft,
              progress: { ...draft.progress, ...action.progress }
            }
          : draft
      )
    case SUBMIT_DRAFT_COMMIT:
      return state.map(draft =>
        draft.draftId === action.meta.id
          ? {
              ...draft,
              status: 'Synced',
              syncedAt: Date.now()
            }
          : draft
      )
    case SUBMIT_DRAFT_ROLLBACK: {
      return state.map(draft =>
        draft.draftId === action.meta.id
          ? {
              ...draft,
              status: 'Sync error'
            }
          : draft
      )
    }
    case DELETE_DRAFT:
      return state.filter(draft => draft.draftId !== action.id)
    default:
      return state
  }
}

// Language
export const language = (state = false, action) => {
  switch (action.type) {
    case SWITCH_LANGUAGE:
      return action.language
    default:
      return state
  }
}

// Store Hydration, false by default, not persistent, marks when store is ready
export const hydration = (state = false, action) => {
  switch (action.type) {
    case SET_HYDRATED:
      return true
    default:
      return state
  }
}

// Sync
export const sync = (
  state = {
    appVersion: null,
    surveys: false,
    families: false,
    images: {
      total: 0,
      synced: 0
    }
  },
  action
) => {
  switch (action.type) {
    case SET_SYNCED_STATE:
      return {
        ...state,
        [action.item]: action.value
      }
    case SET_SYNCED_ITEM_TOTAL:
      return {
        ...state,
        [action.item]: {
          total: action.amount,
          synced: state[action.item].synced
        }
      }
    case SET_SYNCED_ITEM_AMOUNT:
      return {
        ...state,
        [action.item]: {
          synced: action.amount,
          total: state[action.item].total
        }
      }
    case RESET_SYNCED_STATE:
      return {
        surveys: false,
        families: false,
        images: {
          total: 0,
          synced: 0
        }
      }
    default:
      return state
  }
}

// Navigation
export const nav = (
  state = {
    openModal: null,
    beforeCloseModal: null,
    readonly: false,
    draftId: null,
    survey: null,
    deleteDraftOnExit: false
  },
  action
) => {
  switch (action.type) {
    case UPDATE_NAV:
      if (typeof action.value !== 'undefined') {
        return {
          ...state,
          [action.item]: action.value
        }
      } else {
        return {
          ...state,
          ...action.item
        }
      }

    default:
      return state
  }
}

const appReducer = combineReducers({
  env,
  user,
  surveys,
  families,
  drafts,
  language,
  hydration,
  sync,
  dimensions,
  nav
})

export const rootReducer = (state, action) => {
  // note that surveys are synced in the store
  if (action.type === LOAD_SURVEYS_COMMIT) {
    state = {
      ...state,
      sync: {
        ...state.sync,
        surveys: true
      }
    }
  }

  // note that families are synced in the store
  if (action.type === LOAD_FAMILIES_COMMIT) {
    state = {
      ...state,
      sync: {
        ...state.sync,
        families: true
      }
    }
  }

  // if there are no images to cache, make it so the loading screen can continue
  if (action.type === SET_SYNCED_ITEM_TOTAL && !action.amount) {
    state = {
      ...state,
      sync: {
        ...state.sync,
        images: {
          total: 1,
          synced: 1
        }
      }
    }
  }

  if (action.type === USER_LOGOUT) {
    // reset store
    state = {
      ...state,
      user: { token: null, status: null, username: null },
      drafts: [],
      surveys: [],
      families: [],
      env: 'production',
      sync: {
        appVersion: null,
        surveys: false,
        families: false,
        images: {
          total: 0,
          synced: 0
        }
      },
      nav: {
        openModal: null,
        beforeCloseModal: null,
        readonly: false,
        draftId: null,
        survey: null,
        deleteDraftOnExit: false
      }
    }
  }

  // create detailed sentry report on sync error
  if (action.type === SUBMIT_DRAFT_ROLLBACK) {
    Sentry.setExtraContext({
      payload: action.meta.payload,
      familyMembersList: action.meta.payload.familyData.familyMembersList,
      errors: action.payload.response.errors
    })

    Sentry.setTagsContext({
      environment: nodeEnv.NODE_ENV
    })

    Sentry.setUserContext({
      username: state.user.username,
      extra: {
        env: state.env
      }
    })

    Sentry.captureBreadcrumb({
      message: 'Sync error',
      category: 'action',
      data: {
        error: action.payload.response.errors[0].message,
        description: action.payload.response.errors[0].description
      }
    })
    Sentry.captureException('Sync error')
  }

  return appReducer(state, action)
}
