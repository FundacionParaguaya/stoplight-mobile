import {
  getConditionalQuestions,
  getDraftWithUpdatedQuestionsCascading,
} from '../utils/conditional_logic';

import {ImageStore} from 'react-native';
import {generateRandomDraftData} from './demo_draft_generator';
import {getTotalScreens} from '../lifemap/helpers';

const LATIN_CHARS = /^[A-Za-z0-9]*$/;

export const checkAndReplaceSpecialChars = (question) => {
  return {
    ...question,
    options: question.options.map((option) => {
      return {
        ...option,
        text: LATIN_CHARS.test(option.text.replace(/\s/g, '')) // check for strange chars and if found decode
          ? option.text
          : decodeURIComponent(option.text),
      };
    }),
  };
};

export const prepareDraftForSubmit = (draft, survey) => {
  const conditionalQuestions = getConditionalQuestions(survey);
  const currentDraft = getDraftWithUpdatedQuestionsCascading(
    draft,
    conditionalQuestions,
    false,
  );

  // remove unnecessary for sync properties from saved draft
  const {
    previousIndicatorSurveyDataList,
    previousIndicatorPriorities,
    previousIndicatorAchievements,
    progress,
    errors,
    status,
    ...result
  } = Object.assign({}, currentDraft);

  // we remove
  previousIndicatorSurveyDataList;
  previousIndicatorPriorities;
  previousIndicatorAchievements;

  progress;
  errors;
  status;

  // check for frequent sync errors

  // set country to survey country if not set
  if (result.familyData && !result.familyData.country) {
    result.familyData.country =
      survey.surveyConfig.surveyLocation &&
      survey.surveyConfig.surveyLocation.country;
  }

  // set default latitude and longitude if not set
  if(result.familyData && ( !result.familyData.longitude && !result.familyData.latitude)){
    result.familyData.latitude=  survey.surveyConfig.surveyLocation && survey.surveyConfig.surveyLocation.latitude;
    result.familyData.longitude =  survey.surveyConfig.surveyLocation && survey.surveyConfig.surveyLocation.longitude;
  }
  console.log('prepared', result);

  return result;
};
export const convertImages = (sanitizedSnapshot) => {
  // var base64Pictures = []
  const promises = [];
  for (var index in sanitizedSnapshot.pictures) {
    var picture = sanitizedSnapshot.pictures[index];
    const imagePromise = new Promise((resolve, reject) => {
      ImageStore.getBase64ForTag(
        picture.content,
        (success) => {
          resolve({
            name: picture.name,
            content: 'data:' + picture.type + ';base64,' + success,
            type: picture.type,
          });
        },
        () => reject('conversion to base64 failed'),
      );
    });
    promises.push(imagePromise);
  }
  return Promise.all(promises);
};

export const generateNewDemoDraft = (survey, draftId, projectId) => {
  const toalScreens = getTotalScreens(survey);
  const random = Math.floor(
    Math.random() & survey.surveyConfig.documentType.length,
  );
  const documentType = survey.surveyConfig.documentType[random];
  const surveyId = survey.id;
  return generateRandomDraftData(
    draftId,
    surveyId,
    toalScreens,
    documentType,
    projectId,
  );
};

//helps us calculate the progress bar.
export const calculateProgressBar = ({
  readOnly,
  draft,
  screen = 1,
  isLast,
  currentScreen,
  skipQuestions,
}) => {
  if (readOnly || !draft) {
    return 0;
  }
  if (isLast) {
    return (draft.progress.total - 1) / draft.progress.total;
  }
  if (skipQuestions) {
    //search all surveys and remove the questions from the total of the draft.

    if (currentScreen == 'Picture') {
      return (draft.progress.total - 3) / draft.progress.total;
    } else {
      //if we have the signing after the questions (e.g Testing, Fupa)
      let minusScreens = draft.indicatorSurveyDataList.length > 0 ? 1 : 2;
      return (draft.progress.total - minusScreens) / draft.progress.total;
    }
    //return 80%, or 90%;
  }

  //decide if we add one more screen if the primary participant is not alone (the family members screen).
  let showSkippedScreen =
    draft.indicatorSurveyDataList.findIndex((x) => x.value == 0) != -1 ? 1 : 0;
  let membersScreen = draft.familyData.familyMembersList.length > 1 ? 1 : 0;
  //let economicQuestions = draft.progress.socioEconomics ? draft.progress.socioEconomics.questionsPerScreen.length : 0;

  //  let mainScreens = skipQuestions ? draft.progress.total - economicQuestions : draft.progress.total

  let totalScreens = draft.progress.total + membersScreen + showSkippedScreen;

  return screen / (totalScreens + 2);
};

export const fakeSurvey = (draftId, date) => {
  return {
    draftId: draftId,
    project: null,
    stoplightSkipped: false,
    sign: '',
    pictures: [],
    sendEmail: false,
    created: date,
    status: 'Sync error',
    surveyId: 61,
    economicSurveyDataList: [
      {
        key: 'areaOfResidence',
        value: 'RURAL',
      },
      {
        key: 'housingSituation',
        value: 'PROPIA_CON_TITULO',
      },
      {
        key: 'ownerOfTitle',
        multipleValue: ['ESPOSA_CONCUBINA'],
      },
      {
        key: 'mainLanguageHome',
        value: 'ESPANOL',
      },
      {
        key: 'otherLanguageHome',
        multipleValue: ['GUARANI'],
      },
      {
        key: 'familyCar',
        value: 'NO',
      },
      {
        key: 'memberDiedBefore5',
        value: 'NO',
      },
      {
        key: 'memberDisability',
        value: 'NO',
      },
      {
        key: 'activityMain',
        value: 'VENTAS_(DESPENSA_COPETIN_COMESTIBLE)',
      },
      {
        key: 'householdMonthlyIncome',
        value: '666',
      },
      {
        key: 'howManyWork',
        value: '1',
      },
      {
        key: 'otherMonthlyIncomes',
        value: '66',
      },
      {
        key: 'ifReceiveStateIncome',
        value: 'NO',
      },
      {
        key: 'havePartner',
        value: 'NO',
      },
    ],
    indicatorSurveyDataList: [
      {
        key: 'income',
        value: 3,
      },
      {
        key: 'familySavings',
        value: 3,
      },
      {
        key: 'accessToCredit',
        value: 3,
      },
      {
        key: 'diversifiedSourcesOfIncome',
        value: 3,
      },
      {
        key: 'documentation',
        value: 1,
      },
      {
        key: 'unpollutedEnvironment',
        value: 3,
      },
      {
        key: 'garbageDisposal',
        value: 3,
      },
      {
        key: 'drinkingWaterAccess',
        value: 3,
      },
      {
        key: 'accessToHealthServices',
        value: 1,
      },
      {
        key: 'alimentation',
        value: 3,
      },
      {
        key: 'personalHygiene',
        value: 3,
      },
      {
        key: 'sexualHealth',
        value: 3,
      },
      {
        key: 'dentalCare',
        value: 1,
      },
      {
        key: 'eyesight',
        value: 3,
      },
      {
        key: 'vaccinations',
        value: 3,
      },
      {
        key: 'insurance',
        value: 3,
      },
      {
        key: 'safeHouse',
        value: 3,
      },
      {
        key: 'comfortOfTheHome',
        value: 3,
      },
      {
        key: 'separateBedrooms',
        value: 2,
      },
      {
        key: 'properKitchen',
        value: 2,
      },
      {
        key: 'safeBathroom',
        value: 3,
      },
      {
        key: 'refrigerator',
        value: 2,
      },
      {
        key: 'phone',
        value: 3,
      },
      {
        key: 'clothingAndFootwear',
        value: 3,
      },
      {
        key: 'safety',
        value: 3,
      },
      {
        key: 'securityOfProperty',
        value: 2,
      },
      {
        key: 'electricityAccess',
        value: 2,
      },
      {
        key: 'regularMeansOfTransportation',
        value: 3,
      },
      {
        key: 'road',
        value: 3,
      },
      {
        key: 'middleEducation',
        value: 3,
      },
      {
        key: 'readAndWrite',
        value: 2,
      },
      {
        key: 'schoolSuppliesAndBooks',
        value: 2,
      },
      {
        key: 'capacityToPlanAndBudget',
        value: 3,
      },
      {
        key: 'knowledgeAndSkillsToGenerateIncome',
        value: 3,
      },
      {
        key: 'accessInformation',
        value: 2,
      },
      {
        key: 'accessToEntertainment',
        value: 3,
      },
      {
        key: 'respectForDiversity',
        value: 2,
      },
      {
        key: 'awarenessOfHumanRights',
        value: 2,
      },
      {
        key: 'childLabor',
        value: 3,
      },
      {
        key: 'socialCapital',
        value: 3,
      },
      {
        key: 'influenceInPublicSector',
        value: 3,
      },
      {
        key: 'abilityToSolveProblemsAndConflicts',
        value: 3,
      },
      {
        key: 'registeredToVoteAndVotesInElections',
        value: 3,
      },
      {
        key: 'awarenessOfNeeds',
        value: 3,
      },
      {
        key: 'selfEsteem',
        value: 3,
      },
      {
        key: 'moralConscience',
        value: 3,
      },
      {
        key: 'emotionalIntelligence',
        value: 3,
      },
      {
        key: 'householdViolence',
        value: 3,
      },
      {
        key: 'entrepreneurialSpirit',
        value: 3,
      },
      {
        key: 'autonomyDecisions',
        value: 3,
      },
      {
        key: 'culturalTraditionsAndHeritage',
        value: 3,
      },
      {
        key: 'addictions',
        value: 3,
      },
    ],
    priorities: [],
    achievements: [],
    familyData: {
      familyMembersList: [
        {
          firstParticipant: true,
          socioEconomicAnswers: [],
          birthCountry: 'PY',
          phoneCode: '595',
          firstName: 'Fake Survey',
          lastName: 'Test Generated',
          gender: 'M',
          birthDate: 1577829600,
          documentType: 'CEDULA_DE_IDENTIDAD',
          documentNumber: 'test survey generated',
        },
      ],
      countFamilyMembers: 1,
      country: 'PY',
      latitude: 42.769827767585895,
      longitude: 23.470804059797786,
      accuracy: 0,
    },
    progress:{
      screen:"SocioEconomicQuestion",
      total:18
    },
    whatsappNotification: false,
  };
};
