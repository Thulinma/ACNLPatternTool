<template>
  <div class="stage">
    <div class="left-side">
      <div class="preview-container">
        <img class="preview" :src="previewDataURL" />
      </div>
    </div>

    <div class="right-side">
      <div>
        <div class="text-h6">Saving Method</div>
        <VRadioGroup
          :value="savingMethod"
          :value-comparator="(a, b) => a === b"
          @change="savingMethod = $event"
        >
          <VRadio
            v-for="option in savingMethodOptions"
            :key="option.name"
            :label="option.name"
            :value="option.value"
            :color="colors.jambalaya"
          />
        </VRadioGroup>
      </div>

      <VBtn class="save-btn rounded-lg" elevation="0" @click="save">
        Save
      </VBtn>
    </div>
  </div>
</template>

<script>
import { VBtn, VRadio, VRadioGroup } from "vuetify/lib";
import saver from "@/libs/saver";
import DrawingTool from "@/libs/DrawingTool";

import colors from "@/styles/colors.scss";

export default {
  name: "Saving",
  components: {
    VBtn,
    VRadio,
    VRadioGroup,
  },
  props: {
    previewDataURL: {
      type: String,
      required: true,
    },
    outputs: {
      type: Array,
      required: true,
    },
  },
  data: function () {
    return {
      colors,
      savingMethod: this.outputs.length === 1
        ? this.load
        : saver.saveDrawingToolsToStorage,
    };
  },
  computed: {
    savingMethodOptions() {
      return [
        ...(this.outputs.length === 1
          ? [{
            name: "Onto Pattern",
            value: this.load,
          }]
          : []
          ),
        {
          name: "To Storage",
          value: saver.saveDrawingToolsToStorage,
        },
        {
          name: "QRs as .ZIP",
          value: saver.saveDrawingToolsAsPng,
        },
        {
          name: "ACNLs/ACNHs as .ZIP",
          value: saver.saveDrawingToolsAsPattern,
        },
        {
          name: "Both as .ZIP",
          value: saver.saveDrawingToolsAsBoth,
        },
      ]; 
    },
  },
  methods: {
    async load() {
      this.$emit("load", this.outputs);
      window.alert("Conversion successfully loaded onto pattern.")
    },
    async save() {
      const drawingTools = this.outputs.map((output) => {
        const drawingTool = new DrawingTool(output.toString());
        return drawingTool;
      });
      await this.savingMethod(drawingTools);
      if (this.savingMethod === saver.saveDrawingToolsToStorage)
        window.alert("Patterns successfully saved to Storage.");
    },
  },
};
</script>


<style lang="scss" scoped>
@use "styles/overrides" as overrides;
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;

.stage {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  justify-content: center;
  column-gap: 50px;
  row-gap: 30px;
  overflow-y: auto;
  padding: 24px 24px 24px 24px;

  @include screens.tablet-landscape {
    grid-template-columns: auto auto;
    overflow-y: scroll;
    max-height: 425px;
  }
}

.left-side {
  justify-self: center;
  align-self: flex-start;

  position: relative;
  top: 0;
  left: 0;

  display: grid;
  grid-template-areas: "preview preview";
  row-gap: 30px;
  grid-template-rows: auto;
  grid-template-columns: auto;

  justify-content: center;
  justify-items: center;
  align-content: space-between;
  align-items: auto;

  @include screens.tablet-landscape {
    position: sticky;
  }
}

.preview-container {
  @include positioning.relative-in-place;
  grid-area: preview;

  display: flex;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  overflow: hidden;

  @include colors.polkadots(
    colors.$olive-haze,
    colors.$donkey-brown
  );
  @include colors.moving-polkadots(2s);
  min-width: 200px;
  height: 300px;
  padding: 20px;
  border-radius: 8px;

  &::before {
    // overlay
    content: "";
    display: block;
    @include positioning.absolute-center;
    width: 100%;
    height: 100%;
    background: black;
    opacity: 0.5;
  }
  @include screens.phone-landscape {
    width: 350px;
  }
}

.preview {
  @include positioning.relative-in-place;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  // need this or its blurry
  image-rendering: pixelated;
}

.right-side {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: stretch;
  justify-items: stretch;
  align-content: space-between;
  row-gap: 15px;
}

.text-h6 {
  color: colors.$jambalaya;
}

.save-btn {
  @include overrides.v-btn(
    colors.$white,
    colors.$robin-egg-blue
  );
  padding: 0px 20px !important;
  @include overrides.v-btn(
    colors.$white,
    colors.$robin-egg-blue
  );
  border: 4px solid colors.$robin-egg-blue;
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
</style>
