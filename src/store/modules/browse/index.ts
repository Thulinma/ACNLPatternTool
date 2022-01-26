import { Module } from "vuex";
import { RootState } from "@/store/types";
import state, { State } from "./state";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
} as Module<State, RootState>;
