import origin from '/libs/origin';
import lodash from 'lodash';

// 'data' for stores, when mapping, use computed
const state = {
  token: "",
  username: "",
  password: "",
  pending: [], // results, like in browse
};

// 'computed' for stores, when mapping, use computed
// (state, getters)
const getters = {
  isLoggedIn: (state) => {
    return Boolean(state.token);
  },
};

// SYNCHRONOUS ONLY
// COMPONENTS SHOULD NEVER MUTATE DIRECTLY
// assume all payloads and thier contents are valid
// (state, payload)
const mutations = {
  reset: (state) => {
    state.token = "";
    state.username = "";
    state.password = "";
  },
  setLogin: (state, payload) => {
    const { username, password, token } = payload;
    state.username = username;
    state.password = password;
    state.token = token;
  },
  setPending: (state, payload) => {
    const { pending } = payload;
    state.pending = pending;
  }
};

// 'aggregate methods' for stores, when mapping, use methods
// component's interface, sanitize payloads
// (context, payload)
// ({ state, getters, commit, dispatch }, payload)
const actions = {
  logIn: async ({ commit }, payload) => {
    const { localStorage } = window;
    const { username, password } = payload;
    const token = await origin.modLogIn(username, password);
    if (!token) {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      return;
    };
    // for continue, simulate session
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    commit('setLogin', { username, password, token });
  },
  logOut: async ({ commit }) => {
    const { localStorage } = window;
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    commit('reset');
  },
  // simulate session
  continue: async ({ dispatch }) => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password)
      await dispatch('logIn', { username, password });
  },
  getPending: async ({ state, commit }) => {
    const { token } = state;
    const pending = await origin.modPending(token);
    commit('setPending', { pending });
  },
  approve: async ({ state, dispatch }, payload) => {
    const { token } = state;
    const { hash, options } = payload;
    await origin.modApprove(hash, options, token);
    await dispatch('getPending');
  },
  delete: async ({ dispatch }, payload) => {
    const { token } = state;
    const { hash } = payload;
    await origin.modDelete(hash, token);
    await dispatch('getPending');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};