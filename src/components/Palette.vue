<template>
  <div class="palette">
    <div class="palette-color-row">
      <div
        v-for="i in 15"
        v-if="drawingTool.currentColor !== i-1"
        class="palette-color"
        v-bind:key="i-1"
        v-bind:style="{ backgroundColor: paletteColors[i-1] }"
        v-on:click="onColorClick($event, i-1)"
        v-on:mousemove="onColorMousemove($event, i-1)">
      </div>
      <div
        v-else
        v-bind:key="i-1"
        class="palette-color picked"
        v-bind:style="{ backgroundColor: paletteColors[i-1] }"
        v-on:click="onColorClick($event, i-1)"
        v-on:mousemove="onColorMousemove($event, i-1)">
      </div>
    </div>
  </div>
</template>

<script>
import DrawingTool from "/libs/DrawingTool";

export default {
  name: "Palette",
  props: {
    drawingTool: DrawingTool,
  },
  data: function() {
    const paletteColors = [];
    for (let i = 0; i < 15; ++i)
      paletteColors.push(this.drawingTool.getPalette(i));
    return {paletteColors};
  },
  methods: {
    onColorClick: function(event, idx) {
      this.$emit('changed-current-color', idx);
    },
    onColorMousemove: function(event, idx) {
      if (event.buttons === 1)
        this.$emit('changed-current-color', idx);
    },
  },
  mounted: function(){
    this.drawingTool.onColorChange(() => {
      let paletteColors = [];
      for (let i = 0; i < 15; ++i)
        paletteColors[i] = this.drawingTool.getPalette(i);
      this.$data.paletteColors = paletteColors;
    });
  }
}
</script>

<style lang="scss" scoped>
.palette {
  user-select: none;
  border-radius: 0 0 35px 35px;
  background-color: #f1b5c1;
  padding: 15px;
  width: 480px;
  float: right;
  box-shadow: rgba(0,0,0,0.2) 0 0 8px;
}
.palette-color {
  width: 32px;
  height: 32px;
  border-radius: 70% 30% 70% 30% / 60% 30% 70% 40%;
  display: inline-block;
  margin: 0;
  padding: 0;
  font-size: 0;
}

.palette-color-row {
  height: 32px;
}

.palette-color.picked {
  width: 24px;
  height: 24px;
  margin: 4px;
}
</style>
