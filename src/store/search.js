const module = {
  namespaced: true,
  // 'data' for stores, when mapping, use computed
  state: {
    query: "",
    results: []
  },
  // non trivial calculations based on state
  // all computations here cached until next state change
  // 'computed' for stores
  getters: {
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
  },
  // methods available to CHANGE the state, synchronous only
  // store.commit('mutationName', mutationPayload)
  // mutations cannot use each other,
  // 'methods' for stores
  mutations: {
    // you only get get ONE payload argument, should ALWAYS be an object
    // convention to tack properties onto payload, EVEN IF REDUNDANT
    updateStore: (state, payload) => {
      if (payload.query) state.query = payload.query;
      if (payload.results) state.results = payload.results;
    }
  },
};

export default module;