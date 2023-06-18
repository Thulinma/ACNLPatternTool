<template>
  <div class="stage">
    <div class="left-side">
      <div class="preview-container">
        <img class="preview" :src="previewDataURL" />
      </div>

      <VBtn
        class="crop-btn rounded-lg"
        elevation="0"
        @click="$emit('prev', {})"
      >
        Edit Crop
      </VBtn>
      <VBtn
        class="convert-btn rounded-lg"
        elevation="0"
        @click="$emit('next', {})"
      >
        Convert
      </VBtn>
    </div>

    <div class="right-side">
      <div v-if="croppedIsTransparent">
        <div class="text-h6">Transparency Retention</div>
        <VSlider
          class="slider"
          :min="0"
          :max="100"
          :value="transparency"
          @input="$emit('update:transparency', Number($event))"
          :color="colors.oliveHaze"
          :track-color="colors.oliveHaze"
          thumb-label
          :thumb-color="colors.jambalaya"
          hide-details
          dense
        />
      </div>
      <div>
        <div class="text-h6">Saturation</div>
        <VSlider
          class="slider"
          :min="0"
          :max="200"
          :value="saturation"
          @input="$emit('update:saturation', $event)"
          :color="colors.oliveHaze"
          :track-color="colors.oliveHaze"
          thumb-label
          :thumb-color="colors.jambalaya"
          hide-details
          dense
        />
      </div>

      <div>
        <div class="text-h6">Image Smoothing</div>
        <VRadioGroup
          :value="imageSmoothingQuality"
          @change="$emit('update:imageSmoothingQuality', $event)"
        >
          <VRadio
            v-for="option in imageSmoothingQualityOptions"
            :key="option.text"
            :label="option.text"
            :value="option.value"
            :color="colors.jambalaya"
          />
        </VRadioGroup>
      </div>

      <div v-if="isMosaic">
        <div class="text-h6">Palette Between Patterns</div>
        <VRadioGroup
          :value="isSplitPalette"
          @change="$emit('update:isSplitPalette', $event)"
        >
          <VRadio
            v-for="option in isSplitPaletteOptions"
            :key="option.text"
            :label="option.text"
            :value="option.value"
            :color="colors.jambalaya"
          />
        </VRadioGroup>
      </div>

      <div>
        <div class="text-h6">Palette Selection</div>
        <VRadioGroup
          :value="paletteSelector"
          :value-comparator="(a, b) => a === b"
          @change="$emit('update:paletteSelector', $event)"
        >
          <VRadio
            v-for="option in paletteSelectorOptions"
            :key="option.text"
            :label="option.text"
            :value="option.value"
            :color="colors.jambalaya"
          />
        </VRadioGroup>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { VBtn, VCheckbox, VRadio, VRadioGroup, VSlider } from "vuetify/lib";
import { ImageSmoothingQuality } from "@/libs/canvasHelpers";
import {
  PaletteSelector,
  selectRGBPaletteFromImgData,
  selectYUVPaletteFromImgData,
  selectMedianCutPaletteFromImgData,
  selectGreyscalePaletteFromImgData,
  selectSepiaPalettefromImgData,
  selectLowestDistancePalette,
} from "@/libs/converter";
import { Option } from "@/libs/component-helpers";


import colors from "@/styles/colors.scss";

const paletteSelectorOptions: Option<PaletteSelector>[] = [
  {
    text: "RGB Colors",
    value: selectRGBPaletteFromImgData,
  },
  {
    text: "YUV Colors",
    value: selectYUVPaletteFromImgData,
  },
  {
    text: "Median Cut",
    value: selectMedianCutPaletteFromImgData,
  },
  {
    text: "Greyscale",
    value: selectGreyscalePaletteFromImgData,
  },
  {
    text: "Sepia",
    value: selectSepiaPalettefromImgData,
  },
];

const imageSmoothingQualityOptions: Option<ImageSmoothingQuality>[] = [
  {
    text: "Sharpened",
    value: ImageSmoothingQuality.sharp,
  },
  {
    text: "Low Quality",
    value: ImageSmoothingQuality.low,
  },
  {
    text: "Medium Quality",
    value: ImageSmoothingQuality.medium,
  },
  {
    text: "High Quality",
    value: ImageSmoothingQuality.high,
  },
];

const isSplitPaletteOptions: Option<boolean>[] = [
  {
    text: "Split Palette",
    value: true,
  },
  {
    text: "Shared Palette",
    value: false,
  },
];

@Component({
  components: {
    VBtn,
    VCheckbox,
    VRadio,
    VRadioGroup,
    VSlider,
  },
})
export default class AdjustingStage extends Vue {
  @Prop({
    type: Boolean,
    required: true,
  }) readonly isMosaic!: boolean;
  
  @Prop({
    type: Boolean,
    required: true,
  }) readonly croppedIsTransparent!: boolean;
  
  @Prop({
    type: Number,
    required: true,
  }) readonly transparency!: number;
  
  @Prop({
    type: Number,
    required: true,
  }) readonly saturation!: number;
  
  @Prop({
    type: String,
    required: true,
  }) readonly imageSmoothingQuality!: string;
  
  @Prop({
    type: Boolean,
    required: true,
  }) readonly isSplitPalette!: boolean;
  
  @Prop({
    type: Function,
    required: true,
  }) readonly paletteSelector!: PaletteSelector;
  
  @Prop({
    type: String,
    required: false,
  }) readonly previewDataURL!: string
  
  readonly colors = colors;
  readonly imageSmoothingQualityOptions = imageSmoothingQualityOptions;
  readonly isSplitPaletteOptions = isSplitPaletteOptions;
  readonly paletteSelectorOptions = paletteSelectorOptions;
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
  padding: 24px 24px 0px 24px;

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

.left-side {
  grid-template-areas:
    "preview preview"
    "crop convert";
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

.crop-btn {
  grid-area: crop;
  padding: 0px 20px !important;
  @include overrides.v-btn(colors.$ecru-white, colors.$olive-haze);
  &:hover {
    @include colors.polkadots(
      colors.$olive-haze,
      colors.$donkey-brown
    );
    @include colors.moving-polkadots;
  }
}

.convert-btn {
  grid-area: convert;
  padding: 0px 20px !important;
  @include overrides.v-btn(colors.$white, colors.$robin-egg-blue);
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

.right-side {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: stretch;
  justify-items: stretch;
  row-gap: 15px;

  padding-bottom: 30px;
}

.slider-title,
.text-h6 {
  color: colors.$jambalaya;
}
</style>