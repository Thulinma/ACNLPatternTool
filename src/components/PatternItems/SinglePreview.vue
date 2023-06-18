<template>
  <img
    class="single-preview"
    :src="src"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { PatternItem } from "@/libs/storage";
import DrawingTool from "@/libs/DrawingTool";

/**
 * PatternItem hash to dataURL mapping.
 */
const srcCache = new Map<string, string>();

/**
 * A PatternItem preview that can cache its own preview.
*/
@Component
export default class SinglePreview extends Vue {
  /** The pattern item to be rendered for the preview. */
  @Prop({
    type: Object,
    required: true,
  }) readonly patternItem!: PatternItem;
  
  /** The src string for the image. Will be generated if not in cache. */
  src: string = "";
  
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
    this.src = srcCache.get(this.patternItem.fullHash) as string;
  }
};
</script>

<style lang="scss" scoped>
.single-preview { image-rendering: pixelated }
</style>