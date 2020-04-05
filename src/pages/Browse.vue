<template>
  <div id="container">
    <div id="search-bar">
      <IconBase icon-name="search" :icon-color="brown" id="search-icon">
        <IconSearch />
      </IconBase><!-- magnifying glass svg -->
      <input
        type="text"
        @keyup.enter="search"
        @input="onQueryChange"
        :value="query"
        placeholder="Search by name, tag, etc...">
      <!-- <button @click="search">
        Search
      </button> -->
    </div><!-- search bar -->
    <div id="browse">
      <div id="patterns">
        <h1>Designs</h1>
        <span>{{results.length}} results</span>
        <div id="pattern-list">
          <a class="pattern-container" v-for="opt in results" :key="opt.bytes" :href="getUrl(opt.bytes)">
            <h3>{{opt.title}}</h3>
            <div class="type-tags">
              <span v-if="opt.f_type != null" class="tag type">
                {{opt.f_type.toUpperCase()}}
              </span>
              <span v-if="opt.f_type_a != null" class="tag type">
                {{opt.f_type_a}}
              </span>
              <span v-if="opt.f_type_b != null" class="tag type">
                {{opt.f_type_b}}
              </span>
            </div>
            <IconGenerator class="pickPattern" :pattern="opt.bytes" width=150 height=150 />
            <div class="pattern-details">
              <span>by {{opt.author}}</span>
              <span>from {{opt.town}}</span>
            </div>
            <div class="pattern-tags">
              <span v-if="opt.style_main != null" class="tag" :style="tagClass(opt.style_main)">
                {{opt.style_main}}
              </span>
              <span v-if="opt.style_sub_a != null" class="tag" :style="tagClass(opt.style_sub_a)">
                {{opt.style_sub_a}}
              </span>
              <span v-if="opt.style_sub_b != null" class="tag" :style="tagClass(opt.style_sub_b)">
                {{opt.style_sub_b}}
              </span>
            </div>
          </a>
        </div>
      </div><!-- pattern list -->

      <div id="filters">
        <div id="filter-header">
          <IconBase icon-name="filter" :icon-color="beige" id="filter-icon">
            <IconFilter />
          </IconBase><!-- filter svg -->
          <h1>Filters</h1>
        </div>
        <ul id="filter-list">
        </ul>
      </div><!-- attached filter list -->
    </div>
    <div>
      <button
        v-if="pageNumber > 0"
        @click="toPage(pageNumber - 1)">
        Prev
      </button>
      <button
        @click="toPage()">
        Jump
      </button>
      <button @click="toPage(pageNumber + 1)">Next</button>
    </div>
  </div>
</template>

<script>
import lzString from 'lz-string';
import { mapState, mapGetters, mapActions } from 'vuex';
import DrawingTool from '/libs/DrawingTool';
import IconGenerator from '/components/IconGenerator.vue';
import origin from '/libs/origin';

// svg icons
import IconBase from '../components/icons/IconBase.vue';
import IconSearch from '../components/icons/IconSearch.vue';
import IconFilter from '../components/icons/IconFilter.vue';

const colors = {
  "natural": '#EAC558',
  "cute": '#E96598',
  "sporty": '#5EC299',
  "cool": '#6BB6DC',
  "rustic": '#74940D',
  "hip": '#EB7E32',
  "harmonious": '#DC3D32',
  "elegant": '#D589E8',
  "modern": '#5BC0B3',
  "historical": '#8D2E4B',
  "civic": '#4F57C8',
  "silly": '#E64369',
  "spooky": '#363655',
  'sci-fi': '#408877',
  "aquatic": '#328BCE',
  "floral": '#EA80DA',
  "animal": '#AF2E33',
  "holiday": '#48903B',
  "food": '#B156FD',
  "brand": '#E93F33',
  "anime": '#EB8D77',
  "video-game": '#0D1010',
  "meme": '#52307C',
};

export default {
  name: "Browse",
  components: {
    IconGenerator,
    IconBase,
    IconSearch,
    IconFilter,
  },
  beforeRouteUpdate: async function(to, from, next) {
    await this.loadFromRoute(to);
    next();
  },
  beforeRouteLeave: function(to, from, next) {
    next();
  },
  data: function(){
    return {
      brown: '#95683F',
      beige: '#E7E0C3',
      white: '#FFFFFF',
    };
  },
  computed: {
    // map using store module search
    ...mapState('browse', [
      'query',
      'pageNumber'
    ]),
    ...mapGetters('browse', [
      'page'
    ])
  },
  methods: {
    // map using store module search
    ...mapActions('browse', [
      'setViewOptions',
      'setSearchOptions',
      'getSearchResults'
    ]),
    async loadFromRoute(route) {
      // aliases
      // all destructured from route query are strings
      const {
        q: query,
      } = route.query;
      let {
        p: pageNumber,
        nsfc,
        unapproved
      } = route.query;
      let searchOptions = {};
      let viewOptions = {};
      let queryOptions = {};
      let isCorrecting = false;

      if (query != null) {
        // correct the url
        searchOptions = {...searchOptions, query};
        if (query.length !== 0)
          queryOptions = {...queryOptions, q: query};
        else isCorrecting = true;
      }
      if (pageNumber != null) {
        pageNumber = Number.parseInt(pageNumber);
        if (Number.isNaN(pageNumber)) isCorrecting = true;
        // no page number and page number = 0 are both valid
        else if (pageNumber < 0) isCorrecting = true;
        else {
          viewOptions = {...viewOptions, pageNumber};
          queryOptions = {...queryOptions, p: pageNumber};
        }
      }
      else viewOptions = {...viewOptions, pageNumber: 0};
      // if any 'invalid' or uncessary data in query, correct it
      // next loop around will load results
      if (isCorrecting) {
        await this.$router.replace({ query: queryOptions });
        return;
      }
      // always set search options before view options
      await this.setSearchOptions(searchOptions);
      await this.setViewOptions(viewOptions);
      await this.getSearchResults();
    },
    async onQueryChange(event) {
      const query = event.target.value;
      await this.setSearchOptions({ query });
    },
    async search(){
      // duplicated history guard
      const currQuery = this.query;
      let prevQuery = this.$route.query.q;
      if (!prevQuery) prevQuery = "";

      let queryOptions = {};
      // duplication guard
      if (
        currQuery === prevQuery
      ) return;

      if (currQuery.length !== 0) queryOptions = {...queryOptions, q: currQuery};

      // let route guard handle the rest
      await this.$router.push({ query: queryOptions });
    },
    async toPage(n) {
      if (n == null) {
        const response = window.prompt("Please enter a valid page number.");
        n = Number.parseInt(response);
        if (Number.isNaN(n) || n < 0) {
          window.alert(`'${n}' is not a valid page number.`);
          return;
        }
      }
      // should not trigger retrieval
      // should trigger retrieval
      await this.setViewOptions({ pageNumber: n });
      this.$router.push({ query: {
        ...this.$router.query,
        p: n
      }});
    },
    async goToEditor() {
      await this.$router.push({ path: `/editor` });
    },
    tagClass(tag){
      if (tag != null) return {backgroundColor: `${colors[tag.toLowerCase().replace(' ', '-')]}`};
    },
  },
  mounted: async function(){
    await this.loadFromRoute(this.$route);
  }
}
</script>

<style lang="scss" scoped>
$type: #858585;
$brown: #95683F;
$light-beige: #E7E0C3;
$medium-beige: #E3D9B5;
$dark-beige: #DED5AC;
$gray: #C7C1AA;
$white: #FFFFFF;

h1{
  font-size: 24px;
}
#container {
  background-color: $light-beige;
  color: $brown;
  height: 100%;
  padding: 40px 20px 0 50px;
}
#search-bar {
  padding: 0 0 0 10px;
  border-bottom: 3px solid $brown;
  margin: 0 0 20px;

  .svg {
    padding: 0 10px;
  }
  input {
    background-color: transparent;
    border: none;
    font-size: 18px;
    display: inline-block;
    padding: 12px 18px;
    width: 80%;
  }
  input, input::placeholder {
    color: $brown;
  }
}
#browse {
  display: flex;
  flex-direction: row;
}
#patterns {
  width: 65%;

  h1 {
    display: inline-block;
    margin: 0 8px 25px 0;
  }
  span {
    color: $gray;
  }
  #pattern-list {
    direction: rtl;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    grid-gap: 10px;
    justify-items: center;
    overflow-y: scroll;
    max-height: 620px;

    .pattern-container {
      background-color: $brown;
      border: 4px solid $white;
      border-radius: 8px;
      box-shadow: 5px 5px 12px -3px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      width: 220px;
      height: 300px;
      max-width: 220px;
      max-height: 300px;

      canvas {
        margin: 0 10px 10px;
      }
      .pattern-details {
        direction: ltr;
        background-color: $medium-beige;
        border-radius: 10px;
        color: $brown;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 8px 12px;
        width: 150px;
      }
      .type-tags, .pattern-tags{
        min-height: 30px;
        display: flex;
        align-items: center;
      }
      .tag {
        border-radius: 35px;
        padding: 3px 5px;
        margin: 0 2px;
        color: $white;
        text-transform: uppercase;
        font-size: 11px;
        background-color: $type;
      }
    }
  }
}
#filters {
  width: 35%;

  #filter-header {
    border-bottom: 3px dashed $brown;
    display: flex;
    align-items: center;
    padding: 0 0 10px;
    margin: 0 0 10px;
  }
  #filter-icon {
    background-color: $brown;
    border-radius: 3px;
    padding: 5px;
    margin: 0 8px 0 0;
  }
  h1 {
    display: inline-block;
  }
  ul {
    border-radius: 5px;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      $dark-beige,
      $dark-beige 50%,
      $medium-beige 50%,
      $medium-beige
    );
    background-size: 100% 160px;
    max-height: 565px;
  }
}
</style>