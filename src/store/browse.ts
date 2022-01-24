import {
  PatternEntry,
  browse,
  Sorting,
  TypeTag,
  StyleTag,
} from "@/libs/origin";

interface SearchOptions {
  titleFilter: string,
  authorFilter: string,
  townFilter: string,
  styleTagsFilter: [(StyleTag | null), (StyleTag | null), (StyleTag | null)],
  typeTagsFilter: [(TypeTag | null), (TypeTag | null), (TypeTag | null)],
  sorting: Sorting,
};

interface ApiSearchOptions extends SearchOptions {
  originPageNumber: number,
}

type BrowseSearchOptions = Parameters<typeof browse>[0];

const ORIGIN_PAGE_SIZE = 300;

// resolve inconsistencies between api and store
const optionsMap: Partial<{
  [key in keyof ApiSearchOptions]: keyof BrowseSearchOptions;
}> = {
  titleFilter: "q",
  authorFilter: "a",
  townFilter: "t",
  styleTagsFilter: "st",
  typeTagsFilter: "tt",
  originPageNumber: "start",
};

// should be applied before making api call
const remappedOptions = (
  options: ApiSearchOptions
): BrowseSearchOptions => {
  const copy: BrowseSearchOptions | ApiSearchOptions = Object.assign({}, options);
  const optionsMapKeys = Object.keys(optionsMap);
  for (let key of optionsMapKeys) {
    if (!(key in copy))
      continue;
    // key needs to be remapped
    const source = key;
    const target = optionsMap[key];
    copy[target] = copy[source];
    delete copy[source];
  }
  return copy as unknown as BrowseSearchOptions;
};

// maps properties to correct options before api call
const correctOptions = (
  options: ApiSearchOptions,
): BrowseSearchOptions => {
  return remappedOptions(options);
};


const createOptions = (): SearchOptions => ({
  titleFilter: "",
  authorFilter: "",
  townFilter: "",
  styleTagsFilter: [null, null, null],
  typeTagsFilter: [null, null, null],
  sorting: Sorting.Random,
});


/**
 * Makes a clone / deep copy of the options.
 */
const cloneOptions = (
  options: SearchOptions,
): SearchOptions => {
  return JSON.parse(JSON.stringify(options));
};

// Vue2 composition api can't watch new properties b/c not proxy
const resultsCache = {} as Record<string, PatternEntry[]>;


// stringified options to set of fetched pages
const fetchedPagesCache = {} as Record<string, number[]>;

/**
 * Fetches and returns results for a page (or doesn't if it's been fetched already).
 */
const updateResults = async (
  options: SearchOptions,
  localPageSize: number,
  localPageNumber: number,
): Promise<PatternEntry[]> => {
  // get early reference to results of options to prevent modifications when results swap  
  const targetOptions = cloneOptions(options);
  const targetKey = JSON.stringify(options);
  const isRandomized = (
    targetOptions.titleFilter === "" &&
    targetOptions.sorting === Sorting.Random
  );
  const targetResults = (() => {
    if (!resultsCache.hasOwnProperty(targetKey))
      resultsCache[targetKey] = [];
    return resultsCache[targetKey];
  })();
  const targetFetchedPages = (() => {
    if (!fetchedPagesCache.hasOwnProperty(targetKey))
      fetchedPagesCache[targetKey] = [];
    return fetchedPagesCache[targetKey].slice(); // copy
  })();
  

  // convert local page numbe to result indexes
  const startingResultIndex = localPageNumber * localPageSize;
  const endingResultIndex = (localPageNumber + 1) * localPageSize;

  // convert pages number to server page number(s)
  const originPageSize = ORIGIN_PAGE_SIZE;
  const startingOriginPageNumber = Math
    .floor(startingResultIndex / originPageSize);
  const endingOriginPageNumber = Math
    .ceil(endingResultIndex / originPageSize) - 1;
  const inclusiveRange = function* (start: number, end: number) { 
    for (let i = start; i <= end; ++i)
      yield i;
  };
  
  // all origin page numbers that need to be fetched
  const originPageNumbers = [...inclusiveRange(
    startingOriginPageNumber,
    endingOriginPageNumber,
  )];
  const unfetchedOriginPageNumbers = originPageNumbers
    .filter(originPageNumber => !targetFetchedPages.includes(originPageNumber))

  // console.log(startingResultIndex, endingResultIndex, unfetchedOriginPageNumbers);

  const updatedResults = targetResults.slice();
  // only attempt pages that have not been fetched
  for (const originPageNumber of unfetchedOriginPageNumbers) {
    const {
      totalResultsCount: originTotalResultsCount,
      pageResults: originPageResults,
    } = await browse(correctOptions({
      ...targetOptions,
      originPageNumber,
    }));

    // if results are random, infinite possible results, don't update length
    updatedResults.length = originTotalResultsCount;
    // merge results
    for (let j = 0; j < originPageResults.length; ++j) {
      updatedResults[(originPageNumber * originPageSize) + j] = originPageResults[j];
    }
    // last page, we know we can skip all following origin pages
    if (!isRandomized && (originPageResults.length < originPageSize)) break;
  }
  fetchedPagesCache[targetKey] = targetFetchedPages
    .concat(unfetchedOriginPageNumbers);
  resultsCache[targetKey] = updatedResults;
  return updatedResults.slice();
};


/**
 * Fetches and returns results for a page (or doesn't if it's been fetched already).
 */
const updatePage = async (
  options: SearchOptions,
  localPageSize: number,
  localPageNumber: number,
): Promise<PatternEntry[]> => {
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