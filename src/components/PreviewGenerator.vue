<template>
  <canvas ref="canvas" width="150" height="150" @click="$emit('click')">
  </canvas>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import DrawingTool from "@/libs/DrawingTool";

@Component
export default class PreviewGenerator extends Vue {
  $refs!: { canvas: HTMLCanvasElement }
  
  @Prop({
    type: DrawingTool,
    required: true,
  }) drawingTool!: DrawingTool;
  
  @Watch('drawingTool')
  onDrawingToolChange(newVal: DrawingTool) {
    const width = this.$refs.canvas.width;
    const height = this.$refs.canvas.height;
    const ctx = this.$refs.canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, width, height);
    this.draw();
  }
  
  async mounted() {
    await this.draw();
  }
  
  pattClick() {
    this.$emit("pattclick", this.drawingTool);
  }

  async draw() {
    const canvas = document.createElement("canvas");
    canvas.width = this.drawingTool.typeInfo.size;
    canvas.height = this.drawingTool.typeInfo.size;
    this.drawingTool.addCanvas(canvas);
    this.drawingTool.render();

    const width = this.$refs.canvas.width;
    const height = this.$refs.canvas.height;
    const ctx = this.$refs.canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, width, height);
  }
};
</script>

<style lang="scss" scoped>
canvas {
  width: 150px;
  height: 150px;
  display: block;
}
</style>
