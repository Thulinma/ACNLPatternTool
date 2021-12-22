import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { isProd } from '@/utils/if-env';
import translations from "./translations.csv";

// needs to be registered before instance
Vue.use(VueI18n);

const messages = translations.reduce((messages, row) => {
  /**@type {string} */
  const path = row["path"];
  const pathComponents = path.split(".");
  // locales are ISO 639-1 codes
  const locales = Object.keys(row)
    .filter(locale => locale !== "path")
    .map(locale => locale.toLocaleLowerCase());
  // traverse messages and create properties
  for (const locale of locales) {
    const message = row[locale];
    if (message.trim().length <= 0 ) continue;
    const localePathComponents = [locale, ...pathComponents];
    let messagesNode = messages;
    for (const pathComponent of localePathComponents.slice(0, -1)) {
      if (!messagesNode.hasOwnProperty(pathComponent))
        messagesNode[pathComponent] = {};
      messagesNode = messagesNode[pathComponent];
    }
    messagesNode[localePathComponents.slice(-1).pop()] = message;
  }
  return messages;
}, {});

const i18n = new VueI18n({
  locale: navigator.language.toLowerCase(), // use default and fallback languages
  fallbackLocale: "en",
  formatFallbackMessages: true,
  silentTranslationWarn: isProd,
  messages,
});

export default i18n;