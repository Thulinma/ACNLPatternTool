<template>
  <div>
    <input type="text" v-on:keyup.enter="search" v-model="query">
    <IconGenerator v-for="opt in results" :key="opt.bytes" v-on:pattclick="pickPattern" :pattern="opt.bytes" />
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
</style>
