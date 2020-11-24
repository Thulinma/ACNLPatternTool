<template>
  <div class="browse--container">
    <nav>
      <label class="browse--search-bar">
        <div class="browse--search-container">
          <input
            id="browse-search"
            class="browse--search-input"
            type="text"
            placeholder="Browse Patterns..."
            spellcheck="false"
            autocomplete="off"
            :value="query"
            @keyup.enter="search"
            @input="onQueryChange"
          />
        </div>
      </label>
      <button class="browse--search-button" @click="search">Search</button>
    </nav>

    <div class="browse--pattern-grid" v-if="page.length">
      <BrowsePatternInfo
        v-for="pattern in page"
        :key="pattern.bytes"
        :pattern="pattern"
      />
    </div>
    <h1 v-else>No results found!</h1>

    <div class="browse--nav-buttons">
      <button
        :style="{ visibility: pageNumber > 0 ? 'visible' : 'hidden' }"
        @click="toPage(pageNumber - 1)"
      >
        <IconLeftArrow class="browse--nav-icon" />
      </button>
      <button @click="toPage()">Jump</button>
      <button @click="toPage(pageNumber + 1)">
        <IconRightArrow class="browse--nav-icon" />
      </button>
    </div>
  </div>
</template>

<script>
import lzString from "lz-string";
import { mapState, mapGetters, mapActions } from "vuex";
import DrawingTool from "~/libs/DrawingTool";
import origin from "~/libs/origin";
import BrowsePatternInfo from "~/components/partials/BrowsePatternInfo.vue";

import IconLeftArrow from "~/components/icons/IconLeftArrow.vue";
import IconRightArrow from "~/components/icons/IconRightArrow.vue";

const colors = {
  natural: "#EAC558",
  cute: "#E96598",
  sporty: "#5EC299",
  cool: "#6BB6DC",
  rustic: "#74940D",
  hip: "#EB7E32",
  harmonious: "#DC3D32",
  elegant: "#D589E8",
  modern: "#5BC0B3",
  historical: "#8D2E4B",
  civic: "#4F57C8",
  silly: "#E64369",
  spooky: "#363655",
  "sci-fi": "#408877",
  aquatic: "#328BCE",
  floral: "#EA80DA",
  animal: "#AF2E33",
  holiday: "#48903B",
  food: "#B156FD",
  brand: "#E93F33",
  anime: "#EB8D77",
  "video-game": "#0D1010",
  meme: "#52307C",
};

export default {
  name: "Browse",
  components: {
    BrowsePatternInfo,
    IconLeftArrow,
    IconRightArrow,
  },
  beforeRouteUpdate: async function (to, from, next) {
    await this.loadFromRoute(to);
    next();
  },
  beforeRouteLeave: function (to, from, next) {
    next();
  },
  computed: {
    // map using store module search
    ...mapState("browse", ["query", "pageNumber"]),
    ...mapGetters("browse", ["page"]),
  },
  methods: {
    // map using store module search
    ...mapActions("browse", [
      "setViewOptions",
      "setSearchOptions",
      "getSearchResults",
    ]),
    async loadFromRoute(route) {
      // aliases
      // all destructured from route query are strings
      const { q: query } = route.query;
      let { p: pageNumber, nsfc, unapproved } = route.query;
      let searchOptions = {};
      let viewOptions = {};
      let queryOptions = {};
      let isCorrecting = false;

      if (query != null) {
        // correct the url
        searchOptions = { ...searchOptions, query };
        if (query.length !== 0) queryOptions = { ...queryOptions, q: query };
        else isCorrecting = true;
      }
      if (pageNumber != null) {
        pageNumber = Number.parseInt(pageNumber);
        if (Number.isNaN(pageNumber)) isCorrecting = true;
        // no page number and page number = 0 are both valid
        else if (pageNumber < 0) isCorrecting = true;
        else {
          viewOptions = { ...viewOptions, pageNumber };
          queryOptions = { ...queryOptions, p: pageNumber };
        }
      } else viewOptions = { ...viewOptions, pageNumber: 0 };
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
    async search() {
      // duplicated history guard
      const currQuery = this.query;
      let prevQuery = this.$route.query.q;
      if (!prevQuery) prevQuery = "";

      // duplication guard
      if (currQuery === prevQuery) return;

      let queryOptions = {};
      if (currQuery.length !== 0) queryOptions = { q: currQuery };
      // let route guard handle the rest
      await this.$router.push({ query: queryOptions });
    },
    async toPage(n) {
      // should not trigger retrieval
      if (n == null) {
        const response = window.prompt("Please enter a valid page number.");
        n = Number.parseInt(response);
        if (Number.isNaN(n) || n < 0) {
          window.alert(`'${n}' is not a valid page number.`);
          return;
        }
      }
      // should trigger retrieval
      await this.setViewOptions({ pageNumber: n });
      this.$router.push({
        query: {
          ...this.$router.query,
          p: n,
        },
      });
    },
    async goToEditor() {
      await this.$router.push({ path: `/editor` });
    },
  },
  mounted: async function () {
    await this.loadFromRoute(this.$route);
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/screens";
@import "styles/positioning";
@import "styles/resets";

.browse--container {
  padding-top: 12px;
}
nav {
  width: 60%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;

  @include phone-landscape {
    width: 70%;
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
    flex-direction: row;
  }
  @include desktop {
    margin: 0 auto 0 20%;
  }
  @include desktop-hd {
  }
}
.browse--search-bar {
  width: 100%;
  display: block;
  font-size: 1.2rem;
  font-weight: 600;

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
    display: inline-block;
    width: 70%;
  }
  @include desktop {
  }
  @include desktop-hd {
  }
}
.browse--search-container {
  @include relative-in-place;
  background-color: $cinderella;
  padding: 15px 25px;
  border-radius: 8px;

  &:hover {
    background-color: $salmon;
  }

  @include tablet-landscape {
    border-radius: 8px 0 0 8px;
  }
}
.browse--search-input {
  @include reset-input;

  width: 100%;
  display: inline-block;
  padding-bottom: 10px;

  background-size: 20px 3px;
  background-position: bottom;
  background-repeat: repeat-x;
  background-image: linear-gradient(
    90deg,
    $ecru-white,
    $ecru-white 50%,
    transparent 50%,
    transparent 100%
  );

  &::placeholder {
    color: $olive-haze;

    &:focus {
      color: transparent;
    }
  }
}
.browse--search-button {
  @include reset-button;
  width: 100%;
  height: 100%;
  background-color: $tiffany-blue;
  box-sizing: border-box;

  padding: 5px 0px;
  color: white;
  border-radius: 8px;
  border: 5px solid transparent;
  font-weight: 600;
  cursor: pointer;

  display: block;
  font-size: 1.2rem;
  font-weight: 600;

  &:hover {
    @include stripes($tiffany-blue, $tiffany-blue-light, 20px);
    @include moving-stripes(3s);
    border: 5px solid $turquoise;
  }

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
    display: inline-block;
    width: 29%;
    padding: 15px 20px;
    border-radius: 0 8px 8px 0;
  }
  @include desktop {
  }
  @include desktop-hd {
  }
}
.browse--pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  grid-gap: 10px;
  justify-items: center;
}
.browse--nav-buttons {
  position: sticky;
  top: 30px;

  display: flex;
  justify-content: space-around;

  padding: 10px 0;
  button {
    @include reset-button;

    background-color: $tiffany-blue-light;
    border-radius: 20px;
    color: $frosted-mint;
    cursor: pointer;
    padding: 8px 12px;
    line-height: 18px;
  }
}
</style>
