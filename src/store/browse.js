import origin from "/libs/origin";

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
  if (currVal != null && currVal !== prevVal) return true;
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
    const {
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
    const { cache, results } = state;
    // if any search options change and flag has not been triggered
    // add new entry in cache

    if (
      (didChange(query, state.query) ||
       didChange(nsfc, state.nsfc) ||
       didChange(unapproved, state.unapproved)) &&
      !state.searchOptionsChanged
    ) {
      // if old search options are still here, update it before changing search results
      // update old entry
      let didUpdateCache = false;
      for (let prevSearchOptions of cache.keys()) {
        if (optionsAreEqual(currSearchOptions, prevSearchOptions)) {
          cache.set(prevSearchOptions, results.slice());
          didUpdateCache = true;
          // console.log("updated", currSearchOptions, results);
        }
      }
      // no matching entry, set new entry
      if (!didUpdateCache && results.length >= 0) {
        cache.set(currSearchOptions, results.slice());
        // console.log("set new", currSearchOptions, results);
      }
    }

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
    const { results } = payload;
    if (results != null) {
      state.results = results;
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
      else viewOptions = {...viewOptions, pageSize};
    };
    if (pageNumber != null) {
      if (pageNumber < 0)
        throw RangeError(`Invalid page number`);
      else viewOptions = {...viewOptions, pageNumber};
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
      cache
    } = state;
    const {
      pageSize,
      pageNumber,
      searchOptionsChanged,
    } = state;

    if (searchOptionsChanged) {
      // check to see if you can load results from cache
      let didLoadFromCache = false;
      let currSearchOptions = getters.searchOptions;
      for (const prevSearchOptions of cache.keys()) {
        if (optionsAreEqual(currSearchOptions, prevSearchOptions)) {
          results = cache.get(prevSearchOptions);
          didLoadFromCache = true;
          // console.log("loaded from", currSearchOptions, results);
          break;
        }
      }
      // search options not in cache
      // prevents merges between results with different search options
      if (!didLoadFromCache) results = [];
    }
    query = state.query || null;

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
          results[i] = moreResults[i];
      }
    }

    let availablePage = results.slice(startIdx, endIdx);
    if (availablePage.length >= state.pageSize) {
      // commit results from checking originResultSize
      if (moreResults != null || searchOptionsChanged)
        commit('setSearchResults', { results });
      return
    };
    // find origin page that fulfills a portion of the availablePage
    let lastIdxAvailable;
    for (let i = 0; i < availablePage.length; ++i)
      if (results[startIdx + i] !=  null)
        lastIdxAvailable = startIdx + i;
      else break;

    let originPageNumber;
    if (lastIdxAvailable == null)
      originPageNumber = Math.floor(startIdx/originResultsSize);
    else
      originPageNumber = Math.floor((lastIdxAvailable + 1)/originResultsSize);

    do {
      const options = correctOptions({
        ...persistentOptions,
        originPageNumber
      });

      // determine request types
      if (query == null) moreResults = await origin.popular(options);
      else moreResults = await origin.search(query, options);
      // no more results, stop
      if (moreResults.length < originResultsSize) break;

      // merge results
      results = results.slice(); // force vue to detect change
      for (let i = 0; i < moreResults.length; ++i)
        results[startIdx + i] = moreResults[i];

      // ready next loop
      availablePage = results.slice(startIdx, endIdx);
      ++originPageNumber;
    } while (availablePage.length < state.pageSize);
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