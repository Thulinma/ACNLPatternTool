<template>
  <div v-if="isLoggedIn">
    <div class="top">
      Welcome, {{ username }}.<br />
      <button @click="onLogOut">Sign Out</button>
      <button @click="onGetPending">Get pending approval list</button>
    </div>
    <div class="patterns">
      <div
        class="pattern-container"
        v-for="(opt, i) in pending"
        :key="opt.bytes"
      >
        <h3>{{ opt.title }}</h3>
        <div class="type-tags">
          <span v-if="opt.f_type != null" class="tag type">
            {{ opt.f_type }}
          </span>
          <span v-if="opt.f_type_a != null" class="tag type">
            {{ opt.f_type_a }}
          </span>
          <span v-if="opt.f_type_b != null" class="tag type">
            {{ opt.f_type_b }}
          </span>
        </div>
        <IconGenerator
          class="pickPattern"
          :pattern="opt.bytes"
          width="150"
          height="150"
        />
        <div class="pattern-details">
          <span>by {{ opt.author }}</span>
          <span>from {{ opt.town }}</span>
        </div>
        <div class="pattern-tags">
          <span
            v-if="opt.style_main != null"
            class="tag"
            :style="tagClass(opt.style_main)"
          >
            {{ opt.style_main }}
          </span>
          <span
            v-if="opt.style_sub_a != null"
            class="tag"
            :style="tagClass(opt.style_sub_a)"
          >
            {{ opt.style_sub_a }}
          </span>
          <span
            v-if="opt.style_sub_b != null"
            class="tag"
            :style="tagClass(opt.style_sub_b)"
          >
            {{ opt.style_sub_b }}
          </span>
        </div>
        <div class="options">
          <span>
            <input
              :id="i + '-featured'"
              type="checkbox"
              @change="opt.feature = $event.target.checked"
            />
            <label :for="i + '-featured'">Feature this Pattern</label>
          </span>
          <span>
            <input
              :id="i + '-nsfc'"
              type="checkbox"
              :checked="!!+opt.nokids"
              @change="opt.nokids = $event.target.checked"
            />
            <label :for="i + '-nsfc'">Not Safe For Children</label>
          </span>
          <span>
            <input
              :id="i + '-offensive'"
              type="checkbox"
              @change="opt.offensive = $event.target.checked"
            />
            <label :for="i + '-offensive'">Offensive</label>
          </span>
          <!-- <span>
            <input :id="i + '-loweffort'" type="checkbox" @change="opt.loweffort=$event.target.checked">
            <label :for="i + '-loweffort'">Low Effort</label>
          </span> -->
          <span>
            <input
              :id="i + '-retagging'"
              type="checkbox"
              @change="opt.retag = $event.target.checked"
            />
            <label :for="i + '-retagging'">Needs Retagging</label>
          </span>
        </div>
        <div class="mod-buttons">
          <div class="lq">
            <button
              class="approve-button"
              @click.stop="
                opt.loweffort = true;
                okPattern(opt);
              "
            >
              LQ, Approve
            </button>
            <button
              class="approve-button"
              @click.stop="
                opt.is_meme = true;
                okPattern(opt);
              "
            >
              LQ, Meme, Approve
            </button>
            <button
              class="approve-button"
              @click.stop="
                opt.is_anime = true;
                okPattern(opt);
              "
            >
              LQ, Anime, Approve
            </button>
            <button
              class="approve-button"
              @click.stop="
                opt.is_videogame;
                okPattern(opt);
              "
            >
              LQ, Video Game, Approve
            </button>
          </div>
          <div class="normal">
            <button class="approve-button" @click.stop="okPattern(opt)">
              Approve
            </button>
            <button class="delete-button" @click.stop="wipePattern(opt.bytes)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";
import lzString from "lz-string";
import DrawingTool from "~/libs/DrawingTool";
import IconGenerator from "~/components/IconGenerator.vue";

const colors = {
  natural: "#EAC558",
  cute: "#E96598",
  sporty: "#5EC299",
  cool: "#6BB6DC",
  rustic: "#74940D",
  hip: "#EB7E32",
  harmonious: "#DC3D32",
  elegant: "#D589E8",
  modern: "#5BC0B3",
  historical: "#8D2E4B",
  civic: "#4F57C8",
  silly: "#E64369",
  spooky: "#363655",
  "sci-fi": "#408877",
  aquatic: "#328BCE",
  floral: "#EA80DA",
  animal: "#AF2E33",
  holiday: "#48903B",
  food: "#B156FD",
  brand: "#E93F33",
  anime: "#EB8D77",
  "video-game": "#0D1010",
  meme: "#52307C",
};

export default {
  name: "ModeratorDashboard",
  components: {
    IconGenerator,
  },
  computed: {
    ...mapState("profile", ["username", "pending"]),
    ...mapGetters("profile", ["isLoggedIn"]),
  },
  methods: {
    ...mapActions("profile", ["logOut", "getPending", "reject", "approve"]),
    onLogOut: async function () {
      await this.logOut();
    },
    onGetPending: async function () {
      await this.getPending();
    },
    tagClass(tag) {
      if (tag != null)
        return {
          backgroundColor: `${colors[tag.toLowerCase().replace(" ", "-")]}`,
        };
    },
    wipePattern: async function (bytes) {
      const dT = new DrawingTool(bytes);
      await this.reject(dT.pixelHash);
    },
    okPattern: async function (options) {
      //Opt may contain:
      // nsfc: 0/1
      // offensive: 0/1
      // feature: 0/1
      // retag: 0/1
      // loweffort: 0/1
      const dT = new DrawingTool(options.bytes);
      const hash = dT.pixelHash;
      await this.approve({ hash, options });
    },
  },
};
</script>

<style lang="scss" scoped>
$type: #858585;

button {
  text-transform: uppercase;
  padding: 8px 12px;
  border-radius: 35px;
  border: none;
  cursor: pointer;
}
.top {
  text-align: center;
}
.patterns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  grid-gap: 10px;
  justify-items: center;
}
.pattern-container {
  background-color: #a1d4ca;
  border-radius: 35px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 520px;
  max-width: 220px;
  max-height: 520px;
  margin: 10px;
  box-shadow: 5px 5px 12px -3px rgba(0, 0, 0, 0.2);
  background-image: radial-gradient(#89c3b9 20%, transparent 20%),
    radial-gradient(#89c3b9 20%, transparent 20%);
  background-position: 0 0, 5px 5px;
  background-size: 10px 10px;
}
.pattern-container canvas {
  margin: 5px;
}
.pattern-container .pickPattern {
  cursor: pointer;
}
.pattern-details {
  background-color: #ebe6cd;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 12px;
  width: 150px;
}
.type-tags,
.pattern-tags {
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
  color: #ffffff;
  text-transform: uppercase;
  font-size: 11px;
  background-color: $type;
}
.options {
  font-size: 10px;
  margin: 0 0 10px;
}
.options span {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.options span input {
  margin: 0 8px 5px 0;
}
.mod-buttons {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 90%;
}
.mod-buttons .lq {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.mod-buttons .normal {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}
.mod-buttons .approve-button,
.delete-button {
  color: #ffffff;
}
.mod-buttons .approve-button {
  background-color: #50c878;
}
.mod-buttons .delete-button {
  background-color: red;
}
.mod-buttons .lq button {
  background-color: teal;
  padding: 5px 10px;
  margin: 2px 0;
}
</style>
