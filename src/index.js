import Vue from 'vue';
import App from 'app.vue';
import { ifProdExec } from '/utils/if-env';
import logger from "/utils/logger";

// config vue global before mount
Vue.config.productionTip = false;

ifProdExec(() => {
  Vue.config.devtools = false;
});

// mount
new Vue({
  render: h => h(App),
}).$mount("#app");

// .env LOG=INFO to view this
logger.info("Application successfully mounted.");