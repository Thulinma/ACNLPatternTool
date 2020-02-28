<template v-for="i in 1">
  <div class="editor">
    <Palette
      ref="palette"
      v-bind:drawing-tool="drawingTool"
      v-on:changed-current-color="onChangedCurrentColor"/>
    <ColorPicker
      ref="colorPicker"
      v-bind:drawing-tool="drawingTool"
      v-on:color-picked="onColorPicked"/>
    <div>
      <canvas ref="canvas1" width="512" height="512"/>
      <canvas ref="canvas2" width="128" height="128"/>
      <canvas ref="canvas3" width="64" height="64"/>
      <ThreeDRender width="128" height="128" v-bind:drawing-tool="drawingTool"/>
    </div>
    <FileLoader v-on:qr-load="qrLoad" />
    <div style="background-color:white;" ref="qrout"></div>
  </div>
</template>

<script>
import ColorPicker from "/components/ColorPicker.vue";
import Palette from "/components/Palette.vue";
import ThreeDRender from "/components/ThreeDRender.vue";
import FileLoader from "/components/FileLoader.vue";
import DrawingTool from "/libs/DrawingTool";
import logger from "/utils/logger";
import lzString from 'lz-string';
import { BrowserQRCodeSvgWriter, EncodeHintType } from '@zxing/library';

export default {
  name: "Editor",
  components: {
    ColorPicker,
    Palette,
    ThreeDRender,
    FileLoader
  },
  beforeRouteUpdate: function (to, from, next) {
    if (to.hash.length > 1) {
      let newHash = lzString.compressToEncodedURIComponent(this.drawingTool.toString());
      if (to.hash !== "#" + newHash) {
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(to.hash.substring(1)));
      }
    }
    next();
  },
  data: function() {
    return {
      drawingTool: new DrawingTool(),
      fragment: ""
    };
  },
  methods: {
    onColorPicked: function(color) {
      const currentColor = this.drawingTool.currentColor;
      if (this.drawingTool.getPalette(currentColor) === color) return;
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      this.$refs.palette.palChange();
      logger.info(`color picked: ${color}`);
    },
    onChangedCurrentColor: function(idx) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.$refs.colorPicker.forceCheck();
      logger.info(`changed current color: ${idx}`);
    },
    onLoad: function(t){
      this.$refs.palette.palChange();
      this.$refs.colorPicker.forceCheck();
      let patStr = this.drawingTool.toString();
      let newHash = lzString.compressToEncodedURIComponent(patStr);
      if (this.$router.currentRoute.hash !== "#" + newHash) {
        this.$router.push({ hash: newHash });
      }

      this.$refs.qrout.innerHTML = "";
      let writer = new BrowserQRCodeSvgWriter();
      let bytes = this.drawingTool.toBytes();
      if (bytes.byteLength == 620){
        writer.writeToDom(this.$refs.qrout, new Uint8Array(bytes), 300, 300);
      }else{
        const hints = new Map();
        const parityByte = Math.round(Math.random()*255);
        hints.set(EncodeHintType.STRUCTURED_APPEND, [0, 3, parityByte]);
        writer.writeToDom(this.$refs.qrout, new Uint8Array(bytes, 0, 540), 300, 300, hints);
        hints.set(EncodeHintType.STRUCTURED_APPEND, [1, 3, parityByte]);
        writer.writeToDom(this.$refs.qrout, new Uint8Array(bytes, 540, 540), 300, 300, hints);
        hints.set(EncodeHintType.STRUCTURED_APPEND, [2, 3, parityByte]);
        writer.writeToDom(this.$refs.qrout, new Uint8Array(bytes, 1080, 540), 300, 300, hints);
        hints.set(EncodeHintType.STRUCTURED_APPEND, [3, 3, parityByte]);
        writer.writeToDom(this.$refs.qrout, new Uint8Array(bytes, 1620, 540), 300, 300, hints);
      }
    },
    qrLoad: function(data) {
      // only takes valid data, FileLoader determines
      this.drawingTool.load(data);
      this.drawingTool.render();
    }
  },
  mounted: function() {
    this.drawingTool.addCanvas(this.$refs.canvas1, {grid:true});
    this.drawingTool.addCanvas(this.$refs.canvas2);
    this.drawingTool.addCanvas(this.$refs.canvas3);
    this.drawingTool.onLoad(this.onLoad);
    if (this.$router.currentRoute.hash.length > 1){
      this.drawingTool.load(lzString.decompressFromEncodedURIComponent(this.$router.currentRoute.hash.substring(1)));
    }
    else{
      this.drawingTool.render();
    }
  },
}
</script>

<style scoped>
.editor {
  user-select: none;
}
</style>
