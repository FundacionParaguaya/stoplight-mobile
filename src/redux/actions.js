// Login

import { PhoneNumberUtil } from 'google-libphonenumber';
import { interventionDefinition } from './reducer';

// import { ImageStore } from 'react-native'
export const SET_LOGIN_STATE = 'SET_LOGIN_STATE';
export const USER_LOGOUT = 'USER_LOGOUT';
export const SET_VALIDATE = 'SET_VALIDATE';

export const login = (username, password, env) => (dispatch) =>
  fetch(
    `${env}/oauth/token?username=${username}&password=${password}&grant_type=password`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic bW9iaWxlQ2xpZW50SWQ6bW9iaWxlQ2xpZW50U2VjcmV0',
      },
    },
  )
    .then((data) => {
      if (data.status !== 200) {
        dispatch({
          role: null,
          type: SET_LOGIN_STATE,
          token: null,
          status: data.status,
          username: null,
          organization: null
        });
        throw new Error();
      } else return data.json();
    })
    .then((data) =>
      dispatch({
        role: data.user.authorities ? data.user.authorities[0].authority : null,
        type: SET_LOGIN_STATE,
        token: data.access_token,
        status: 200,
        username: data.user.username,
        organization: data.user.organization
      }),
    )
    .catch((e) => e);

export const validate = (env, token) => (dispatch) => {
  fetch(`${env}/api/v1/users/validate`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json;charset=utf8',
    },
  })
    .then((data) => {
      if (data.status !== 200) {
        throw new Error();
      } else return data.json();
    }).
    then((data) => {
      dispatch({
        type: SET_VALIDATE,
        interactive_help: !!data.application &&
          !!data.application.interactiveHelp
      })
    })
}

export const logout = () => ({
  type: USER_LOGOUT,
});

// Download images/maps/audios

export const SET_DOWNLOADMAPSIMAGES = 'SET_DOWNLOADMAPSIMAGES';

export const setDownloadMapsAndImages = (downloadMapsAndImages) => ({
  type: SET_DOWNLOADMAPSIMAGES,
  downloadMapsAndImages,
});

// Dimensions

export const SET_DIMENSIONS = 'SET_DIMENSIONS';

export const setDimensions = (dimensions) => ({
  type: SET_DIMENSIONS,
  dimensions,
});

// Environment

export const SET_ENV = 'SET_ENV';

export const setEnv = (env) => ({
  type: SET_ENV,
  env,
});

// Get Maps

export const LOAD_MAPS = 'LOAD_MAPS';
export const LOAD_MAPS_COMMIT = 'LOAD_MAPS_COMMIT';
export const LOAD_MAPS_ROLLBACK = 'LOAD_MAPS_ROLLBACK';

export const loadMaps = (env, token) => ({
  type: LOAD_MAPS,
  env,
  token,
  meta: {
    offline: {
      effect: {
        url: `${env}/graphql`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json;charset=utf8',
        },
        body: JSON.stringify({
          query: 'query { offlineMaps { from, to, center, name }  }',
        }),
      },
      commit: { type: LOAD_MAPS_COMMIT },
      rollback: { type: LOAD_MAPS_ROLLBACK },
    },
  },
});

// Projects
export const LOAD_PROJECTS = 'LOAD_PROJECTS';
export const LOAD_PROJECTS_COMMIT = 'LOAD_PROJECTS_COMMIT';
export const LOAD_PROJECTS_ROLLBACK = 'LOAD_PROJECTS_ROLLBACK';

export const loadProjectsByOrganization = (env, token, orgId) => ({
  type: LOAD_PROJECTS,
  env,
  token,
  meta: {
    offline: {
      effect: {
        url: `${env}/graphql`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query:
            'query projectsByOrganization($organizations: [Long]) { projectsByOrganization (organizations: $organizations) { id, title, description, color, active} }',
          variables: {
            organizations: orgId

          }
        }),
      },
      commit: { type: LOAD_PROJECTS_COMMIT },
      rollback: { type: LOAD_PROJECTS_ROLLBACK },
    }

  }
})

// Interventions

export const LOAD_INTERVENTION_DEFINITION = 'LOAD_INTERVENTION_DEFINITION';
export const LOAD_INTERVENTION_DEFINITION_COMMIT = 'LOAD_INTERVENTION_DEFINITION_COMMIT';
export const LOAD_INTERVENTION_DEFINITION_ROLLBACK = 'LOAD_INTERVENTION_DEFINITION_ROLLBACK';
export const SUBMIT_INTERVENTION = 'SUBMIT_INTERVENTION';
export const SUBMIT_INTERVENTION_COMMIT = 'SUBMIT_INTERVENTION_COMMIT';
export const SUBMIT_INTERVENTION_ROLLBACK = 'SUBMIT_INTERVENTION_ROLLBACK';

export const loadInterventionDefinition = (env, token, orgId) => ({
  type: LOAD_INTERVENTION_DEFINITION,
  env,
  token,
  meta: {
    offline:{
      effect: {
        url:`${env}/graphql`,
        method:'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body:JSON.stringify({
          query:`query interventionDefinitionByOrg( $organization: Long!) { interventionDefinitionByOrg( organization: $organization){ id title active questions { id codeName shortName answerType coreQuestion required options {value text otherOption}} }}`,
          variables: {
            organization: orgId
          }
        })
      },
      commit: { type:LOAD_INTERVENTION_DEFINITION_COMMIT},
      rollback: { type:LOAD_INTERVENTION_DEFINITION_ROLLBACK},
    }
  }
});

export const submitIntervention = (env, token, payload) => ({
  type: SUBMIT_INTERVENTION,
  payload,
  meta: {
    offline: {
      effect: {
        url:`${env}/graphql`,
        method: 'POST',
        headers: {
          Authorization:`Bearer ${token}`,
          'content-type': 'application/json;charset=utf8',
        },
        body:JSON.stringify({
          query: `mutation createIntervention($intervention: InterventionDataModelInput) { createIntervention (intervention: $intervention) { id  intervention{id} ${payload.params} } }`,
          variables: {
            intervention: {
              values: payload.values,
              interventionDefinition: payload.interventionDefinition,
              snapshot:payload.snapshot,
              intervention: payload.relatedIntervention
            }
        }
      })
    },
    commit: {
      type:SUBMIT_INTERVENTION_COMMIT,
      meta: {
        id:payload.values[0].value,
        payload
      }
    },
    rollback: {
      type:SUBMIT_INTERVENTION_ROLLBACK,
      meta: {
        id: {
          id:payload.values[0].value,
          payload
        }
      }
    }
  }
  }
})

// Surveys

export const LOAD_SURVEYS = 'LOAD_SURVEYS';
export const LOAD_SURVEYS_COMMIT = 'LOAD_SURVEYS_COMMIT';
export const LOAD_SURVEYS_ROLLBACK = 'LOAD_SURVEYS_ROLLBACK';

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
          'content-type': 'application/json;charset=utf8',
        },
        body: JSON.stringify({
          query:
            'query { surveysByUser { title id createdAt description minimumPriorities privacyPolicy { title  text } termsConditions{ title text }  surveyConfig { stoplightOptional signSupport pictureSupport isDemo documentType {text value otherOption} requiredFields{primaryParticipant, familyMember} gender { text value otherOption } surveyLocation { country latitude longitude}}  surveyEconomicQuestions { questionText codeName answerType topic topicAudio required forFamilyMember options {text value otherOption conditions{codeName, type, values, operator, valueType, showIfNoData}}, conditions{codeName, type, value, operator}, conditionGroups{groupOperator, joinNextGroup, conditions{codeName, type, value, operator}} } surveyStoplightQuestions { questionText codeName definition dimension id questionAudio stoplightColors { url value description } required } } }',
        }),
      },
      commit: { type: LOAD_SURVEYS_COMMIT },
      rollback: { type: LOAD_SURVEYS_ROLLBACK },
    },
  },
});

// Families

export const LOAD_FAMILIES = 'LOAD_FAMILIES';
export const LOAD_FAMILIES_COMMIT = 'LOAD_FAMILIES_COMMIT';
export const LOAD_FAMILIES_ROLLBACK = 'LOAD_FAMILIES_ROLLBACK';

export const loadFamilies = (env, token, params) => ({
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
          'content-type': 'application/json;charset=utf8',
        },
        body: JSON.stringify({
          query:
            `query { familiesNewStructure {familyId name allowRetake code project { title } snapshotList  { id surveyId stoplightSkipped createdAt familyData { familyMembersList { birthCountry birthDate documentNumber documentType email familyId firstName firstParticipant gender id lastName memberIdentifier phoneCode phoneNumber  socioEconomicAnswers { key value multipleValue other}  }  countFamilyMembers latitude longitude country accuracy } economicSurveyDataList { key value multipleValue other } indicatorSurveyDataList { key value snapshotStoplightId } achievements { action indicator roadmap } priorities { action estimatedDate indicator reason } interventions{ interventionName id interventionDate intervention{id}  ${params} } } } }`
        }),
      },
      commit: { type: LOAD_FAMILIES_COMMIT },
      rollback: { type: LOAD_FAMILIES_ROLLBACK },
    },
  },
});

// Priorities

export const ADD_PRIORITY = 'ADD_PRIORITY';
export const SUBMIT_PRIORITY = 'SUBMIT_PRIORITY';
export const SUBMIT_PRIORITY_COMMIT = 'SUBMIT_PRIORITY_COMMIT';
export const SUBMIT_PRIORITY_ROLLBACK = 'SUBMIT_PRIORITY_ROLLBACK';
export const addPriority = (payload) => ({
  type: ADD_PRIORITY,
  payload,
});
export const submitPriority = (env, token, payload) => ({
  type: SUBMIT_PRIORITY,
  payload,
  meta: {
    offline: {
      effect: {
        url: `${env}/graphql`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json;charset=utf8',
        },
        body: JSON.stringify({
          query:
            'mutation addPriority($newPriority : PriorityDtoInput) {addPriority(newPriority: $newPriority)  {  indicator, reviewDate, reason, action, indicator, months, snapshotStoplightId } }',
          variables: { newPriority: payload },
        }),
      },
      commit: {
        type: SUBMIT_PRIORITY_COMMIT,
        meta: {
          id: payload.snapshotStoplightId,
          payload

        }
      },
      rollback: {
        type: SUBMIT_PRIORITY_ROLLBACK,
        meta: {
          id: payload.snapshotStoplightId,
          payload
        }
      }
    }
  }
})



// Drafts

export const CREATE_DRAFT = 'CREATE_DRAFT';
export const UPDATE_DRAFT = 'UPDATE_DRAFT';
export const DELETE_DRAFT = 'DELETE_DRAFT';
export const ADD_SURVEY_DATA_CHECKBOX = 'ADD_SURVEY_DATA_CHECKBOX';
export const ADD_SURVEY_DATA = 'ADD_SURVEY_DATA';
export const SET_DRAFT_PENDING = 'SET_DRAFT_PENDING';
export const SUBMIT_DRAFT = 'SUBMIT_DRAFT';
export const SUBMIT_DRAFT_COMMIT = 'SUBMIT_DRAFT_COMMIT';
export const MANUAL_SUBMIT_DRAFT_COMMIT = 'MANUAL_SUBMIT_DRAFT_COMMIT';
export const MANUAL_SUBMIT_PICTURES_COMMIT = 'MANUAL_SUBMIT_PICTURES_COMMIT';
export const SUBMIT_DRAFT_ROLLBACK = 'SUBMIT_DRAFT_ROLLBACK';
export const SUBMIT_ERROR_DRAFT = 'SUBMIT_ERROR_DRAFT';
export const SUBMIT_ERROR_IMAGES = 'SUBMIT_ERROR_IMAGES';


export const createDraft = (payload) => ({
  type: CREATE_DRAFT,
  payload,
});

export const updateDraft = (payload) => ({
  type: UPDATE_DRAFT,
  payload,
});

export const deleteDraft = (id) => ({
  type: DELETE_DRAFT,
  id,
});

export const setDraftToPending = (id) => ({
  type: SET_DRAFT_PENDING,
  id
});

export const manualSubmitDraftCommit = (id, snapshotId, hasPictures) => ({
  type: MANUAL_SUBMIT_DRAFT_COMMIT,
  id,
  snapshotId,
  hasPictures
})

export const manualSubmitPicturesCommit = (id) => ({
  type: MANUAL_SUBMIT_PICTURES_COMMIT,
  id
})

export const submitDraftError = (id) => ({
  type: SUBMIT_ERROR_DRAFT,
  id
})

export const submitImagesError = (id) => ({
  type: SUBMIT_ERROR_IMAGES,
  id
})

export const addSurveyData = (id, category, payload) => ({
  type: ADD_SURVEY_DATA,
  category,
  id,
  payload,
});

const formatPhone = (code, phone) => {
  if (code && phone && phone.length > 0) {
    const phoneUtil = PhoneNumberUtil.getInstance();
    const international = '+' + code + ' ' + phone;
    let phoneNumber = phoneUtil.parse(international, code);
    phone = phoneNumber.getNationalNumber();
  }
  return phone;
};

//IMAGES
export const LOAD_IMAGES = 'LOAD_IMAGES';
export const LOAD_IMAGES_COMMIT = 'LOAD_IMAGES_COMMIT';
export const LOAD_IMAGES_ROLLBACK = 'LOAD_IMAGES_ROLLBACK';

export const submitDraftWithImages = (env, token, id, sanitizedSnapshot) => {
  console.log('Calling submitDraftWithImages');
  let formData = createFormData(sanitizedSnapshot);

  return {
    type: LOAD_IMAGES,
    env,
    token,
    id,
    meta: {
      offline: {
        effect: {
          url: `${env}/api/v1/snapshots/files/pictures/upload`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'multipart/form-data'
          },
          body: formData,
        },
        commit: {
          type: LOAD_IMAGES_COMMIT,
          draft: sanitizedSnapshot,
          env: env,
          token: token,
          id: id,
        },
        rollback: {
          type: LOAD_IMAGES_ROLLBACK,
          draft: sanitizedSnapshot,
          env: env,
          token: token,
          id: id,
        },
      },
    },
  };
};

const createFormData = (sanitizedSnapshot) => {
  let data = new FormData();
  console.log('sanitizedSnapshot');
  console.log(sanitizedSnapshot);

  if (sanitizedSnapshot.pictures) {
    sanitizedSnapshot.pictures.forEach((picture) => {
      data.append('pictures', {
        uri: picture.content,
        name: picture.name,
        type: picture.type,
      });
    });
  }
  return data;
};


export const manualSubmitDraft = (env, token, draft) => (dispatch) => {

  const id = draft.draftId;
  let payload = draft;

  delete payload.progress
  const sanitizedSnapshot = { ...payload };

  let { economicSurveyDataList } = payload;

  const validEconomicIndicator = (ec) =>
    (ec.value !== null && ec.value !== undefined && ec.value !== '') ||
    (!!ec.multipleValue && ec.multipleValue.length > 0);

  economicSurveyDataList = economicSurveyDataList.filter(
    validEconomicIndicator,
  );
  sanitizedSnapshot.economicSurveyDataList = economicSurveyDataList;
  sanitizedSnapshot.familyData.familyMembersList.forEach((member) => {
    let { socioEconomicAnswers = [] } = member;
    delete member.memberIdentifier;
    delete member.id;
    delete member.familyId;
    delete member.uuid;

    member.phoneNumber = formatPhone(member.phoneCode, member.phoneNumber);
    socioEconomicAnswers = socioEconomicAnswers.filter(validEconomicIndicator);
    // eslint-disable-next-line no-param-reassign
    member.socioEconomicAnswers = socioEconomicAnswers;
  });

  return fetch(`${env}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json;charset=utf8',
    },
    body: JSON.stringify({
      query:
        'mutation addSnapshot($newSnapshot: NewSnapshotDTOInput) {addSnapshot(newSnapshot: $newSnapshot)  { snapshotId surveyId surveyVersionId snapshotStoplightAchievements { action indicator roadmap } snapshotStoplightPriorities { reason action indicator estimatedDate } family { familyId } user { userId  username } indicatorSurveyDataList {key value} economicSurveyDataList {key value multipleValue} familyDataDTO { latitude longitude accuracy familyMemberDTOList { firstName lastName socioEconomicAnswers {key value } } } } }',
      variables: { newSnapshot: sanitizedSnapshot },
    })
  })
};

export const submitPictures = (env, token, pictures) => (dispatch) => {
  let formData = new FormData();

  formData = createFormData({ pictures });

  return fetch(`${env}/api/v1/snapshots/files/pictures/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'multipart/form-data',
    },
    body: formData
  })
};

export const updateSnapshotImages = (env, token, snapshotId, pictures) => (dispatch) => {
  return fetch(`${env}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json;charset=utf8',
    },
    body: JSON.stringify({
      query:
      'mutation updateSnapshotPictures($snapshot: SnapshotUpdateModelInput) {updateSnapshotPictures(snapshot: $snapshot){successful}}',
      variables: {
        snapshot: {
          id: snapshotId,
          pictures: pictures
        }
      },
    })
  })
}

export const submitDraft = (env, token, id, payload) => {
  console.log('----Calling Submit Draft----');
  const sanitizedSnapshot = { ...payload };

  let { economicSurveyDataList } = payload;

  const validEconomicIndicator = (ec) =>
    (ec.value !== null && ec.value !== undefined && ec.value !== '') ||
    (!!ec.multipleValue && ec.multipleValue.length > 0);

  economicSurveyDataList = economicSurveyDataList.filter(
    validEconomicIndicator,
  );
  sanitizedSnapshot.economicSurveyDataList = economicSurveyDataList;
  sanitizedSnapshot.familyData.familyMembersList.forEach((member) => {
    let { socioEconomicAnswers = [] } = member;
    delete member.memberIdentifier;
    delete member.id;
    delete member.familyId;
    delete member.uuid;

    member.phoneNumber = formatPhone(member.phoneCode, member.phoneNumber);
    socioEconomicAnswers = socioEconomicAnswers.filter(validEconomicIndicator);
    // eslint-disable-next-line no-param-reassign
    member.socioEconomicAnswers = socioEconomicAnswers;
  });
  console.log(sanitizedSnapshot);
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
            'content-type': 'application/json;charset=utf8',
          },
          body: JSON.stringify({
            query:
              'mutation addSnapshot($newSnapshot: NewSnapshotDTOInput) {addSnapshot(newSnapshot: $newSnapshot)  { surveyId surveyVersionId snapshotStoplightAchievements { action indicator roadmap } snapshotStoplightPriorities { reason action indicator estimatedDate } family { familyId } user { userId  username } indicatorSurveyDataList {key value} economicSurveyDataList {key value multipleValue} familyDataDTO { latitude longitude accuracy familyMemberDTOList { firstName lastName socioEconomicAnswers {key value } } } } }',
            variables: { newSnapshot: sanitizedSnapshot },
          }),
        },
        commit: {
          type: SUBMIT_DRAFT_COMMIT,
          meta: {
            id,
            sanitizedSnapshot,
          },
        },
        rollback: {
          type: SUBMIT_DRAFT_ROLLBACK,
          meta: {
            id,
            sanitizedSnapshot,
          },
        },
      },
    },
  };
};

// Language

export const SWITCH_LANGUAGE = 'SWITCH_LANGUAGE';

export const switchLanguage = (language) => ({
  type: SWITCH_LANGUAGE,
  language,
});

// Store Hydration

export const SET_HYDRATED = 'SET_HYDRATED';

export const setHydrated = () => ({
  type: SET_HYDRATED,
});

// Sync

export const SET_SYNCED_ITEM_TOTAL = 'SET_SYNCED_ITEM_TOTAL';
export const SET_SYNCED_ITEM_AMOUNT = 'SET_SYNCED_ITEM_AMOUNT';
export const SET_SYNCED_STATE = 'SET_SYNCED_STATE';
export const RESET_SYNCED_STATE = 'RESET_SYNCED_STATE';

export const setSyncedItemTotal = (item, amount) => ({
  type: SET_SYNCED_ITEM_TOTAL,
  item,
  amount,
});

export const setSyncedItemAmount = (item, amount) => ({
  type: SET_SYNCED_ITEM_AMOUNT,
  item,
  amount,
});

export const setSyncedState = (item, value) => ({
  type: SET_SYNCED_STATE,
  item,
  value,
});

export const setAppVersion = (value) => ({
  type: SET_SYNCED_STATE,
  item: 'appVersion',
  value,
});

export const resetSyncState = () => ({
  type: RESET_SYNCED_STATE,
});

// API Versioning

export const TOGGLE_API_VERSION_MODAL = 'TOGGLE_API_VERSION_MODAL';
export const MARK_VERSION_CHECKED = 'MARK_VERSION_CHECKED';

export const markVersionCheked = (timestamp) => ({
  type: MARK_VERSION_CHECKED,
  timestamp,
});

export const toggleAPIVersionModal = (isOpen) => ({
  type: TOGGLE_API_VERSION_MODAL,
  isOpen,
});
