import Vue from "vue";
import { ActionTree } from "vuex";
import { RootState } from "@/store/types";
import { State } from "./state";
import { PatternEntry } from "@/libs/origin";
import {
  SearchOptions,
  correctOptions,
  cloneOptions,
} from "./helpers";
import {
  Sorting,
  browse,
} from "@/libs/origin";

const ORIGIN_PAGE_SIZE = 300;

export default {
  /**
   * Fetches and returns results for a given set of search options.
   */
  async updateResults({ state, commit }, {
    options,
    localPageSize,
    localPageNumber,
  }: {
    options: SearchOptions,
    localPageSize: number,
    localPageNumber: number,
  }): Promise<PatternEntry[]> {
    // get early reference to results of options to prevent modifications when results swap  
    const targetOptions = cloneOptions(options);
    const targetKey = JSON.stringify(options);
    const isRandomized = (
      targetOptions.titleFilter === "" &&
      targetOptions.sorting === Sorting.Random
    );
    const targetResults = (() => {
      if (!state.resultsCache.hasOwnProperty(targetKey))
        state.resultsCache[targetKey] = [];
      return state.resultsCache[targetKey];
    })();
    const targetFetchedPages = (() => {
      if (!state.fetchedPagesCache.hasOwnProperty(targetKey))
        state.fetchedPagesCache[targetKey] = [];
      return state.fetchedPagesCache[targetKey].slice(); // copy
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
    
    commit('updateFetchedPagesCache', {
      targetKey,
      value: targetFetchedPages
        .concat(unfetchedOriginPageNumbers),
    });
    commit('updateResultsCache', {
      targetKey,
      value: updatedResults,
    })
    return updatedResults.slice();
  },
  /**
   * Fetches and returns results for a set of search options and page (or
   * doesn't if it's been fetched already).
   */
  async updatePage({ dispatch }, {
    options,
    localPageSize,
    localPageNumber,
  }: {
    options: SearchOptions,
    localPageSize: number,
    localPageNumber: number,
  }): Promise<PatternEntry[]> {
    const startingResultIndex = localPageNumber * localPageSize;
    const endingResultIndex = (localPageNumber + 1) * localPageSize;
    return (await dispatch('updateResults', {
      options,
      localPageSize,
      localPageNumber,
    }) as PatternEntry[])
      .slice(startingResultIndex, endingResultIndex)
      .filter(result => result != null);
  },
} as ActionTree<State, RootState>;
