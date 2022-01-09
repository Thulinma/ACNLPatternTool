import Vue from "vue";
import Vuex from "vuex";
import { RootState } from "./types";
import profile from "./modules/profile";

Vue.use(Vuex);

export default new Vuex.Store<RootState>({
  modules: {
    profile,
  },
});
