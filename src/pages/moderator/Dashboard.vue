<template>
  <div v-if="!isLoggedIn"></div>
  <div v-else>
    <div>
      I am {{ username }}.
      <button @click="onLogOut">Sign Out</button>
      <button @click="onGetPending">Get pending approval list</button>
    </div>
    <div class="patterns">
      <div class="pattern-container" v-for="opt in pending" :key="opt.bytes">
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
        <button @click.stop="okPattern(opt.bytes, {feature:1})">Approve, featured!</button>
        <div>
          <button @click.stop="okPattern(opt.bytes)">Approve</button>
          <button @click.stop="okPattern(opt.bytes, {nsfc:true})">Approve NSFC</button>
          <button @click.stop="okPattern(opt.bytes, {offensive:true})">Approve offensive</button>
        </div>
        <div>
          <button @click.stop="okPattern(opt.bytes, {retag:true})">Approve, must retag</button>
          <button @click.stop="okPattern(opt.bytes, {nsfc:true, retag:true})">Approve NSFC, must retag</button>
          <button @click.stop="okPattern(opt.bytes, {offensive:true, retag:true})">Approve offensive, must retag</button>
        </div>
        <button @click.stop="wipePattern(opt.bytes)">DELETE</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import lzString from 'lz-string';
import DrawingTool from '/libs/DrawingTool';
import IconGenerator from '/components/IconGenerator.vue';

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
};

export default {
  name: "ModeratorDashboard",
  components: {
    IconGenerator
  },
  computed: {
    ...mapState('profile', [
      'username',
      'pending'
    ]),
    ...mapGetters('profile', [
      'isLoggedIn'
    ]),
  },
  methods: {
    ...mapActions('profile', [
      'logOut',
      'getPending',
      'reject',
      'approve'
    ]),
    onLogOut: async function() {
      await this.logOut();
    },
    onGetPending: async function() {
      await this.getPending();
    },
    tagClass(tag){
      if (tag != null) return {backgroundColor: `${colors[tag.toLowerCase()]}`};
    },
    wipePattern(bytes){
      const dT = new DrawingTool(bytes);
      this.reject(dT.pixelHash);
    },
    okPattern(bytes, opts={}){
      //Opts may contain:
      // nsfc: 0/1
      // offensive: 0/1
      // feature: 0/1
      // retag: 0/1
      // loweffort: 0/1
      const dT = new DrawingTool(bytes);
      opts.approve = dT.pixelHash;
      this.approve(opts);
    },
  }
}
</script>


<style lang="scss" scoped>
$type: #858585;

.patterns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  grid-gap: 10px;
  justify-items: center;
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
