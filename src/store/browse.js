import origin from "@/libs/origin";

const ORIGIN_PAGE_SIZE = 300;

const binarizeOptions = (options) => {
  const keys = Object.keys(options);
  for (let key of keys) {
    if (typeof options[key] !== "boolean") continue;
    options[key] = Number(options[key]); // always 1 or 0
  }
  return options;
};

// fills in missing options with defaults
const normalizeOptions = (options) => {
  if (options.originPageNumber == null) options.originPageNumber = 0;
  return options;
};

// resolve inconsistencies between api and store
const optionsMap = {
  titleFilter: "q",
  authorFilter: "a",
  townFilter: "t",
  styleTagsFilter: "st",
  typeTagsFilter: "tt",
  originPageNumber: "start",
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
  }
  return options;
};

// fixes options before api call
const correctOptions = (options) => {
  binarizeOptions(options);
  normalizeOptions(options);
  remapOptions(options);
  return options;
};


const createOptions = () => ({
  titleFilter: "",
  authorFilter: "",
  townFilter: "",
  styleTagsFilter: [null, null, null],
  typeTagsFilter: [null, null, null],
  sorting: origin.sortingOptions.random,
});


/**
 * Makes a clone / deep copy of the options.
 * @param {*} options 
 * @returns 
 */
const cloneOptions = (options) => {
  return JSON.parse(JSON.stringify(options));
};

// Vue2 composition api can't watch new properties b/c not proxy
const resultsCache = new Map();

/**
 * Gets a full copy of the results.
 */
const getResults = (options) => {
  const targetKey = JSON.stringify(options);
  if (!resultsCache.has(targetKey)) {
    resultsCache.set(targetKey, []);
  };
  return resultsCache.get(targetKey);
};

/**
 * Sets a full copy of the results.
 */
const setResults = (options, results) => {
  const targetKey = JSON.stringify(options);
  resultsCache.set(targetKey, results);
};

// options to set of fetched pages
const fetchedPagesCache = new Map();


/**
 * Gets the set of pages which have been fetched for the options.
 */
const getFetchedPages = (options) => {
  const targetKey = JSON.stringify(options);
  if (!fetchedPagesCache.has(targetKey)) {
    fetchedPagesCache.set(targetKey, new Set());
  }
  return fetchedPagesCache.get(targetKey);
}

/**
 * Sets the set pageswhich have been fetched for the options.
 */
const setFetchedPagesCache = (options, fetchedPages) => {
  const targetKey = JSON.stringify(options);
  fetchedPagesCache.set(targetKey, fetchedPages);
}

/**
 * Fetches and returns results for a page (or doesn't if it's been fetched already).
 * @param {Object} options - options
 * @param {number} localPageSize - our local page size
 * @param {number} localPageNumber - the local page number
 */
const updateResults = async (options, localPageSize, localPageNumber) => {
  // get early reference to results of options to prevent modifications when results swap  
  const targetOptions = cloneOptions(options);
  const isRandomized = (
    targetOptions.titleFilter === "" &&
    targetOptions.sorting === origin.sortingOptions.random
);
  const targetResults = getResults(options);
  const targetFetchedPages = getFetchedPages(options);
  
  // convert local page numbe to result indexes
  const startingResultIndex = localPageNumber * localPageSize;
  const endingResultIndex = (localPageNumber + 1) * localPageSize;
  
  // convert pages number to server page number(s)
  const originPageSize = ORIGIN_PAGE_SIZE;
  const startingOriginPageNumber = Math
    .floor(startingResultIndex / originPageSize);
  const endingOriginPageNumber = Math
    .ceil(endingResultIndex / originPageSize) - 1;
  const inclusiveRange = function*(start, end) {
    for (let i = start; i <= end; ++i) yield i;
  };
  
  // all origin page numbers that need to be fetched
  const originPageNumbers = [...inclusiveRange(
    startingOriginPageNumber,
    endingOriginPageNumber,
  )];
  const unfetchedOriginPageNumbers = originPageNumbers
    .filter(originPageNumber => !targetFetchedPages.has(originPageNumber))
  
  // console.log(startingResultIndex, endingResultIndex, unfetchedOriginPageNumbers);
  
  const updatedResults = targetResults.slice();
  // only attempt pages that have not been fetched
  for (const originPageNumber of unfetchedOriginPageNumbers) {
    const {
      totalResultsCount: originTotalResultsCount,
      pageResults: originPageResults,
    } = await origin.browse(correctOptions({
      ...targetOptions,
      originPageNumber,
    }));
    targetFetchedPages.add(originPageNumber);
    
    // if results are random, infinite possible results, don't update length
    updatedResults.length = originTotalResultsCount;
    // merge results
    for (let j = 0; j < originPageResults.length; ++j) {
      updatedResults[(originPageNumber * originPageSize) + j] = originPageResults[j];
    }
    // last page, we know we can skip all following origin pages
    if (!isRandomized && (originPageResults.length < originPageSize)) break;
  }
  setResults(targetOptions, updatedResults);
  return updatedResults.slice();
};


/**
 * Fetches and returns results for a page (or doesn't if it's been fetched already).
 * @param {Object} options - options
 * @param {number} localPageSize - our local page size
 * @param {number} localPageNumber - the local page number
 */
const updatePage = async (options, localPageSize, localPageNumber)  => {
  const startingResultIndex = localPageNumber * localPageSize;
  const endingResultIndex = (localPageNumber + 1) * localPageSize;
  return (await updateResults(options, localPageSize, localPageNumber))
    .slice(startingResultIndex, endingResultIndex)
    .filter(result => result != null);
};


// TODO: Move browse results caches to store
export {
  createOptions,
  cloneOptions,
  updateResults,
  updatePage,
}

