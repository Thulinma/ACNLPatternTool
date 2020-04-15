<template>
  <div class="spacing_top">
    <h1 class="f-heading-4">A. Browse the Getty Museum Collection</h1>

    <div class="m-search-input">
      <input
        name="search"
        ref="input"
        type="search"
        v-model="value"
        @keyup.enter="search"
        placeholder="Search the Getty's Open Content Images "
      />
      <button
        ref="search"
        name="search"
        @click="search"
        class="a-btn a-btn--text"
      >
        <Icon :name="'search'" />
      </button>
    </div>
    <hr />
    <span v-if="query" ref="summary"
      >Showing {{ matches.length }} {{ resultText }} for '{{ query }}'</span
    >

    <ol>
      <li
        v-for="match of currentResults"
        @click="choose(match)"
        :key="match.webpage"
      >
        {{ match.full_name }}
        <span v-if="match.artist">by {{ match.artist }}</span>
        <a :href="match.webpage">view in collection</a>
        <img :key="match.webpage" :src="match.iiif_url" />
      </li>
    </ol>
    <button @click="prevPage" :disabled="currentSearchPage == 0">
      prev
    </button>
    <button @click="nextPage" :disabled="onLastSearchPage">
      next
    </button>
  </div>
</template>
<script>
import NoC_US from "../data/NoC-US.txt";
import { extractData } from "../libs/ExtractData.js";
import { Icon } from "@thegetty/getty-ui";
import "unorm";
export default {
  name: "Search",
  components: { Icon },
  data() {
    return {
      value: "",
      query: "",
      matches: [],
      maxSearch: 250,
      itemsPerPage: 16,
      currentSearchPage: 0,
      imageData: NoC_US,
    };
  },
  computed: {
    resultText() {
      if (this.matches && this.matches.length == 1) {
        return "result";
      }
      return "results";
    },
    currentResults() {
      return this.matches.slice(this.startIndex, this.lastIndex);
    },
    startIndex() {
      return this.currentSearchPage * this.itemsPerPage;
    },
    lastIndex() {
      return this.startIndex + this.itemsPerPage;
    },
    onLastSearchPage() {
      return this.lastIndex >= this.matches.length;
    },
  },
  methods: {
    choose(match) {
      this.$emit("input", match);
    },
    prevPage() {
      this.currentSearchPage = this.currentSearchPage - 1;
    },
    nextPage() {
      this.currentSearchPage = this.currentSearchPage + 1;
    },
    search() {
      this.query = this.value;
      this.matches = [];
      this.currentSearchPage = 0;
      for (let _line of this.imageData.split("\n")) {
        let cols = _line.split("|");
        const _upper = cols[0]
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase();
        const _query = this.query
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase();
        let _artist = "";
        if (cols.length > 3 && cols[3] != undefined) {
          _artist = cols[3]
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
        }
        if (_upper.indexOf(_query) > -1 || _artist.indexOf(_query) > -1) {
          this.matches.push(extractData(_line));
        }
      }
    },
  },
};
</script>
<style type="text/css" scoped>
ol {
  max-height: 40em;
  overflow-y: scroll;
  list-style: decimal;
}
li {
  margin-left: 3em;
}

.a-btn--text:hover {
  background: transparent;
}
.spacing_top {
  margin-top: 1.2em;
}
input[type="search"] {
  font-size: 20px;
  font-weight: 600;
}
</style>
