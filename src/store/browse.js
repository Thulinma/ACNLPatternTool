import origin from "~/libs/origin";

const PAGE_SIZE_MIN = 30;
const PAGE_SIZE_MAX = 50;

// turns booleans into nums 1 or 0
const binarizeOptions = (options) => {
  const keys = Object.keys(options);
  for (let key of keys) {
    if (typeof options[key] !== "boolean") continue;
    options[key] = Number(options[key]); // always 1 or 0
  };
  return options;
};

// fills in missing options with defaults
const normalizeOptions = (options) => {
  if (options.originPageNumber == null)
    options.originPageNumber = 0;
  return options;
};

// resolve inconsistencies between api and store
const optionsMap = {
  "unapproved": "letsgetdangerous",
  "originPageNumber": "start"
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

// fixes options before api call
const correctOptions = (options) => {
  binarizeOptions(options);
  normalizeOptions(options);
  remapOptions(options);
  return options;
};

// extract options included in every request
const persistentOptionsFrom = (state) => {
  const { nsfc, unapproved } = state;
  const options = {
    nsfc,
    unapproved
  };
  return options;
};


// browse cache helpers
const optionsAreEqual = (optionsA, optionsB) => {
  const options = new Set(Object.keys(optionsA));
  for (let option of options)
    if (optionsA[option] !== optionsB[option])
      return false;
  return true;
};

// mutation helpers
const didChange = (currVal, prevVal) => {
  if (currVal != null) return currVal !== prevVal;
  return false;
};

// 'data' for stores, when mapping, use computed
const state = {
  // search options
  query: "",
  nsfc: false,
  unapproved: false,
  searchOptionsChanged: false,
  // view options
  pageSize: 50,
  pageNumber: 0,
  // results
  results: [],
  // meta
  originResultsSize: null, // unknown at first
  cache: new Map(), // key: search options, value: results
  prevSearchOptions: null,
};

// 'computed' for stores, when mapping, use computed
// (state, getters)
const getters = {
  page: (state) => {
    // compute current page from state.results
    const { pageSize, pageNumber, results } = state;
    const startIdx = pageSize * pageNumber;
    const endIdx = pageSize * (pageNumber + 1);
    return results.slice(startIdx, endIdx);
  },
  searchOptions: (state) => {
    let {
      query,
      nsfc,
      unapproved,
    } = state;
    return {
      query,
      nsfc,
      unapproved,
    };
  },
  viewOptions: (state) => {
    const {
      pageSize,
      pageNumber,
    } = state;
    return {
      pageSize,
      pageNumber,
    }
  }
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
    let searchOptionsChanged = false;
    const { query, nsfc, unapproved, currSearchOptions } = payload;
    if (state.prevSearchOptions == null)
      state.prevSearchOptions = currSearchOptions;

    // need to do this manually to trigger setters
    if (didChange(query, state.query)) {
      state.query = query;
      searchOptionsChanged = true;
    }
    if (didChange(nsfc, state.nsfc)) {
      state.nsfc = nsfc;
      searchOptionsChanged = true;
      if (!nsfc) {
        state.unapproved = false;
      }
    }
    if (didChange(unapproved, state.unapproved)) {
      state.unapproved = unapproved;
      searchOptionsChanged = true;
      if (unapproved) {
        state.nsfc = true;
      }
    }
    if (searchOptionsChanged) state.searchOptionsChanged = true;
  },
  setSearchResults: (state, payload) => {
    const { searchOptionsChanged } = state;
    const { results, currSearchOptions } = payload;
    if (results != null) {
      state.results = results;
      if (searchOptionsChanged)
        state.prevSearchOptions = currSearchOptions;
      state.searchOptionsChanged = false;
    }
  },
  setMeta: (state, payload) => {
    const { originResultsSize, cache } = payload;
    if (originResultsSize != null) {
      state.originResultsSize = originResultsSize;
    }
    if (cache != null) {
      state.cache = cache;
    }
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
    if (pageSize != null) {
      if (pageSize < PAGE_SIZE_MIN || pageSize > PAGE_SIZE_MAX)
        throw RangeError(`Invalid page size`);
      else viewOptions = { ...viewOptions, pageSize };
    };
    if (pageNumber != null) {
      if (pageNumber < 0)
        throw RangeError(`Invalid page number`);
      else viewOptions = { ...viewOptions, pageNumber };
    }
    commit('setViewOptions', viewOptions);
  },
  setSearchOptions: async ({ getters, commit }, payload) => {
    payload = {
      ...payload,
      currSearchOptions: getters.searchOptions
    };
    commit('setSearchOptions', payload);
  },
  // fetch search results using all options
  getSearchResults: async ({ state, getters, commit }) => {
    let {
      query,
      results,
      originResultsSize,
      cache,
      prevSearchOptions
    } = state;
    const {
      pageSize,
      pageNumber,
      searchOptionsChanged,
    } = state;
    query = state.query || null;
    prevSearchOptions = Object.assign({}, prevSearchOptions);
    const currSearchOptions = getters.searchOptions;
    // know results will change if changed, need to update cache
    if (searchOptionsChanged) {
      // determine how prevSearchOptions are handled      
      if (cache.get(JSON.stringify(prevSearchOptions)) != null) {
        cache.set(JSON.stringify(prevSearchOptions), results.slice());
        console.log("updated cache entry:", prevSearchOptions);
      }
      else {
        cache.set(JSON.stringify(prevSearchOptions), results.slice());
        console.log("added new cache entry:", prevSearchOptions);
      }
      // look for old cache entry, load it
      if (cache.get(JSON.stringify(currSearchOptions)) != null) {
        results = cache.get(JSON.stringify(currSearchOptions));
        console.log("loaded cache entry:", currSearchOptions);
      }
      // prevent merges with old search options if not in cache
      else results = [];
    }

    // target result indexes to complete a page
    let startIdx = pageSize * pageNumber;
    let endIdx = pageSize * (pageNumber + 1);

    // set up options to be sent out during search
    const persistentOptions = persistentOptionsFrom(state);

    let moreResults;
    if (originResultsSize == null) {
      // always get page 0 if we don't know origin result size
      const options = correctOptions({
        ...persistentOptions,
        originPageNumber: 0,
      });
      // can only rely on origin popular for accurate result size
      moreResults = await origin.popular(options);
      // update origin result size
      originResultsSize = moreResults.length;
      commit('setMeta', { originResultsSize });
      // merge the results, only if using popular search
      if (query == null) {
        results = results.slice(); // force vue to detect change
        for (let i = 0; i < moreResults.length; ++i)
          results.splice(i, 1, moreResults[i]);
      }
    }

    let availablePage = results.slice(startIdx, endIdx);
    if (availablePage.length >= state.pageSize) {
      // commit results from checking originResultSize
      if (moreResults != null || searchOptionsChanged)
        commit('setSearchResults', { results, currSearchOptions });
      return;
    };
    // find origin page that fulfills a portion of the availablePage
    let lastIdxAvailable;
    for (let i = 0; i < availablePage.length; ++i)
      if (results[startIdx + i] != null)
        lastIdxAvailable = startIdx + i;
      else break;

    let originPageNumber;
    if (lastIdxAvailable == null)
      originPageNumber = Math.floor(startIdx / originResultsSize);
    else
      originPageNumber = Math.floor((lastIdxAvailable + 1) / originResultsSize);

    do {
      const options = correctOptions({
        ...persistentOptions,
        originPageNumber
      });

      // determine request types
      if (query == null) moreResults = await origin.popular(options);
      else moreResults = await origin.search(query, options);

      // merge results
      results = results.slice(); // force vue to detect change
      for (let i = 0; i < moreResults.length; ++i)
        results.splice(startIdx + i, 1, moreResults[i]);

      // no more results, stop
      if (moreResults.length < originResultsSize) {
        break;
      }

      // ready next loop
      availablePage = results.slice(startIdx, endIdx);
      ++originPageNumber;
    } while (availablePage.length < state.pageSize);
    commit('setSearchResults', { results, currSearchOptions });
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