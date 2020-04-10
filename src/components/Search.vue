<template>
  <div>
    <input name="search" v-model="value" /><button
      name="search"
      @click="search"
    >
      Search
    </button>
    <ol>
      <li v-for="match of matches">
        {{ match.title }}
        {{ match.id }}
      </li>
    </ol>
  </div>
</template>
<script>
import imageData from "../data/NoC-US.txt"; // OR: const helloText = require('./hello.txt')

export default {
  name: "Search",
  data() {
    return {
      value: "",
      matches: []
    };
  },
  methods: {
    search() {
      let query = this.value;
      this.matches = [];
      console.log("searching imageData...", query);
      for (let _line of imageData.split("\n")) {
        let _query = query.toUpperCase();
        let _upper = _line.toUpperCase();
        if (
          (_upper.includes && _upper.includes(_query)) ||
          _upper.indexOf(_query) > -1
        ) {
          let line = _line.split("|");
          this.matches.push({
            title: line[0],
            id: line[1],
            manifest: line[2]
          });
        }
      }
    }
  }
};
</script>
<style type="text/css" scoped>
ol {
  max-height: 10em;
  overflow-y: scroll;
}
</style>
