import origin from "/libs/origin";

const PAGE_SIZE_MIN = 30;

// inconsistencies between api and store
const optionsMap = {
  "unapproved": "letsgetdangerous"
};

// should be applied before making api call
const remapOptions = (options) => {
  const optionsMapKeys = Object.keys(optionsMap);
  for (let key of optionsMapKeys) {
    if (!(key in options)) continue;
    // key needs to be remapped
    const source = key;
    const target = optionsMap[key];
    options[target] = options[source];
    delete options[source];
  };
  return options;
};

// apply to to params before every api call
const binarizeOptions = (options) => {
  const keys = Object.keys(options);
  for (let key of keys) {
    if (typeof options[key] !== "boolean") continue;
    options[key] = Number(options[key]); // always 1 or 0
  };
  return options;
};

// helps normalize all requests for debugging
// fills in missing options with defaults
const transformOptions = (options) => {
  if (options.start == null) options.start = 0;
  return options;
};

const correctOptions = (options) => {
  remapOptions(options);
  binarizeOptions(options);
  transformOptions(options);
  return options;
};

const persistentOptionsFrom = (state) => {
  const { nsfc, unapproved } = state;
  const options = {
    nsfc,
    unapproved
  };
  return options;
};

// 'data' for stores, when mapping, use computed
const state = {
  // search options
  query: "",
  nsfc: false,
  unapproved: false,
  // view options
  pageSize: 50,
  pageNumber: 0,
  // results
  results: [],
  // meta, need this to conditionally reset results
  searchOptionsChanged: true
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
      state.searchOptionsChanged = true;
    }
    if (nsfc != null && state.nsfc !== nsfc) {
      state.nsfc = nsfc;
      state.searchOptionsChanged = true;
      if (!nsfc) {
        state.unapproved = false;
      }
    }
    if (unapproved != null && state.unapproved !== unapproved) {
      state.unapproved = unapproved;
      state.searchOptionsChanged = true;
      if (unapproved) {
        state.nsfc = true;
      }
    }
  },
  setSearchResults: (state, payload) => {
    const { results } = payload;
    state.results = results;
    state.searchOptionsChanged = false;
  }
};

// 'aggregate methods' for stores, when mapping, use methods
// component's interface, sanitize payloads
// you only get one payload, destructure it, don't rename it
// (context, payload)
// ({ state, getters, commit, dispatch }, payload)
const actions = {
  setViewOptions: async ({ state, commit }, payload) => {
    let {
      pageSize,
      pageNumber
    } = payload;

    // build up view options
    let viewOptions = {};
    if (payload.pageSize != null) {
      if (payload.pageSize <= PAGE_SIZE_MIN)
        throw RangeError(`Page size must be at least ${PAGE_SIZE_MIN}`);
      else viewOptions = {...viewOptions, pageSize};
    };
    if (payload.pageNumber != null) {
      if (payload.pageNumber < 0)
        throw RangeError(`Page number must be at least 0`);
      else viewOptions = {...viewOptions, pageNumber};
    }
    commit('setViewOptions', viewOptions);
  },
  setSearchOptions: async ({ commit }, payload) => {
    commit('setSearchOptions', payload);
  },
  // fetch search results using all options
  getSearchResults: async ({ state, commit }) => {
    let {
      query,
      results
    } = state;
    const {
      pageSize,
      pageNumber,
      searchOptionsChanged
    } = state;
    query = state.query || null;

    // prevents merges between results with different search options
    if (searchOptionsChanged) results = [];

    // determine, are there enough results to justify a request?
    let start = pageSize * pageNumber;
    let end = pageSize * (pageNumber + 1);

    // set up options to be sent out during search
    const persistentOptions = persistentOptionsFrom(state);
    const options = correctOptions({
      ...persistentOptions,
      start
    });

    let availablePage = results.slice(start, end);
    // enough results to justify another request?
    if (availablePage.length >= state.pageSize) return;

    let moreResults;
    if (query == null) moreResults = await origin.popular(options);
    else moreResults = await origin.search(query, options);

    // merge results
    results = results.slice();
    for (let i = 0; i < moreResults.length; ++i)
      results[start + i] = moreResults[i];
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