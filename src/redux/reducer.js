import {
  ADD_PRIORITY,
  ADD_SURVEY_DATA,
  CREATE_DRAFT,
  DELETE_DRAFT,
  LOAD_FAMILIES_COMMIT,
  LOAD_FAMILIES_ROLLBACK,
  LOAD_IMAGES,
  LOAD_IMAGES_COMMIT,
  LOAD_IMAGES_ROLLBACK,
  LOAD_INTERVENTION_DEFINITION_COMMIT,
  LOAD_INTERVENTION_DEFINITION_ROLLBACK,
  LOAD_MAPS_COMMIT,
  LOAD_MAPS_ROLLBACK,
  LOAD_PROJECTS_COMMIT,
  LOAD_PROJECTS_ROLLBACK,
  LOAD_SURVEYS_COMMIT,
  LOAD_SURVEYS_ROLLBACK,
  MANUAL_SUBMIT_DRAFT_COMMIT,
  MANUAL_SUBMIT_PICTURES_COMMIT,
  MARK_VERSION_CHECKED,
  RESET_SYNCED_STATE,
  SET_DIMENSIONS,
  SET_DOWNLOADMAPSIMAGES,
  SET_DRAFT_PENDING,
  SET_ENV,
  SET_HYDRATED,
  SET_LOGIN_STATE,
  SET_SYNCED_ITEM_AMOUNT,
  SET_SYNCED_ITEM_TOTAL,
  SET_SYNCED_STATE,
  SET_VALIDATE,
  SUBMIT_DRAFT,
  SUBMIT_DRAFT_COMMIT,
  SUBMIT_DRAFT_ROLLBACK,
  SUBMIT_ERROR_DRAFT,
  SUBMIT_ERROR_IMAGES,
  SUBMIT_INTERVENTION,
  SUBMIT_INTERVENTION_COMMIT,
  SUBMIT_INTERVENTION_ROLLBACK,
  SUBMIT_PRIORITY,
  SUBMIT_PRIORITY_COMMIT,
  SUBMIT_PRIORITY_ROLLBACK,
  SWITCH_LANGUAGE,
  TOGGLE_API_VERSION_MODAL,
  UPDATE_DRAFT,
  USER_LOGOUT
} from './actions';

import { combineReducers } from 'redux';
import { getDeviceLanguage } from '../utils';

const defaultLanguage = getDeviceLanguage();
//Login

export const user = (
  state = { token: null, status: null, username: null, role: null, interactive_help: null },
  action,
) => {
  switch (action.type) {
    case SET_LOGIN_STATE:
      return {
        status: action.status,
        token: action.token,
        username: action.username,
        role: action.role,
        organization: action.organization
      };
    case USER_LOGOUT:
      return {
        status: null,
        token: null,
        username: null,
        role: null,
        interactive_help: null,
        organization: null
      };
    case SET_VALIDATE:
      return {
        ...state,
        interactive_help: action.interactive_help
      };
    default:
      return state;
  }
};

//Environment

export const env = (state = 'production', action) => {
  switch (action.type) {
    case SET_ENV:
      return action.env;
    default:
      return state;
  }
};

//Download Maps or images
export const downloadMapsAndImages = (
  state = { downloadMaps: true, downloadImages: true, downLoadAudios: true },
  action,
) => {
  switch (action.type) {
    case SET_DOWNLOADMAPSIMAGES:
      return action.downloadMapsAndImages;
    default:
      return state;
  }
};

//Dimensions
export const dimensions = (
  state = { width: null, height: null, scale: null },
  action,
) => {
  switch (action.type) {
    case SET_DIMENSIONS:
      return action.dimensions;
    default:
      return state;
  }
};
//Maps
export const maps = (state = [], action) => {
  switch (action.type) {
    case LOAD_MAPS_COMMIT:
      //if there are no maps simply return an array with emty object,because of the componentdidUpdate listener on the Loading.js we are looking for a change in props.maps length.
      return action.payload.data.offlineMaps.length
        ? action.payload.data.offlineMaps
        : [{}];
    default:
      return state;
  }
};
//Surveys
export const surveys = (state = [], action) => {
  switch (action.type) {
    case LOAD_SURVEYS_COMMIT:
      return action.payload.data.surveysByUser;
    default:
      return state;
  }
};

//Projects
export const projects = (state = [], action) => {
  switch (action.type) {
    case LOAD_PROJECTS_COMMIT:
      return action.payload.data.projectsByOrganization;
    default:
      return state;
  }
};

// Intervention Definition
export const interventionDefinition = (state=null, action) => {
  switch(action.type) {
    case LOAD_INTERVENTION_DEFINITION_COMMIT:
      return action.payload.data.interventionDefinitionByOrg;
    default:
      return state;
  }
};

// Interventions

export const interventions = (state=[], action) => {
  switch(action.type) {
    case SUBMIT_INTERVENTION: 
      return [
        ...state,
        {
          ...action.payload,
          status: 'Pending Status'
        }
      ]
    case SUBMIT_INTERVENTION_COMMIT:
      return state.map(intervention => intervention.id == action.meta.id ? {
        ...intervention,
        status: 'Synced',
        syncedAt: Date.now()
      }: intervention);

    case SUBMIT_INTERVENTION_ROLLBACK:
      const intervention =  state.find(intervention => intervention.id === action.meta.id);
      if(!!intervention) {
        const previousArray = state.filter(intervention => intervention.id !== action.meta.id);
        const transformArray = previousArray.concat({ ...intervention,status: 'Sync Error'});
        return transformArray;
      }
    
    default:
      return state;
  }
}

//Families
export const families = (state = [], action) => {
  switch (action.type) {
    case LOAD_FAMILIES_COMMIT:
      return action.payload.data.familiesNewStructure;
    default:
      return state;
  }
};

//Queue invocations
export const syncStatus = (state = [], action) => {
  switch (action.type) {
    case LOAD_IMAGES: {
      console.log('Adding id to sync: ', action.id);
      return [...state, action.id];
    }
    case SUBMIT_DRAFT: {
      if (state.indexOf(action.id) === -1) {
        console.log('Adding id to sync: ', action.id);
        return [...state, action.id];
      } else {
        return [...state];
      }
    }
    case SUBMIT_DRAFT_COMMIT: {
      console.log(
        'SUBMIT_DRAFT_COMMIT -- Removing id to synced: ',
        action.meta.id,
      );
      return state.filter(draftId => draftId !== action.meta.id);
    }
    case LOAD_IMAGES_ROLLBACK: {
      console.log('LOAD_IMAGES_ROLLBACK -- Removing id to synced: ', action.id);
      return state.filter(draftId => draftId !== action.id);
    }
    default:
      return state;
  }
};

// Priorities
export const priorities = (state = [], action) => {
  switch (action.type) {
    case ADD_PRIORITY:
      return [
        ...state,
        {
          ...action.payload,
          status: 'Pending Status'
        }
      ]
    case SUBMIT_PRIORITY:
      return state.map(priority =>
        priority.snapshotStoplightId === action.payload.snapshotStoplightId
          ? {
            ...priority,
            status: 'Pending Status',
          }
          : priority);

    case SUBMIT_PRIORITY_COMMIT:
      return state.map(priority =>
        priority.snapshotStoplightId == action.meta.id
          ? {
            ...priority,
            status: 'Synced',
            syncedAt: Date.now()
          } : priority);

    case SUBMIT_PRIORITY_ROLLBACK:
      return state.map(priority =>
        priority.snapshotStoplightId == action.meta.id
          ? {
            ...priority,
            status: 'Sync Error',
          } : priority);


    default:
      return state;
  }
}

//Drafts
export const drafts = (state = [], action) => {
  switch (action.type) {
    case CREATE_DRAFT:
      return [...state, action.payload];

    case UPDATE_DRAFT:
      return state.map(draft => {
        // if this is the draft we are editing
        if (draft.draftId === action.payload.draftId) {
          return action.payload;
        } else {
          return draft;
        }
      });

    case ADD_SURVEY_DATA:
      return state.map(draft => {
        // if this is the draft we are editing
        if (draft.draftId === action.id) {
          const draftCategory = draft[action.category];
          if (Array.isArray(draftCategory)) {
            // if category is an Array
            const item = draftCategory.filter(
              item => item.key === Object.keys(action.payload)[0],
            )[0];
            if (Object.keys(action.payload).length === 2) {
              if (item) {
                const index = draftCategory.indexOf(item);
                return {
                  ...draft,
                  [action.category]: [
                    ...draftCategory.slice(0, index),
                    {
                      key: Object.keys(action.payload)[0],
                      value: Object.values(action.payload)[0],
                      other: Object.values(action.payload)[1],
                      multipleValue: [],
                    },
                    ...draftCategory.slice(index + 1),
                  ],
                };
              }
            } else {
              if (item) {
                // if item exists in array update it
                const index = draftCategory.indexOf(item);
                return {
                  ...draft,
                  [action.category]: [
                    ...draftCategory.slice(0, index),
                    {
                      key: Object.keys(action.payload)[0],
                      value: Object.values(action.payload)[0],
                      multipleValue: [],
                    },
                    ...draftCategory.slice(index + 1),
                  ],
                };
              } else {
                // if item is not in array push it
                return {
                  ...draft,
                  [action.category]: [
                    ...draftCategory,
                    {
                      key: Object.keys(action.payload)[0],
                      value: Object.values(action.payload)[0],
                      multipleValue: [],
                    },
                  ],
                };
              }
            }
          } else {
            // if category is an Object
            const payload = action.payload;
            return {
              ...draft,
              [action.category]: {
                ...draftCategory,
                ...payload,
              },
            };
          }
        } else return draft;
      });

    case SUBMIT_DRAFT:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Pending sync',
          }
          : draft,
      );

    case SET_DRAFT_PENDING:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Pending sync',
          }
          : draft,
      );

    case SUBMIT_DRAFT_COMMIT:
      return state.map(draft =>
        draft.draftId === action.meta.id
          ? {
            ...draft,
            status: 'Synced',
            syncedAt: Date.now(),
          }
          : draft,
      );

    case MANUAL_SUBMIT_DRAFT_COMMIT:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            snapshotId: action.snapshotId,
            status: action.hasPictures ? 'Pending images' : 'Synced',
            syncedAt: Date.now(),
          }
          : draft,
      );


    case MANUAL_SUBMIT_PICTURES_COMMIT:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Synced',
            syncedAt: Date.now(),
          }
          : draft,
      );

    case SUBMIT_ERROR_DRAFT:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Sync error',
          }
          : draft,
      );

    case SUBMIT_ERROR_IMAGES:
      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Sync images error',
          }
          : draft,
      );

    case SUBMIT_DRAFT_ROLLBACK: {
      return state.map(draft =>
        draft.draftId === action.meta.id
          ? {
            ...draft,
            status: 'Sync error',
            errors: action.payload.response.errors,
          }
          : draft,
      );
    }
    case LOAD_IMAGES: {
      console.log('LOAD_IMAGES set to Pending sync');

      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Pending sync',
          }
          : draft,
      );
    }

    case LOAD_IMAGES_COMMIT: {
      console.log('--LOAD_IMAGES_COMMIT set to Pending sync');
      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Pending sync',
          }
          : draft,
      );
    }
    case LOAD_IMAGES_ROLLBACK: {
      console.log('--LOAD_IMAGES_ROLLBACK set to Pending sync');

      return state.map(draft =>
        draft.draftId === action.id
          ? {
            ...draft,
            status: 'Sync error',
          }
          : draft,
      );
    }

    case DELETE_DRAFT:
      return state.filter(draft => draft.draftId !== action.id);
    default:
      return state;
  }
};

// Language
export const language = (state = defaultLanguage, action) => {
  switch (action.type) {
    case SWITCH_LANGUAGE:
      return action.language;
    default:
      return state;
  }
};

// Store Hydration, false by default, not persistent, marks when store is ready
export const hydration = (state = false, action) => {
  switch (action.type) {
    case SET_HYDRATED:
      return true;
    default:
      return state;
  }
};

// Sync
export const sync = (
  state = {
    appVersion: null,
    surveys: false,
    surveysError: false,
    mapsError: false,
    families: false,
    familiesError: false,
    projects: false,
    projectsError: false,
    interventionDefinition:false,
    interventionDefinitionError:false,
    images: {
      total: 0,
      synced: 0,
    },
    audios: {
      total: null,
      synced: null,
    }
  },
  action,
) => {
  switch (action.type) {
    case SET_SYNCED_STATE:
      return {
        ...state,
        [action.item]: action.value,
      };
    case SET_SYNCED_ITEM_TOTAL:
      return {
        ...state,
        [action.item]: {
          total: action.amount,
          synced: state[action.item].synced,
        },
      };
    case SET_SYNCED_ITEM_AMOUNT:
      return {
        ...state,
        [action.item]: {
          synced: action.amount,
          total: state[action.item].total,
        },
      };
    case LOAD_SURVEYS_ROLLBACK:
      return {
        ...state,
        surveysError: true,
      };
    case LOAD_FAMILIES_ROLLBACK:
      return {
        ...state,
        familiesError: true,
      };
    case LOAD_PROJECTS_ROLLBACK:
      return {
        ...state,
        projectsError: true,
      };
    case LOAD_INTERVENTION_DEFINITION_ROLLBACK:
      return {
        ...state,
        interventionDefinitionError:true
      }
    case LOAD_MAPS_ROLLBACK:
      return {
        ...state,
        mapsError: true,
      };
    case RESET_SYNCED_STATE:
      return {
        ...state,
        surveys: false,
        surveysError: false,
        mapsError: false,
        families: false,
        familiesError: false,
        projects: false,
        projectsError: false,
        interventionDefinition:false,
        interventionDefinitionError:false,
        images: {
          total: 0,
          synced: 0,
        },
        audios: {
          total: null,
          synced: null,
        }
      };
    default:
      return state;
  }
};

// API Versioning
export const apiVersion = (
  state = {
    showModal: false,
    timestamp: null,
  },
  action,
) => {
  switch (action.type) {
    case TOGGLE_API_VERSION_MODAL:
      return {
        ...state,
        showModal: action.isOpen,
      };
    case MARK_VERSION_CHECKED:
      return {
        ...state,
        timestamp: action.timestamp,
      };

    default:
      return state;
  }
};

const appReducer = combineReducers({
  env,
  user,
  maps,
  priorities,
  surveys,
  families,
  projects,
  interventionDefinition,
  interventions,
  syncStatus,
  drafts,
  language,
  hydration,
  sync,
  dimensions,
  downloadMapsAndImages,
  apiVersion,
});

export const rootReducer = (state, action) => {
  // note that surveys are synced in the store
  if (action.type === LOAD_SURVEYS_COMMIT) {
    state = {
      ...state,
      sync: {
        ...state.sync,
        surveys: true,
      },
    };
  }

  // note that families are synced in the store
  if (action.type === LOAD_FAMILIES_COMMIT) {
    state = {
      ...state,
      sync: {
        ...state.sync,
        families: true,
      },
    };
  }

  // note that projects are synced in the store
  if (action.type === LOAD_PROJECTS_COMMIT) {
    state = {
      ...state,
      sync: {
        ...state.sync,
        projects: true,
      }
    }
  }

  // note that intervention definition is synced in the store
  if(action.type === LOAD_INTERVENTION_DEFINITION_COMMIT) {
    state = {
      ...state,
      sync:{
        ...state.sync,
        interventionDefinition: true,
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
          synced: 1,
        },
      },
    };
  }

  // create detailed Bugsnag report on sync error
  if (action.type === SUBMIT_DRAFT_ROLLBACK) {
    const { families, surveys, ...currentState } = state;
    families;
    surveys;

    const draftSurvey =
      state.surveys &&
      action.meta.sanitizedSnapshot &&
      action.meta.sanitizedSnapshot.surveyId &&
      state.surveys.find(s => s.id === action.meta.sanitizedSnapshot.surveyId);
  }
  return appReducer(state, action);
};
