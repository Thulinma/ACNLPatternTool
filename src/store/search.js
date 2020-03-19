import origin from "/libs/origin";

// 'data' for stores, when mapping, use computed
const state = {
  query: "",
  results: [],
};

// non trivial calculations based on state
// all computations here cached until next state change
// 'computed' for stores, when mapping, use computed
const getters = {
  // e.g. get filtered results by options, can store options in state
  // can access state and other getters
  // filteredResults: (state, getters) => {
    // do the thing
    // return this.state.results.filter()
  // },
  // need a payload?, return a function instead
  // this.$store.getPage(10)
  // getPage: () => (pageNumber) => {
    // return "";
  // }
};

// SYNCHRONOUS ONLY
// when mapping, use methods
const mutations = {
  // you only get get ONE payload argument, should ALWAYS be an object
  // convention to tack properties onto payload, EVEN IF REDUNDANT
  setOptions: (state, payload) => {
    const {
      query,
    } = payload;
    // need to do this manually to trigger setters
    if (query != null) state.query = query;
  },
  setResults: (state, payload) => {
    const {
      results
    } = payload;
    if (results) state.results = results;
  }
};

// aggregates mutations, can be async
// when mapping, use methods
const actions = {
  // (context, payload)
  // wrapper
  setOptions: async(context, payload) => {
    context.commit('setOptions', payload);
  },
  // get results based on query
  getQueryResults: async (context, payload) => {
    const { query } = context.state;
    let results;
    if (query.length === 0)
      results = await origin.recent();
    else results = await origin.search(query);
    context.commit('setResults', { results });
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