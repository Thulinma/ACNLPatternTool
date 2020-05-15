<template>
  <div :class="{
      'color-tools--container': true,
      'picking': isPicking,
    }">

    <Palette
      :drawingTool="drawingTool"
      @change-current-color="onChangeCurrentColor"/>

    <div v-show="isPicking" class="color-tools--color-pickers">
      <div class="color-tools--tabs acnl">
        <div
          :class="{
            'color-tools--tab': true,
            'open': isACNL,
          }"
          @click="onChangeColorPicker('acnl')">
          ACNL
        </div>
        <div
          :class="{
            'color-tools--tab': true,
            'open': isACNH,
          }"
          @click="onChangeColorPicker('acnh')">
          ACNH
        </div>
        <!-- <div
          :class="{
            'color-tools--tab': true,
            'open': isWheel,
          }">
          Wheel
        </div> -->
        <div class="color-tools--tab-cover"></div>
      </div>

      <div :class="{
        'color-tools--color-picker-content': true,
        'acnl': isACNL,
        'acnh': isACNH,
      }">
        <ACNLColorPicker
          v-show="isACNL"
          :drawingTool="drawingTool"
          @color-picked="onColorPicked"/>
        <ACNHColorPicker
          v-if="isACNH"
          :drawingTool="drawingTool"
          @color-picked="onColorPicked"/>
      </div>
    </div>

    <div
      class="color-picker-close">
    </div>
  </div>
</template>


<script>
import Palette from "./Palette";
import DrawingTool from "~/libs/DrawingTool";
import ACNLColorPicker from "./ACNLColorPicker";
import ACNHColorPicker from "./ACNHColorPicker";

const colorPickerDefault = "acnl";
const validACNLColorPickers = new Set(["acnl"]);
const validACNHColorPickers = new Set(["acnl", "acnh"]);
export default {
  name: "ColorTools",
  components: {
    Palette,
    ACNLColorPicker,
    ACNHColorPicker
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true
    },
    colorPicker: {
      type: String,
      required: false
    }
  },
  computed: {
    isPicking: function() {
      return this.colorPicker != null;
    },
    isACNL: function() {
      return this.colorPicker === "acnl";
    },
    isACNH: function() {
      return this.colorPicker === "acnh"
    },
    isWheel: function() {
      return this.colorPicker === "wheel"
    },
  },
  methods: {
    // also responsible for closing, send null to close
    onChangeColorPicker: function(colorPickerMode) {
      this.$emit("change-color-picker", colorPickerMode);
    },
    onChangeCurrentColor: function(idx) {
      this.$emit("change-current-color", idx);
    },
    onColorPicked: function(color) {
      this.$emit("color-picked", color);
    },
  }
}
</script>

<style lang="scss" scoped>
@import "styles/colors";

@keyframes color-tools-barberpole {
  0% {background-position: 100% 100%;}
  100% {background-position: 0% 0%;}
}
.color-tools--container {
  user-select: none;
  display: inline-block;
  background: $pink;

  padding: 0px 25px 5px 25px;
  padding-top: 0px;
  padding-right: 25px;
  padding-bottom: 5px;
  padding-left: 25px;
  border-radius: 0px 0px 50px 50px;
  text-align: left;

  &.picking {
    background: repeating-linear-gradient(
      -45deg,
      $pastel-pink,
      $pastel-pink 20px,
      $piggy-pink 20px,
      $piggy-pink 40px
    );
    background-size: 200% 200%;
    animation: color-tools-barberpole 20s linear infinite;
    padding-bottom: 25px;
  }
}

.color-tools--color-pickers {
  margin-top: 15px;
}

.color-tools--tabs {
  position: relative;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: stretch;
}

.color-tools--tab {
  flex: 1 1 0px;
  padding-top: 15px;
  padding-bottom: 10px;

  background-color: $pastel-pink;
  color: $umber;
  text-align: center;
  &.open {
    background-color: $pink;
    cursor: default;
  }
  cursor: pointer;
  border-radius: 25px 25px 0px 0px;
  z-index: 1;
}

.color-tools--tab-cover {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(0%, 100%);
  width: 100%;
  height: 100%;
  background-color: $pastel-pink;
}

.color-tools--color-picker-content {
  position: relative;
  top: 0;
  left: 0;

  background-color: pink;
  padding: 20px 25px;
  border-radius: 0px 0px 20px 20px;

  &.acnl {
    border-radius: 0px 20px 20px 20px;
  }
  &.acnh {
    border-radius: 20px 0px 20px 20px;
  }

  // &.wheel {
  //   border-radius: 0px 0px 20px 20px;
  // }
}
</style>