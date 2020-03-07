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
    onFile: async function(e) {
      const results = [];
      for (let i = 0; i < e.target.files.length; ++i){
        if (e.target.files[i].type && e.target.files[i].type.match('image.*')){
          const iUrl = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {resolve(re.target.result);};
            fr.readAsDataURL(e.target.files[i]);
          });
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
                if (this.currRead[0] && this.currRead[1] && this.currRead[2] && this.currRead[3]){
                  results.push(new Uint8Array(this.currDataBuffer));
                  this.currRead = [false, false, false, false];
                }
                return;
              }
              results.push(code.resultMetadata.get(ResultMetadataType.BYTE_SEGMENTS)[0]);
            });
          }
          catch (err) {
            console.warn(err);
          }
        } else {
          const pattern = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {resolve(re.target.result);};
            fr.readAsArrayBuffer(e.target.files[i]);
          });
          results.push(pattern);
        }
      }
      logger.info("Read "+results.length+" patterns from files!");
      if (results.length == 1){
        this.$emit('qr-load', results[0]);
      }else if (results.length > 1){
        this.$emit('qr-multiload', results);
      }
    },
  }
}
</script>

<style scoped>
</style>
