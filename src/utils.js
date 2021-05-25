import * as RNLocalize from 'react-native-localize';

export const replaceSpecialChars = (text) => {
  const SYMBOLS_MAP = {
    'Ã³': 'ó',
    'Ã¼': 'ü',
    'Ã¤': 'ä',
    'Ã¶': 'ö',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã±': 'ñ',
    'Ã\u00ad': 'í',
  };

  let textToBeCleaned = JSON.stringify(text);
  for (const symbol in SYMBOLS_MAP) {
    if (SYMBOLS_MAP.hasOwnProperty(symbol)) {
      const CORRECT_CHAR_FROM_MAP = SYMBOLS_MAP[symbol];
      textToBeCleaned = textToBeCleaned.replace(
        new RegExp(symbol, 'g'),
        CORRECT_CHAR_FROM_MAP,
      );
    }
  }
  return JSON.parse(textToBeCleaned);
};

export const getDeviceLanguage = () => {
  const APP_LANGUAGES = ['en', 'es', 'pt', 'ht','ar'];
  const deviceLanguages = RNLocalize.getLocales();
  const { languageCode } = deviceLanguages[0];

  return APP_LANGUAGES.some((lang) => lang === languageCode)
    ? languageCode
    : 'en';
};


export const getLocaleForLanguage = (language) => {
  const resources = {
    en: "en",
    es: "es",
    pt: "pt",
    ht: "fr",
    ar: "ar"
  }
  return resources[language] || 'en';
}
