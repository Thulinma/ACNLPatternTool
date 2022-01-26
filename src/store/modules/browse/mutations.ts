import Vue from "vue";
import { MutationTree } from "vuex";
import { State, createDefaultState } from "./state";

export default {
  reset(state) {
    Object.assign(state, createDefaultState());
  },
  updateResultsCache(state, {
    targetKey,
    value,
  }) {
    Vue.set(state.resultsCache, targetKey, value);
  },
  updateFetchedPagesCache(state, {
    targetKey,
    value,
  }) {
    Vue.set(state.fetchedPagesCache, targetKey, value);
  },
} as MutationTree<State>;