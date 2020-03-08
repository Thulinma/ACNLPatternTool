<template v-for="i in 1">
  <div class="editor">
    <main>
      <div class="left">
        <div class="previews">
          <div class="2D">
            <canvas ref="canvas2" width="128" height="128"/>
            <canvas ref="canvas3" width="64" height="64"/>
          </div>
          <ThreeDRender :width="196" :height="300" :drawing-tool="drawingTool"/>
        </div>
      </div>

      <div class="center">
        <Palette
          ref="palette"
          :drawing-tool="drawingTool"
          v-on:changed-current-color="onChangedCurrentColor"/>
        <canvas ref="canvas1" width="512" height="512"/>
      </div>
      
      <div class="right">
        <div class="topbar-buttons">
          <button v-on:click="$refs.fileloader.open()">Scan QR / load file</button>
          <FileLoader v-show="false" ref="fileloader" v-on:qr-load="extLoad" v-on:qr-multiload="extMultiLoad"  />
        </div>
        <div class="tools-and-colors">
          <ToolSelector v-on:newtool="toolChange" v-on:newtoolalt="toolChangeAlt" />
          <ColorPicker
            ref="colorPicker"
            v-bind:drawing-tool="drawingTool"
            v-on:color-picked="onColorPicked"/>
        </div>
      </div>
    </main>

    <button v-on:click="convertImage = true">Convert image</button>
    <button>Open Storage</button>
    <input class="downACNL" type="button" :value="$tc('editor.download')" v-on:click="downACNL" />
    <button v-on:click="onModalOpen">Generate QR code(s)</button>

    <ModalContainer
      v-if="qrCode"
      v-on:modal-close="closeQr">
      <div class="modal-window">
        <ACNLQRGenerator :pattern="qrCode" />
      </div>
    </ModalContainer>

    <ModalContainer
      v-if="pickPatterns"
      v-on:modal-close="closePicks">
      <div class="modal-window pattern-list">
        <IconGenerator
          v-for="(opt, idx) in pickPatterns"
          :key="idx"
          v-on:pattclick="pickPattern"
          :pattern="opt" />
      </div>
    </ModalContainer>

    <ModalContainer
      v-if="convertImage"
      v-on:modal-close="convertImage = false">
      <div class="modal-window">
        <ImageLoader :pattern-type="pattType" @converted="onConvert" />
      </div>
    </ModalContainer>
  </div>
</template>

<script>
import ColorPicker from '/components/ColorPicker.vue';
import Palette from '/components/Palette.vue';
import ThreeDRender from '/components/ThreeDRender.vue';
import FileLoader from '/components/FileLoader.vue';
import ImageLoader from '/components/ImageLoader.vue';
import ACNLQRGenerator from '/components/ACNLQRGenerator.vue';
import IconGenerator from '/components/IconGenerator.vue';
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
    ImageLoader,
    ACNLQRGenerator,
    IconGenerator,
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
      pattType: 9,
      pickPatterns: false,
      convertImage: false,
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
      this.pattType = this.drawingTool.patternType;

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
    },
    onConvert: function(sourceTool){
      let pixelCount = sourceTool.pixelCount * 4;
      for (let i = 0; i < pixelCount; i++){this.drawingTool.pixels[i] = sourceTool.pixels[i];}
      for (let i = 0; i < 15; i++){this.drawingTool.setPalette(i, sourceTool.getPalette(i));}
      this.convertImage = false;
      this.drawingTool.onColorChange();
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
button, input[type="button"] {
  border-radius: 35px;
  text-transform: uppercase;
  padding: 10px 14px;
  border: none;
  background-color: #eff1d8;
  color: #7e7261;
  box-shadow: rgba(0,0,0,0.2) 0 0 8px;
  cursor: pointer;
  font-weight: 800;
}

input[type="button"].downACNL {
  background-color: #57b7a8;
  color: #ffffff;
}

.editor {
  user-select: none;
  color: #7e7261;
}

.modal-window {
  position: fixed;
  top: 50%;
  left: 50%;
  padding: 10px;
  transform: translate(-50%, -50%);
  background-color: #e28e8e;
}

.pattern-list {
  width:80%;
  height:80%;
  overflow:scroll;
}

.topbar-buttons {
  display: inline-flex;
  align-items: center;
  justify-content: space-evenly;
  height: 62px;
}

main {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

main .left, .center, .right {
  display: flex;
  flex-direction: column;
}

main .left {
  padding-right: 40px;
}

main .center canvas, main .left canvas {
  box-shadow: 0px 12px 12px -3px rgba(0,0,0,0.3);
}

.previews {
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 62px;
  height: 512px;
}

.tools-and-colors {
  height: 512px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  border-radius: 0 35px 35px 0;
  background-color: #f1b5c1;
}
</style>
