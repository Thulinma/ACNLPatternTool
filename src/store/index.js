import Vue from 'vue';
import Vuex from 'vuex';
// aggregate all individual modules
import browse from '~/store/browse';
import profile from '~/store/profile';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    browse,
    profile,
  }
})

export default store;