<template>
  <div>
    <label for="files" >{{$tc('editor.load')}}</label>
    <input
      type="file"
      name="files"
      ref="files"
      accept="image/*,.acnl,.acnh,.dat,.zip"
      multiple
      @change="onFile" />
  </div>
</template>

<script>
import DrawingTool from '/libs/DrawingTool';
import JSZip from 'jszip';
import { BrowserQRCodeReader, ResultMetadataType, DecodeHintType } from '@zxing/library';
import logger from "/utils/logger";

function parseACNL(){
}



export default {
  name: "FileLoader",
  data: function() {return {
    currParity: 0,
    currDataBuffer: new Uint8Array(2160),
    currRead: [false, false, false, false]
  };},
  methods: {
    open(){
      this.$refs.files.click();
    },
    onFile: async function(e) {
      const results = {};
      const addResult = (r) => {
        const newPat = new DrawingTool();
        newPat.load(r);
        logger.info("Adding pattern: ", newPat);
        results[newPat.fullHash] = newPat;
      };
      const attemptFile = async (f, fName) => {
        if (fName.endsWith(".zip")){
          let zip = await JSZip.loadAsync(f);
          for (const efName in zip.files){
            const fileData = await zip.files[efName].async("blob");
            await attemptFile(fileData, efName.toLowerCase());
          }
        } else if (fName.endsWith(".png") || fName.endsWith(".jpg") || fName.endsWith(".jpeg") || fName.endsWith(".gif") || fName.endsWith(".bmp")){
          const iUrl = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {resolve(re.target.result);};
            fr.readAsDataURL(f);
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
                  addResult(this.currDataBuffer);
                  this.currRead = [false, false, false, false];
                }
                return;
              }
              addResult(code.resultMetadata.get(ResultMetadataType.BYTE_SEGMENTS)[0]);
            });
          }
          catch (err) {
            logger.warn(err);
          }
        } else if (fName.endsWith(".acnl") || fName.endsWith(".acnh")){
          const pattern = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {resolve(re.target.result);};
            fr.readAsArrayBuffer(f);
          });
          addResult(new Uint8Array(pattern));
        } else if (fName.endsWith(".dat")){
          const pattern = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {resolve(re.target.result);};
            fr.readAsArrayBuffer(f);
          });

          if (pattern.byteLength == 522752){
            //garden.dat
            for (let i = 0; i < 10; ++i){
              addResult(new Uint8Array(pattern, 0xCC+2160*i, 2160));
            }
            for (let i = 0; i < 10; ++i){
              addResult(new Uint8Array(pattern, 0x9FDC+2160*i, 2160));
            }
            for (let i = 0; i < 8; ++i){
              addResult(new Uint8Array(pattern, 0x80+0x05c8b4+2160*i, 2160));
            }
          }else if (pattern.byteLength == 563968){
            //garden_plus.dat
            for (let i = 0; i < 10; ++i){
              addResult(new Uint8Array(pattern, 0xCC+2160*i, 2160));
            }
            for (let i = 0; i < 10; ++i){
              addResult(new Uint8Array(pattern, 0x149CC+2160*i, 2160));
            }
            for (let i = 0; i < 8; ++i){
              addResult(new Uint8Array(pattern, 0x62338+2160*i, 2160));
            }
          }
        }else{
          logger.warn("Unknown file type: "+fName);
        }
      };
      for (let i = 0; i < e.target.files.length; ++i){
        await attemptFile(e.target.files[i], e.target.files[i].name.toLowerCase());
      }
      logger.info(results);
      logger.info("Read "+Object.keys(results).length+" patterns from files!");
      if (Object.keys(results).length == 1){
        this.$emit('qr-load', results[Object.keys(results)[0]]);
      }else if (Object.keys(results).length > 1){
        this.$emit('qr-multiload', results);
      }
      this.$refs.files.value = null;
    },
  }
}
</script>

<style lang="scss" scoped>
</style>
