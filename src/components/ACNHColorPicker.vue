<template>
  <div>
    <section>
      <label>Hue</label>
      <div class="slider-container">
        <input type="range" id="hue" min="0" max="30" ref="hue"
          :style="hueGradient"
          @change="setSliderColors"> 
      </div>
    </section><!-- hue -->

    <section>
      <label>Vividness</label>
      <div class="slider-container">
        <input type="range" id="vividness" min="0" max="15" ref="vividness"
          :style="vividnessGradient"
          @change="setSliderColors">
      </div>
    </section><!-- vividness -->

    <section>
      <label>Brightness</label>
      <div class="slider-container">
        <input type="range" id="brightness" min="0" max="15" ref="brightness"
          :style="brightnessGradient"
          @change="setSliderColors">
      </div>
    </section><!-- brightness -->
  </div>
</template>

<script>
import ACNHFormat from "/libs/ACNHFormat";
import DrawingTool from "/libs/DrawingTool";

export default {
  name: "ACNHColorPicker",
  props: {
    drawingTool: DrawingTool,
  },
  data: function() {
    return {
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
    }
  },
  methods: {
    setSliderColors: function() {
      // color of draw tool will be in HSV format
      // increments based on slots in sliders in ACNH
      // H = hue 1 - 30 
      // S = vividness 1 - 15 
      // V = brightness 1 - 15 
      console.log('setSliderColors')

      const hue = this.$refs.hue.value;
      const vividness = this.$refs.vividness.value;
      const brightness = this.$refs.brightness.value;

      // set inline style for gradient? of each slider background
      // for hue -> each hue increment, vividness, brightness
      // for vividness -> hue, each vividness increment, brightness
      // for brightness -> hue, vividness, each increment of brightness

      // hue
      let hueSlider = [];
      for (let i = 0; i <= 30; i++) {
        hueSlider.push(ACNHFormat.slidersToColor(i, vividness, brightness));
      }
      this.hueSliderColors = [...hueSlider];

      // vividness & brightness
      let vividnessSlider = [];
      let brightnessSlider = [];
      for (let i = 0; i <= 15; i++) {
        vividnessSlider.push(ACNHFormat.slidersToColor(hue, i, brightness));
        brightnessSlider.push(ACNHFormat.slidersToColor(hue, vividness, i));
      }
      this.vividnessSliderColors = [...vividnessSlider];
      this.brightnessSliderColors = [...brightnessSlider];

      this.hueGradient.background = 'linear-gradient(to right, ' + [...this.hueSliderColors].join() + ')';
      this.vividnessGradient.background = 'linear-gradient(to right, ' + [...this.vividnessSliderColors].join() + ')';
      this.brightnessGradient.background = 'linear-gradient(to right, ' + [...this.brightnessSliderColors].join() + ')';

      if (this.currentColor !== ACNHFormat.slidersToColor(hue, vividness, brightness)) {
        this.currentColor = ACNHFormat.slidersToColor(hue, vividness, brightness);
        this.$emit('color-picked', ACNHFormat.slidersToColor(hue, vividness, brightness));
      }
    },
    setSliderPosition: function(currentColor) {
      // when user switches between colors on the palettes, 
      // we need to display the correct colors on the sliders
      // as well as have the sliders in the right positions

      // set selected drawing color
      // todo: need to call this from editor at same time as onChangedCurrentColor
      console.log('setSliderPosition')
      console.log(currentColor)
      let rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(currentColor);
      rgb = {
        r: parseInt(rgb[1], 16),
        g: parseInt(rgb[2], 16),
        b: parseInt(rgb[3], 16)
      };

      const sliderPositions = ACNHFormat.colorToSliders(rgb.r, rgb.g, rgb.b);
      this.$refs.hue.value = sliderPositions[0];
      this.$refs.vividness.value  = sliderPositions[1];
      this.$refs.brightness.value = sliderPositions[2];
    },
  },
  mounted: function() {
    this.drawingTool.onColorChange(() => { 
      this.setSliderPosition(this.drawingTool.color);
      this.setSliderColors();
    });
  }
}
</script>

<style lang="scss" scoped>
 .slider-container {
   width: 100%;

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
</style>