import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/fr';

import moment from 'moment';

import i18n from '../../i18n';
import colors from '../../theme.json';
import {
  achievementIcon,
  achievementIconWithoutStyles,
  priorityIcon,
  priorityIconWithoutStyles,
  styles,
} from './assets';

import {getLocaleForLanguage} from '../../utils';

moment.locale('en');
const MAX_COLS = 5;

export const getReportTitle = (snapshot) => {
  const firstParticipant = snapshot.familyData.familyMembersList.find(
    (m) => !!m.firstParticipant,
  );
  return `${firstParticipant.firstName} ${firstParticipant.lastName}`;
};

export const getIndicatorQuestionByCodeName = (codeName, survey) => {
  const {surveyStoplightQuestions: questions} = survey;
  return questions.find((q) => q.codeName === codeName).questionText;
};

export const getColor = (value) => {
  switch (value) {
    case 1:
      return colors.palered;
    case 2:
      return colors.gold;
    case 3:
      return colors.palegreen;
    case 0:
      return colors.palegrey;

    default:
      return colors.palegrey;
  }
};

const createTableRow = (
  indicatorsArray,
  survey,
  achievements,
  priorities,
  previousIndicatorsList,
  previousIndicatorPriorities,
  previousIndicatorAchievements
) => {
  console.log('previusInd', previousIndicatorsList);
  return `<tr style="${styles.tableRow}">
              ${indicatorsArray
                .map((indicator) => {
                  const color = getColor(indicator.value);
                  const title = getIndicatorQuestionByCodeName(
                    indicator.key,
                    survey,
                  );
                  const previousIndicator = previousIndicatorsList.find(
                    (prevInd) => prevInd.key == indicator.key,
                  );

                  const prevIndColor = previousIndicator ?  getColor(previousIndicator.value):null ;
                  return `<td style="width: ${100 / MAX_COLS}%;${
                    styles.tableData
                  }">
                              <div style="${styles.indicatorBallContainer}">
                            ${
                              previousIndicatorsList && previousIndicatorsList.length > 0 ?
                              `<div style="position:relative">
                            
                            <div style="${
                              styles.prevBall
                            }background-color:${prevIndColor};">
                            ${
                              previousIndicatorAchievements.some(
                                (a) => a.indicator === indicator.key,
                              )
                                ? achievementIcon(
                                    'max-width:20px;border-radius:35px;',

                                  )
                                : ''
                            }
                            ${
                              previousIndicatorPriorities.some(
                                (p) => p.indicator === indicator.key,
                              )
                                ? priorityIcon(
                                    'max-width:20px;border-radius:35px',
                                  )
                                : ''
                            }
                            </div>
                            </div>`
                            :''}
                              

                              <div style="position:relative">
                              ${
                                achievements.some(
                                  (a) => a.indicator === indicator.key,
                                )
                                  ? achievementIcon(
                                      'position:absolute;width:25px;left:35px;border-radius:35px;z-index:15;',
                                    )
                                  : ''
                              }
                              ${
                                priorities.some(
                                  (p) => p.indicator === indicator.key,
                                )
                                  ? priorityIcon(
                                      'position:absolute;width:25px; border-radius:45px;left:35px;z-index:15;',
                                    )
                                  : ''
                              }
                              <div style="${
                                styles.ball
                              }background-color:${color};"></div>
                              </div>
                              </div>
                            <span style="${
                              styles.indicatorName
                            }">${title}</span>
                            <div>
                          </td>`;
                })
                .join('')}
            </tr>`;
};


/* PRIORITIES TABLE */
const generateTableHeaderForPriorities = (dateCreated) => `
  <div style="${styles.wrapperHeader};page-break-before: always;">
              <h2 style="${styles.title}">${i18n.t(
  'views.lifemap.myPriorities',
)} ${priorityIconWithoutStyles}</h2>
              <h2 style="${styles.date};margin-top:40px;">${dateCreated.format(
  'MMMM D, YYYY',
)}</h2>
            </div>
  <tr>
    <th style="${styles.tHeader}">${i18n.t('views.lifemap.status')}</th>
    <th style="${styles.tHeader};text-align:left;">${i18n.t(
  'views.lifemap.indicator',
)}</th>
    <th style="${styles.tHeader}">${i18n.t(
  'views.lifemap.whyDontYouHaveIt',
)}</th>
    <th style="${styles.tHeader}">${i18n.t(
  'views.lifemap.whatWillYouDoToGetIt',
)}</th>
    <th style="${styles.tHeader}">${i18n.t('views.lifemap.monthsRequired')}</th>
    <th style="${styles.tHeader}">${i18n.t('views.lifemap.reviewDate')}</th>
    </tr>`;

const generatePrioritiesTable = (
  priorities,
  dateCreated,
  survey,
  indicatorsArray,
  lng,
) => {
  return `
          <table cellspacing="0" stye="${
            styles.tableWithHeader
          };page-break-after: always;">
            ${generateTableHeaderForPriorities(dateCreated)}
            ${priorities
              .map((priority, index) => {
                const stripe = index % 2 !== 0;
                const {reason, action, estimatedDate, indicator} = priority;
                const indicatorValue = indicatorsArray.find(
                  (i) => i.key === indicator,
                ).value;
                const color = getColor(indicatorValue);
                const dateForReviewWithLocale = moment(dateCreated);

                dateForReviewWithLocale.locale(getLocaleForLanguage(lng));
                const dateForReview = dateForReviewWithLocale
                  .add(estimatedDate, 'months')
                  .format('DD MMM, YYYY');
                return `<tr style="${
                  stripe ? 'background-color:rgb(238,238,238)' : ''
                }">
                          <td style="${styles.tData}">
                            <div style="${styles.indicatorWrapper}">
                              <div style="${
                                styles.smallBall
                              }background-color:${color};"></div>
                            <div>
                        </td>
                          <td style="${
                            styles.tData
                          }text-transform:capitalize;text-align:left;">${getIndicatorQuestionByCodeName(
                  indicator,
                  survey,
                )}</td>
                          <td style="${styles.tData}">${reason}</td>
                          <td style="${styles.tData}">${action}</td>
                          <td style="${styles.tData}">${estimatedDate}</td>
                          <td style="text-align:center">${dateForReview}</td>
                        </tr>`;
              })
              .join('')}
            
          </table>`;
};
/* END PRIORITIES TABLE */

/* ACHIEVEMENTS TABLE */
const generateTableHeaderForAchievements = (dateCreated) => `
  <div style="${styles.wrapperHeader};page-break-before: always;">
              <h2 style="${styles.title}">${i18n.t(
  'views.lifemap.myAchievements',
)} ${achievementIconWithoutStyles}</h2>
              <h2 style="${styles.date};margin-top:40px;">${dateCreated.format(
  'MMMM D, YYYY',
)}</h2>
            </div>
  <tr>
    <th style="${styles.tHeader}">${i18n.t('views.lifemap.status')}</th>
    <th style="${styles.tHeader};text-align:left;">${i18n.t(
  'views.lifemap.indicator',
)}</th>
    <th style="${styles.tHeader}">${i18n.t('views.lifemap.howDidYouGetIt')}</th>
    <th style="${styles.tHeader}">${i18n.t(
  'views.lifemap.whatDidItTakeToAchieveThis',
)}</th>
    </tr>`;

const generateAchievementsTable = (
  achievements,
  dateCreated,
  survey,
  indicatorsArray,
) => {
  return `
              <table cellspacing="0" stye="${
                styles.tableWithHeader
              };page-break-after: always;">
                ${generateTableHeaderForAchievements(dateCreated)}
                ${achievements
                  .map((achievement, index) => {
                    const stripe = index % 2 !== 0;
                    const {action, roadmap, indicator} = achievement;
                    const indicatorValue = indicatorsArray.find(
                      (i) => i.key === indicator,
                    ).value;
                    const color = getColor(indicatorValue);

                    return `<tr style="${
                      stripe ? 'background-color:rgb(238,238,238)' : ''
                    }">
                              <td style="${styles.tData}">
                                <div style="${styles.indicatorWrapper}">
                                  <div style="${
                                    styles.smallBall
                                  }background-color:${color};"></div>
                                <div>
                            </td>
                              <td style="${
                                styles.tData
                              }text-transform:capitalize;text-align:left;">${getIndicatorQuestionByCodeName(
                      indicator,
                      survey,
                    )}</td>
                              <td style="${styles.tData}">${action}</td>
                              <td style="${styles.tData}">${roadmap}</td>
                            </tr>`;
                  })
                  .join('')}
                
              </table>`;
};
/* END ACHIEVEMENTS TABLE */

const generateLifeMapHtmlTemplate = (draft, survey, lng) => {
  const indicatorsList = draft.indicatorSurveyDataList;
  const achievements = draft.achievements;
  const priorities = draft.priorities;
  const previousIndicatorsList = draft.previousIndicatorSurveyDataList || [];
  const previousIndicatorPriorities = draft.previousIndicatorPriorities || [];
  const previousIndicatorAchievements = draft.previousIndicatorAchievements || [];
  let dateCreated = draft && draft.created && moment.utc(draft.created);
  dateCreated.locale(getLocaleForLanguage(lng));

  const reportTitle = getReportTitle(draft);

  return `<div style="${styles.wrapper}">
            <h2 style="${styles.title}">${reportTitle}, ${i18n.t(
    'views.lifemap.lifeMap',
  )}</h2>
            <h2 style="${styles.date}">${dateCreated.format(
    'MMMM D, YYYY',
  )}</h2>
          </div>
          <table style="${styles.table}">${indicatorsList
    .map((indicator, index) => {
      if (index % MAX_COLS === 0) {
        return createTableRow(
          indicatorsList.slice(index, index + MAX_COLS),
          survey,
          achievements,
          priorities,
          previousIndicatorsList.slice(index, index + MAX_COLS),
          previousIndicatorPriorities,
          previousIndicatorAchievements
        );
      }
    })
    .join('')}
        </table>
        ${
          priorities.length > 0
            ? generatePrioritiesTable(
                priorities,
                dateCreated,
                survey,
                indicatorsList,
                lng,
              )
            : ''
        }
        ${
          achievements.length > 0
            ? generateAchievementsTable(
                achievements,
                dateCreated,
                survey,
                indicatorsList,
                lng,
              )
            : ''
        }
        `;
};

export const buildPrintOptions = (draft, survey, lng) => {
  return {
    html: generateLifeMapHtmlTemplate(draft, survey, lng),
  };
};

export const buildPDFOptions = (draft, survey, lng) => {
  return {
    html: generateLifeMapHtmlTemplate(draft, survey, lng),
    fileName: 'lifemap.pdf',
    directory: 'docs',
    padding: 0,
    height: 842,
    width: 595,
  };
};
