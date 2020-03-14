<template v-for="i in 1">
  <div class="editor">
    <main>
      <div class="left">
        <div class="previews">
          <div class="2D">
            <canvas class="fordrawing" ref="canvas2" width="128" height="128"/>
            <canvas class="fordrawing" ref="canvas3" width="64" height="64"/>
          </div>
          <ThreeDRender :width="196" :height="300" :drawing-tool="drawingTool"/>
        </div>
      </div>

      <div class="center">
        <Palette
          ref="palette"
          :drawing-tool="drawingTool"
          v-on:changed-current-color="onChangedCurrentColor"/>
        <canvas class="fordrawing" ref="canvas1" width="512" height="512"/>
      </div>

      <div class="right">
        <div class="topbar-buttons">
          <button v-on:click="$refs.fileloader.open()">
            <object class="svg nav brown-circle" :data="scanSvg"></object>
            Scan QR / load file
            </button>
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

    <button v-on:click="onLocalSave">
      <object class="svg nav brown-circle" :data="storageAddSvg"></object>
      Save to storage
    </button>
    <button v-on:click="onPublish">
      <object class="svg nav brown-circle" :data="storageAddSvg"></object>
      Publish
    </button>
    <button v-on:click="onOpenDB">
      <object class="svg nav brown-circle" :data="storageSvg"></object>
      Open published DB
    </button>
    <button v-on:click="onOpenLocal">
      <object class="svg nav brown-circle" :data="storageSvg"></object>
      Open Storage
    </button>
    <button v-on:click="convertImage = true">
      <object class="svg nav brown-circle" :data="imageAddSvg"></object>
      Convert image
    </button>
    <button v-on:click="onModalOpen">
      <object class="svg nav brown-circle" :data="barcodeSvg"></object>
      Generate QR code(s)
    </button>
    <!-- <input class="downACNL" type="button" :value="$tc('editor.download')" v-on:click="downACNL" /> -->
    <button class="downACNL" :value="$tc('editor.download')" v-on:click="downACNL">
      <object class="svg nav white-circle" :data="saveSvg"></object>
      Download ACNL File
    </button>

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
        <button v-if="allowMoveToLocal" v-on:click="picksToLocal">Store all in local storage</button>
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
import * as API from '/libs/origin';
import logger from '/utils/logger';
import lzString from 'lz-string';
import { saveAs } from 'file-saver';
import saveSvg from '/assets/icons/bxs-save.svg';
import scanSvg from '/assets/icons/bx-scan.svg';
import userSvg from '/assets/icons/bx-user-circle.svg';
import paintSvg from '/assets/icons/bxs-paint.svg';
import paletteSvg from '/assets/icons/bxs-palette.svg';
import barcodeSvg from '/assets/icons/bx-barcode-reader.svg';
import imageAddSvg from '/assets/icons/bxs-image-add.svg';
import storageSvg from '/assets/icons/bxs-folder-open.svg';
import storageAddSvg from '/assets/icons/bxs-folder-plus.svg';

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
      allowMoveToLocal: true,
      convertImage: false,
      saveSvg,
      scanSvg,
      userSvg,
      paintSvg,
      paletteSvg,
      barcodeSvg,
      imageAddSvg,
      storageSvg,
      storageAddSvg,
    };
  },
  methods: {
    onPublish(){
      API.upload(btoa(this.drawingTool.toString()));
    },
    onOpenLocal(){
      let tmp = {};
      for (const i in localStorage){
        if (i.startsWith("acnl_")){
          tmp[i] = new DrawingTool(lzString.decompressFromUTF16(localStorage.getItem(i)));
        }
      }
      this.pickPatterns = tmp;
      this.allowMoveToLocal = false;
    },
    async onOpenDB(){
      this.$router.push("/browse");
    },
    onLocalSave(){
      localStorage.setItem("acnl_"+this.drawingTool.fullHash, lzString.compressToUTF16(this.drawingTool.toString()));
    },
    picksToLocal(){
      for (const i in this.pickPatterns){
        localStorage.setItem("acnl_"+this.pickPatterns[i].fullHash, lzString.compressToUTF16(this.pickPatterns[i].toString()));
      }
    },
    toolChange(newTool){
      this.drawingTool.drawHandler = newTool;
    },
    toolChangeAlt(newTool){
      this.drawingTool.drawHandlerAlt = newTool;
    },
    downACNL(){
      const blob = new Blob([this.drawingTool.toBytes()], {"type": "application/octet-stream"});
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

      const newHash = lzString.compressToEncodedURIComponent(patStr);
      const newPixHash = "#H:"+this.drawingTool.pixelHash;
      if (this.$router.currentRoute.hash !== "#" + newHash && this.$router.currentRoute.hash !== newPixHash) {
        //this.$router.push({ hash: newHash });
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
      this.allowMoveToLocal = true;
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
      const hash = this.$router.currentRoute.hash.substring(1);
      if (hash.startsWith("H:")){
        API.view(hash.substring(2)).then((r)=>{
          this.drawingTool.load(r);
        });
      }else{
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(hash));
      }
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

<style lang="scss" scoped>
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
  display: inline-flex;
  align-items: center;
}

input[type="button"].downACNL, button.downACNL {
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
  max-width:90%;
  max-height:90%;
  border-radius: 35px;
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

.svg {
  padding: 5px;
  pointer-events: none;
}

.svg.nav {
  border-radius: 100%;
  margin-right: 5px;
  height: 25px;
  width: 25px;
}

.svg.toolbar{
  height: 50px;
  width: 50px;
}

.svg.white-circle {
  background-color: #ffffff;
}

.svg.brown-circle {
  background-color: #7E7261;
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

canvas.fordrawing{
  background: repeating-linear-gradient(-45deg, #ddd, #ddd 5px, #fff 5px, #fff 10px);
}

</style>
