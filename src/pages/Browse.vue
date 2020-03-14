<template>
  <div class="container">
    <nav> 
      Search: <input type="text" v-on:keyup.enter="search" v-model="query">
    </nav>
    <div class="patterns">
      <div class="pattern-container" v-for="opt in results" :key="opt.bytes">
        <h3>{{opt.title}}</h3>
        <IconGenerator v-on:pattclick="pickPattern" :pattern="opt.bytes" />
        <div class="pattern-details">
          <span>by {{opt.author}}</span>
          <span>from {{opt.town}}</span>
          <div class="pattern-tags">
            <!-- <span v-for="tag in opt.tags" :key="tag">
              {{tag}} need to assign class based on tag
            </span> -->
          </div>
        </div>
      </div>
    </div>
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
<<<<<<< HEAD
    return {};
  },
  computed: {
    // map using store module search
    ...mapState('search', [
      'query',
      'results',
    ]),
=======
    return {
      results: false, 
      query: "",
    };
>>>>>>> matching modals to prototype
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
<<<<<<< HEAD
    const results = await API.recent();
    this.updateResults({ results });
=======
      this.results = await API.recent();
      console.log(results)
>>>>>>> matching modals to prototype
  }
}
</script>

<style lang="scss" scoped>
// maybe a calculated class?
// TODO: use css grids instead of flexbox
:root {
  --type: #858585;
  --natural: #EAC558;
  --cute: #E96598;
  --sporty: #5EC299;
  --cool: #6BB6DC;
  --rustic: #74940D;
  --hip: #EB7E32;
  --harmonious: #DC3D32;
  --elegant: #D589E8;
  --modern: #5BC0B3;
  --historical: #8D2E4B;
  --civic: #4F57C8;
  --silly: #E64369;
  --spooky: #363655;
  --sci-fi: #408877;
  --aquatic: #328BCE;
  --floral: #EA80DA;
  --animal: #AF2E33;
  --holiday: #48903B;
  --food: #B156FD;
  --brand: #E93F33;
}
.container {
  padding: 10px 5px;
  color: #7e7261;
}
nav {
  padding: 10px 20px;
}
nav input[type=text] {
  padding: 10px;
  min-width: 300px;
  border: none;
}
.patterns {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.pattern-container {
  background-color: #A1D4CA;
  border-radius: 35px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 280px;
  max-width: 220px;
  max-height: 280px;
  margin: 10px;
  box-shadow: 5px 5px 12px -3px rgba(0,0,0,0.2);
  background-image: radial-gradient(#89C3B9 20%, transparent 20%), radial-gradient(#89C3B9 20%, transparent 20%);
  background-position: 0 0, 5px 5px;
  background-size: 10px 10px;
}
.pattern-container canvas {
  margin: 10px;
}
.pattern-details {
  background-color: #EBE6CD;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 12px;
  width: 150px;
}
.tags {
  border-radius: 35px;
  padding: 2px 3px;
  color: #FFFFFF;
}
.tags .type {
  background-color: #858585;
}
</style>
