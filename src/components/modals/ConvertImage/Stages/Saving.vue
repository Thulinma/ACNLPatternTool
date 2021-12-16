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
import saver from "~/libs/saver";
import DrawingTool from "~/libs/DrawingTool";

import colors from "~/styles/colors.scss";

const savingMethodOptions = [
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

export default {
  name: "Saving",
  components: {
    VBtn,
    VRadio,
    VRadioGroup,
  },
  props: {
    isMural: {
      type: Boolean,
      required: true,
    },
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
      savingMethodOptions,
      savingMethod: saver.saveDrawingToolsToStorage,
    };
  },
  methods: {
    async save() {
      const drawingTools = this.outputs.map((output) => {
        const drawingTool = new DrawingTool(output);
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
@import "styles/colors";
@import "styles/positioning";
@import "styles/resets";
@import "styles/screens";

.stage {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  justify-content: center;
  column-gap: 50px;
  row-gap: 30px;
  overflow-y: auto;
  padding: 24px 24px 24px 24px;

  @include tablet-landscape {
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

  @include tablet-landscape {
    position: sticky;
  }
}

.preview-container {
  @include relative-in-place;
  grid-area: preview;

  display: flex;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  overflow: hidden;

  @include polkadots($olive-haze, $donkey-brown);
  @include moving-polkadots(2s);
  min-width: 200px;
  height: 300px;
  padding: 20px;
  border-radius: 8px;

  &::before {
    // overlay
    content: "";
    display: block;
    @include absolute-center;
    width: 100%;
    height: 100%;
    background: black;
    opacity: 0.5;
  }
  @include phone-landscape {
    width: 350px;
  }
}

.preview {
  @include relative-in-place;
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
  color: $jambalaya;
}

.save-btn {
  @include overrides.v-btn($white, $robin-egg-blue);
  padding: 0px 20px !important;
  @include overrides.v-btn($white, $robin-egg-blue);
  border: 4px solid $robin-egg-blue;
  &:hover {
    @include stripes($tiffany-blue, $tiffany-blue-light, 20px);
    @include moving-stripes(8s);
    border: 4px solid $turquoise;
  }
}
</style>
