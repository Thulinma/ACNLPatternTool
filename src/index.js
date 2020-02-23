import Vue from 'vue';
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import App from 'App.vue';
import { ifDevExec, ifProdExec } from '/utils/if-env';
import logger from '/utils/logger';

// config vue global before mount
Vue
  .use(VueRouter)
  .use(VueI18n);

Vue.config.productionTip = false;
ifDevExec(() => {});
ifProdExec(() => {
  Vue.config.devtools = false;
});

// mount
new Vue({
  render: (h) => h(App),
}).$mount("#app");

// .env LOG=INFO to view this
logger.info("Application mounted.");