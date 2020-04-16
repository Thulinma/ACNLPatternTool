<template>
  <div class="spacing_top">
    <div class="m-search-input" ref="searchInput">
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
    <span v-if="query" ref="summary" class="summary"
      >Showing {{ startIndex + 1 }} - {{ lastIndex }} of {{ matches.length }}
      {{ resultText }} for '{{ query }}'</span
    >

    <ol ref="searchResults">
      <li v-for="match of currentResults" :key="match.webpage">
        <img
          :key="match.webpage"
          class="gallery_img"
          :class="match.iiif_url == selected ? 'selected' : ''"
          :src="match.iiif_url"
          @click="choose(match)"
        />
        <p class="f-body-1" @click="choose(match)">
          {{ match.full_name
          }}<span v-if="match.artist"> by {{ match.artist }}</span>
        </p>
        <a class="f-body-1 a-link" :href="match.webpage"
          ><span class="a-link__label">view in collection</span></a
        >
      </li>
    </ol>
    <div v-if="query" class="paginate">
      <a
        class="f-body-1 a-link"
        href="#"
        @click.prevent="prevPage"
        v-if="currentSearchPage != 0"
      >
        <span class="a-link__label">
          prev
        </span>
      </a>
      <a
        class="f-body-1 a-link"
        href="#"
        @click.prevent="nextPage"
        v-if="onLastSearchPage == false"
      >
        <span class="a-link__label">
          next
        </span>
      </a>
    </div>
  </div>
</template>
<script>
import NoC_US from "../data/NoC-US.txt";
import { extractData } from "../libs/ExtractData.js";
import { Icon } from "@thegetty/getty-ui";
import "unorm";
if (typeof window !== "undefined") {
  let smoothscroll = require("smoothscroll-polyfill");
  smoothscroll.polyfill();
}

export default {
  name: "Search",
  components: { Icon },
  data() {
    return {
      value: "",
      query: "",
      matches: [],
      maxSearch: 250,
      itemsPerPage: 8,
      selected: undefined,
      currentSearchPage: 0,
      imageData: NoC_US
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
    }
  },
  methods: {
    choose(match) {
      this.selected = match.iiif_url;
      this.$emit("input", match);
    },
    prevPage() {
      this.currentSearchPage = this.currentSearchPage - 1;
      this.scrollTo(this.$refs["searchInput"]);
    },
    nextPage() {
      this.currentSearchPage = this.currentSearchPage + 1;
      this.scrollTo(this.$refs["searchInput"]);
    },
    scrollTo(el) {
      const scroll = el.offsetTop - 110;
      if (window.pageYOffset - 220 <= scroll) {
        return;
      }
      window.scrollTo({
        top: scroll,
        behavior: "smooth"
      });
    },
    search() {
      this.query = this.value;
      this.selected = undefined;
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
    }
  }
};
</script>
<style type="text/css" scoped>
ol {
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  min-height: 0px;
}
li {
  /*overflow: auto;*/
  flex: 1 0 22%;
  padding-bottom: 1em;
}

.a-btn--text:hover {
  background: transparent;
}
.spacing_top {
  margin-top: 1.2em;
}

.gallery_img {
  max-width: 90%;
  min-width: 50%;
}

.summary {
  display: block;
  padding-top: 1em;
  padding-bottom: 1em;
}

.paginate {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  border-top: 1px solid #aeaeae;
  padding-top: 0.2em;
  margin-top: 1em;
}

.paginate > .a-link + .a-link {
  padding-left: 2em;
}

a.disabled,
a.disabled:hover,
a.disabled .a-link__label:hover {
  color: #1a1a1a;
  text-decoration: none !important;
}

.selected {
  border: 6px solid white;
  outline: 2px solid #675102;
}
</style>
