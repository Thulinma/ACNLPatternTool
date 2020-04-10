<template>
  <div>
    <input name="search" v-model="value" /><button
      name="search"
      @click="search"
    >
      Search
    </button>
    <ol>
      <li v-for="match of matches" @click="choose(match)">
        {{ match.full_name }}
        <a :src="match.webpage">view in collection</a>
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

      matches: [],
    };
  },
  methods: {
    choose(match) {
      this.$emit("input", match);
    },
    search() {
      let query = this.value;
      this.matches = [];
      console.log("searching imageData...", query);
      for (let _line of imageData.split("\n")) {
        const _upper = _line.split("|")[0].toUpperCase();
        const _query = query.toUpperCase();
        if (_upper.indexOf(_query) > -1) {
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
}
</style>
