import { ActionTree } from "vuex";
import { RootState } from "@/store/types";
import { State } from "./state";
import origin, { UploadEntry } from "@/libs/origin";

export default {
  async logIn({ commit }, {
    username,
    password,
  }: {
    username: string,
    password: string,
  }): Promise<void> {
    const { localStorage } = window;
    const token = await origin.modLogIn(username, password);
    if (!token) {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      return;
    }
    // simulate session
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    commit("setLogin", { username, password, token });
  },
  async logOut({ commit }): Promise<void> {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    commit("reset");
  },
  // simulate session
  async continue({ dispatch }): Promise<void> {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password) {
      await dispatch("logIn", { username, password });
    }
  },
  async getPending({ state, commit }): Promise<void> {
    const { token } = state;
    const pending = await origin.modPending(token);
    commit("setPending", { pending });
  },
  async approve({ state, getters, commit, dispatch }, {
    hash,
    options,
  }: {
    hash: string,
    options: UploadEntry
  }) {
    const { token } = state;
    await origin.modApprove(hash, options, token);
    
    const index = getters.pendingHashes.indexOf(hash);
    const pending = state.pending.slice();
    pending.splice(index, 1);
    if (pending.length < 10) await dispatch('getPending');
    else commit('setPending', { pending });
  },
  async reject({ state, getters, commit, dispatch }, hash) {
      const { token } = state;
      await origin.modDelete(hash, token);
      
      const index = getters.pendingHashes.indexOf(hash);
      const pending = state.pending.slice();
      pending.splice(index, 1);
      if (pending.length < 10) await dispatch("getPending");
      else commit("setPending", { pending });
  },
} as ActionTree<State, RootState>;
