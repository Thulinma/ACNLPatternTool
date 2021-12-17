<template>
  <VCard elevation="0" class="card">
    <div class="publish--window">
      <CancelButton @click="$emit('close')" />
      <div class="publish--header">
        <div class="publish--icon-cloud-container">
          <IconCloud class="publish--icon-cloud" />
        </div>
        <div class="publish--header-text">Publish Your Design!</div>
      </div>

      <IconGenerator
        class="publish--render"
        :width="280"
        :height="280"
        :pattern="drawingTool"
      />

      <div class="publish--text-fields">
        <VTextField
          v-model="details.title"
          class="text-field"
          label="Title"
          :maxlength="drawingTool.compatMode === 'ACNL' ? 20: 21"
          :hint="`${drawingTool.compatMode} pattern's name.`"
          persistent-hint
          outlined
          clearable
          counter
          @keydown.stop
        />

        <VTextField
          v-model="details.creator.name"
          class="text-field"
          label="Villager"
          :maxlength="drawingTool.compatMode === 'ACNL' ? 9: 10"
          :hint="`${drawingTool.compatMode} villager's name.`"
          persistent-hint
          outlined
          clearable
          counter
          @keydown.stop
        />

        <VTextField
          v-model="details.town.name"
          class="text-field"
          label="Town"
          :maxlength="drawingTool.compatMode === 'ACNL' ? 9: 10"
          :hint="`${drawingTool.compatMode} town's name.`"
          persistent-hint
          outlined
          clearable
          counter
          @keydown.stop
        />
      </div>

      <div class="style-tags">
        <div class="tags-title">Style Tags</div>
        <div class="tag-selects">
          <VSelect
            v-for="(style, i) in selectedStyles"
            :key="i"
            class="select"
            v-model="selectedStyles[i]"
            :items="styleOptsList[i]"
            outlined
            hide-details
            :menu-props="{
              'content-class': 'settings-type--menu',
            }"
          />
        </div>
      </div>

      <div class="type-tags">
        <div class="tags-title">Type Tags</div>
        <div class="tag-selects">
          <VSelect
            v-for="(type, i) in selectedTypes"
            :key="i"
            class="select"
            v-model="selectedTypes[i]"
            :items="typeOptsList[i]"
            outlined
            hide-details
            :menu-props="{
              'content-class': 'settings-type--menu',
            }"
          />
        </div>
      </div>

      <div class="publish--bottom-row">
        <VSwitch
          class="nsfw-switch"
          v-model="isNSFW"
          label="NSFW"
          :color="colors.persianGreen"
          hide-details
          dense
        />

        <VBtn
          class="publish-btn rounded-lg"
          elevation="0"
          @click="publish"
        >
          Publish
        </VBtn>
      </div>
    </div>
  </VCard>
</template>

<script>
import {
  VCard,
  VBtn,
  VSelect,
  VSwitch,
} from "vuetify/lib";
import CancelButton from "~/components/modals/CancelButton.vue";
import IconCloud from "~/components/icons/IconCloud.vue";
import IconGenerator from "~/components/IconGenerator.vue";
import DrawingTool from "~/libs/DrawingTool";
import origin from "~/libs/origin";

import colors from './../../styles/colors.scss';
import { computeOptsList } from "./../../utils/helpers";

export default {
  name: "Publish",
  components: {
    VCard,
    VBtn,
    VSelect,
    VSwitch,
    CancelButton,
    IconGenerator,
    IconCloud,
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    },
    patternDetails: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    const styles = [...origin.tags_style];
    const types = [...origin.tags_type];
    const selectedStyles = new Array(3).fill("");
    const selectedTypes = new Array(3).fill("");
    return {
      colors,
      styles,
      types,
      details: {
        ...this.$props.patternDetails,
      },
      selectedStyles,
      selectedTypes,
      isNSFW: false,
      isUploading: false,
    };
  },
  computed: {
    styleOptsList() {
      return computeOptsList(
        this.selectedStyles,
        [{ text: '- - -', value: "" }],
        this.styles.map(style => ({ text: style, value: style })),
      );
    },
    typeOptsList() {
      return computeOptsList(
        this.selectedTypes,
        [{ text: '- - -', value: "" }],
        this.types.map(type => ({ text: type, value: type })),
      );
    },
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
        ...this.details,
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
        isNSFW
      );
      if (uplStatus["upload"]) {
        this.open = false;
        this.$router.push({ hash: `H:${uplStatus["upload"]}` });
        window.alert("Successfully uploaded to database");
        this.$emit("close");
      } else if (uplStatus.includes("error")) {
        window.alert(
          "A pattern just like this already exists in the database!"
        );
        this.$emit("close");
      }
      this.isUploading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use "styles/overrides";
@import "styles/colors";
@import "styles/positioning";
@import "styles/resets";
@import "styles/screens";


.card {
  @include relative-in-place;
  max-width: 945px;
}

.publish--window {
  @include relative-in-place;

  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;
  grid-auto-columns: auto;
  row-gap: 25px;

  padding: 14px 23px;

  background-color: $ecru-white;
  color: $jambalaya;

  @include phone-landscape {
    padding: 28px 46px;
  }
  @include tablet-landscape {
    width: auto;
    height: auto;
    grid-template-columns: repeat(6, 1fr);
    grid-template-areas:
      "header header header header header header"
      "render render inputs inputs inputs inputs"
      "style style style type type type"
      "bottom bottom bottom bottom bottom bottom";
    padding: 30px 40px;
    column-gap: 20px;
    box-shadow: 0px 3px 20px rgba(0, 0, 0, 0.16);
  }
}

.publish--header {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: left;
  align-content: center;
  align-items: center;
  @include tablet-landscape {
    grid-area: header;
  }
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
  justify-self: center;
  align-self: center;
  background-color: $cinderella;
  border-radius: 10px;
  border-style: dashed;
  border-color: #707070;
  border-width: 4px;

  width: 250px;
  height: 250px;

  @include phone-landscape {
    width: 300px;
    height: 300px;
  }

  @include tablet-landscape {
    justify-self: flex-start;
    grid-area: render;
    margin: 0px;
  }
}

.publish--text-fields {
  display: grid;
  row-gap: 20px;
  justify-items: stretch;

  @include tablet-landscape {
    justify-items: auto;
    min-width: 500px;
    margin-left: 50px;
    grid-area: inputs;
  }
}

.style-tags { @include tablet-landscape { grid-area: style; }}
.type-tags { @include tablet-landscape { grid-area: type; }}
.style-tags,
.type-tags {
  margin-top: 20px;
  width: 100%;
  display: grid;
  row-gap: 10px;

  font-size: 1.1rem;
  font-weight: 600;
  color: $jambalaya;
}

.tag-selects {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: left;
  justify-items: stretch;
  column-gap: 10px;
  row-gap: 20px;

  @include phone-landscape {
    justify-items: auto;
    grid-template-columns: 1fr 1fr 1fr;
    row-gap: 0px;
  }
}

.publish--bottom-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
  column-gap: 10px;

  @include tablet-landscape {
    margin-bottom: 0px;
    grid-area: bottom;
  }
}

.nsfw-switch {
  padding-top: 0px;
  margin-top: 0px;
}

.publish-btn {
  @include overrides.v-btn(
    $white,
    $robin-egg-blue,
  );
  text-transform: uppercase;
  border: 4px solid $robin-egg-blue;
  font-weight: 700;
  &:hover {
    @include stripes($tiffany-blue, $tiffany-blue-light, 20px);
    @include moving-stripes(8s);
    border: 4px solid $turquoise;
  }
}

.text-field {
  @include overrides.v-text-field(
    $jambalaya,
    $cinderella,
    $olive-haze,
  );
}

.select {
  @include overrides.v-select(
    $jambalaya,
    $cinderella,
    $olive-haze,
  );
}
</style>