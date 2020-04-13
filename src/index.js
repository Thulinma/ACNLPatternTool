import Vue from "vue";
import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";

Sentry.init({
  dsn:
    "https://0ceef9680626415687568c7bd41ccbf8@o294689.ingest.sentry.io/5199201",
  integrations: [new Integrations.Vue({ Vue, attachProps: true })]
});

import App from "/App.vue";
import i18n from "/i18n"; // use i18n
import PortalVue from "portal-vue";
import { ifProdExec } from "/utils/if-env";
import logger from "/utils/logger";
import router from "/routers"; // use router
import store from "/store"; // use vuex
// import "/style.scss"; // top-level styles
import VBodyScrollLock from "v-body-scroll-lock";

// vue global config
Vue.config.productionTip = false;
ifProdExec(() => {
  Vue.config.devtools = false;
});

// More Vue plugins
Vue.use(PortalVue);
Vue.use(VBodyScrollLock);

// mount the application
new Vue({
  store,
  router,
  i18n,
  render: h => h(App)
}).$mount("#app");

// add this query string to url to see: '?log=info'
logger.info("Application mounted.");
