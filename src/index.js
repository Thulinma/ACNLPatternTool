import Vue from 'vue';
import VueRouter from 'vue-router';
import 'reset-css';
import App from '/App.vue';
import router from '/routers';
import i18n from '/i18n';
import { ifProdExec } from '/utils/if-env';
import logger from '/utils/logger';

// config vue global before mount
Vue
  //.use(VueI18n) in i18n
  .use(VueRouter);

Vue.config.productionTip = false;
ifProdExec(() => {
  Vue.config.devtools = false;
});

// mount
new Vue({
  router,
  i18n,
  render: (h) => h(App),
}).$mount("#app");

// add this query string to url to see: '?log=info'
logger.info("Application mounted.");