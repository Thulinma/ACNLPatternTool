<template>
  <canvas ref="canvas" width="150" height="150" @click="$emit('click')">
  </canvas>
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";

export default {
  name: "PreviewGenerator",
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    },
  },
  data: function () {
    return {};
  },
  watch: {
    //Whenever pattern changes, draw it!
    drawingTool(newVal, oldVal) {
      this.draw(newVal);
    },
  },
  mounted: async function () {
    await this.draw();
  },
  methods: {
    pattClick() {
      this.$emit("pattclick", this.pattern);
    },
    async draw() {
      const canvas = document.createElement("canvas");
      canvas.width = this.drawingTool.typeInfo.size;
      canvas.height = this.drawingTool.typeInfo.size;
      this.drawingTool.addCanvas(canvas);
      this.drawingTool.render();

      const width = this.$refs.canvas.width;
      const height = this.$refs.canvas.height;
      const ctx = this.$refs.canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, width, height);
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 150px;
  height: 150px;
  display: block;
}
</style>
