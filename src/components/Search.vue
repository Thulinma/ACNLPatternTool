<template>
  <div>
    <input
      name="search"
      v-model="value"
      @keyup.enter="search"
      placeholder="Search the Getty's Open Content Images "
    />
    <button name="search" @click="search">
      Search
    </button>

    <span v-if="query"
      >Showing {{ matches.length }} results for {{ query }}</span
    >

    <ol>
      <li v-for="match of matches" @click="choose(match)">
        {{ match.full_name }}
        <a :href="match.webpage">view in collection</a>
        <img :src="match.iiif_url" />
      </li>
    </ol>
  </div>
</template>
<script>
import imageData from "../data/NoC-US.txt";
import { extractData } from "../libs/ExtractData.js";

export default {
  name: "Search",
  data() {
    return {
      value: "",
      query: "",
      matches: []
    };
  },
  methods: {
    choose(match) {
      this.$emit("input", match);
    },
    search() {
      this.query = this.value;
      this.matches = [];
      console.log("searching imageData...", this.query);
      for (let _line of imageData.split("\n")) {
        const _upper = _line.split("|")[0].toUpperCase();
        const _query = this.query.toUpperCase();
        if (_upper.indexOf(_query) > -1) {
          this.matches.push(extractData(_line));
        }
      }
    }
  }
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
</style>
