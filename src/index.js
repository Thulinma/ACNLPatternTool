import Vue from 'vue';
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import 'reset-css';
import App from 'App.vue';
import router from '/routers';
import {
  ifDevExec,
  ifProdExec
} from '/utils/if-env';
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
  router: router,
  render: (h) => h(App),
}).$mount("#app");

// .env LOG=INFO to view this
logger.info("Application mounted.");