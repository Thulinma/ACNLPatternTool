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
          :width="150"
          :height="150"
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

<script lang="ts">
import { UploadEntry, StyleTag } from "@/libs/origin";
import { namespace } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import { mapGetters, mapState, mapActions } from "vuex";
import DrawingTool from "@/libs/DrawingTool";
import IconGenerator from "@/components/IconGenerator.vue";

const colors: Record<StyleTag, string> = {
  [StyleTag.Natural]: "#EAC558",
  [StyleTag.Cute]: "#E96598",
  [StyleTag.Sporty]: "#5EC299",
  [StyleTag.Cool]: "#6BB6DC",
  [StyleTag.Rustic]: "#74940D",
  [StyleTag.Hip]: "#EB7E32",
  [StyleTag.Harmonious]: "#DC3D32",
  [StyleTag.Elegant]: "#D589E8",
  [StyleTag.Modern]: "#5BC0B3",
  [StyleTag.Historical]: "#8D2E4B",
  [StyleTag.Civic]: "#4F57C8",
  [StyleTag.Silly]: "#E64369",
  [StyleTag.Spooky]: "#363655",
  [StyleTag.SciFi]: "#408877",
  [StyleTag.Aquatic]: "#328BCE",
  [StyleTag.Floral]: "#EA80DA",
  [StyleTag.Animal]: "#AF2E33",
  [StyleTag.Holiday]: "#48903B",
  [StyleTag.Food]: "#B156FD",
  [StyleTag.Brand]: "#E93F33",
  [StyleTag.Anime]: "#EB8D77",
  [StyleTag.VideoGame]: "#0D1010",
  [StyleTag.Meme]: "#52307C",
};

const modModule = namespace('profile');

@Component({
  name: "ModeratorDashboard",
  components: {
    IconGenerator,
  },
})
export default class ModeratorDashboard extends Vue {
  /**
   * The username of this moderator user.
   */
  @modModule.State('username') readonly username!: string;
  
  /**
   * The list of entries pending approval  pending approval.
   */
  @modModule.State('pending') readonly pending!: Array<UploadEntry>;
  
  /**
   * Whether the current moderator is logged in.
   */
  @modModule.Getter('isLoggedIn') readonly isLoggedIn!: boolean;
  
  /**
   * Logs out this moderator user.
   */
  @modModule.Action('logOut') logOut!: () => void;
  
  /**
   * Refrehes the list of entries pending approval.
   */
  @modModule.Action('getPending') getPending!: () => void;
  
  /**
   * Rejects the pattern.
   */
  @modModule.Action('reject') reject!: (hash: string) => void;
  
  /**
   * Approves the pattern with options.
   */
  @modModule.Action('approve')
  approve!: ({
    hash,
    options,
  } : {
    hash: string,
    options: UploadEntry,
  }) => void;
  
    async onLogOut() {
      await this.logOut();
    }
    
    async onGetPending() {
      await this.getPending();
    }
    
    tagClass(tag: StyleTag) {
      if (tag != null)
        return {
          backgroundColor: `${colors[tag]}`,
        };
    }
    
    /**
     * @param bytes The bytes string of the upload entry.
     */
    async wipePattern(bytes: string): Promise<void> {
      const dT = new DrawingTool(bytes);
      await this.reject(dT.pixelHash);
    }
    
    async okPattern(options: UploadEntry): Promise<void> {
      //Opt may contain:
      // nsfc: 0/1
      // offensive: 0/1
      // feature: 0/1
      // retag: 0/1
      // loweffort: 0/1
      const dT = new DrawingTool(options.bytes);
      const hash = dT.pixelHash;
      await this.approve({ hash, options });
    }
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
  font-family: inherit;
  text-align: center;
}
.patterns {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  row-gap: 0px;
  column-gap: 30px;
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
  height: auto;
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
