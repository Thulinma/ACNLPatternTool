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
    <ToolSelector v-on:newtool="toolChange" v-on:newtoolalt="toolChangeAlt" />
    <div>
      <canvas ref="canvas1" width="512" height="512"/>
      <canvas ref="canvas2" width="128" height="128"/>
      <canvas ref="canvas3" width="64" height="64"/>
      <ThreeDRender :width="128" :height="128" :drawing-tool="drawingTool"/>
    </div>
    <FileLoader v-on:qr-load="extLoad" v-on:qr-multiload="extMultiLoad" />
    <input type="button" :value="$tc('editor.download')" v-on:click="downACNL" />
    <button v-on:click="onModalOpen">Generate QR code(s)</button>

    <ModalContainer
      v-if="qrCode"
      v-on:modal-close="closeQr">
      <!-- must provide a window for modal container -->
      <div class="modal-window">
        <ACNLQRGenerator :pattern="qrCode" />
      </div>
    </ModalContainer>

    <ModalContainer
      v-if="pickPatterns"
      v-on:modal-close="closePicks">
      <!-- must provide a window for modal container -->
      <div class="modal-window">
        <ACNLQRGenerator
          v-for="(opt, idx) in pickPatterns"
          :key="idx"
          v-on:pattclick="pickPattern"
          :pattern="opt" />
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
import ToolSelector from '/components/ToolSelector.vue';
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
    ModalContainer,
    ToolSelector
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
      qrCode: false,
      fragment: "",
      pickPatterns: false
    };
  },
  methods: {
    toolChange(newTool){
      this.drawingTool.drawHandler = newTool;
    },
    toolChangeAlt(newTool){
      this.drawingTool.drawHandlerAlt = newTool;
    },
    downACNL(){
      var blob = new Blob([this.drawingTool.toBytes()], {"type": "application/octet-stream"});
      saveAs(blob, this.drawingTool.title+".acnl");
    },
    onColorPicked: function(color) {
      const currentColor = this.drawingTool.currentColor;
      if (this.drawingTool.getPalette(currentColor) === color) return;
      this.drawingTool.pushUndo();
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      logger.info(`color picked: ${color}`);
    },
    onChangedCurrentColor: function(idx) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();
      logger.info(`changed current color: ${idx}`);
    },
    onLoad: async function(t){
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
    extLoad: function(data) {
      this.drawingTool.load(data);
      this.drawingTool.render();
    },
    extMultiLoad: function(data) {
      this.pickPatterns = data;
    },
    onModalOpen: function() {
      const patStr = this.drawingTool.toString();
      this.qrCode = patStr;
    },
    closeQr: function() {
      this.qrCode = false;
    },
    pickPattern: function(p){
      this.extLoad(p);
      this.pickPatterns = false;
    },
    closePicks: function() {
      this.pickPatterns = false;
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

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Z'){
        this.drawingTool.redo();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'z'){
        this.drawingTool.undo();
        e.preventDefault();
        return;
      }
    });

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
