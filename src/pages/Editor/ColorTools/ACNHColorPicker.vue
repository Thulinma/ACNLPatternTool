<template>
  <div id="acnh-sliders">
    <section>
      <label>
        Hue
        <div v-if="mode" class="slider-slot-label">
          <button @click="() => {if (hue > 0) hue--; setSliderColors()}">
            <IconLeftArrow class="slider-slot-label-arrow"/>
          </button>
            {{ parseInt(hue) + 1 }}
          <button @click="() => {if (hue < 29) hue++; setSliderColors()}">
            <IconRightArrow class="slider-slot-label-arrow"/>
          </button>
        </div>
      </label>
      <div class="slider-container">
        <input type="range" id="hue" min="0" max="29"
          v-model="hue"
          :style="hueGradient"
          @change="setSliderColors"
          />
      </div>
    </section><!-- hue -->

    <section>
      <label>
        Vividness
        <div v-if="mode" class="slider-slot-label">
          <button @click="() => {if (vividness > 0) vividness--; setSliderColors()}">
            <IconLeftArrow class="slider-slot-label-arrow"/>
          </button>
            {{ parseInt(vividness) + 1 }}
          <button @click="() => {if (vividness < 14) vividness++; setSliderColors()}">
            <IconRightArrow class="slider-slot-label-arrow"/>
          </button>
        </div>
      </label>
      <div class="slider-container">
        <input type="range" id="vividness" min="0" max="14"
          v-model="vividness"
          :style="vividnessGradient"
          @change="setSliderColors"
          />
      </div>
    </section><!-- vividness -->

    <section>
      <label>
        Brightness
        <div v-if="mode" class="slider-slot-label">
          <button @click="() => {if (brightness > 0) brightness--; setSliderColors()}">
            <IconLeftArrow class="slider-slot-label-arrow"/>
          </button>
            {{ parseInt(brightness) + 1 }}
          <button @click="() => {if (brightness < 14) brightness++; setSliderColors()}">
            <IconRightArrow class="slider-slot-label-arrow"/>
          </button>
        </div>
      </label>
      <div class="slider-container">
        <input type="range" id="brightness" min="0" max="14"
          v-model="brightness"
          :style="brightnessGradient"
          @change="setSliderColors"
          />
      </div>
    </section><!-- brightness -->
  </div>
</template>

<script>
import colorMaker from "/libs/ACNHFormat";

import IconLeftArrow from "~/components/icons/IconLeftArrow.vue";
import IconRightArrow from "~/components/icons/IconRightArrow.vue";

export default {
  name: "ACNHColorPicker",
  components: {
    IconLeftArrow,
    IconRightArrow
  },
  props: {
    drawingTool: Object,
  },
  data: function() {
    return {
      hue: 0,
      vividness: 0,
      brightness: 0,
      hueSliderColors: [],
      vividnessSliderColors: [],
      brightnessSliderColors: [],
      hueGradient: {
        background: '',
      },
      vividnessGradient: {
        background: '',
      },
      brightnessGradient: {
        background: '',
      },
      currentColor: 0,
      mode: this.drawingTool.compatMode === 'ACNH'
    }
  },
  methods: {
    setSliderColors: function() {
      // color of draw tool will be in HSV format
      // increments based on slots in sliders in ACNH
      // H = hue 1 - 30
      // S = vividness 1 - 16
      // V = brightness 1 - 16

      // hue
      let hueSlider = [];
      for (let i = 0; i <= 29; i++) {
        hueSlider.push(colorMaker.slidersToColor(i, this.vividness, this.brightness));
      }
      this.hueSliderColors = [...hueSlider];

      // vividness & brightness
      let vividnessSlider = [];
      let brightnessSlider = [];
      for (let i = 0; i <= 14; i++) {
        vividnessSlider.push(colorMaker.slidersToColor(this.hue, i, this.brightness));
        brightnessSlider.push(colorMaker.slidersToColor(this.hue, this.vividness, i));
      }
      this.vividnessSliderColors = [...vividnessSlider];
      this.brightnessSliderColors = [...brightnessSlider];

      this.hueGradient.background = 'linear-gradient(to right, ' + [...this.hueSliderColors].join() + ')';
      this.vividnessGradient.background = 'linear-gradient(to right, ' + [...this.vividnessSliderColors].join() + ')';
      this.brightnessGradient.background = 'linear-gradient(to right, ' + [...this.brightnessSliderColors].join() + ')';

      if (this.currentColor !== colorMaker.slidersToColor(this.hue, this.vividness, this.brightness)) {
        this.currentColor = colorMaker.slidersToColor(this.hue, this.vividness, this.brightness);
        this.$emit('color-picked', colorMaker.slidersToColor(this.hue, this.vividness, this.brightness));
      }
    },
    setSliderPosition: function(currentColor) {
      // when user switches between colors on the palettes,
      // we need to display the correct colors on the sliders
      // as well as have the sliders in the right positions

      // set selected drawing color
      // todo: need to call this from editor at same time as onChangedCurrentColor
      let rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(currentColor);
      if (!rgb){return;}

      rgb = {
        r: parseInt(rgb[1], 16),
        g: parseInt(rgb[2], 16),
        b: parseInt(rgb[3], 16)
      };

      const sliderPositions = colorMaker.colorToSliders(rgb.r, rgb.g, rgb.b);

      this.hue = sliderPositions[0];
      this.vividness = sliderPositions[1];
      this.brightness = sliderPositions[2];
    },
  },
  mounted: function() {
    this.setSliderPosition(this.drawingTool.color);
    this.setSliderColors();
    this.drawingTool.onColorChange(() => {
      this.setSliderPosition(this.drawingTool.color);
      this.setSliderColors();
    });
  }
}
</script>

<style lang="scss" scoped>
  #acnh-sliders {
    padding: 10px 20px 15px;
    width: 470px;
    user-select: none;
    margin: auto;
  }
 .slider-container {
   width: 100%;
   padding: 10px 0;
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 15px;
    border-radius: 15px;

    &:focus {
      outline: none;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      border: none;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      background: rgba(255,255,255,0.8);
      margin-top: -4px;
    }
  }
 }
 label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
 }
 button {
  appearance: none;
  outline: none;
  padding: 0px;
  border: 0px;

  background: none;

  cursor: pointer;
 }
</style>