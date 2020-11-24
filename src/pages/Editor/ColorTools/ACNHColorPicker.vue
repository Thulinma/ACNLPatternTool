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
                if (hue > 0) hue--;
                setSliderColors();
              }
            "
          >
            <IconLeftArrow class="arrow" />
          </button>
          <div class="slider--label-slot-number">{{ parseInt(hue) + 1 }}</div>
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (hue < 29) hue++;
                setSliderColors();
              }
            "
          >
            <IconRightArrow class="arrow" />
          </button>
        </div>
      </label>
      <div class="sliders--slider-container">
        <input
          class="sliders--slider"
          type="range"
          id="hue"
          min="0"
          max="29"
          v-model="hue"
          :style="hueGradient"
          @change="setSliderColors"
        />
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
                if (vividness > 0) vividness--;
                setSliderColors();
              }
            "
          >
            <IconLeftArrow class="arrow" />
          </button>
          <div class="slider--label-slot-number">
            {{ parseInt(vividness) + 1 }}
          </div>
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (vividness < 14) vividness++;
                setSliderColors();
              }
            "
          >
            <IconRightArrow class="arrow" />
          </button>
        </div>
      </label>
      <div class="sliders--slider-container">
        <input
          class="sliders--slider"
          type="range"
          id="vividness"
          min="0"
          max="14"
          v-model="vividness"
          :style="vividnessGradient"
          @change="setSliderColors"
        />
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
                if (brightness > 0) brightness--;
                setSliderColors();
              }
            "
          >
            <IconLeftArrow class="arrow" />
          </button>
          <div class="slider--label-slot-number">
            {{ parseInt(brightness) + 1 }}
          </div>
          <button
            v-if="acnh"
            class="slider--label-slot-button"
            @click="
              () => {
                if (brightness < 14) brightness++;
                setSliderColors();
              }
            "
          >
            <IconRightArrow class="arrow" />
          </button>
        </div>
      </label>
      <div class="sliders--slider-container">
        <input
          class="sliders--slider"
          type="range"
          id="brightness"
          min="0"
          max="14"
          v-model="brightness"
          :style="brightnessGradient"
          @change="setSliderColors"
        />
      </div>
    </section>
    <!-- brightness -->
  </div>
</template>

<script>
import colorMaker from "~/libs/ACNHFormat";

import IconLeftArrow from "~/components/icons/IconLeftArrow.vue";
import IconRightArrow from "~/components/icons/IconRightArrow.vue";

export default {
  name: "ACNHColorPicker",
  components: {
    IconLeftArrow,
    IconRightArrow,
  },
  props: {
    drawingTool: Object,
  },
  data() {
    return {
      hue: 0,
      vividness: 0,
      brightness: 0,
      hueSliderColors: [],
      vividnessSliderColors: [],
      brightnessSliderColors: [],
      hueGradient: {
        background: "",
      },
      vividnessGradient: {
        background: "",
      },
      brightnessGradient: {
        background: "",
      },
      currentColor: 0,
      acnh: this.drawingTool.compatMode === "ACNH",
    };
  },
  methods: {
    setSliderColors: function () {
      // color of draw tool will be in HSV format
      // increments based on slots in sliders in ACNH
      // H = hue 1 - 30
      // S = vividness 1 - 16
      // V = brightness 1 - 16

      // hue
      let hueSlider = [];
      for (let i = 0; i <= 29; i++) {
        hueSlider.push(
          colorMaker.slidersToColor(i, this.vividness, this.brightness)
        );
      }
      this.hueSliderColors = [...hueSlider];

      // vividness & brightness
      let vividnessSlider = [];
      let brightnessSlider = [];
      for (let i = 0; i <= 14; i++) {
        vividnessSlider.push(
          colorMaker.slidersToColor(this.hue, i, this.brightness)
        );
        brightnessSlider.push(
          colorMaker.slidersToColor(this.hue, this.vividness, i)
        );
      }
      this.vividnessSliderColors = [...vividnessSlider];
      this.brightnessSliderColors = [...brightnessSlider];

      this.hueGradient.background =
        "linear-gradient(to right, " + [...this.hueSliderColors].join() + ")";
      this.vividnessGradient.background =
        "linear-gradient(to right, " +
        [...this.vividnessSliderColors].join() +
        ")";
      this.brightnessGradient.background =
        "linear-gradient(to right, " +
        [...this.brightnessSliderColors].join() +
        ")";

      if (
        this.currentColor !==
        colorMaker.slidersToColor(this.hue, this.vividness, this.brightness)
      ) {
        this.currentColor = colorMaker.slidersToColor(
          this.hue,
          this.vividness,
          this.brightness
        );
        this.$emit(
          "color-picked",
          colorMaker.slidersToColor(this.hue, this.vividness, this.brightness)
        );
      }
    },
    setSliderPosition: function (currentColor) {
      // when user switches between colors on the palettes,
      // we need to display the correct colors on the sliders
      // as well as have the sliders in the right positions

      // set selected drawing color
      // todo: need to call this from editor at same time as onChangedCurrentColor
      let rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(currentColor);
      if (!rgb) {
        return;
      }

      rgb = {
        r: parseInt(rgb[1], 16),
        g: parseInt(rgb[2], 16),
        b: parseInt(rgb[3], 16),
      };

      const sliderPositions = colorMaker.colorToSliders(rgb.r, rgb.g, rgb.b);

      this.hue = sliderPositions[0];
      this.vividness = sliderPositions[1];
      this.brightness = sliderPositions[2];
    },
  },
  mounted() {
    this.setSliderPosition(this.drawingTool.color);
    this.setSliderColors();
    this.drawingTool.onColorChange(() => {
      this.setSliderPosition(this.drawingTool.color);
      this.setSliderColors();
    });
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";

.acnh-sliders {
  padding: 10px 20px 15px;
  width: 470px;
  user-select: none;
  margin: auto;
}

.sliders--slider-container {
  width: 100%;
  padding: 10px 0;

  .sliders--slider {
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
      background: rgba(255, 255, 255, 0.8);
      margin-top: -4px;
    }
  }
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
  border-radius: 20px;
  background: none;
  background-color: $salmon;
  cursor: pointer;
  margin: 0 5px;
  padding: 2px;
}

.slider--label-slot-number {
  width: 20px;
  text-align: center;
}
</style>