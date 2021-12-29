<template>
  <VCard elevation="0" class="card rounded-xl">
    <VCardTitle class="title">Convert Image</VCardTitle>
    <CancelButton @click="$emit('close')" />
    <VStepper class="stepper rounded-xl" v-model="state" elevation="0">
      <VStepperItems>
        <VStepperContent
          class="stepper-content internal-padding"
          :step="1"
        >
          <CroppingStage
            v-if="state === states.cropping"
            :dataURL="dataURL"
            @update:dataURL="dataURL = $event"
            :rows="rows"
            @update:filename="filename = $event"
            @update:rows="rows = $event"
            :columns="columns"
            @update:columns="columns = $event"
            @next="toAdjusting"
          />
        </VStepperContent>
        <VStepperContent
          class="stepper-content internal-padding"
          :step="2"
        >
          <AdjustingStage
            v-if="state === states.adjusting"
            :previewDataURL="previewDataURL"
            :isMosaic="isMosaic"
            :croppedIsTransparent="croppedIsTransparent"
            :transparency="transparency"
            @update:transparency="transparency = $event"
            :saturation="saturation"
            @update:saturation="saturation = $event"
            :imageSmoothingQuality="imageSmoothingQuality"
            @update:imageSmoothingQuality="imageSmoothingQuality = $event"
            :isSplitPalette="isSplitPalette"
            @update:isSplitPalette="isSplitPalette = $event"
            :paletteSelector="paletteSelector"
            @update:paletteSelector="paletteSelector = $event"
            @prev="toCropping(false)"
            @next="toSaving(true)"
          />
        </VStepperContent>
        <VStepperContent
          v-if="isMosaic"
          class="stepper-content internal-padding"
          :step="3"
        >
          <SavingStage
            :previewDataURL="previewDataURL"
            :outputs="outputs"
            v-if="state === states.saving"
          />
        </VStepperContent>
      </VStepperItems>

      <VStepperHeader class="stepper-header">
        <VStepperStep
          :editable="state > states.cropping"
          :step="1"
          :complete="state > states.cropping"
          :color="colors.oliveHaze"
        >
          Crop
        </VStepperStep>
        <VStepperStep
          :editable="state > states.adjusting"
          :step="2"
          :complete="state > states.adjusting"
          :color="colors.oliveHaze"
        >
          Convert
        </VStepperStep>
        <VStepperStep
          v-if="isMosaic"
          :editable="state > states.saving"
          :step="3"
          :complete="state > states.saving"
          :color="colors.oliveHaze"
        >
          Save
        </VStepperStep>
      </VStepperHeader>
    </VStepper>
  </VCard>
</template>

<script>
import {
  VCard,
  VCardTitle,
  VBtn,
  VStepper,
  VStepperHeader,
  VStepperStep,
  VStepperItems,
  VStepperContent,
} from "vuetify/lib";
import CancelButton from "@/components/modals/CancelButton.vue";
import DrawingTool from "@/libs/DrawingTool";

import CroppingStage from "./Stages/Cropping.vue";
import AdjustingStage from "./Stages/Adjusting.vue";
import SavingStage from "./Stages/Saving.vue";

import { debounce } from "lodash";
import { ImageSmoothingQuality, canvasIsTransparent } from "@/libs/canvasHelpers";
import {
  selectMedianCutPaletteFromImgData,
  convertCanvas,
  drawingToolGridToImage,
} from "@/libs/converter";

import colors from "./../../../styles/colors.scss";

// FINITE STATE MACHINE PATTERN
// ENUM STATES
const states = Object.freeze({
  cropping: 1,
  adjusting: 2,
  saving: 3, // avail only on non 1x1 patterns
});

export default {
  name: "ImageLoader",
  components: {
    VCard,
    VCardTitle,
    VBtn,
    VStepper,
    VStepperHeader,
    VStepperStep,
    VStepperItems,
    VStepperContent,
    CancelButton,
    CroppingStage,
    AdjustingStage,
    SavingStage,
  },
  data: function () {
    return {
      colors,
      states,
      state: states.cropping,
      dataURL: null,
      filename: null,
      rows: 1,
      columns: 1,
      transparency: 100, // range: [0, 100]
      saturation: 100, // range: [0, 200] 100 = no change
      paletteSelector: selectMedianCutPaletteFromImgData,
      imageSmoothingQuality: ImageSmoothingQuality.sharp,
      isSplitPalette: true,
      croppedCanvas: null,
      previewDataURL: null,
      outputs: [],
    };
  },
  computed: {
    isMosaic() { return this.rows > 1 || this.columns > 1; },
    alphaThreshold() { return this.transparency * 2.55; },
    croppedIsTransparent()  { return canvasIsTransparent(this.croppedCanvas); },
  },
  props: {
    sourcetool: {
      type: DrawingTool,
      required: true,
      default: () => new DrawingTool(),
    }
  },
  methods: {
    toCropping(forward = true) {
      this.state = states.cropping;
    },
    // state swapping (forward only)
    toAdjusting(croppedCanvas, forward = true) {
      if (croppedCanvas == null) return;
      if (this.dataURL == null) return;
      this.state = states.adjusting;
      if (!forward) return;
      this.croppedCanvas = croppedCanvas;
      this.updatePreviewDataURL();
    },
    toSaving() {
      if (!this.isMosaic) {
        this.$emit("load", this.outputs[0]);
        this.$emit("close");
        this.state = states.cropping;
      }
      this.state = states.saving;
    },
    prev() {
      if (this.state < 0) this.state = 0;
      else this.state = this.state - 1;
    },
    updatePreviewDataURL: debounce(function() {
      const drawingToolGrid = convertCanvas(
        this.croppedCanvas,
        this.sourcetool,
        this.rows,
        this.columns,
        this.alphaThreshold,
        this.saturation,
        this.imageSmoothingQuality,
        this.isSplitPalette,
        this.paletteSelector,
      );
      const preview = drawingToolGridToImage(drawingToolGrid);
      this.previewDataURL = preview.toDataURL("image/png");
      this.outputs = drawingToolGrid.flat(1);
    }, 150),
  },
  watch: {
    saturation() {
      this.updatePreviewDataURL();
    },
    alphaThreshold() {
      this.updatePreviewDataURL();
    },
    imageSmoothingQuality() {
      this.updatePreviewDataURL();
    },
    isSplitPalette() {
      this.updatePreviewDataURL();
    },
    paletteSelector() {
      this.updatePreviewDataURL();
    },
  },
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/overrides" as overrides;

.card { background-color: colors.$ecru-white; }

.title {
  color: colors.$jambalaya;
  font-family: Nunito !important;
}

.stepper {
  background-color: colors.$ecru-white;
  @include overrides.v-stepper-step(colors.$olive-haze);
}

.stepper-content {
  overflow: scroll;
  &.internal-padding {
    padding: 0;
  }
  &::v-deep {
    .v-stepper__wrapper {
      overflow: visible;
    }
  }
}
</style>
