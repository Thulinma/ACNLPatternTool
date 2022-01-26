<template>
  <VCard class="card" width="auto">
    <VCardTitle>Publish</VCardTitle>
    <VCardText class="publish-grid">
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
    </VCardText>
    <CancelButton @click="$emit('close')" />
  </VCard>
</template>

<script>
import {
  VCard,
  VCardTitle,
  VCardText,
  VBtn,
  VSelect,
  VSwitch,
} from "vuetify/lib";
import CancelButton from "@/components/modals/CancelButton.vue";
import IconGenerator from "@/components/IconGenerator.vue";
import DrawingTool from "@/libs/DrawingTool";
import {
  StyleTag,
  TypeTag,
  upload,
} from "@/libs/origin";

import colors from './../../styles/colors.scss';
import { computeOptsList } from "./../../libs/component-helpers";

export default {
  name: "Publish",
  components: {
    VCard,
    VCardTitle,
    VCardText,
    VBtn,
    VSelect,
    VSwitch,
    CancelButton,
    IconGenerator,
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
    const styles = Object.values(StyleTag);
    const types = Object.values(TypeTag);
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
      const uplStatus = await upload(
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
@use "styles/overrides" as overrides;
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;


.card {
  @include positioning.relative-in-place;
  max-width: 945px;
  color: colors.$jambalaya !important;
  background-color: colors.$ecru-white;
}

.publish-grid {
  @include positioning.relative-in-place;

  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;
  grid-auto-columns: auto;
  row-gap: 25px;

  color: colors.$jambalaya;

  @include screens.tablet-landscape {
    width: auto;
    height: auto;
    grid-template-columns: repeat(6, 1fr);
    grid-template-areas:
      "render render inputs inputs inputs inputs"
      "style style style type type type"
      "bottom bottom bottom bottom bottom bottom";
    column-gap: 20px;
  }
}


.publish--render {
  justify-self: center;
  align-self: center;
  background-color: colors.$cinderella;
  border-radius: 10px;
  border-style: dashed;
  border-color: #707070;
  border-width: 4px;

  width: 250px;
  height: 250px;

  @include screens.phone-landscape {
    width: 300px;
    height: 300px;
  }

  @include screens.tablet-landscape {
    justify-self: flex-start;
    grid-area: render;
    margin: 0px;
  }
}

.publish--text-fields {
  display: grid;
  row-gap: 20px;
  justify-items: stretch;

  @include screens.tablet-landscape {
    justify-items: auto;
    min-width: 500px;
    margin-left: 50px;
    grid-area: inputs;
  }
}

.style-tags { @include screens.tablet-landscape { grid-area: style; }}
.type-tags { @include screens.tablet-landscape { grid-area: type; }}
.style-tags,
.type-tags {
  margin-top: 20px;
  width: 100%;
  display: grid;
  row-gap: 10px;

  font-size: 1.1rem;
  font-weight: 600;
  color: colors.$jambalaya;
}

.tag-selects {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: left;
  justify-items: stretch;
  column-gap: 10px;
  row-gap: 20px;

  @include screens.phone-landscape {
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

  @include screens.tablet-landscape {
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
    colors.$white,
    colors.$robin-egg-blue,
  );
  text-transform: uppercase;
  border: 4px solid colors.$robin-egg-blue;
  font-weight: 700;
  &:hover {
    @include colors.stripes(
      colors.$tiffany-blue,
      colors.$tiffany-blue-light,
      20px
    );
    @include colors.moving-stripes(8s);
    border: 4px solid colors.$turquoise;
  }
}

.text-field {
  @include overrides.v-text-field(
    colors.$jambalaya,
    colors.$cinderella,
    colors.$olive-haze,
  );
}

.select {
  @include overrides.v-select(
    colors.$jambalaya,
    colors.$cinderella,
    colors.$olive-haze,
  );
}
</style>