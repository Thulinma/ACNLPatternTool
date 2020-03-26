import origin from "/libs/origin";

const PAGE_SIZE_MIN = 30;

// 'data' for stores, when mapping, use computed
const state = {
  query: "",
  nsfc: false,
  unapproved: false,
  pageSize: 50,
  pageNumber: 0,
  initResultsRetrieved: false,
  results: [],
};

// 'computed' for stores, when mapping, use computed
// (state, getters)
const getters = {
  // e.g. get filtered results by options, can store options in state
  // can access state and other getters
  // filteredResults: (state, getters) => {
    // do the thing
    // return this.state.results.filter()
  // },
  page: (state) => {
    // compute current page from state.results
    const { pageSize, pageNumber, results } = state;
    const start = pageSize * pageNumber;
    const end = pageSize * (pageNumber + 1);
    return results.slice(start, end);
  },
};

// SYNCHRONOUS ONLY
// COMPONENTS SHOULD NEVER MUTATE DIRECTLY
// you only get one payload, destructure it, don't rename it
// assume all payloads and thier contents are valid
// (state, payload)
const mutations = {
  // you only get get ONE payload argument, should ALWAYS be an object
  // convention to tack properties onto payload, even if redundant
  setViewOptions: (state, payload) => {
    const {
      pageSize,
      pageNumber
    } = payload;
    if (pageSize != null) state.pageSize = pageSize;
    if (pageNumber != null) state.pageNumber = pageNumber;
  },
  setSearchOptions: (state, payload) => {
    const { query, nsfc, unapproved } = payload;
    // need to do this manually to trigger setters
    if (query != null && state.query !== query) {
      state.query = query;
      state.initResultsRetrieved = false;
    }
    if (nsfc != null && state.nsfc !== nsfc) {
      state.nsfc = nsfc;
      state.initResultsRetrieved = false;
      if (!nsfc) {
        state.unapproved = false;
      }
    }
    if (unapproved != null && state.unapproved !== unapproved) {
      state.unapproved = unapproved;
      state.initResultsRetrieved = false;
      if (unapproved) {
        state.nsfc = true;
      }
    }
  },
  setSearchResults: (state, payload) => {
    const { results } = payload;
    state.initResultsRetrieved = true;
    state.results = results;
  }
};

// 'aggregate methods' for stores, when mapping, use methods
// component's interface, sanitize payloads
// you only get one payload, destructure it, don't rename it
// (context, payload)
// ({ state, getters, commit, dispatch }, payload)
const actions = {
  setViewOptions: async ({ state, commit }, payload) => {
    const {
      pageSize,
      pageNumber
    } = payload;
    // cannot set both at the same time
    if (pageSize != null && pageNumber != null) {
      // throw error
    };
    if (pageSize != null) {
      if (pageSize <= 0)
        throw RangeError(`Page size must be at least ${PAGE_SIZE_MIN}`);
      if (state.pageSize !== pageSize)
        payload.pageNumber = 0;
        commit('setViewOptions', { pageSize });
    };
    if (payload.pageNumber != null) {
      if (payload.pageNumber < 0) { throw RangeError("Page number must greater than 0"); };
      // check if there are enough results to go to the page number
      let start = state.pageSize * (payload.pageNumber);
      let end = state.pageSize * (payload.pageNumber + 1);
      let page = state.results.slice(start, end);
      // calculate forward backward
      const totalDesired = state.pageSize * 3;
      if (page.length <= state.pageSize) {
        // attempt to retrieve more
      }
    };
    commit('setViewOptions', { pageNumber });
  },
  setSearchOptions: async ({ commit }, payload) => {
    commit('setSearchOptions', payload);
  },
  // go fetch search results using all options in this store
  getInitSearchResults: async ({ state, commit }) => {
    // results are still here, block the repeated request
    const { nsfc, unapproved } = state;
    const options = {
      nsfc,
      unapproved
    };
    if (state.initResultsRetrieved) return;
    let results;
    if (state.query.length === 0)
      results = await origin.recent(options);
    else {
      results = await origin.search(state.query, options);
    }
    commit('setViewOptions', { pageNumber: 0 });
    commit('setSearchResults', { results });
  }
};

// this is a store "module"
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};