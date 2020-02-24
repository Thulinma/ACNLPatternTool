<template>
  <div class="palette">
    <div
      class="palette-color-row"
      v-for="i in 5"
      v-bind:key="i - 1">
      <div
        class="palette-color"
        v-for="j in 3"
        v-bind:key="(i-1)*3 + j-1"
        v-bind:style="{ backgroundColor: paletteColors[(i-1)*3 + j-1] }"
        v-on:click="onColorClick($event, (i - 1) * 3 + (j -1))"
        v-on:mousemove="onColorMousemove($event, (i - 1) * 3 + (j -1))">
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
    const paletteColors = new Array(15).fill(null).map((_, idx) => {
      return this.drawingTool.getPalette(idx);
    });
    return {
      paletteColors,
    };
  },
  methods: {
    onColorClick: function(event, idx) {
      this.$emit('changed-current-color', idx);
    },
    onColorMousemove: function(event, idx) {
      if (event.buttons === 1)
        this.$emit('changed-current-color', idx);
    }
  },
  updated: function() {
  }
}
</script>

<style scoped>
.palette {
	user-select: none;
  border: 2px solid white;
  margin-top: 20px;
  margin-bottom: 20px;
	display: inline-block;
	margin-right: 5px;
	vertical-align: top;
}

.palette-color-row {
	height: 32px;
	background-color: black;
}

.palette-color {
  width: 32px;
  height: 32px;
  display: inline-block;
  margin: 0;
  padding: 0;
  font-size: 0;
}

.palette-color.picked {
  width: 24px;
  height: 24px;
  margin: 4px;
}
</style>
