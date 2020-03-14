import Vue from 'vue';
import Vuex from 'vuex';
// aggregate all individual modules
import search from '/store/search';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    search
  }
})

export default store;