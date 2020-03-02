import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { isProd } from '/utils/if-env';
import en from '/i18n/en';

// needs to be registered before instance
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: window.navigator.language, // use default and fallback languages
  fallbackLocale: "en",
  formatFallbackMessages: true,
  silentTranslationWarn: isProd,
  messages: {
    en,
  }
});

export default i18n;