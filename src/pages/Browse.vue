<template>
  <div class="container">
    <nav>
      <div class="search-bar">
        Search:
        <input
          type="text"
          @keyup.enter="search"
          @input="onQueryChange"
          :value="query">
        <button @click="search">
          Search
        </button>
      </div>
      <button class="create-button" @click="goToEditor">
        Create
        <object class="svg" :data="addSvg"></object>
      </button>
      <div>
        All patterns submitted to the database go through an approval system first.<br>After Nintendo contacted us, we decided to remove the ability to search through the unapproved portion of the database in order to keep the game a happy and save place for everyone.
      </div>
    </nav>
    <div class="patterns">
      <a class="pattern-container" v-for="opt in results" :key="opt.bytes" :href="getUrl(opt.bytes)">
        <h3>{{opt.title}}</h3>
        <div class="type-tags">
          <span v-if="opt.f_type != null" class="tag type">
            {{opt.f_type.toUpperCase()}}
          </span>
          <span v-if="opt.f_type_a != null" class="tag type">
            {{opt.f_type_a}}
          </span>
          <span v-if="opt.f_type_b != null" class="tag type">
            {{opt.f_type_b}}
          </span>
        </div>
        <IconGenerator class="pickPattern" :pattern="opt.bytes" width=150 height=150 />
        <div class="pattern-details">
          <span>by {{opt.author}}</span>
          <span>from {{opt.town}}</span>
        </div>
        <div class="pattern-tags">
          <span v-if="opt.style_main != null" class="tag" :style="tagClass(opt.style_main)">
            {{opt.style_main}}
          </span>
          <span v-if="opt.style_sub_a != null" class="tag" :style="tagClass(opt.style_sub_a)">
            {{opt.style_sub_a}}
          </span>
          <span v-if="opt.style_sub_b != null" class="tag" :style="tagClass(opt.style_sub_b)">
            {{opt.style_sub_b}}
          </span>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import lzString from 'lz-string';
import { mapState, mapActions } from 'vuex';
import DrawingTool from '/libs/DrawingTool';
import IconGenerator from '/components/IconGenerator.vue';
import origin from '/libs/origin';
import addSvg from '/assets/icons/bxs-plus-circle.svg';

const colors = {
  "natural": '#EAC558',
  "cute": '#E96598',
  "sporty": '#5EC299',
  "cool": '#6BB6DC',
  "rustic": '#74940D',
  "hip": '#EB7E32',
  "harmonious": '#DC3D32',
  "elegant": '#D589E8',
  "modern": '#5BC0B3',
  "historical": '#8D2E4B',
  "civic": '#4F57C8',
  "silly": '#E64369',
  "spooky": '#363655',
  'sci-fi': '#408877',
  "aquatic": '#328BCE',
  "floral": '#EA80DA',
  "animal": '#AF2E33',
  "holiday": '#48903B',
  "food": '#B156FD',
  "brand": '#E93F33',
  "anime": '#EB8D77',
  "video-game": '#0D1010',
  "meme": '#52307C',
};

export default {
  name: "Browse",
  components: {
    IconGenerator
  },
  beforeRouteUpdate: async function(to, from, next) {
    await this.loadFromRoute(to);
    next();
  },
  beforeRouteLeave: function(to, from, next) {
    next();
  },
  data: function(){
    return {
      addSvg,
    };
  },
  computed: {
    // map using store module search
    ...mapState('browse', [
      'query',
      'results',
      'nsfc',
      'unapproved'
    ]),
  },
  methods: {
    // map using store module search
    ...mapActions('browse', [
      'setViewOptions',
      'setSearchOptions',
      'getInitSearchResults'
    ]),
    async loadFromRoute(route) {
      const query = route.query.q;
      let nsfc = route.query.nsfc;
      let unapproved = route.query.unapproved;
      let searchOptions = {};
      let queryOptions = {};
      let isCorrecting = false;

      if (query != null) {
        // correct the url
        searchOptions = {...searchOptions, query};
        if (query.length !== 0) queryOptions = {...queryOptions, q: query};
        else isCorrecting = true;
      }
      if (nsfc != null) {
        nsfc = Number.parseInt(nsfc);
        if (nsfc === 1) {
          searchOptions  = {...searchOptions, nsfc: true};
          queryOptions = {...queryOptions, nsfc: 1 };
        }
        else isCorrecting = true;
      }
      if (unapproved != null) {
        unapproved = Number.parseInt(unapproved);
        if (unapproved === 1) {
          searchOptions = {...searchOptions, unapproved: true};
          queryOptions = {...queryOptions, unapproved: 1};
        }
        else isCorrecting = true;
      }
      // if any 'invalid' or uncessary data in query, correct it
      // next loop around will load results
      if (isCorrecting) {
        await this.$router.replace({ query: queryOptions });
        return;
      }
      await this.setSearchOptions(searchOptions);
      await this.getInitSearchResults();
    },
    async onQueryChange(event) {
      const query = event.target.value;
      await this.setSearchOptions({ query });
    },
    async search(){
      // duplicated history guard
      const currQuery = this.query;
      let prevQuery = this.$route.query.q;
      if (!prevQuery) prevQuery = "";
      const currNSFC = this.nsfc;
      const prevNSFC = Boolean(this.$route.query.nsfc);

      const currUnapproved = this.unapproved;
      const prevUnapproved = Boolean(this.$route.query.unapproved);

      let queryOptions = {};
      // duplication guard
      if (
        currQuery === prevQuery &&
        currNSFC === prevNSFC &&
        currUnapproved === prevUnapproved
      ) {
        // console.log("blocked");
        return;
      };

      if (currQuery.length !== 0) queryOptions = {...queryOptions, q: currQuery};
      if (currNSFC) queryOptions = {...queryOptions, nsfc: 1};
      if (currUnapproved) queryOptions = {...queryOptions, unapproved: 1};
      // let route guard handle the rest
      await this.$router.push({ query: queryOptions });
    },
    getUrl(p){
      const dt = new DrawingTool(p);
      return "/editor#H:"+dt.pixelHash;
    },
    async goToEditor() {
      await this.$router.push({ path: `/editor` });
    },
    tagClass(tag){
      if (tag != null) return {backgroundColor: `${colors[tag.toLowerCase().replace(' ', '-')]}`};
    },
    openNSFCDisclaimer: async function(e) {
      const disclaimer = `      By selecting this option, you are voluntarily agreeing to viewing patterns that may contain content that is pornographic, violent, illegal, or disturbing in nature.
      By accepting this, you are consenting to this and confirming that you are at least 18 years of age.
      Continue?`;
      let prevNSFC = this.nsfc;
      let currNSFC;
      // turning off if already on
      if (prevNSFC) {
        currNSFC = false;
      }
      // confirm turn on if already off
      else if (window.confirm(disclaimer)) {
        currNSFC = true;
      }  else currNSFC = false;
      if (prevNSFC === currNSFC && prevNSFC === false) {
        e.preventDefault();
        return currNSFC;
      }

      await this.setSearchOptions({ nsfc: currNSFC });
      await this.search();
      return currNSFC;
    },
    onUnapprovedChange: async function(e) {
      let currUnapproved = e.target.checked;
      const prevUnapproved = this.unapproved;
      // console.log(currUnapproved, prevUnapproved);

      const nsfc = this.nsfc;
      if (currUnapproved) {// turning on
        // skip disclaimer if nsfc already on
        if (nsfc) { currUnapproved = true; }
        // enable disclaimer if nsfc not accepted
        else {
          const didAccept = await this.openNSFCDisclaimer(e);
          if (!didAccept) {
            currUnapproved = false;
            e.preventDefault();
          }
          else currUnapproved = true;
        }
      }
      // otherwise turning off
      await this.setSearchOptions({ unapproved: currUnapproved});
      await this.search();
    },
  },
  mounted: async function(){
    await this.loadFromRoute(this.$route);
  }
}
</script>

<style lang="scss" scoped>
$type: #858585;

.container {
  padding: 10px 5px;
  color: #7e7261;
}
nav {
  max-width: 80%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
nav input[type=text] {
  padding: 10px;
  min-width: 300px;
  border: none;
}
nav .create-button {
  background-color: #57AB35;
  color: #FFFFFF;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  border: none;
  box-shadow: rgba(0,0,0,0.2) 0 0 8px;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  min-width: 120px;
  padding: 10px 18px;
  justify-content: space-between;
  border-radius: 35px;
  cursor: pointer;
}
nav .create-button .svg {
  height: 25px;
  width: 25px;
  pointer-events: none;
}
.patterns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  grid-gap: 10px;
  justify-items: center;
}
.pattern-container {
  text-decoration:none;
  color:black;
  background-color: #A1D4CA;
  border-radius: 35px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 300px;
  max-width: 220px;
  max-height: 300px;
  margin: 10px;
  box-shadow: 5px 5px 12px -3px rgba(0,0,0,0.2);
  background-image: radial-gradient(#89C3B9 20%, transparent 20%), radial-gradient(#89C3B9 20%, transparent 20%);
  background-position: 0 0, 5px 5px;
  background-size: 10px 10px;
}
.pattern-container canvas {
  margin: 10px;
}
.pattern-container .pickPattern{
  cursor: pointer;
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
.type-tags, .pattern-tags{
  min-height: 30px;
  display: flex;
  align-items: center;
}
.type-tags .type {
  background-color: $type;
  text-transform: uppercase;
}
.tag {
  border-radius: 35px;
  padding: 3px 5px;
  margin: 0 2px;
  color: #FFFFFF;
  text-transform: uppercase;
  font-size: 11px;
  background-color: $type;
}
</style>
