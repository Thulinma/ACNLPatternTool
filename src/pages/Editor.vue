<template v-for="i in 1">
  <div class="editor">
    <Palette
      ref="palette"
      :drawing-tool="drawingTool"
      v-on:changed-current-color="onChangedCurrentColor"/>
    <ColorPicker
      ref="colorPicker"
      v-bind:drawing-tool="drawingTool"
      v-on:color-picked="onColorPicked"/>
    <div>
      <canvas ref="canvas1" width="512" height="512"/>
      <canvas ref="canvas2" width="128" height="128"/>
      <canvas ref="canvas3" width="64" height="64"/>
      <ThreeDRender :width="128" :height="128" :drawing-tool="drawingTool"/>
    </div>
    <FileLoader v-on:qr-load="qrLoad" />
    <input type="button" :value="$tc('editor.download')" v-on:click="downACNL" />
    <button v-on:click="onModalOpen">Toggle Modal</button>

    <!-- using ref inside a v-if -->
    <ModalContainer
      v-if="isModalOpen"
      v-on:modal-close="onModalClose"
      v-on:modal-open="" >
      <!-- must provide a window for modal container -->
      <div class="modal-window">
        <ACNLQRGenerator
          ref="qrgen"
          :pattern="qrCode.pattern"
          :width="qrCode.size[0]"
          :height="qrCode.size[1]" />
      </div>
    </ModalContainer>
  </div>
</template>

<script>
import ColorPicker from '/components/ColorPicker.vue';
import Palette from '/components/Palette.vue';
import ThreeDRender from '/components/ThreeDRender.vue';
import FileLoader from '/components/FileLoader.vue';
import ACNLQRGenerator from '/components/ACNLQRGenerator.vue';
import ModalContainer from '/components/ModalContainer.vue';
import DrawingTool from '/libs/DrawingTool';
import logger from '/utils/logger';
import lzString from 'lz-string';
import { saveAs } from 'file-saver';

export default {
  name: "Editor",
  components: {
    ColorPicker,
    Palette,
    ThreeDRender,
    FileLoader,
    ACNLQRGenerator,
    ModalContainer
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
      qrCode: {
        size: [240, 480],
        pattern: ""
      },
      fragment: "",
      isModalOpen: false,
    };
  },
  methods: {
    downACNL(){
      var blob = new Blob([this.drawingTool.toBytes()], {"type": "application/octet-stream"});
      saveAs(blob, this.drawingTool.title+".acnl");
    },
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
    onLoad: async function(t){
      this.$refs.palette.palChange();
      this.$refs.colorPicker.forceCheck();
      let patStr = this.drawingTool.toString();

      // need to wait 2 ticks before access ref in portal
      // AFTER setting isOpenModal to true
      // https://portal-vue.linusb.org/guide/caveats.html#provide-inject
      await this.$nextTick();
      await this.$nextTick();

      let newHash = lzString.compressToEncodedURIComponent(patStr);
      if (this.$router.currentRoute.hash !== "#" + newHash) {
        this.$router.push({ hash: newHash });
      }
      return;
    },
    qrLoad: function(data) {
      // only takes valid data, FileLoader determines
      this.drawingTool.load(data);
      this.drawingTool.render();
    },
    onModalOpen: function() {
      const patStr = this.drawingTool.toString();
      this.qrCode.pattern = patStr;
      if (patStr.length > 620){
        this.qrCode.size = [760, 460];
      } else{
        this.qrCode.size = [440, 270];
      }
      this.isModalOpen = true;
    },
    onModalClose: function() {
      this.isModalOpen = false;
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

.modal-window {
  position: fixed;
  top: 50%;
  left: 50%;
  padding: 10px;
  transform: translate(-50%, -50%);
  background-color: #e28e8e;
}
</style>
