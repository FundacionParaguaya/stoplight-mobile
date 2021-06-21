export const NUMBER_FORMAT_PER_LANG = {
    en: {
      THOUSAND: '$1,',
    },
    es: {
      THOUSAND: '$1.',
    }
  };

  export const getThousandSeparatorByLang = lang => {
    const conf = NUMBER_FORMAT_PER_LANG[lang] || NUMBER_FORMAT_PER_LANG.en;
    return conf.THOUSAND;
  };