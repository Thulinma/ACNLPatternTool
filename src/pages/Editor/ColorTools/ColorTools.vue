<template>
  <div
    :class="{
      'color-tools--container': true,
      picking: isPicking,
    }"
  >
    <Palette
      class="color-tools--palette"
      :drawingTool="drawingTool"
      @change-color-picker="$emit('change-color-picker', prevColorPicker)"
      @change-current-color="$emit('change-current-color', $event)"
    />

    <div v-show="isPicking" class="color-tools--color-pickers">
      <div class="color-tools--tabs acnl">
        <div
          :class="{
            'color-tools--tab': true,
            open: isACNL,
          }"
          @click="onChangeColorPicker('acnl')"
        >
          ACNL
        </div>
        <div
          :class="{
            'color-tools--tab': true,
            open: isACNH,
          }"
          @click="onChangeColorPicker('acnh')"
        >
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

      <div
        :class="{
          'color-tools--color-picker-content': true,
          acnl: isACNL,
          acnh: isACNH,
        }"
      >
        <ACNLColorPicker
          v-show="isACNL"
          :drawingTool="drawingTool"
          @color-picked="$emit('color-picked', $event)"
        />
        <ACNHColorPicker
          v-if="isACNH"
          :drawingTool="drawingTool"
          @color-picked="$emit('color-picked', $event)"
        />
      </div>
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
    ACNHColorPicker,
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    },
    prevColorPicker: {
      type: String,
      required: false,
    },
    colorPicker: {
      type: String,
      required: false,
    },
    isNewPattern: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    isPicking: function () {
      return this.colorPicker != null;
    },
    isACNL: function () {
      return this.colorPicker === "acnl";
    },
    isACNH: function () {
      return this.colorPicker === "acnh";
    },
    isWheel: function () {
      return this.colorPicker === "wheel";
    },
  },
  methods: {
    // also responsible for closing, send null to close
    onChangeColorPicker: function (colorPickerMode) {
      this.$emit("change-color-picker", colorPickerMode);
    },
    onChangeCurrentColor: function (idx) {
      this.$emit("change-current-color", idx);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/screens";

// size dictated by palette
.color-tools--container {
  grid-area: color-tools;
  justify-items: center;
  width: 100%;
  display: grid;

  user-select: none;

  background: $pink-lace;

  text-align: left;
  padding-top: 5px;
  padding-bottom: 5px;

  @include tablet-portrait {
    width: auto;
    display: inline-block;
    padding-top: 0px;
    padding-right: 10px;
    padding-left: 10px;
    border-radius: 0px 0px 40px 40px;
  }
  @include tablet-landscape {
    padding-top: 0px;
    padding-right: 25px;
    padding-left: 25px;
    border-radius: 0px 0px 50px 50px;
  }

  &:hover {
    @include stripes($pink-lace, $piggy-pink, 20px);
    @include moving-stripes;
  }

  &.picking {
    @include stripes($pink-lace, $piggy-pink, 20px);
    @include moving-stripes(20s);
    position: relative;
    height: 100%;
    padding-bottom: 0px;
    border-radius: 0px;

    @include tablet-portrait {
      height: auto;
      $full-thickness: 25px;
      border-radius: 0px 0px 20px 20px;
      padding-right: $full-thickness;
      padding-bottom: $full-thickness;
      padding-left: $full-thickness;
    }
    @include tablet-landscape {
      $full-thickness: 30px;
      padding-right: $full-thickness;
      padding-bottom: $full-thickness;
      padding-left: $full-thickness;
    }
  }
}

.color-tools--color-pickers {
  margin-top: 15px;
  width: 100%;

  @include tablet-portrait {
    width: auto;
  }
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

  background-color: $piggy-pink;
  color: $jambalaya;
  text-align: center;
  &.open {
    background-color: $pink-lace;
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
  background-color: $pink-lace;
}

.color-tools--color-picker-content {
  position: relative;
  top: 0;
  left: 0;

  background-color: $pink-lace;
  padding: 20px 10px;
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

  @include tablet-landscape {
    padding: 20px 25px;
  }
}
</style>