import origin from '/libs/origin';
import lodash from 'lodash';

// 'data' for stores, when mapping, use computed
const state = {
  token: null, // str when set
};

// 'computed' for stores, when mapping, use computed
// (state, getters)
const getters = {
  isLoggedIn: (state) => {
    return state.token != null;
  },
};

// SYNCHRONOUS ONLY
// COMPONENTS SHOULD NEVER MUTATE DIRECTLY
// assume all payloads and thier contents are valid
// (state, payload)
const mutations = {
  setToken: (state, payload) => {
    const { token } = payload;
    state.token = token;
  },
};

// 'aggregate methods' for stores, when mapping, use methods
// component's interface, sanitize payloads
// (context, payload)
// ({ state, getters, commit, dispatch }, payload)
const actions = {
  logIn: async ({ commit }, payload) => {
    const { passphrase } = payload;
    // const token = await origin.modLogIn(passphrase);
    // commit('setToken', { token });
  },
  logOut: async ({ commit }) => {
    const token = null;
    // commit('setToken', { token });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};