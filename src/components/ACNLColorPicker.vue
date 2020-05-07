<template>
  <div class="swatch">
    <!-- non-grays -->
      <div
        class="swatch-color-block"
        v-for="(block, index) in colorBlocks"
        :key="index">
        <div
          v-for="color in block"
          :key="color"
          :class="{picked: currColor === color}"
          class="swatch-color"
          :style="{ backgroundColor: color }"
          @click="onColorClick($event, color)"
          @mousemove="onColorMousemove($event, color)">
        </div>
      </div>
      <div class="swatch-mono-block">
        <div
          v-for="color in monoBlock"
          :key="color"
          :class="{picked: currColor === color}"
          class="swatch-color"
          :style="{ backgroundColor: color }"
          @click="onColorClick($event, color)"
          @mousemove="onColorMousemove($event, color)">
        </div>
      </div>
  </div>
</template>

<script>
import ACNLFormat from "/libs/ACNLFormat";

export default {
  name: "ColorPicker",
  props: {
    drawingTool: Object,
  },
  data: function() {
    const colorBlocks = [];
    for (let i = 0x00; i < 0xFF; i += 0x10) {
      let vibrantBlock = [];
      for (let j = 0x00; j < 0x09; j += 0x01)
        vibrantBlock.push(ACNLFormat.paletteColors[i + j]);
      colorBlocks.push(vibrantBlock);
    };
    const monoBlock = [];
    for (let i = 0x0F; i < 0xFF; i += 0x10)
      monoBlock.push(ACNLFormat.paletteColors[i]);
    return {
      colorBlocks,
      monoBlock,
      currColor: 0
    };
  },
  methods: {
    onColorClick: function(event, color) {
      // if color is the same, gets blocked at parent
      this.$emit("color-picked", color);
    },
    onColorMousemove: function(event, color) {
      // if color is the same, gets blocked at parent
      if (event.buttons === 1) {
        this.$emit("color-picked", color);
      }
    }
  },
  mounted: function(){
    this.drawingTool.onColorChange(() => {this.$data.currColor = this.drawingTool.color;});
  }
}
</script>

<style lang="scss" scoped>
.swatch {
  user-select: none;
  display: inline-flex;
  flex-wrap: wrap;
  width: 240px;
}

.swatch-color-block {
  height: 45px;
  width: 45px;
  margin: 7.5px;
  display: inline-block;
}

.swatch-mono-block {
  background: repeating-linear-gradient(
    45deg,
    black,
    black 2px,
    white 2px,
    white 4px
  );
  margin: 7.5px;
}

.swatch-color {
  width: 15px;
  height: 15px;
  border: 0;
  float: left;
  margin: 0;
  padding: 0;
}

.swatch-color.picked {
  width: 7.5px;
  height: 7.5px;
  margin: 3.75px;
}
</style>
