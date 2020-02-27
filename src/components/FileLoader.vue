<template>
  <div>
    <label for="files" >Load ACNL file or QR code image:</label>
    <input
      type="file"
      name="files"
      id="files"
      multiple
      v-on:change="onFile" />
  </div>
</template>

<script>
import { BrowserQRCodeReader, BrowserQRCodeSvgWriter } from '@zxing/library';
import logger from "/utils/logger";

export default {
  name: "FileLoader",
  data: function() {return {};},
  methods: {
    onFile: function(e) {
      for (let i = 0; i < e.target.files.length; ++i){
        if (e.target.files[i].type && e.target.files[i].type.match('image.*')){
          var fr = new FileReader();
          fr.onload = (re) => {
            // image to decode from
            // this.$refs.decodeimg.src = re.target.result;
            this.decodeQR(re.target.result);
          }
          fr.readAsDataURL(e.target.files[i]);
        }
        else {
          var readNew = new FileReader();
          readNew.onload = (re) => {
            this.$emit('qr-load', re.target.result);
          }
          readNew.readAsArrayBuffer(e.target.files[i]);
        }
      }
    },
    decodeQR: async function(iUrl) {
      const codeReader = new BrowserQRCodeReader();
      try {
        // check for multi-part qr code
        const r = await codeReader.decodeFromImageUrl(iUrl);
        if (r.resultMetadata.has(9) && r.resultMetadata.has(10)) {
          let sequence_info = r.resultMetadata.get(9);
          if ((sequence_info & 0x0F) != 3) {
            logger.info('Multipart code is not 4 parts.');
            return;
          }
          if (this.currParity != r.resultMetadata.get(10)) {
            logger.info("Resetting parser: new code");
            this.currParity = r.resultMetadata.get(10);
            this.currRead = [false, false, false, false];
          }
          let currNum = (sequence_info >> 4);
          if (!this.currRead[currNum]) {
            const inArr = r.resultMetadata.get(2)[0];
            const offset = currNum * 540;
            for (let i = 0; i < 540 && i < inArr.byteLength; ++i) {
              this.currDataBuffer[i + offset] = inArr[i];
            }
            this.currRead[currNum] = true;
          }
          if (this.currRead[0]) {
            // && this.currRead[1] && this.currRead[2] && this.currRead[3]
            this.$emit('qr-load', this.currDataBuffer);
          }
          return;
        }
        this.$emit('qr-load', r.resultMetadata.get(2)[0]) // data bytes
      }
      catch (err) {
        throw err; // throw instead of log, get warning
      }
    }
  }
}
</script>

<style scoped>
</style>