import origin from '/libs/origin';
import lodash from 'lodash';

// 'data' for stores, when mapping, use computed
const state = {
  token: "",
  username: "",
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
  },
  setLogin: (state, payload) => {
    const { username, token } = payload;
    state.username = username;
    state.token = token;
  },
};

// 'aggregate methods' for stores, when mapping, use methods
// component's interface, sanitize payloads
// (context, payload)
// ({ state, getters, commit, dispatch }, payload)
const actions = {
  logIn: async ({ commit }, payload) => {
    const { username, password } = payload;
    // const token = await origin.modLogIn(username, password, token);
    // verify token to check if actually logged in
    // commit('setLogin', { username, token });
  },
  logOut: async ({ commit }) => {
    // await origin.modlogOut();
    // commit('reset');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};