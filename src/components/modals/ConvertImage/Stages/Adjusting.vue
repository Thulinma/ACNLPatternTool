<template>
  <div class="container">
    <div class="left-side">
      <div class="preview-container">
        <img class="preview" :src="previewDataURL" />
      </div>
      <button class="crop-button" @click="$emit('prev', {})">Edit Crop</button>
      <button class="convert-button" @click="$emit('next', {})">Convert</button>
    </div>

    <div class="right-side">
      <div class="slider-option">
        <div class="slider-option-title">Transparency Retention</div>
        <div class="slider-option-indicator"></div>
        <input
          type="range"
          min="0"
          max="100"
          :value="transparency"
          @change="$emit('update:transparency', Number($event.target.value))"
        />
      </div>

      <div class="slider-option">
        <div class="slider-option-title">Saturation</div>

        <div class="slider-option-indicator"></div>
        <input
          type="range"
          min="0"
          max="100"
          :value="saturation"
          @change="$emit('update:saturation', Number($event.target.value))"
        />

        <div class="checkbox-option" :class="{ active: applySaturation }">
          <input
            type="checkbox"
            id="saturation-effect"
            name="saturation-effect"
            :checked="applySaturation"
            :value="applySaturation"
            @change="$emit('update:applySaturation', Boolean($event.target.checked))"
          />
          <label class="checkbox-option-title" for="saturation-effect">Apply Saturation Effect</label>
        </div>
      </div>

      <div class="radio-options">
        <div class="radio-options-title">Conversion Method</div>
        <label
          v-for="option in conversionQualityOptions"
          :key="option.conversionQuality"
          :class="{
          'radio-option': true,
          'active': option.conversionQuality === conversionQuality
        }"
        >
          <span class="radio-option-indicator"></span>
          <span>{{ option.name }}</span>
          <input
            v-show="false"
            name="conversionQuality"
            type="radio"
            :checked="option.conversionQuality === conversionQuality"
            :value="option.conversionQuality"
            @change="$emit('update:conversionQuality', option.conversionQuality)"
          />
        </label>
      </div>

      <!-- palette option -->
      <div class="radio-options" v-if="isMural">
        <div class="radio-options-title">Palette Between Patterns</div>
        <label
          v-for="(option, index) in isSplitPaletteOptions"
          :key="index"
          :class="{
          'radio-option': true,
          'active': option.isSplitPalette === isSplitPalette
        }"
        >
          <span class="radio-option-indicator"></span>
          <span>{{ option.name }}</span>
          <input
            v-show="false"
            name="paletteSelectionMethod"
            type="radio"
            :checked="option.isSplitPalette === isSplitPalette"
            :value="option.isSplitPalette"
            @change="$emit('update:isSplitPalette', option.isSplitPalette)"
          />
        </label>
      </div>

      <div class="radio-options">
        <div class="radio-options-title">Palette Selection Method</div>
        <label
          v-for="option in paletteSelectionMethodOptions"
          :key="option.paletteSelectionMethod"
          :class="{
          'radio-option': true,
          'active': option.paletteSelectionMethod === paletteSelectionMethod
        }"
        >
          <span class="radio-option-indicator"></span>
          <span>{{ option.name }}</span>
          <input
            v-show="false"
            name="paletteSelectionMethod"
            type="radio"
            :checked="option.paletteSelectionMethod === paletteSelectionMethod"
            :value="option.paletteSelectionMethod"
            @change="$emit('update:paletteSelectionMethod', option.paletteSelectionMethod)"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { paletteSelectionMethods, conversionQualities } from "./enums";

const paletteSelectionMethodOptions = [
  {
    name: "RGB Colors",
    paletteSelectionMethod: paletteSelectionMethods.rgb,
  },
  {
    name: "YUV Colors",
    paletteSelectionMethod: paletteSelectionMethods.yuv,
  },
  {
    name: "Median Cut",
    paletteSelectionMethod: paletteSelectionMethods.medianCut,
  },
  {
    name: "Greyscale",
    paletteSelectionMethod: paletteSelectionMethods.greyscale,
  },
  {
    name: "Sepia",
    paletteSelectionMethod: paletteSelectionMethods.sepia,
  },
];

const conversionQualityOptions = [
  {
    name: "High Quality",
    conversionQuality: conversionQualities.high,
  },
  {
    name: "Medium Quality",
    conversionQuality: conversionQualities.medium,
  },
  {
    name: "Low Quality",
    conversionQuality: conversionQualities.low,
  },
  {
    name: "Sharpened",
    conversionQuality: conversionQualities.sharp,
  },
];

const isSplitPaletteOptions = [
  {
    name: "Split Palette",
    isSplitPalette: true,
  },
  {
    name: "Shared Palette",
    isSplitPalette: false,
  },
];

export default {
  name: "Adjusting",
  props: {
    isMural: {
      type: Boolean,
      required: true,
    },
    transparency: {
      type: Number,
      required: true,
    },
    saturation: {
      type: Number,
      required: true,
    },
    applySaturation: {
      type: Boolean,
      required: true,
    },
    conversionQuality: {
      type: Number,
      required: true,
    },
    isSplitPalette: {
      type: Boolean,
      required: true,
    },
    paletteSelectionMethod: {
      type: Number,
      required: true,
    },
    previewDataURL: {
      type: String,
      required: false,
    },
  },
  components: {},
  data: function () {
    return {
      conversionQualityOptions,
      isSplitPaletteOptions,
      paletteSelectionMethodOptions,
    };
  },
};
</script>


<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/resets";
@import "styles/screens";

@import "./shared";

.left-side {
  grid-template-areas:
    "preview preview"
    "crop convert";
}

.crop-button {
  grid-area: crop;
}
.convert-button {
  grid-area: convert;
}

.crop-button,
.convert-button {
  cursor: pointer;
  @include reset-button;

  padding: 8px 30px;

  border-radius: 8px;
  color: $white;
  background-color: $robin-egg-blue;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;

  @include phone-landscape {
    padding: 10px 45px;
  }
}
</style>