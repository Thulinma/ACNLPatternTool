<template>
  <div class="swatch">
    <!-- non-grays -->
    <div>
      <div
        class="swatch-color-block"
        v-for="(block, index) in colorBlocks"
        v-bind:key="index">
        <div
          v-for="color in block"
          v-if="currColor !== color"
          v-bind:key="color"
          class="swatch-color"
          v-bind:style="{ backgroundColor: color }"
          v-on:click="onColorClick($event, color)"
          v-on:mousemove="onColorMousemove($event, color)">
        </div>
        <div
          v-else
          v-bind:key="color"
          class="swatch-color picked"
          v-bind:style="{ backgroundColor: color }"
          v-on:click="onColorClick($event, color)"
          v-on:mousemove="onColorMousemove($event, color)">
        </div>
      </div>
      <div class="swatch-mono-block">
        <div
          v-for="color in monoBlock"
          v-if="currColor !== color"
          v-bind:key="color"
          class="swatch-color"
          v-bind:style="{ backgroundColor: color }"
          v-on:click="onColorClick($event, color)"
          v-on:mousemove="onColorMousemove($event, color)">
        </div>
        <div
          v-else
          v-bind:key="color"
          class="swatch-color picked"
          v-bind:style="{ backgroundColor: color }"
          v-on:click="onColorClick($event, color)"
          v-on:mousemove="onColorMousemove($event, color)">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ACNLFormat from "/libs/ACNLFormat";
import DrawingTool from "/libs/DrawingTool";

export default {
  name: "ColorPicker",
  props: {
    drawingTool: DrawingTool,
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
      this.$data.currColor = this.drawingTool.color;
    },
    onColorMousemove: function(event, color) {
      // if color is the same, gets blocked at parent
      if (event.buttons === 1) {
        this.$emit("color-picked", color);
        this.$data.currColor = this.drawingTool.color;
      }
    },
    forceCheck: function(){
      this.$data.currColor = this.drawingTool.color;
    }
  },
}
</script>

<style scoped>
.swatch {
  user-select: none;
  border-radius: 35px;
  background: repeating-linear-gradient(
    45deg,
    #ebbccd,
    #ebbccd 6px,
    #c38399 6px,
    #c38399 12px
  );
  display: inline-block;
  padding:10px;
  width: 160px;
  height: 180px;
}

.swatch-color-block {
  background: repeating-linear-gradient(
    45deg,
    black,
    black 2px,
    white 2px,
    white 4px
  );
  height: 30px;
  width: 30px;
  float: left;
  overflow: hidden;
  margin: 5px;
}

.swatch-mono-block {
  background: repeating-linear-gradient(
    45deg,
    black,
    black 2px,
    white 2px,
    white 4px
  );
  height: 10px;
  width: 150px;
  float: left;
  overflow: hidden;
  margin: 5px;
}

.swatch-color {
  width: 10px;
  height: 10px;
  border: 0;
  float: left;
  margin: 0;
  padding: 0;
}

.swatch-color.picked {
  width: 6px;
  height: 6px;
  margin: 2px;
}
</style>
