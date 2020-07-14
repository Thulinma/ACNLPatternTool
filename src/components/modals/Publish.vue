<template>
  <ModalContainer @modal-close="$emit('close')">
    <template #window>
      <div class="publish--window">
        <div class="publish--header">
          <div class="publish--icon-cloud-container">
            <IconCloud class="publish--icon-cloud" />
          </div>
          <div class="publish--header-text">Publish Your Design!</div>
        </div>

        <ThreeDRender
          class="publish--render"
          :width="280"
          :height="280"
          :drawingTool="drawingTool"
        />

        <div class="publish--inputs">
          <label class="settings--input-field">
            <div class="settings--input-field-name required">Title</div>
            <div class="settings--input-container">
              <input
                id="pattern-title"
                class="settings--input"
                type="text"
                maxlength="20"
                spellcheck="false"
                autocomplete="off"
                v-model="details.title"
                @keydown.stop
              />
            </div>
          </label>

          <label class="settings--input-field">
            <div class="settings--input-field-name required">Author</div>
            <div class="settings--input-container">
              <input
                class="settings--input"
                type="text"
                maxlength="9"
                spellcheck="false"
                autocomplete="off"
                v-model="details.creator.name"
                @keydown.stop
              />
            </div>
          </label>

          <label class="settings--input-field">
            <div class="settings--input-field-name required">Town</div>
            <div class="settings--input-container">
              <input
                class="settings--input"
                type="text"
                maxlength="9"
                spellcheck="false"
                autocomplete="off"
                v-model="details.town.name"
                @keydown.stop
              />
            </div>
          </label>
        </div>

        <div class="publish--style-tags">
          <div class="publish--style-tags-title">Style Tags</div>
          <div class="publish--style-tag-selectors">
            <select
              v-for="(selected, i) in selectedStyles"
              :key="i"
              class="publish--style-tags-select"
              v-model="selectedStyles[i]"
            >
              <option value>- - -</option>
              <option v-for="style in styleOptionSets[i]" :value="style" :key="style">{{ style }}</option>
            </select>
          </div>
        </div>

        <div class="publish--type-tags">
          <div class>Type Tags</div>
          <div class="publish--type-tag-selectors">
            <select
              class="publish--type-tags-select"
              v-for="(selected, i) in selectedTypes"
              :key="i"
              v-model="selectedTypes[i]"
            >
              <option value>- - -</option>
              <option v-for="type in typeOptionSets[i]" :value="type" :key="type">{{ type }}</option>
            </select>
          </div>
        </div>

        <div class="publish--nsfw">
          <input type="checkbox" id="nsfw" v-model="isNSFW" />
          <label for="nsfw">NSFW</label>
        </div>

        <button class="publish--publish" @click="publish">Publish</button>
      </div>
    </template>
  </ModalContainer>
</template>

<script>
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import IconCloud from "~/components/icons/IconCloud.vue";
import ThreeDRender from "/components/ThreeDRender.vue";
import DrawingTool from "~/libs/DrawingTool";
import origin from "/libs/origin";

export default {
  name: "Publish",
  components: {
    ModalContainer,
    ThreeDRender,
    IconCloud
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true
    },
    patternDetails: {
      type: Object,
      required: true
    }
  },
  data: function() {
    const styles = [...origin.tags_style];
    const types = [...origin.tags_type];
    const selectedStyles = new Array(3).fill("");
    const selectedTypes = new Array(3).fill("");
    return {
      styles,
      types,
      details: {
        ...this.$props.patternDetails
      },
      selectedStyles,
      selectedTypes,
      isNSFW: false,
      isUploading: false
    };
  },
  computed: {
    styleOptionSets() {
      // do not allow duplicate selections
      return new Array(3).fill(null).map((_, i) => {
        return this.styles
          .slice()
          .filter(
            option =>
              this.selectedStyles.indexOf(option) <= -1 ||
              this.selectedStyles.indexOf(option) === i
          );
      });
    },
    typeOptionSets() {
      return new Array(3).fill(null).map((_, i) => {
        return this.types
          .slice()
          .filter(
            option =>
              this.selectedTypes.indexOf(option) <= -1 ||
              this.selectedTypes.indexOf(option) === i
          );
      });
    }
  },
  methods: {
    update() {
      this.details.title = this.details.title.trim();
      this.details.town.name = this.details.town.name.trim();
      this.details.creator.name = this.details.creator.name.trim();
      if (this.originalType !== this.details.type) {
        const msg =
          "A change in pattern type may cause the pattern to change in specific areas. Do you wish to proceed?";
        const confirm = window.confirm(msg);
        if (!confirm) return;
      }

      this.$emit("update-details", {
        ...this.details
      });
    },

    async publish() {
      if (this.isUploading) return;
      const title = this.details.title;
      const town = this.details.town.name;
      const author = this.details.town.author;
      const isNSFW = this.isNSFW;
      this.isUploading = true;
      const uplStatus = await origin.upload(
        btoa(this.drawingTool.toString()),
        ...this.selectedStyles,
        ...this.selectedTypes,
        isNSFW,
      );
      if (uplStatus["upload"]) {
        this.open = false;
        this.$router.push({ hash: `H:${uplStatus["upload"]}` });
        window.alert("successfully uploaded to database");
        this.$emit('close');
      } else if (uplStatus.includes("error")) {
        window.alert(
          "A pattern just like this already exists in the database!"
        );
      }
      this.isUploading = false;
    }
  },
  mounted() {
    this.$emit('pinkify');
  },
  destroyed() {
    this.$emit('unpinkify');
  }
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/resets";

.publish--window {
  @include absolute-center;
  z-index: 999;

  display: grid;
  grid-template-areas:
    "header header header header header header"
    "render render inputs inputs inputs inputs"
    "style-tags style-tags style-tags type-tags type-tags type-tags"
    "nsfw nsfw nsfw publish publish publish";
  grid-template-rows: auto;
  padding: 30px 40px;
  row-gap: 25px;
  column-gap: 20px;

  background-color: $ecru-white;
  border-radius: 45px;
  color: $jambalaya;
}

.publish--header {
  grid-area: header;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: left;
  align-content: center;
  align-items: center;
}

.publish--icon-cloud-container {
  margin-right: 15px;

  background-color: $cinderella;
  border-radius: 5px;
  padding: 0px 3px;
}

.publish--icon-cloud {
  fill: $jambalaya;
  align-items: str;
}

.publish--header-text {
  font-size: 1.1rem;
  font-weight: 600;
}

.publish--render {
  grid-area: render;
  align-self: center;
  background-color: $cinderella;
  border-radius: 10px;
  border-style: dashed;
  border-color: #707070;
  border-width: 4px;
}

.publish--inputs {
  grid-area: inputs;
  display: grid;
  row-gap: 20px;

  min-width: 500px;
  margin-left: 50px;
}

.settings--input-field {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
}

.settings--input-field-name {
  display: block;
  margin-bottom: 10px;

  &.required:after {
    content: "*";
    color: $tiffany-blue;
  }
}

.settings--input-container {
  @include relative-in-place;
  background-color: $cinderella;
  padding: 13px 25px;
  border-radius: 10px;

  &:hover {
    background-color: $salmon;
  }
}

.settings--input {
  @include reset-input;

  display: block;
  width: 100%;
  padding-bottom: 10px;

  background-size: 20px 3px;
  background-position: bottom;
  background-repeat: repeat-x;
  background-image: linear-gradient(
    90deg,
    $ecru-white,
    $ecru-white 50%,
    transparent 50%,
    transparent 100%
  );
}

.publish--style-tags {
  grid-area: style-tags;
}
.publish--type-tags {
  grid-area: type-tags;
}

.publish--style-tags,
.publish--type-tags {
  display: grid;
  row-gap: 10px;

  font-size: 1.1rem;
  font-weight: 600;
  color: $jambalaya;
}

.publish--style-tag-selectors,
.publish--type-tag-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  justify-content: left;
  justify-items: auto;
  column-gap: 10px;
}

select {
  @include reset-input;

  font-size: 1.1rem;

  background-color: $cinderella;
  border-radius: 8px;
  font-weight: 600;
  color: $jambalaya;
  padding: 10px 10px;
  cursor: pointer;
}

.publish--nsfw {
  grid-area: nsfw;
  justify-self: right;
  align-self: center;
}

.publish--publish {
  @include reset-button;
  grid-area: publish;
  justify-self: left;
  align-self: center;

  padding: 10px 45px;
  color: white;
  background-color: $robin-egg-blue;
  border-radius: 10px;
  cursor: pointer;
}
</style>