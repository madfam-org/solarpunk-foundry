// src/locales.ts
var locales = ["en", "es", "pt"];
var defaultLocale = "es";
var fallbackLocale = "en";
var localeMetadata = {
  en: {
    code: "en",
    nativeName: "English",
    englishName: "English",
    direction: "ltr",
    dateFormat: "MM/DD/YYYY",
    decimalSeparator: ".",
    thousandsSeparator: ","
  },
  es: {
    code: "es",
    nativeName: "Espa\xF1ol",
    englishName: "Spanish",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    decimalSeparator: ",",
    thousandsSeparator: "."
  },
  pt: {
    code: "pt",
    nativeName: "Portugu\xEAs",
    englishName: "Portuguese",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    decimalSeparator: ",",
    thousandsSeparator: "."
  }
};
function isValidLocale(value) {
  return locales.includes(value);
}
function parseLocale(value) {
  if (value && isValidLocale(value)) {
    return value;
  }
  return fallbackLocale;
}
function getLocaleMetadata(locale) {
  const validLocale = parseLocale(locale);
  return localeMetadata[validLocale];
}

export { defaultLocale, fallbackLocale, getLocaleMetadata, isValidLocale, localeMetadata, locales, parseLocale };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=locales.js.map