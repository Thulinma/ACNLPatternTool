<template>
  <div class="acnh-sliders">
    <section class="sliders--slider-section">
      <label class="sliders--slider-label">
        Hue
        <div class="slider--label-slot">
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (hue - 1 >= 0) hue--;
                setSliderColors();
              }
            "
          >
            <IconLeftArrow class="arrow" />
          </button>
          <div class="slider--label-slot-number">{{ hue + 1 }}</div>
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (hue + 1 < hues) hue++;
                setSliderColors();
              }
            "
          >
            <IconRightArrow class="arrow" />
          </button>
        </div>
      </label>
      <div class="sliders--slider-container"
        :style="hueGradient"
      >
        <VSlider
          class="slider"
          :style="{ 'padding': `0 ${100 / hues / 2}%` }"
          :min="0"
          :max="hues - 1"
          v-model.number="hue"
          :color="colors.oliveHaze"
          :track-color="colors.oliveHaze"
          ticks="always"
          thumb-label
          :thumb-color="colors.jambalaya"
          hide-details
          dense
        >
          <template v-slot:thumb-label>
            {{ hue + 1 }}
          </template>
        </VSlider>
      </div>
    </section>
    <!-- hue -->

    <section class="sliders--slider-section">
      <label class="sliders--slider-label">
        Vividness
        <div class="slider--label-slot">
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (vividness - 1 >= 0) vividness--;
                setSliderColors();
              }
            "
          >
            <IconLeftArrow class="arrow" />
          </button>
          <div class="slider--label-slot-number">
            {{ vividness + 1 }}
          </div>
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (vividness + 1 < vividnesses) vividness++;
                setSliderColors();
              }
            "
          >
            <IconRightArrow class="arrow" />
          </button>
        </div>
      </label>
      <div class="sliders--slider-container"
        :style="vividnessGradient"
      >
        <VSlider
          class="slider"
          :style="{ 'padding': `0 ${100 / vividnesses / 2}%` }"
          :min="0"
          :max="vividnesses - 1"
          v-model.number="vividness"
          :color="colors.oliveHaze"
          :track-color="colors.oliveHaze"
          ticks="always"
          thumb-label
          :thumb-color="colors.jambalaya"
          hide-details
          dense
        >
          <template v-slot:thumb-label>
            {{ vividness + 1 }}
          </template>
        </VSlider>
      </div>
    </section>
    <!-- vividness -->

    <section class="sliders--slider-section">
      <label class="sliders--slider-label">
        Brightness
        <div class="slider--label-slot">
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (brightness - 1 >= 0) brightness--;
                setSliderColors();
              }
            "
          >
            <IconLeftArrow class="arrow" />
          </button>
          <div class="slider--label-slot-number">
            {{ brightness + 1 }}
          </div>
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (brightness + 1 < brightnesses) brightness++;
                setSliderColors();
              }
            "
          >
            <IconRightArrow class="arrow" />
          </button>
        </div>
      </label>
      <div class="sliders--slider-container"
        :style="brightnessGradient"
      >
        <VSlider
          class="slider"
          :style="{ 'padding': `0 ${100 / brightnesses / 2}%` }"
          :min="0"
          :max="brightnesses - 1"
          v-model.number="brightness"
          :color="colors.oliveHaze"
          :track-color="colors.oliveHaze"
          ticks="always"
          thumb-label
          :thumb-color="colors.jambalaya"
          hide-details
          dense
        >
          <template v-slot:thumb-label>
            {{ brightness + 1 }}
          </template>
        </VSlider>
      </div>
    </section>
    <!-- brightness -->
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { VSlider } from "vuetify/lib";
import ACNHFormat from "@/libs/ACNHFormat";

import IconLeftArrow from "@/assets/icons/bxs-left-arrow.svg?inline";
import IconRightArrow from "@/assets/icons/bxs-right-arrow.svg?inline";

import colors from "@/styles/colors.scss";
import DrawingTool from "@/libs/DrawingTool";

const hues = 30;
const vividnesses = 15;
const brightnesses = 15;

@Component({
  components: {
    VSlider,
    IconLeftArrow,
    IconRightArrow,
  },
})
export default class ACNHColorPicker extends Vue {
  @Prop({
    type: DrawingTool,
    required: true,
  }) drawingTool!: DrawingTool;
  
  readonly hues = hues;
  readonly vividnesses = vividnesses;
  readonly brightnesses = brightnesses;
  readonly colors = colors;
  
  hueSliderColors: string[] = [];
  vividnessSliderColors: string[] = [];
  brightnessSliderColors: string[] = [];
  
  hue: number = 0;
  vividness: number = 0;
  brightness: number = 0;
  
  hueGradient = { background: "" };
  vividnessGradient = { background: "" };
  brightnessGradient = { background: "" };
  
  currentColor: string = "";
  
  acnh = this.drawingTool.compatMode === "ACNH";
  
  setSliderColors(): void {
    // color of draw tool will be in HSV format
    // increments based on slots in sliders in ACNH
    // H = hue 1 - 30
    // S = vividness 1 - 15
    // V = brightness 1 - 15

    // hue
    let hueSlider = [];
    for (let i = 0; i < hues; i++) {
      hueSlider.push(
        ACNHFormat.slidersToColor(i, this.vividness, this.brightness)
      );
    }
    this.hueSliderColors = [...hueSlider];

    // vividness & brightness
    let vividnessSlider = [];
    for (let i = 0; i < vividnesses; i++) {
      vividnessSlider.push(
        ACNHFormat.slidersToColor(this.hue, i, this.brightness)
      );
    }
    
    let brightnessSlider = [];
    for (let i = 0; i < brightnesses; i++) {
      brightnessSlider.push(
        ACNHFormat.slidersToColor(this.hue, this.vividness, i)
      );
    }
    
    this.vividnessSliderColors = [...vividnessSlider];
    this.brightnessSliderColors = [...brightnessSlider];
    
    const hueStops = this.hueSliderColors.map((color, i) => {
      if (i === 0)
        return `${color} ${i * 100/hueSlider.length}%`;
      return `${color} ${i * 100/hueSlider.length}% ${(i + 1) * 100/hueSlider.length}%`;
    });
    
    const vividnessStops = this.vividnessSliderColors.map((color, i) => {
      if (i === 0)
        return `${color} ${(i + 1) * 100/vividnessSlider.length}%`;
      return `${color} ${i * 100/vividnessSlider.length}% ${(i + 1) * 100/vividnessSlider.length}%`;
    });
    
    const brightnessStops = this.brightnessSliderColors.map((color, i) => {
      if (i === 0)
        return `${color} ${(i + 1) * 100/brightnessSlider.length}%`;
      return `${color} ${i * 100/brightnessSlider.length}% ${(i + 1) * 100/brightnessSlider.length}%`;
    });
    
    this.hueGradient.background =
      `linear-gradient(to right, ${hueStops.join(",")})`;
    this.vividnessGradient.background =
      `linear-gradient(to right, ${vividnessStops.join(",")})`;
    this.brightnessGradient.background =
      `linear-gradient(to right, ${brightnessStops.join(",")})`;
    if (
      this.currentColor !==
      ACNHFormat.slidersToColor(this.hue, this.vividness, this.brightness)
    ) {
      this.currentColor = ACNHFormat.slidersToColor(
        this.hue,
        this.vividness,
        this.brightness
      );
      this.$emit(
        "color-picked",
        ACNHFormat.slidersToColor(this.hue, this.vividness, this.brightness)
      );
    }
  }
  
  setSliderPosition(currentColor: string): void {
    // when user switches between colors on the palettes,
    // we need to display the correct colors on the sliders
    // as well as have the sliders in the right positions

    // set selected drawing color
    // todo: need to call this from editor at same time as onChangedCurrentColor
    let rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(currentColor);
    if (!rgb) { return; }

    const parsedRgb = {
      r: parseInt(rgb[1], 16),
      g: parseInt(rgb[2], 16),
      b: parseInt(rgb[3], 16),
    };

    const sliderPositions = ACNHFormat.colorToSliders(parsedRgb.r, parsedRgb.g, parsedRgb.b);
    this.hue = sliderPositions[0];
    this.vividness = sliderPositions[1];
    this.brightness = sliderPositions[2];
  }
  
  mounted() {
    this.setSliderPosition(this.drawingTool.color);
    this.setSliderColors();
    this.drawingTool.onColorChange(() => {
      this.setSliderPosition(this.drawingTool.color);
      this.setSliderColors();
    });
  }
  
  
    @Watch('hue')
    onHueChanged() { this.setSliderColors(); }
    
    @Watch('vividness')
    onVividnessChanged() { this.setSliderColors(); }
    
    @Watch('brightness')
    onBrightnessChanged() { this.setSliderColors(); }
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;

.acnh-sliders {
  padding: 10px 20px 15px;
  width: 100%;
  user-select: none;
  margin: auto;
}

.sliders--slider-container {
  width: 100%;
  margin: 10px 0;
  border-radius: 10px;
}

.sliders--slider-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .slider--label-slot {
    display: inline-flex;
    align-items: center;
  }
}

.slider--label-slot-button {
  display: flex;
  align-items: center;
  justify-content: center;

  appearance: none;
  outline: none;
  padding: 0px;
  border: 0px;
  border-radius: 5px;
  background: none;
  background-color: colors.$salmon;
  cursor: pointer;
  margin: 0 5px;
  padding: 5px;
}

.slider--label-slot-number {
  width: 20px;
  text-align: center;
}

.slider ::v-deep .v-slider{
  margin: 0;
}

.arrow {
  fill: white;
  width: 16px;
}
</style>