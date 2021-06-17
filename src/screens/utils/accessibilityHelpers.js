import i18n from '../../i18n'

const pause = '.'

export const setListOfLabeles = options => {
  if (!options) {
    return ''
  }
  const optionsList = `${options
    .map(item => item.text || item.label)
    .join()} ${pause}`

  return `Choose one of the options from the dropdown ${optionsList}`
}

export const logoutModalAccessibleText = (
  unsyncedDrafts,
  checkboxesVisible
) => {
  const logoutTitle = `${
    !checkboxesVisible
      ? i18n.t('views.logout.logout')
      : `${i18n.t('general.warning')}!`
  }`

  const logoutCheckboxes = `
  ${i18n.t('general.delete')} ${i18n.t('general.drafts')}
  ${i18n.t('general.delete')} ${i18n.t('general.lifeMaps')}
  ${i18n.t('general.delete')} ${i18n.t('general.familyInfo')}
  ${i18n.t('general.delete')} ${i18n.t('general.cachedData')}${pause}
  `

  const logoutBody = `
    ${
      !checkboxesVisible
        ? unsyncedDrafts
          ? `${i18n.t('views.logout.youHaveUnsynchedData')}
        ${i18n.t('views.logout.thisDataWillBeLost')} . ${i18n.t(
              'views.logout.areYouSureYouWantToLogOut'
            )}${pause}`
          : `
      ${i18n.t('views.logout.weWillMissYou')} ${i18n.t(
              'views.logout.comeBackSoon'
            )} . ${i18n.t('views.logout.areYouSureYouWantToLogOut')}`
        : `${i18n.t('views.logout.looseYourData')} ${i18n.t(
            'views.logout.cannotUndo'
          )}
          ${logoutCheckboxes}
          `
    }
  `
  const logoutButtons = `${
    !checkboxesVisible
      ? `${i18n.t('general.yes')} ${pause} ${i18n.t('general.no')}`
      : `${i18n.t('general.delete')} ${pause} ${i18n.t('general.cancel')}`
  }`

  return `
  ${logoutTitle}${pause}
  ${logoutBody}
  ${logoutButtons}
`
}

export const exitModalAccessibleText = (draftId, deleteDraftOnExit) => {
  const popUpBody = `${
    !draftId || deleteDraftOnExit
      ? `
      ${
        deleteDraftOnExit
          ? i18n.t('views.modals.lifeMapWillNotBeSaved')
          : i18n.t('views.modals.weCannotContinueToCreateTheLifeMap')
      }
      ${i18n.t('views.modals.areYouSureYouWantToExit')}`
      : `${i18n.t('views.modals.yourLifemapIsNotComplete')}${pause}${i18n.t(
          'views.modals.thisWillBeSavedAsADraft'
        )}`
  }`
  const popUpButtons = `${i18n.t('general.yes')}${pause}${i18n.t('general.no')}`
  return `
    ${popUpBody}
    ${popUpButtons}
  `
}

export const screenSyncScreenContent = (
  offline,
  pendingDrafts,
  draftsWithError
) => {
  const screenTitle = `${i18n.t('views.synced')}${pause}`

  const syncUptoDate =
    offline.online && !pendingDrafts.length && !draftsWithError.length
  const syncInProgress = offline.online && pendingDrafts.length
  const syncOffline = !offline.online
  const syncRetry =
    offline.online && draftsWithError.length && !pendingDrafts.length

  let syncBody

  if (syncUptoDate) {
    syncBody = `${i18n.t('views.sync.upToDate')}`
  } else if (syncInProgress) {
    syncBody = `${i18n.t('views.sync.inProgress')} `
  } else if (syncOffline) {
    syncBody = `${i18n.t('views.sync.offline')}`
  } else if (syncRetry) {
    syncBody = `${
      draftsWithError === 1
        ? i18n.t('views.sync.priorityHasError').replace('%n', draftsWithError)
        : i18n.t('views.sync.prioritiesHaveError').replace('%n', draftsWithError)
    }`
  }

  return `
    ${screenTitle}
    ${syncBody}
  `
}

export const skippedScreen = tipVisible => {
  const pageTitle = i18n.t('views.skippedIndicators')
  const skippedTip = tipVisible
    ? `${i18n.t('views.lifemap.youSkipped')} 
      ${i18n.t('views.lifemap.whyNotTryAgain')}
      ${i18n.t('general.gotIt')}`
    : ''
  return `
    ${pageTitle}
    ${skippedTip}
  `
}

export const prioritiesScreen = (tipVisible, tipDescription) => {
  const pageTitle = i18n.t('views.lifemap.priorities')
  const prioritiesTip = tipVisible
    ? `${i18n.t('views.lifemap.toComplete')} 
    ${tipDescription}
  ${i18n.t('general.gotIt')}
  `
    : ''

  return `
    ${pageTitle}
    ${prioritiesTip}
  `
}

export const setAccessibleColorName = (colors, item) => {
  if (!item) {
    return ''
  }
  const type = Object.keys(colors).find(key => colors[key] === item)
  const colorSchema = {
    gold: () => {
      return `${i18n.t('views.lifemap.yellow')}`
    },
    palegreen: () => {
      return `${i18n.t('views.lifemap.green')}`
    },
    palered: () => {
      return `${i18n.t('views.lifemap.red')}`
    },
    palegrey: () => {
      return 'No answer selected'
    }
  }

  return (typeof colorSchema[type] === 'function' && colorSchema[type]()) || ''
}

export const setAccessibleIndicatorName = indicatorCodeName => {
  if (!indicatorCodeName) {
    return ''
  }

  // this line splits the camel cased codenames coming from the server
  // and adds pause between each word
  return (
    indicatorCodeName.replace(/([a-z0-9])([A-Z])/g, `$1 ${pause} $2`) + pause
  )
}

export const setAccessibilityTextForFamilies = () => {
  const pageTitle = i18n.t('view.families')
  return `
    ${pageTitle}
  `
}
