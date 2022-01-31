import Vue from 'vue';
import VueI18n, {
  LocaleMessage,
  LocaleMessageObject,
  LocaleMessages,
} from 'vue-i18n';
import Papa from "papaparse";
import { last } from "lodash";
import { isProd } from '@/utils/if-env';
import translationsCsvString from "./translations.csv";

Vue.use(VueI18n);

interface Translation {
  path: string,
  [key: string]: string,
}

const translations = Papa.parse<Translation>(
  translationsCsvString,
  {
    dynamicTyping: false,
    header: true,
    skipEmptyLines: true,
  },
).data;

const messages = translations.reduce((messages, row) => {
  const path = row["path"];
  const pathComponents = path.split(".");
  // locales are ISO 639-1 codes
  const locales = Object.keys(row)
    .filter(locale => locale !== "path")
    .map(locale => locale.toLocaleLowerCase());
  // traverse messages and create properties
  for (const locale of locales) {
    const message = row[locale];
    if (message.trim().length <= 0) continue;
    const localePathComponents = [locale, ...pathComponents];
    let messagesNode: LocaleMessageObject = messages;
    for (const pathComponent of localePathComponents.slice(0, -1)) {
      if (!messagesNode.hasOwnProperty(pathComponent))
        messagesNode[pathComponent] = {};
      messagesNode = messagesNode[pathComponent] as LocaleMessageObject;
    }
    const lastPathComponent = last(localePathComponents) as string;
    (messagesNode as LocaleMessageObject)[lastPathComponent] = message;
  }
  return messages;
}, {}) as LocaleMessages;

const i18n = new VueI18n({
  locale: navigator.language.toLowerCase(), // use default and fallback languages
  fallbackLocale: "en",
  formatFallbackMessages: true,
  silentTranslationWarn: isProd,
  messages,
});

export default i18n;