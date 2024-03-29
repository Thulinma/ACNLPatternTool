<template>
  <div class="color-picker--container">
    <div class="color-picker--vibrant-blocks">
      <div
        class="color-picker--vibrant-block"
        v-for="(block, i) in vibrantBlocks"
        :key="i"
        :style="{
          borderColor: block[4],
          backgroundColor: block[4],
        }"
      >
        <div
          :class="{
            'color-picker--vibrant-color': true,
            picked: color === currColor,
          }"
          v-for="color in block"
          :key="color"
          :style="{ backgroundColor: color }"
          @click="onColorClick($event, color)"
          @mousemove="onColorMousemove($event, color)"
        >
          <div class="color-picker--vibrant-color-highlight"></div>
        </div>
      </div>
    </div>
    <div class="color-picker--mono-block">
      <div
        :class="{
          'color-picker--mono-color': true,
          picked: color === currColor,
        }"
        v-for="color in monoBlock"
        :key="color"
        :style="{ backgroundColor: color }"
        @click="onColorClick($event, color)"
        @mousemove="onColorMousemove($event, color)"
      >
        <div class="color-picker--mono-color-highlight"></div>
      </div>
    </div>
  </div>
</template>

<script>
import DrawingTool from "@/libs/DrawingTool";
import ACNLFormat from "@/libs/ACNLFormat";

export default {
  name: "ACNLColorPicker",
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    },
  },
  data: function () {
    const vibrantBlocks = [];
    for (let i = 0x00; i < 0xff; i += 0x10) {
      let vibrantBlock = [];
      for (let j = 0x00; j < 0x09; j += 0x01)
        vibrantBlock.push(ACNLFormat.paletteColors[i + j]);
      vibrantBlocks.push(vibrantBlock);
    }
    const monoBlock = [];
    for (let i = 0x0f; i < 0xff; i += 0x10)
      monoBlock.push(ACNLFormat.paletteColors[i]);
    return {
      vibrantBlocks,
      monoBlock,
      currColor: this.drawingTool.color,
    };
  },
  methods: {
    onColorClick: function (event, color) {
      // if color is the same, gets blocked at parent
      this.$emit("color-picked", color);
    },
    onColorMousemove: function (event, color) {
      // if color is the same, gets blocked at parent
      if (event.buttons === 1) {
        this.$emit("color-picked", color);
      }
    },
    updateCurrColor: function () {
      this.$data.currColor = this.drawingTool.color;
    },
  },
  mounted: function () {
    this.drawingTool.onColorChange(this.updateCurrColor);
  },
  beforeDestroy: function () {
    this.drawingTool.onColorChangeRemove(this.updateCurrColor);
  },
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/transitions" as transitions;
@use "styles/screens" as screens;

.color-picker--container {
  user-select: none;
}

.color-picker--vibrant-blocks {
  display: grid;
  grid-template-rows: repeat(4, auto);
  grid-template-columns: repeat(4, auto);
  justify-content: space-between;
  row-gap: 20px;
}

.color-picker--vibrant-block {
  width: 65px;
  height: 65px;

  border-width: 4px;
  border-style: solid;
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);
  border-radius: 7px;

  @include screens.phone-landscape {
    width: 85px;
    height: 85px;
  }
  @include screens.tablet-portrait {
    width: 100px;
    height: 100px;
    border-radius: 10px;
  }
}

@mixin vibrant-color-block-radius($size) {
  &:nth-child(1) {
    border-top-left-radius: $size;
  }
  &:nth-child(3) {
    border-top-right-radius: $size;
  }
  &:nth-child(7) {
    border-bottom-left-radius: $size;
  }
  &:nth-child(9) {
    border-bottom-right-radius: $size;
  }
}

.color-picker--vibrant-color {
  @include vibrant-color-block-radius(3px);
  @include screens.tablet-portrait {
    @include vibrant-color-block-radius(6px);
  }
}

.color-picker--vibrant-color-highlight,
.color-picker--mono-color-highlight {
  width: 4px;
  height: 4px;
  border-radius: 100%;

  position: absolute;
  top: 4px;
  left: 6px;
  background-color: white;
  opacity: 0.5;
}

$mono-block-size: 30px;
$mono-block-border-radius: 10px;
$mono-color-border-radius: $mono-block-border-radius - 5px;
.color-picker--mono-block {
  margin-top: 20px;
  height: $mono-block-size;

  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-template-rows: repeat(1, auto);
  justify-items: stretch;

  border-color: #7e7261;
  border-width: 4px;
  border-style: solid;
  border-radius: $mono-block-border-radius;
}

.color-picker--mono-color {
  &:nth-child(1) {
    border-top-left-radius: $mono-color-border-radius;
    border-bottom-left-radius: $mono-color-border-radius;
  }
  &:nth-last-child(1) {
    border-top-right-radius: $mono-color-border-radius;
    border-bottom-right-radius: $mono-color-border-radius;
  }
}

.color-picker--vibrant-color,
.color-picker--mono-color {
  box-sizing: border-box;
  position: relative;
  top: 0;
  left: 0;

  cursor: pointer;
  transition: transform 0.1s transitions.$energetic;
  &.picked {
    border-width: 4px;
    border-style: solid;
    border-color: colors.$tiffany-blue;
  }
  &:hover {
    transform: scale(1.2);
    border-radius: 5px;
    z-index: 1;
  }
}
</style>
