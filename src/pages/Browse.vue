<template>
  <div>
    Search:
    <input
      type="text"
      v-on:keyup.enter="search"
      v-bind:value="query"
      v-on:input="updateQuery({query: $event.target.value})">
    <table>
    <tr>
      <th>Title</th>
      <th>Preview</th>
      <th>Author name</th>
      <th>Author town</th>
      <th>Publish date</th>
    </tr>
    <tr v-for="opt in results" :key="opt.bytes">
      <td>{{opt.title}}</td>
      <td><IconGenerator v-on:pattclick="pickPattern" :pattern="opt.bytes" /></td>
      <td>{{opt.author}}</td>
      <td>{{opt.town}}</td>
      <td>{{opt.upload_date}}</td>
    </tr>
    </table>
  </div>
</template>

<script>
import lzString from 'lz-string';
import { mapState, mapMutations } from 'vuex';
import DrawingTool from '/libs/DrawingTool';
import IconGenerator from '/components/IconGenerator.vue';
import * as API from '/libs/origin';

export default {
  name: "Browse",
  components: {
    IconGenerator
  },
  data: function(){
    return {};
  },
  computed: {
    // map using store module search
    ...mapState('search', [
      'query',
      'results',
    ]),
  },
  methods: {
    // map using store module search
    ...mapMutations('search', [
      'updateQuery',
      'updateResults',
    ]),
    async search(){
      const results = await API.search(this.query);
      this.updateResults({ results });
    },
    pickPattern(p){
      const dt = new DrawingTool(p);
      this.$router.push({hash:"H:"+dt.pixelHash, path:"/editor"});
    }
  },
  mounted: async function(){
    const results = await API.recent();
    this.updateResults({ results });
  }
}
</script>

<style lang="scss" scoped>
table, td, th{
  border: 1px solid black;
  vertical-align:middle;
}
td{padding:5px;}
</style>
