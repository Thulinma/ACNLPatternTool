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
      lookupData: [],
      searchData: [],
      matches: [],
    };
  },
  mounted() {
    this.searchData = imageData
      .split("\n")
      .map((line) => line.split("|")[0].toUpperCase());
    this.lookupData = imageData.split("\n").map((line) => extractData(line));
  },
  methods: {
    choose(match) {
      this.$emit("input", match);
    },
    search() {
      let query = this.value;
      this.matches = [];
      console.log("searching imageData...", query);
      this.searchData.forEach((_upper, index) => {
        let _query = query.toUpperCase();
        if (_upper.indexOf(_query) > -1) {
          this.matches.push(this.lookupData[index]);
        }
      });
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
