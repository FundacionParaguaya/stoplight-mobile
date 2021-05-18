import i18n from 'i18next'
import { reactI18nextModule } from 'react-i18next'

import en from './locales/en.json'
import es from './locales/es.json'
import pt from './locales/pt.json'
import ht from './locales/ht.json'
import ar from './locales/ar.json'
import store from './redux/store'
import { getDeviceLanguage } from './utils'

const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  },
  pt: {
    translation: pt
  },
  ht: {
    translation: ht
  },
  ar:{
    translation: ar
  }
}

/* eslint-disable import/no-named-as-default-member */

// set language after store rehydration
export const setLanguage = () => {
  const reduxLanguage = store.getState().language
  let lng

  // check if the app store has a set language from the user,
  // if not check the device language
  if (reduxLanguage) {
    lng = reduxLanguage
  } else {
    lng = getDeviceLanguage()
  }

  i18n.changeLanguage(lng)
}

i18n.use(reactI18nextModule).init({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false // react already safes from xss
  }
})

export default i18n
