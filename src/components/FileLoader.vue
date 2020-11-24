<template>
    <input
      v-show="false"
      type="file"
      name="files"
      ref="files"
      :accept="accept"
      multiple
      @change="onFile"
    />
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";
import JSZip from "jszip";
import {
  BrowserQRCodeReader,
  ResultMetadataType,
  DecodeHintType,
} from "@zxing/library";

export default {
  name: "FileLoader",
  props: {
    fileType: {
      type: String,
      required: true,
      validator: function (value) {
        return ["image", "acnl", "acnh", "acpattern", "collection", null, undefined].includes(
          value
        );
      },
    },
  },
  data: function () {
    let accept = new Set();
    if (this.fileType === "image") accept.add("image/*");
    else if (this.fileType === "acnl") accept.add(".acnl");
    else if (this.fileType === "acnh") accept.add(".acnh");
    else if (this.fileType === "collection") {
      accept.add(".zip");
      accept.add(".dat");
    }
    else if (this.fileType === "acpattern") {
      accept.add(".acnl");
      accept.add(".acnh");
    }
    else {
      accept.add("image/*");
      accept.add(".acnl");
      accept.add(".acnh");
      accept.add(".dat");
      accept.add(".zip");
    }
    accept = [...accept].join(",");
    return {
      accept,
      currParity: 0,
      currDataBuffer: new Uint8Array(2160),
      currRead: [false, false, false, false],
    };
  },
  methods: {
    open() {
      this.$refs.files.click();
    },
    onFile: async function (e) {
      const results = {};
      const addResult = (r) => {
        const newPat = new DrawingTool();
        newPat.load(r);
        results[newPat.fullHash] = newPat;
      };
      const attemptFile = async (f, fName) => {
        if (fName.endsWith(".zip")) {
          let zip = await JSZip.loadAsync(f);
          for (const efName in zip.files) {
            const fileData = await zip.files[efName].async("blob");
            await attemptFile(fileData, efName.toLowerCase());
          }
        } else if (
          fName.endsWith(".png") ||
          fName.endsWith(".jpg") ||
          fName.endsWith(".jpeg") ||
          fName.endsWith(".gif") ||
          fName.endsWith(".bmp")
        ) {
          const iUrl = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {
              resolve(re.target.result);
            };
            fr.readAsDataURL(f);
          });
          const codeReader = new BrowserQRCodeReader();
          try {
            // check for multi-part qr code
            const hints = new Map();
            hints.set(DecodeHintType.TRY_HARDER, true);
            codeReader.hints = hints;
            const r = await codeReader.decodeFromImageUrl(iUrl);
            r.forEach((code) => {
              if (
                code.resultMetadata.has(
                  ResultMetadataType.STRUCTURED_APPEND_SEQUENCE
                ) &&
                code.resultMetadata.has(ResultMetadataType.BYTE_SEGMENTS)
              ) {
                let sequence_info = code.resultMetadata.get(
                  ResultMetadataType.STRUCTURED_APPEND_SEQUENCE
                );
                if ((sequence_info & 0x0f) != 3) {
                  // console.log('Multipart code is not 4 parts.');
                  return;
                }
                if (
                  this.currParity !=
                  code.resultMetadata.get(
                    ResultMetadataType.STRUCTURED_APPEND_PARITY
                  )
                ) {
                  console.log(
                    `Resetting parser: new multipart parity number ${
                      this.currParity
                    } -> ${code.resultMetadata.get(10)}`
                  );
                  this.currParity = code.resultMetadata.get(
                    ResultMetadataType.STRUCTURED_APPEND_PARITY
                  );
                  this.currRead = [false, false, false, false];
                }
                let currNum = sequence_info >> 4;
                console.log("Multipart code #" + currNum);
                if (!this.currRead[currNum]) {
                  const inArr = code.resultMetadata.get(
                    ResultMetadataType.BYTE_SEGMENTS
                  )[0];
                  const offset = currNum * 540;
                  for (let i = 0; i < 540 && i < inArr.byteLength; ++i) {
                    this.currDataBuffer[i + offset] = inArr[i];
                  }
                  this.currRead[currNum] = true;
                }
                if (
                  this.currRead[0] &&
                  this.currRead[1] &&
                  this.currRead[2] &&
                  this.currRead[3]
                ) {
                  addResult(this.currDataBuffer);
                  this.currRead = [false, false, false, false];
                }
                return;
              }
              addResult(
                code.resultMetadata.get(ResultMetadataType.BYTE_SEGMENTS)[0]
              );
            });
          } catch (err) {
            console.warn(err);
          }
        } else if (fName.endsWith(".acnl") || fName.endsWith(".acnh")) {
          const pattern = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {
              resolve(re.target.result);
            };
            fr.readAsArrayBuffer(f);
          });
          addResult(new Uint8Array(pattern));
        } else if (fName.endsWith(".dat")) {
          const pattern = await new Promise((resolve, reject) => {
            let fr = new FileReader();
            fr.onerror = () => {
              fr.abort();
              reject(new DOMException("Problem parsing input file."));
            };
            fr.onload = (re) => {
              resolve(re.target.result);
            };
            fr.readAsArrayBuffer(f);
          });

          if (pattern.byteLength == 11283104) {
            //ACNH decrypted save
            //50 regular patterns of 680 bytes each are stored in main.dat starting at offset 1930000
            //50 pro patterns of 2216 bytes each are stored in main.dat starting at offset 1964000
            //1 regular pattern (town flag) of 680 bytes in main.dat starting at offset 2074800
            //8 pro patterns (able sisters) of 2216 bytes each are stored in main.dat starting at offset 2075480
            for (let i = 0; i < 50; ++i) {
              addResult(new Uint8Array(pattern, 1930000 + 680 * i, 680));
            }
            for (let i = 0; i < 50; ++i) {
              addResult(new Uint8Array(pattern, 1964000 + 2216 * i, 2216));
            }
            addResult(new Uint8Array(pattern, 2074800, 680));
            for (let i = 0; i < 8; ++i) {
              addResult(new Uint8Array(pattern, 2075480 + 2216 * i, 2216));
            }
          } else if (pattern.byteLength == 522752) {
            //ACNL garden.dat
            for (let i = 0; i < 10; ++i) {
              addResult(new Uint8Array(pattern, 0xcc + 2160 * i, 2160));
            }
            for (let i = 0; i < 10; ++i) {
              addResult(new Uint8Array(pattern, 0x9fdc + 2160 * i, 2160));
            }
            for (let i = 0; i < 8; ++i) {
              addResult(
                new Uint8Array(pattern, 0x80 + 0x05c8b4 + 2160 * i, 2160)
              );
            }
          } else if (pattern.byteLength == 563968) {
            //ACNL garden_plus.dat
            for (let i = 0; i < 10; ++i) {
              addResult(new Uint8Array(pattern, 0xcc + 2160 * i, 2160));
            }
            for (let i = 0; i < 10; ++i) {
              addResult(new Uint8Array(pattern, 0x149cc + 2160 * i, 2160));
            }
            for (let i = 0; i < 8; ++i) {
              addResult(new Uint8Array(pattern, 0x62338 + 2160 * i, 2160));
            }
          }
        } else {
          console.warn("Unknown file type: " + fName);
        }
      };
      for (let i = 0; i < e.target.files.length; ++i) {
        await attemptFile(
          e.target.files[i],
          e.target.files[i].name.toLowerCase()
        );
      }
      console.log(results);
      console.log(
        "Read " + Object.keys(results).length + " patterns from files!"
      );
      const message = "No QR codes could be read from the image.";
      if (Object.keys(results).length === 0) window.alert(message);
      if (Object.keys(results).length == 1) {
        this.$emit("load", results[Object.keys(results)[0]]);
      }
      else if (Object.keys(results).length > 1) {
        this.$emit("multiload", [...Object.values(results)]); // note results is an object
      }
      this.$refs.files.value = null;
    },
  },
};
</script>