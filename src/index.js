import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api'
import PortalVue from "portal-vue";
import App from '~/App.vue';
import i18n from '~/i18n'; // use i18n
import { ifProdExec } from '~/utils/if-env';
import router from '~/routers'; // use router
import store from '~/store'; // use vuex
import "~/style.scss"; // top-level styles

// vue global config
Vue.config.productionTip = false;
ifProdExec(() => {
  Vue.config.devtools = false;
});


// More Vue plugins
Vue.use(PortalVue);
Vue.use(VueCompositionAPI);

// mount the application
new Vue({
  store,
  router,
  i18n,
  render: (h) => h(App),
}).$mount("#app");