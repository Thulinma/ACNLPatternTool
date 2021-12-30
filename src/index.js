import Vue from 'vue';
import vuetify from './plugins/vuetify';
import "@/plugins/fragment";
import App from '@/App.vue';
import i18n from '@/i18n'; // use i18n
import { ifProdExec } from '@/utils/if-env';
import router from '@/routers'; // use router
import store from '@/store'; // use vuex

// vue global config
Vue.config.productionTip = false;
ifProdExec(() => {
  Vue.config.devtools = false;
});



// mount the application
new Vue({
  store,
  router,
  i18n,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");