import origin from '~/libs/origin';
import DrawingTool from '~/libs/DrawingTool';

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
  pendingHashes: (state) => {
    const { pending } = state;
    const hashes = pending.map((i) => {
      return new DrawingTool(i.bytes).pixelHash;
    });
    return hashes;
  }
};

// SYNCHRONOUS ONLY
// COMPONENTS SHOULD NEVER MUTATE DIRECTLY
// you only get one payload, destructure it, don't rename it
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
// you only get one payload, destructure it, don't rename it
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
  approve: async ({ state, getters, commit, dispatch }, payload) => {
    const { token } = state;
    const { hash, options } = payload;
    await origin.modApprove(hash, options, token);

    const index = getters.pendingHashes.indexOf(hash);
    const pending = state.pending.slice();
    pending.splice(index, 1);
    if (pending.length < 10) await dispatch('getPending');
    else commit('setPending', { pending });
  },
  reject: async ({ state, commit, getters }, payload) => {
    const { token } = state;
    const hash = payload;
    await origin.modDelete(hash, token);

    const index = getters.pendingHashes.indexOf(hash);
    const pending = state.pending.slice();
    pending.splice(index, 1);
    if (pending.length < 10) await dispatch('getPending');
    else commit('setPending', { pending });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
