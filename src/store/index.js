import Vue from 'vue';
import Vuex from 'vuex';
// aggregate all individual modules
import browse from '/store/browse';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    browse
  }
})

export default store;