<template>
  <div>
    <label for="files" >{{$tc('editor.load')}}</label>
    <input
      type="file"
      name="files"
      id="files"
      multiple
      v-on:change="onFile" />
  </div>
</template>

<script>
import { BrowserQRCodeReader, ResultMetadataType, DecodeHintType } from '@zxing/library';
import logger from "/utils/logger";

export default {
  name: "FileLoader",
  data: function() {return {
    currParity: 0,
    currDataBuffer: new Uint8Array(2160),
    currRead: [false, false, false, false]
  };},
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
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        const r = await codeReader.decodeFromImageUrl(iUrl, hints);
        r.forEach(code => {
          if (code.resultMetadata.has(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE)
            && code.resultMetadata.has(ResultMetadataType.BYTE_SEGMENTS)){
            let sequence_info = code.resultMetadata.get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE);
            if ((sequence_info & 0x0F) != 3) {
              logger.info('Multipart code is not 4 parts.');
              return;
            }
            if (this.currParity != code.resultMetadata.get(ResultMetadataType.STRUCTURED_APPEND_PARITY)) {
              logger.info(`Resetting parser: new multipart parity number ${this.currParity} -> ${code.resultMetadata.get(10)}`);
              this.currParity = code.resultMetadata.get(ResultMetadataType.STRUCTURED_APPEND_PARITY);
              this.currRead = [false, false, false, false];
            }
            let currNum = (sequence_info >> 4);
            logger.info("Multipart code #"+currNum);
            if (!this.currRead[currNum]) {
              const inArr = code.resultMetadata.get(ResultMetadataType.BYTE_SEGMENTS)[0];
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
          this.$emit('qr-load', code.resultMetadata.get(ResultMetadataType.BYTE_SEGMENTS)[0]) // data bytes
        })
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
