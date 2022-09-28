<template>
  <img
    class="single-preview"
    :src="src"
  />
</template>

<script>
import DrawingTool from "@/libs/DrawingTool";

/**
 * PatternItem hash to dataURL mapping.
 * @type {Map<string, string>}
 */
const srcCache = new Map();

/**
 * A PatternItem preview that can cache its own preview.
 */
export default {
  props: {
    patternItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      src: "",
    };
  },
  mounted() {
    if (!srcCache.has(this.patternItem.fullHash)) {
      // draw the pattern
      const canvas = document.createElement("canvas");
      canvas.width = this.patternItem.drawingTool.typeInfo.size;
      canvas.height = this.patternItem.drawingTool.typeInfo.size;
      const drawingTool = new DrawingTool(this.patternItem.drawingTool);
      drawingTool.addCanvas(canvas);
      drawingTool.render();
      // retrieve the data
      const dataUrl = canvas.toDataURL("image/png");
      srcCache.set(this.patternItem.fullHash, dataUrl);
    }
    this.src = srcCache.get(this.patternItem.fullHash);
  },
};
</script>

<style lang="scss" scoped>
.single-preview { image-rendering: pixelated }
</style>