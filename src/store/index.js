import Vue from 'vue';
import Vuex from 'vuex';
// aggregate all individual modules
import profile from '~/store/profile';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    profile,
  }
})

export default store;