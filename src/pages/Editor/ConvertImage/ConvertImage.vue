<template>
  <VCard elevation="0" class="card rounded-xl">
    <VCardTitle class="title">Convert Image</VCardTitle>
    <CancelButton @click="$emit('close')" />
    <VStepper class="stepper rounded-xl" v-model="state" elevation="0">
      <VStepperItems>
        <VStepperContent
          class="stepper-content"
          :step="states.uploading"
        >
          <UploadingStage
            v-if="state === states.uploading"
            @update:dataURL="dataURL = $event"
            @update:filename="filename = $event"
            @next="state = states.cropping"
          />
        </VStepperContent>
        <VStepperContent
          class="stepper-content internal-padding"
          :step="states.cropping"
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
            @next="croppingToAdjusting"
          />
        </VStepperContent>
        <VStepperContent
          class="stepper-content internal-padding"
          :step="states.adjusting"
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
            @prev="state = states.cropping"
            @next="state = states.saving"
          />
        </VStepperContent>
        <VStepperContent
          class="stepper-content internal-padding"
          :step="states.saving"
        >
          <SavingStage
            v-if="state === states.saving"
            :previewDataURL="previewDataURL"
            :outputs="outputs"
            @load="$emit('load', $event)"
          />
        </VStepperContent>
      </VStepperItems>

      <VStepperHeader class="stepper-header">
        <VStepperStep
          :editable="state > states.uploading"
          :step="states.uploading"
          :complete="state > states.uploading"
          :color="colors.oliveHaze"
        >
          Upload
        </VStepperStep>
        <VStepperStep
          :editable="state > states.cropping"
          :step="states.cropping"
          :complete="state > states.cropping"
          :color="colors.oliveHaze"
        >
          Crop
        </VStepperStep>
        <VStepperStep
          :editable="state > states.adjusting"
          :step="states.adjusting"
          :complete="state > states.adjusting"
          :color="colors.oliveHaze"
        >
          Convert
        </VStepperStep>
        <VStepperStep
          :editable="state > states.saving"
          :step="states.saving"
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

import UploadingStage from "./Stages/Uploading.vue";
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
  uploading: 1,
  cropping: 2,
  adjusting: 3,
  saving: 4, // avail only on non 1x1 patterns
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
    UploadingStage,
    CroppingStage,
    AdjustingStage,
    SavingStage,
  },
  data: function () {
    return {
      colors,
      states,
      state: states.uploading,
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
    // state swapping (forward only)
    croppingToAdjusting(croppedCanvas) {
      if (croppedCanvas == null)
        return;
      this.state = states.adjusting;
      this.croppedCanvas = croppedCanvas;
      this.updatePreviewDataURL();
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
      for (const drawingToolGridRow of drawingToolGrid)
        for (const drawingTool of drawingToolGridRow)
          drawingTool.title = this.filename;
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
  border-radius: 0px !important;
  background-color: colors.$ecru-white;
  @include overrides.v-stepper-step(colors.$olive-haze);
}

.stepper-content {
  // overflow-y: scroll;
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
