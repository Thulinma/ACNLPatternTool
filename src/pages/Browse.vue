<template>
  <div>
    Search: <input type="text" v-on:keyup.enter="search" v-model="query">
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
import DrawingTool from '/libs/DrawingTool';
import IconGenerator from '/components/IconGenerator.vue';
import * as API from '/libs/origin';
import lzString from 'lz-string';

export default {
  name: "Browse",
  components: {
    IconGenerator
  },
  data: function(){
    return {results: false, query:""};
  },
  methods: {
    async search(){
      this.results = await API.search(this.query);
    },
    pickPattern(p){
      const dt = new DrawingTool(p);
      this.$router.push({hash:"H:"+dt.pixelHash, path:"/editor"});
    }
  },
  mounted: async function(){
      this.results = await API.recent();
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
