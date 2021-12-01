<template>
  <div class="browse">
    <div class="search-row">
      <Searchbar class="searchbar" v-model="nextOptions.titleFilter"
      :isOptionsChanged="isOptionsChanged" @search="onSearch" />
    </div>
    <div class="filters-row">
      <div class="filter-container">
        <div class="filter-title">Types</div>
        <SharedSelector
          v-model="nextOptions.typeTagsFilter"
          :exclusiveOptions="typeTagOptions"
          :inclusiveOptions="[null]"
          @enter="onSearch"
        />
      </div>
      <div class="filter-container">
        <div class="filter-title">Styles</div>
        <SharedSelector
          v-model="nextOptions.styleTagsFilter"
          :exclusiveOptions="styleTagOptions"
          :inclusiveOptions="[null]"
          @enter="onSearch"
        />
      </div>
      <div class="filter-container">
        <div class="filter-title">Author</div>
        <TextInput
          v-model="nextOptions.authorFilter"
          @enter="onSearch" />
      </div>
      <div class="filter-container">
        <div class="filter-title">Town</div>
        <TextInput
          v-model="nextOptions.townFilter"
          @enter="onSearch" />
      </div>
      <div class="filter-container sorting">
        <div class="filter-title">Sorting</div>
        <SharedSelector
          :value="nextSortingWrapped"
          @input="onNextSortingInput"
          :exclusiveOptions="sortingOptions"
          @enter="onSearch" />
      </div>
    </div>
    <div class="browse--pattern-grid" v-if="!isCurrPageEmpty">
      <div class="browse--pattern-grid-overlay" v-if="isLoading">
        <BxRefresh class="browse--pattern-grid-refreshing"/>
      </div>
      <PatternEntry
        v-for="patternEntry in currPageResults"
        :key="patternEntry.bytes"
        :patternEntry="patternEntry"
      />
    </div>
    <div v-else class="browse--pattern-grid">
      <h1 class="browse--pattern-grid-message">No Results Found.</h1>
    </div>
    
    <div class="navigation-container">
      <nav class="navigation">
        <button
          class="page-button prev"
          @click="onPrevPage"
        >
          <IconLeftArrow />
        </button>
        <div class="page-numbers">
          <button
            :class="{
              'page-number': true,
              'selected': pageIndicator === pageNumber,
            }"
            v-for="pageIndicator in pageIndicators"
            :key="pageIndicator"
            @click="() => onChangePage(pageIndicator)"
          >
            {{ pageIndicator }}
          </button>
        </div>
        <button
          class="page-button next"
          @click="onNextPage"
        >
          <IconRightArrow />
        </button>
        <button class="page-button jump" @click="onJumpPage">Jump</button>
      </nav>
    </div>
  </div>
</template>

<script>
import qs from "qs";
import origin from "~/libs/origin";
import {
  createOptions,
  cloneOptions,
  updateResults,
} from "~/store/browse";

import PatternEntry from "./PatternEntry";
import Searchbar from "./Searchbar";
import TextInput from "~/components/TextInput";
import SharedSelector from "~/components/SharedSelector";
import IconLeftArrow from "~/assets/icons/bxs-left-arrow-alt.svg?inline";
import IconRightArrow from "~/assets/icons/bxs-right-arrow-alt.svg?inline";
import BxRefresh from "~/assets/icons/bx-refresh.svg?inline";

// const colors = {
//   natural: "#EAC558",
//   cute: "#E96598",
//   sporty: "#5EC299",
//   cool: "#6BB6DC",
//   rustic: "#74940D",
//   hip: "#EB7E32",
//   harmonious: "#DC3D32",
//   elegant: "#D589E8",
//   modern: "#5BC0B3",
//   historical: "#8D2E4B",
//   civic: "#4F57C8",
//   silly: "#E64369",
//   spooky: "#363655",
//   "sci-fi": "#408877",
//   aquatic: "#328BCE",
//   floral: "#EA80DA",
//   animal: "#AF2E33",
//   holiday: "#48903B",
//   food: "#B156FD",
//   brand: "#E93F33",
//   anime: "#EB8D77",
//   "video-game": "#0D1010",
//   meme: "#52307C",
// };

export default {
  name: "Browse",
  
  components: {
    Searchbar,
    TextInput,
    SharedSelector,
    PatternEntry,
    IconLeftArrow,
    IconRightArrow,
    BxRefresh,
  },
  
  data() {
    return {
      // enumerated values from origin
      styleTagOptions: origin.tags_style,
      typeTagOptions: origin.tags_type,
      sortingOptions: Object.keys(origin.sortingOptions).reverse(),
      // search options replicated from browse
      currOptions: createOptions(),
      currResults: new Array(),
      nextOptions: createOptions(),
      isLoading: false,
      // current page number 0 indexed
      pageSize: 30,
      pageNumber: 0,
    };
  },
  
  computed: {
    // lock to first page if results are randomized
    isRandomized() {
      return (
        this.currOptions.titleFilter === "" &&
        this.currOptions.sorting === origin.sortingOptions.random
      );
    },
    
    isOptionsChanged() {
      return (
        JSON.stringify(this.nextOptions) !==
        JSON.stringify(this.currOptions)
      );
    },
    
    // last page number available 0 indexed
    maxPageNumber() {
      if (this.isRandomized) {
        return Infinity;
      }
      // get results not good enough
      // calculate results with undefined trailing removed
      const maxPageNumber = Math.floor(
        this.currResults.length /
        this.pageSize
      );
      return maxPageNumber;
    },
    
    currPageResults() {
      const startingIndex = this.pageNumber * this.pageSize;
      const endingIndex = (this.pageNumber + 1) * this.pageSize;
      return this.currResults
        .slice(startingIndex, endingIndex)
        .filter(result => result != null);
    },
    
    pageIndicators() {
      const pageIndicators = [];
      const inclusiveRange = function*(start, end) {
        for (let i = start; i <= end; ++i) yield i;
      };
      let start = 0;
      let end = 0;
      
      // number of page indicators surrounding our current one
      const padding = 2;
      // total number of page indicators
      const maxPageIndicators = (padding * 2) + 1;
      // start and end are forward
      if (this.pageNumber <= padding) {
        start = Math.max(this.pageNumber - padding, 0);
        end =  Math.min(
          this.pageNumber + padding + Math.abs(this.pageNumber - padding),
          this.maxPageNumber,
        );
      }
      // start ane end are backward
      else if (this.pageNumber > this.maxPageNumber - padding) {
        // start = pageNumber.value - 2;
        // end = pageNumber.value + 2;
      }
      // start and end surround page number
      else {
        start = this.pageNumber - padding;
        end = this.pageNumber + padding;
      }
      pageIndicators.push(...inclusiveRange(start, end));
      return pageIndicators;
    },
    
    isCurrPageEmpty() {
      return !this.isLoading && this.currPageResults.length === 0;
    },
    
    // lazy implementation to utilize the shared selector
    nextSortingWrapped() {
      // return the key
      const entries = Object.entries(origin.sortingOptions);
      const selected = entries
        .find(([key, value]) => value === this.nextOptions.sorting);
      return [selected[0]];
    },
  },
  
  methods: {
    async updateCurrResults() {
        this.isLoading = true;
        let results;
        try {
          results = await updateResults(
            cloneOptions(this.currOptions),
            this.pageSize,
            this.pageNumber,
          );
        }
        catch (error) {
          this.isLoading = false;
          return;
        }
        this.currResults = results.slice();
        this.isLoading = false;
    },
    
    updateOptions(options, newPageNumber) {
      options = cloneOptions(options);
      newPageNumber = parseInt(newPageNumber);
      const defaultOptions = createOptions();

      this.currOptions.titleFilter = (
        options.titleFilter ||
        defaultOptions.titleFilter
      );
      this.currOptions.authorFilter = (
        options.authorFilter ||
        defaultOptions.authorFilter
      );
      this.currOptions.townFilter = (
        options.townFilter ||
        defaultOptions.townFilter
      );
      this.currOptions.styleTagsFilter = (
        options.styleTagsFilter ||
        defaultOptions.styleTagsFilter
      );
      this.currOptions.typeTagsFilter = (
        options.typeTagsFilter ||
        defaultOptions.typeTagsFilter
      );
      
      this.pageNumber = newPageNumber || 0;
      this.updateCurrResults();
    },
    
    // update route with options
    updateRoute(options, newPageNumber) {
      newPageNumber = Number.parseInt(newPageNumber);
      const currentRoute = this.$router.currentRoute;
      const routeOptions = {
        path: currentRoute.path,
        query: {
          ...cloneOptions(options),
          pageNumber: newPageNumber,
        },
      };
      
      const currentQs = qs.stringify(currentRoute.query);
      const nextQs = qs.stringify(routeOptions.query);
      const willUpdate = currentQs !== nextQs;
      if (willUpdate)
        this.$router.push(routeOptions);
    },
    
    onChangePage(newPageNumber) {
      this.pageNumber = Math.min(
        Math.max(newPageNumber, 0),
        this.maxPageNumber,
      );
      this.updateRoute(
        this.currOptions,
        Math.min(this.maxPageNumber, Math.max(this.pageNumber, 0)),
      );
    },
    
    onPrevPage() {
      this.updateRoute(this.currOptions, Math.max(this.pageNumber - 1), 0);
    },
    
    onNextPage() {
      this.updateRoute(this.currOptions, Math.min(this.maxPageNumber, this.pageNumber + 1));
    },
    
    onJumpPage() {
      const response = window.prompt("Page number to jump to:");
      if (response == null || response === "") return;
      try {
        const pn = Number.parseInt(response);
        const errorMessage = `Page does not exist: ${pn}`;
        if (pn < 0)
          throw new Error(errorMessage)
        else if (pn > this.maxPageNumber)
          throw new Error(errorMessage);
        this.updateRoute(this.currOptions, pn);
      }
      catch (error) {
        window.alert(error.message);
      }
    },
    
    onSearch() {
      // will trigger updateOptions
      this.updateRoute(this.nextOptions, 0);
    },
    
    onNextSortingInput(sortingOptions) {
      this.nextOptions.sorting = origin.sortingOptions[sortingOptions[0]];
    },
  },
  beforeRouteEnter (to, from, next) {
    const defaultOptions = createOptions();
    const {
      titleFilter,
      townFilter,
      authorFilter,
      styleTagsFilter,
      typeTagsFilter,
      pageNumber,
    } = to.query;
    
    const options = {
      titleFilter,
      townFilter,
      authorFilter,
      styleTagsFilter,
      typeTagsFilter,
    };
    
    const normalizedOptions = {
      titleFilter: titleFilter || defaultOptions.titleFilter,
      townFilter: townFilter || defaultOptions.townFilter,
      authorFilter: authorFilter || defaultOptions.authorFilter,
      styleTagsFilter: styleTagsFilter || defaultOptions.styleTagsFilter,
      typeTagsFilter: typeTagsFilter || defaultOptions.typeTagsFilter,
    };
    
    next(vm => {
      vm.updateOptions(normalizedOptions, pageNumber || 0);
      vm.updateRoute(normalizedOptions, pageNumber || 0);
    });
  },
  beforeRouteUpdate (to, from, next) {
    let {
      titleFilter,
      townFilter,
      authorFilter,
      styleTagsFilter,
      typeTagsFilter,
      pageNumber,
    } = to.query;
    
    const options = {
      titleFilter,
      townFilter,
      authorFilter,
      styleTagsFilter,
      typeTagsFilter,
    };
    
    this.updateOptions(options, pageNumber);
    next();
  },
};
</script>

<style lang="sass" scoped>
@use "styles/colors" as colors
@use "styles/screens" as screens
@use "styles/positioning" as positioning
@use "styles/resets" as resets
@use "styles/animations" as animations

.browse
  padding-bottom: 50px
  
  @include positioning.relative-in-place
  .search-row
    @include positioning.relative-in-place
    display: grid
    grid-template-columns: 1fr auto
    row-gap: 15px
    column-gap: 15px
    justify-content: space-between
    justify-items: stretch
    align-content: center
    align-items: stretch
    margin-top: 55px
    padding-left: 30px
    padding-right: 30px
    
    @include screens.phone-landscape
      margin-top: 25px
      padding-left: 60px
      padding-right: 80px
    @include screens.tablet-portrait
      margin-top: 40px
      padding-left: 85px
      padding-right: 90px
    @include screens.tablet-landscape
      padding-left: 124px
      margin-right: auto
      margin-left: auto
    @include screens.desktop
      padding-left: 250px
      padding-right: 100px
      max-width: 900px
  
  .filters-row
    margin-top: 35px
    padding: 0px 10px
    display: grid
    grid-template-columns: repeat(1, 1fr)
    grid-template-rows: auto
    justify-content: space-between
    justify-items: stretch
    column-gap: 40px
    row-gap: 15px

    @include screens.phone-landscape
      padding: 0px 20px
    @include screens.tablet-portrait
      grid-template-columns: repeat(2, 1fr)
      padding: 0px 30px
      .filter-container.sorting
        grid-column: auto / span 2
    @include screens.tablet-landscape
      padding: 0px 40px
    @include screens.desktop
      grid-template-columns: 1fr 1fr 0.5fr 0.5fr 0.5fr
      padding: 0px 70px
      .filter-container.sorting
        grid-column: auto / span 1
    .filter-title
      color: colors.$olive-haze
      margin-bottom: 15px
      font-weight: 600

.browse--pattern-grid
  @include positioning.relative-in-place
  display: grid
  grid-template-columns: repeat(auto-fill, 215px)
  justify-content: center
  justify-items: auto
  column-gap: 25px
  row-gap: 35px
  margin: 30px 0px
  padding: 20px 20px
  min-height: 400px
  
  @include screens.phone-landscape
    justify-content: space-between
    margin: 30px 10px
  @include screens.tablet-portrait
    margin: 30px 10px
  @include screens.tablet-landscape
    margin: 30px 30px
    column-gap: 50px
    row-gap: 25px
  @include screens.desktop
    margin: 30px 60px

.browse--pattern-grid-overlay
    position: absolute
    top: 0
    left: 0
    height: 100%
    width: 100%
    background-color: rgba(colors.$soapstone, 0.5)
    z-index: 1
    
    .browse--pattern-grid-refreshing
      position: absolute
      top: 50%
      left: 50%
      $transforms: translate(-50%, -50%)
      transform: $transforms
      width: 100px
      height: 100px
      fill: colors.$jambalaya
      @include animations.spin(3s, $transforms)

.browse--pattern-grid-message
  @include positioning.absolute-center
  font-size: 2rem

.navigation-container
  display: grid
  grid-auto-flow: column
  grid-template-columns: auto
  justify-content: center
  
  .navigation
    display: grid
    grid-template-areas: "prev numbers next" ". jump ."
    grid-template-columns: auto 170px auto
    grid-template-rows: auto
    align-items: stretch
    justify-items: stretch
    row-gap: 15px
    column-gap: 15px
    
    .page-button
      @include resets.reset-button
      font-weight: 600
      font-size: 1rem
      color: colors.$ecru-white
      background-color: colors.$olive-haze
      svg
        fill: colors.$ecru-white
        display: block
        height: 20px
      
      &.prev,
      &.next
        padding: 5px 15px
      &.prev
        grid-area: prev
      &.next
        grid-area: next
      &.jump
        grid-area: jump
        padding: 5px 5px
    
    .page-numbers
      grid-area: numbers
      display: grid
      grid-auto-flow: column
      column-gap: 5px
      grid-template-columns: max-content
      justify-content: space-evenly
      
      .page-number
        @include resets.reset-button
        font-weight: 600
        background-color: colors.$olive-haze
        color: colors.$ecru-white
        min-width: 30px
        padding: 5px 5px
        
        &.selected
          background-color: colors.$jambalaya
        &:hover
          cursor: pointer
          background-color: colors.$jambalaya

    .page-number,
    .page-button
      border-radius: 4px
      &:hover
        cursor: pointer
        background-color: colors.$jambalaya

</style>
