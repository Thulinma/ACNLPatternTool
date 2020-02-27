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
    <label for="files" style="color:white;">Load ACNL file or QR code image:</label>
    <input type="file" name="files" id="files" multiple v-on:change="onFile">
    <!-- <img ref="decodeimg"> -->
    <div style="background-color:white;" ref="qrholder"></div>
  </div>
</template>

<script>
import ColorPicker from "/components/ColorPicker.vue";
import Palette from "/components/Palette.vue";
import ThreeDRender from "/components/ThreeDRender.vue";
import DrawingTool from "/libs/DrawingTool";
import logger from "/utils/logger";
import lzString from 'lz-string';

import { BrowserQRCodeReader, BrowserQRCodeSvgWriter } from '@zxing/library';

export default {
  name: "Editor",
  components: {
    ColorPicker,
    Palette,
    ThreeDRender
  },
  beforeRouteUpdate (to, from, next) {
    if (to.hash.length > 1){
      let newHash = lzString.compressToEncodedURIComponent(this.drawingTool.toString());
      if (to.hash != "#"+newHash){
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(to.hash.substring(1)));
      }
    }
    next();
  },
  data: function() {
    return {
      drawingTool: new DrawingTool(),
      fragment: "",
      currParity: 0,
      currDataBuffer: new Uint8Array(2160),
      currRead: [false, false, false, false]
    };
  },
  methods: {
    onColorPicked: function(color) {
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      this.$refs.palette.palChange();
    },
    onChangedCurrentColor: function(idx) {
      this.drawingTool.currentColor = idx;
      this.$refs.colorPicker.forceCheck();
    },
    tryQRDecode(iUrl){
      const codeReader = new BrowserQRCodeReader();
      const result = codeReader.decodeFromImageUrl(iUrl).then((r) => {
        console.log(r);
        //Check for multi-part code
        if (r.resultMetadata.has(9) && r.resultMetadata.has(10)){
          let sequence_info = r.resultMetadata.get(9);
          if ((sequence_info & 0x0F) != 3){
            console.log("Multipart code is not 4 parts");
            return;
          }
          if (this.currParity != r.resultMetadata.get(10)){
            console.log("Resetting parser: new code");
            this.currParity = r.resultMetadata.get(10);
            this.currRead = [false, false, false, false];
          }
          let currNum = (sequence_info >> 4);
          if (!this.currRead[currNum]){
            const inArr = r.resultMetadata.get(2)[0];
            const offset = currNum*540;
            for (let i = 0; i < 540 && i < inArr.byteLength; ++i){
              this.currDataBuffer[i + offset] = inArr[i];
            }
            this.currRead[currNum] = true;
          }
          if (this.currRead[0]){// && this.currRead[1] && this.currRead[2] && this.currRead[3]){
            this.drawingTool.load(this.currDataBuffer);//data bytes
          }
          return;
        }
        this.drawingTool.load(r.resultMetadata.get(2)[0]);//data bytes
        this.drawingTool.render();
      }).catch((r) => {
        console.log("Decode failed");
        //Stupid attempt to help codes scan - didn't work.
        //this.$refs.decodeimg.width += 5;
        //setTimeout(this.tryQRDecode, 100);
      });
    },
    onFile: function(e){
      for (let i = 0; i < e.target.files.length; ++i){
        if (e.target.files[i].type && e.target.files[i].type.match('image.*')){
          var r = new FileReader();
          r.onload = (re) => {
            //this.$refs.decodeimg.src = re.target.result;
            this.tryQRDecode(re.target.result);
          }
          r.readAsDataURL(e.target.files[i]);
        }else{
          var readNew = new FileReader();
          readNew.onload = (re) => {this.drawingTool.load(re.target.result);}
          readNew.readAsArrayBuffer(e.target.files[i]);
        }
      }
    },
    onLoad: function(t){
      this.$refs.palette.palChange();
      this.$refs.colorPicker.forceCheck();
      let patStr = this.drawingTool.toString();
      let newHash = lzString.compressToEncodedURIComponent(patStr);
      if (this.$router.currentRoute.hash != "#"+newHash){
        this.$router.push({hash:newHash});
      }
      //let writer = new BrowserQRCodeSvgWriter();
      //writer.writeToDom(this.$refs.qrholder, patStr, 300, 300);
    }
  },
  mounted: function() {
    this.drawingTool.addCanvas(this.$refs.canvas1, {grid:true});
    this.drawingTool.addCanvas(this.$refs.canvas2);
    this.drawingTool.addCanvas(this.$refs.canvas3);
    this.drawingTool.onLoad(this.onLoad);
    if (this.$router.currentRoute.hash.length > 1){
      this.drawingTool.load(lzString.decompressFromEncodedURIComponent(this.$router.currentRoute.hash.substring(1)));
    }else{
      this.drawingTool.render();
    }
  }
}
</script>

<style scoped>
.editor {
  user-select: none;
}
</style>
