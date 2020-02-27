import Vue from 'vue';
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import 'reset-css';
import App from 'App.vue';
import router from '/routers';
import {
  ifProdExec
} from '/utils/if-env';
import logger from '/utils/logger';

// config vue global before mount
Vue
  .use(VueRouter)
  .use(VueI18n);

Vue.config.productionTip = false;
ifProdExec(() => {
  Vue.config.devtools = false;
});

// mount
new Vue({
  router: router,
  render: (h) => h(App),
}).$mount("#app");

// add this query string to url to see: '?log=info'
logger.info("Application mounted.");