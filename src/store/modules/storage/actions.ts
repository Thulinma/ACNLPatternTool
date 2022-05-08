import { ActionTree } from "vuex";
import { RootState } from "@/store/types";
import { State } from "./state";

export default {
  async add({ state, commit }, patternItems) {
    if (!state.initialized)
      commit('init');
    commit('add', patternItems);
  },
  async remove({ state, commit }, patternItems) {
    if (!state.initialized)
      commit('init');
    commit('remove', patternItems);
  },
} as ActionTree<State, RootState>;