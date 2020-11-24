<template>
  <ModalContainer
    @modal-close="$emit('close')"
    @scroll-freeze="$emit('scroll-freeze')"
    @scroll-unfreeze="$emit('scroll-unfreeze')"
  >
    <template #window>
      <div
        :class="{
          'converter--window': true,
          cropping: state === states.cropping,
          adjusting: state === states.adjusting,
          saving: state === states.saving,
        }"
      >
        <CancelButton @click="$emit('close')" />
        <CroppingStage
          v-if="state === states.cropping"
          :dataURL="dataURL"
          @update:dataURL="dataURL = $event"
          :rows="rows"
          @update:filename="filename = $event"
          @update:rows="rows = $event"
          :columns="columns"
          @update:columns="columns = $event"
          @next="toAdjusting"
        />

        <AdjustingStage
          v-if="state === states.adjusting"
          :previewDataURL="previewDataURL"
          :isMural="isMural"
          :transparency="transparency"
          @update:transparency="updateTransparency"
          :saturation="saturation"
          @update:saturation="updateSaturation"
          :applySaturation="applySaturation"
          @update:applySaturation="updateApplySaturation"
          :conversionQuality="conversionQuality"
          @update:conversionQuality="updateConversionQuality"
          :isSplitPalette="isSplitPalette"
          @update:isSplitPalette="updateIsSplitPalette"
          :paletteSelectionMethod="paletteSelectionMethod"
          @update:paletteSelectionMethod="updatePaletteSelectionMethod"
          @prev="toCropping(false)"
          @next="toSaving"
        />

        <SavingStage
          :isMural="isMural"
          :previewDataURL="previewDataURL"
          :outputs="outputs"
          v-if="state === states.saving"
        />
      </div>
    </template>
  </ModalContainer>
</template>

<script>
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import CancelButton from "~/components/modals/CancelButton.vue";
import DrawingTool from "~/libs/DrawingTool";

import CroppingStage from "./Stages/Cropping.vue";
import AdjustingStage from "./Stages/Adjusting.vue";
import SavingStage from "./Stages/Saving.vue";
import { paletteSelectionMethods, conversionQualities } from "./Stages/enums";

// FINITE STATE MACHINE PATTERN
// ENUM STATES
const states = Object.freeze({
  cropping: 0,
  adjusting: 1,
  saving: 2, // avail only on non 1x1 patterns
});

export default {
  name: "ImageLoader",
  components: {
    CancelButton,
    ModalContainer,
    CroppingStage,
    AdjustingStage,
    SavingStage,
  },
  data: function () {
    const drawingTool = new DrawingTool();
    const drawingCanvas = document.createElement("canvas");
    drawingTool.addCanvas(drawingCanvas);
    const drawingContext = drawingCanvas.getContext("2d");

    const saturationCanvas = document.createElement("canvas");
    const saturationContext = saturationCanvas.getContext("2d");

    const mixingCanvas = document.createElement("canvas");
    const mixingContext = mixingCanvas.getContext("2d");

    const previewCanvas = document.createElement("canvas");
    const previewContext = previewCanvas.getContext("2d");

    return {
      states,
      started: false,
      state: states.cropping,

      dataURL: null,
      filename: null,
      rows: 1,
      columns: 1,

      // --- OPTIONS ---
      // retain full transparency
      transparency: 100, // range: [0, 100]
      saturation: 50, // range: [0, 100]
      applySaturation: false, // dont apply saturation automatically
      paletteSelectionMethod: paletteSelectionMethods.medianCut,
      conversionQuality: conversionQualities.high,
      // only shows up when rows and columns === 1
      isSplitPalette: true, // prioritize accuracy for murals

      // to be used by the drawingTool to generate preview
      drawingTool,
      drawingCanvas,
      drawingContext,
      // selected crop, keep this intact ALWAYS, need to this reapply adjustments
      // raw image crop width/height
      croppedCanvas: null,
      // saturation effect, pre-mid-process
      // raw image crop width/height
      saturationCanvas,
      saturationContext,
      // mid-process, holds the FINAL mixing result
      // downscaled using final mural width/height
      mixingCanvas,
      mixingContext,
      // use this to draw the final preview
      // downscaled using final mural width/height
      previewCanvas,
      previewContext,
      // to be passed to later stages for responsive previews
      previewDataURL: null,
      outputs: [],
    };
  },
  computed: {
    isMural() {
      return this.rows > 1 || this.columns > 1;
    },
  },
  props: ["sourcetool"],
  methods: {
    toCropping(forward = true) {
      this.state = states.cropping;
    },
    // state swapping (forward only)
    toAdjusting(croppedCanvas, forward = true) {
      if (croppedCanvas == null) return;
      if (this.dataURL == null) return;
      this.state = states.adjusting;
      if (!forward) return;
      this.croppedCanvas = croppedCanvas;
      this.updatePreviewDataURL();
    },
    toSaving(forward = true) {
      if (!this.isMural) {
        this.$emit("load", this.outputs[0]);
        this.$emit("close");
      }
      this.state = states.saving;
    },
    prev() {
      if (this.state < 0) this.state = 0;
      else this.state = this.state - 1;
    },
    updateSaturation(saturation) {
      this.saturation = saturation;
      this.updatePreviewDataURL();
    },
    updateApplySaturation(applySaturation) {
      this.applySaturation = applySaturation;
      this.updatePreviewDataURL();
    },
    updateTransparency(transparency) {
      this.transparency = transparency;
      this.updatePreviewDataURL();
    },
    updateConversionQuality(conversionQuality) {
      this.conversionQuality = conversionQuality;
      this.updatePreviewDataURL();
    },
    updateIsSplitPalette(isSplitPalette) {
      this.isSplitPalette = isSplitPalette;
      this.updatePreviewDataURL();
    },
    updatePaletteSelectionMethod(paletteSelectionMethod) {
      this.paletteSelectionMethod = paletteSelectionMethod;
      this.updatePreviewDataURL();
    },
    saturateImage() {
      const {
        croppedCanvas,
        saturationCanvas,
        saturationContext,
        saturation,
        applySaturation,
      } = this;

      saturationContext.drawImage(
        croppedCanvas,
        0,
        0,
        croppedCanvas.width,
        croppedCanvas.height
      );

      if (applySaturation) {
        saturationContext.globalCompositeOperation = `saturation`; // switch to saturation comp
        saturationContext.fillStyle = `hsl(0, ${saturation}%, 50%)`; // apply amount of saturation
        saturationContext.fillRect(
          0,
          0,
          saturationCanvas.width,
          saturationCanvas.height
        ); // apply the comp filter
        saturationContext.globalCompositeOperation = `source-over`; // restore default comp
      }
    },
    selectRGBPaletteFromImgData(imgData) {
      let palette = [];
      for (let i = 0; i < 256; i++) {
        palette.push({ n: i, c: 0 });
      }
      const pixelCount = imgData.data.length;
      for (let i = 0; i < pixelCount; i += 4) {
        if (imgData.data[i + 3] < this.transparency * 2.55) {
          continue;
        }
        palette[
          this.drawingTool.findRGB([
            imgData.data[i],
            imgData.data[i + 1],
            imgData.data[i + 2],
          ])
        ].c++;
      }
      palette.sort((a, b) => {
        if (a.c > b.c) {
          return -1;
        }
        if (a.c < b.c) {
          return 1;
        }
        return 0;
      });
      for (let i = 0; i < 15; i++) {
        this.drawingTool.setPalette(i, palette[i].n);
      }
    },
    selectYUVPaletteFromImgData(imgData) {
      let palette = [];
      for (let i = 0; i < 256; i++) {
        palette.push({ n: i, c: 0 });
      }
      const pixelCount = imgData.data.length;
      for (let i = 0; i < pixelCount; i += 4) {
        if (imgData.data[i + 3] < this.transparency * 2.55) {
          continue;
        }
        palette[
          this.drawingTool.findYUV([
            imgData.data[i],
            imgData.data[i + 1],
            imgData.data[i + 2],
          ])
        ].c++;
      }
      palette.sort(function (a, b) {
        if (a.c > b.c) {
          return -1;
        }
        if (a.c < b.c) {
          return 1;
        }
        return 0;
      });
      for (let i = 0; i < 15; i++) {
        this.drawingTool.setPalette(i, palette[i].n);
      }
    },
    selectMedianCutPaletteFromImgData(imgData) {
      const pixelCount = imgData.data.length;
      let pixels = [];
      for (let i = 0; i < pixelCount; i += 4) {
        if (imgData.data[i + 3] < this.transparency * 2.55) {
          continue;
        }
        pixels.push({
          r: imgData.data[i],
          g: imgData.data[i + 1],
          b: imgData.data[i + 2],
        });
      }
      const medianCut = (pixels) => {
        let l = Math.floor(pixels.length / 2);
        let r_min = null;
        let r_max = null;
        let g_min = null;
        let g_max = null;
        let b_min = null;
        let b_max = null;
        for (let i in pixels) {
          if (pixels[i].r < r_min || r_min === null) {
            r_min = pixels[i].r;
          }
          if (pixels[i].r > r_max || r_max === null) {
            r_max = pixels[i].r;
          }
          if (pixels[i].g < g_min || g_min === null) {
            g_min = pixels[i].g;
          }
          if (pixels[i].g > g_max || g_max === null) {
            g_max = pixels[i].g;
          }
          if (pixels[i].b < b_min || b_min === null) {
            b_min = pixels[i].b;
          }
          if (pixels[i].b > b_max || b_max === null) {
            b_max = pixels[i].b;
          }
        }
        let r_dist = r_max - r_min;
        let g_dist = g_max - g_min;
        let b_dist = b_max - b_min;
        if (r_dist >= g_dist && r_dist >= b_dist) {
          //Sort on red
          pixels.sort((a, b) => a.r - b.r);
        } else if (g_dist >= r_dist && g_dist >= b_dist) {
          //Sort on green
          pixels.sort((a, b) => a.g - b.g);
        } else {
          //Sort on blue
          pixels.sort((a, b) => a.b - b.b);
        }
        return [pixels.slice(0, l), pixels.slice(l)];
      };
      const medianMultiCut = (buckets) => {
        let res = [];
        for (let i in buckets) {
          const newBuck = medianCut(buckets[i]);
          if (newBuck[0].length) {
            res.push(newBuck[0]);
          }
          if (newBuck[1].length) {
            res.push(newBuck[1]);
          }
        }
        return res;
      };
      let buckets = medianCut(pixels); //creates 2 buckets
      buckets = medianMultiCut(buckets); //splits into 4
      buckets = medianMultiCut(buckets); //splits into 8
      buckets = medianMultiCut(buckets); //splits into 16

      //Now we have 16 buckets.
      let colors = [];
      let uniqCol = new Set();

      //Pushes average color of given bucket onto colors.
      const pushAvg = (b) => {
        let r_avg = 0;
        let g_avg = 0;
        let b_avg = 0;
        for (let i in b) {
          r_avg += b[i].r;
          g_avg += b[i].g;
          b_avg += b[i].b;
        }
        let rgb = [
          Math.round(r_avg / b.length),
          Math.round(g_avg / b.length),
          Math.round(b_avg / b.length),
        ];
        let idx = this.drawingTool.findRGB(rgb);
        if (!uniqCol.has(idx)) {
          colors.push(rgb);
          uniqCol.add(idx);
        }
      };

      //Average the insides for colors.
      for (let i in buckets) {
        pushAvg(buckets[i]);
      }
      // console.log("Unique colors: " + uniqCol.size);

      if (uniqCol.size < 15) {
        //We could add more colors. Quantize some more and cross fingers!
        buckets = medianMultiCut(buckets); //splits into 32
        for (let i in buckets) {
          pushAvg(buckets[i]);
        }
        // console.log("Unique colors after further quantize: " + uniqCol.size);
        if (uniqCol.size < 15) {
          buckets = medianMultiCut(buckets); //splits into 64
          for (let i in buckets) {
            pushAvg(buckets[i]);
          }
          // console.log("Unique colors after further quantize: " + uniqCol.size);
          if (uniqCol.size < 15) {
            buckets = medianMultiCut(buckets); //splits into 128
            for (let i in buckets) {
              pushAvg(buckets[i]);
            }
            // console.log(
            //   "Unique colors after further quantize: " + uniqCol.size
            // );
          }
        }
      } else if (uniqCol.size > 15) {
        //We have 16 colors (one for each bucket)
        //Find the closest two colors and merge them
        let minDist = 255 * 255 * 3;
        let bucketA = null;
        let bucketB = null;
        for (let i in colors) {
          for (let j in colors) {
            if (i >= j) {
              continue;
            }
            let rD = colors[i][0] - colors[j][0];
            let gD = colors[i][1] - colors[j][1];
            let bD = colors[i][2] - colors[j][2];
            let match = rD * rD + gD * gD + bD * bD;
            if (match < minDist || bucketA === null) {
              minDist = match;
              bucketA = i;
              bucketB = j;
            }
          }
        }
        //Merge bucket A and B into C
        let bucketC = buckets[bucketA].concat(buckets[bucketB]);
        colors.splice(bucketB); //Must remove B first, since B is guaranteed to be the latter entry
        colors.splice(bucketA); //Now we can remove A too, since it was before B and thus couldn't have shifted
        pushAvg(bucketC);
      }

      //Set palette to chosen colors
      let cNum = 0;
      for (let c of uniqCol) {
        if (cNum > 14) {
          break;
        }
        // console.log("Setting color " + cNum + " to " + c);
        this.drawingTool.setPalette(cNum, c);
        cNum++;
      }
    },
    selectGreyscalePaletteFromImgData(imgData) {
      for (let i = 0; i < 15; i++)
        this.drawingTool.setPalette(i, 0x10 * i + 0xf);
    },
    selectSepiaPaletteFromImgData(imgData) {
      for (let i = 0; i < 9; i++) this.drawingTool.setPalette(i, 0x30 + i);
      for (let i = 9; i < 15; i++) this.drawingTool.setPalette(i, 0x60 + i - 6);
    },
    selectPalette(imgData) {
      this.drawingTool.compatMode = this.sourcetool.compatMode;
      if (this.paletteSelectionMethod === paletteSelectionMethods.rgb)
        this.selectRGBPaletteFromImgData(imgData);
      else if (this.paletteSelectionMethod === paletteSelectionMethods.yuv)
        this.selectYUVPaletteFromImgData(imgData);
      else if (
        this.paletteSelectionMethod === paletteSelectionMethods.medianCut
      )
        this.selectMedianCutPaletteFromImgData(imgData);
      else if (
        this.paletteSelectionMethod === paletteSelectionMethods.greyscale
      )
        this.selectGreyscalePaletteFromImgData(imgData);
      else if (this.paletteSelectionMethod === paletteSelectionMethods.sepia)
        this.selectSepiaPaletteFromImgData(imgData);
    },
    updatePreviewDataURL() {
      const {
        drawingTool,
        croppedCanvas,
        drawingCanvas,
        drawingContext,
        saturationCanvas,
        saturationContext,
        mixingCanvas,
        mixingContext,
        previewCanvas,
        previewContext,
        filename,
        rows,
        columns,
        transparency,
        saturation,
        applySaturation,
        conversionQuality,
        isSplitPalette,
        paletteSelectionMethod,
        outputs,
      } = this;
      // reset outputs
      outputs.splice(0, outputs.length);

      // SUMMARY
      // croppedCanvas stays intact, always, result from cropper
      // saturationCanvas (to draw saturated cropped) =>
      // mixingCanvas (final mix result) =>
      // drawingCanvas (to draw invidual sections) =>
      // previewCanvas (to draw all sections pieced together);

      // SETUP ALL CANVASES FIRST
      saturationCanvas.width = croppedCanvas.width;
      saturationCanvas.height = croppedCanvas.height;
      saturationContext.clearRect(
        0,
        0,
        croppedCanvas.width,
        croppedCanvas.height
      );

      // The final pixelated size for the mural.
      const width = columns * drawingTool.width;
      const height = rows * drawingTool.width;

      mixingCanvas.width = width;
      mixingCanvas.height = height;
      mixingContext.clearRect(0, 0, width, height);

      previewCanvas.width = width;
      previewCanvas.height = height;
      previewContext.clearRect(0, 0, width, height);

      // make size match for drawing
      drawingCanvas.height = drawingTool.width * 4;
      drawingCanvas.width = drawingTool.width * 4;
      drawingContext.clearRect(
        0,
        0,
        drawingTool.width * 4,
        drawingTool.width * 4
      );
      drawingTool.render();

      // BEGIN PROCESSING
      // saturate the cropped image onto the saturation canvas
      this.saturateImage();

      // determine how to pixelate the image based on conversion quality
      if (conversionQuality !== conversionQuality.sharp) {
        mixingContext.imageSmoothingEnabled = true;
        if (conversionQuality === conversionQualities.high)
          mixingContext.imageSmoothingQuality = "high";
        else if (conversionQuality === conversionQualities.medium)
          mixingContext.imageSmoothingQuality = "medium";
        else if (conversionQuality === conversionQualities.low)
          mixingContext.imageSmoothingQuality = "low";
      } else mixingContext.imageSmoothingEnabled = false;

      // draws pixelated version from the saturation canvas (applies downscaling here)
      mixingContext.drawImage(
        saturationCanvas,
        0,
        0,
        saturationCanvas.width, // greater than
        saturationCanvas.height, // greater than
        0,
        0,
        width,
        height
      );

      // get image data to make palette from
      const imgData = mixingContext.getImageData(0, 0, width, height);

      // select palette
      if (!isSplitPalette) this.selectPalette(imgData);

      // draw each section onto the drawingCanvas after selecting colors
      // then take that image and piece it together with the preview
      for (let column = 0; column < columns; ++column) {
        for (let row = 0; row < rows; ++row) {
          const xOffset = column * drawingTool.width;
          const yOffset = row * drawingTool.width;

          // grab the section
          const sectionImgData = mixingContext.getImageData(
            xOffset, // x offset
            yOffset, // y offset
            drawingTool.width,
            drawingTool.width
          );

          // select palette based on this current section only
          if (isSplitPalette) this.selectPalette(sectionImgData);

          // palette is already selected
          // set pixel to nearest color from palette
          for (let sectionX = 0; sectionX < drawingTool.width; ++sectionX) {
            for (let sectionY = 0; sectionY < drawingTool.width; ++sectionY) {
              // compute imgDataOffset
              const sectionImgDataOffset =
                (sectionX + sectionY * sectionImgData.width) * 4;
              const r = sectionImgData.data[sectionImgDataOffset + 0];
              const g = sectionImgData.data[sectionImgDataOffset + 1];
              const b = sectionImgData.data[sectionImgDataOffset + 2];
              const a = sectionImgData.data[sectionImgDataOffset + 3];
              if (a < transparency * 2.55)
                drawingTool.setPixel(sectionX, sectionY, 15);
              else drawingTool.setPixel(sectionX, sectionY, [r, g, b]);
            }
          }

          if (this.isMural) {
            const x = column.toString().padStart(2, "0");
            const y = row.toString().padStart(2, "0");
            const newTitle = `${filename.substring(0, 15)} ${x}x${y}y`;
            drawingTool.title = newTitle;
          } else drawingTool.title = filename.substring(0, 21);
          drawingTool.fixIssues();
          outputs.push(drawingTool.toString());

          // apply changes to drawingCanvas which draws the section preview
          drawingContext.clearRect(0, 0, drawingTool.width, drawingTool.width);
          drawingTool.render();
          previewContext.imageSmoothingEnabled = false;
          // copy section from drawingCanvas to preview
          previewContext.drawImage(
            drawingCanvas,
            0,
            0,
            drawingTool.width * 4,
            drawingTool.width * 4,
            xOffset,
            yOffset,
            drawingTool.width,
            drawingTool.width
          );
        }
      }
      // update previewURL to use as <img/> and make resizable
      this.previewDataURL = previewCanvas.toDataURL("image/png", 1.0);
    },
    // update enums and adjusting to add support for this;
    selectLowestDistancePalette(imgData) {
      var palette = [];
      var prepixels = [];
      const pixelCount = imgData.data.length;
      for (let i = 0; i < 256; i++) {
        palette.push({ n: i, c: 0 });
      }
      function myPal(pixel, r, g, b) {
        var matches = {};
        var best = 16581375; //there's no worse best score
        var bestno = 0;
        for (let i = 0; i < 256; i++) {
          if (ACNLFormat.RGBLookup[i] === null) {
            continue;
          }
          let rgb = ACNLFormat.RGBLookup[i];
          var match =
            (rgb[0] - r) * (rgb[0] - r) +
            (rgb[1] - g) * (rgb[1] - g) +
            (rgb[2] - b) * (rgb[2] - b);
          if (match < best) {
            best = match;
            bestno = i;
          }
          matches[i.toString()] = match;
        }
        palette[bestno].c++;
        prepixels[pixel] = matches;
      }
      for (let i = 0; i < pixelCount; i += 4) {
        if (imgData.data[i + 3] < this.transparency * 2.55) {
          continue;
        }
        myPal(i / 4, imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]);
      }
      palette.sort(function (a, b) {
        if (a.c > b.c) {
          return -1;
        }
        if (a.c < b.c) {
          return 1;
        }
        return 0;
      });
      while (palette.length > 40) {
        palette.pop();
      }
      var best_chosen = [];
      var scor_chosen = 0x200000; //we can always do better than this
      alert(
        "Optimizing happens after you click ok - please stand by as this might take a while."
      );
      for (var z = 0; z < 4000 && palette.length > 16; z++) {
        var chosen_ones = [];
        //pick random colors out of the top 40
        while (chosen_ones.length < 15 && chosen_ones.length < palette.length) {
          var next = palette[Math.floor(Math.random() * palette.length)].n;
          if ($.inArray(next, chosen_ones) != -1) {
            continue;
          }
          chosen_ones.push(next);
        }
        //score this random selection
        var curr_score = 0;
        for (var p in prepixels) {
          var low_pixel = 750;
          for (var m in prepixels[p]) {
            if ($.inArray(parseInt(m), chosen_ones) == -1) {
              continue;
            }
            if (prepixels[p][m] < low_pixel) {
              low_pixel = prepixels[p][m];
            }
          }
          curr_score += low_pixel;
          if (curr_score >= scor_chosen) {
            break;
          }
        }
        if (curr_score < scor_chosen) {
          scor_chosen = curr_score;
          best_chosen = chosen_ones;
        }
      }

      for (let i = 0; i < 15 && i < best_chosen.length; i++) {
        this.drawingTool.setPalette(i, best_chosen[i]);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/screens";

.converter--window {
  box-sizing: border-box;
  @include relative-in-place;
  position: fixed;
  z-index: 999;
  background-color: $ecru-white;
  width: 100%;
  height: 100%;
  overscroll-behavior: contain;
  padding: 40px 30px 30px 30px;
  overflow: scroll;

  @include tablet-landscape {
    overflow: visible;
    padding: 0 0 0 0;
    @include absolute-center;
    width: auto;
    height: auto;
    border-radius: 40px;
  }
}
</style>
