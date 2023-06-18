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
            :columns="columns"
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

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
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
  PaletteSelector,
  selectMedianCutPaletteFromImgData,
  convertCanvas,
  drawingToolGridToImage,
} from "@/libs/converter";

import colors from "@/styles/colors.scss";

// FINITE STATE MACHINE PATTERN
// ENUM STATES
const states = Object.freeze({
  uploading: 1,
  cropping: 2,
  adjusting: 3,
  saving: 4, // avail only on non 1x1 patterns
});

@Component({
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
})
export default class ConvertImage extends Vue{
  @Prop({
    type: DrawingTool,
    default: () => new DrawingTool(),
  }) readonly sourcetool!: DrawingTool;
  
  readonly colors = colors;
  readonly states = states;
  state = states.uploading;
  dataURL: string | null = null;
  filename: string | null = null;
  rows: number = 1;
  columns: number = 1;
  
  /**
   * Transparency threshold of hte image on a a range of [0, 100].
   */
  transparency: number = 100;
  
  /**
   * Saturation of the image on a range of [0, 200]. 100 = no change.
   */
  saturation: number = 100;
  
  /**
   * The palette selection method to use when choosing colors from the image.
   */
  paletteSelector: PaletteSelector = selectMedianCutPaletteFromImgData;
  
  /**
   * The browser image smoothing technique when redrawing images internally.
   */
  imageSmoothingQuality: ImageSmoothingQuality = ImageSmoothingQuality.sharp;
  
  /**
   * Whether or not each generated pattern's palette is independent of the others.
   */
  isSplitPalette: boolean = true;
  
  /**
   * The cropped canvas generated by the cropper.
   */
  croppedCanvas: HTMLCanvasElement | null = null;
  
  /**
   * The final preview data URL.
   */
  previewDataURL: string | null = null;
  
  /**
   * The generated drawing tools.
   */
  outputs: DrawingTool[] = [];

  /**
   * Whether or not the generated will be a mosaic or a single pattern.
   */
  get isMosaic(): boolean { return this.rows > 1 || this.columns > 1; }

  /**
   * The equivalent alpha value for the transparency.
   */
  get alphaThreshold(): number { return this.transparency * 2.55; }

  /**
   * Whether or not the cropped canvas from the copper includes transparency in the image.
   */
  get croppedIsTransparent(): boolean { return canvasIsTransparent(this.croppedCanvas as HTMLCanvasElement); }
  
  
  // state swapping (forward only)
  croppingToAdjusting(croppedCanvas: typeof this.croppedCanvas): void {
    if (croppedCanvas == null)
      return;
    this.state = states.adjusting;
    this.croppedCanvas = croppedCanvas;
    this.updatePreviewDataURL();
  }
  
  updatePreviewDataURL = debounce(function(this: ConvertImage): void {
    const drawingToolGrid = convertCanvas(
      this.croppedCanvas as HTMLCanvasElement,
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
        drawingTool.title = this.filename as string;
    const preview = drawingToolGridToImage(drawingToolGrid);
    this.previewDataURL = preview.toDataURL("image/png");
    this.outputs = drawingToolGrid.flat(1);
  }, 150);
  
  @Watch('saturation')
  @Watch('alphaThreshold')
  @Watch('imageSmoothingQuality')
  @Watch('isSplitPalette')
  @Watch('paletteSelector')
  onConvertOptionsChanged(): void {
    this.updatePreviewDataURL();
  }
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
