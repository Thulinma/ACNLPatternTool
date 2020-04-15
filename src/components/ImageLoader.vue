<template>
  <div>
    <Cropper
      :src="iiifUrl"
      :stencilProps="{ aspectRatio: getAspectRatio() }"
      :defaultPosition="defPos"
      :defaultSize="defSize"
      ref="cropper"
      @change="onCrop"
    />

    <!-- These are part of the rendering pipeline.  I think we could
    get rid of the preview one, but I don't know 100%, and it didn't seem
    worth the time to dig in. -->
    <canvas v-show="false" ref="preview" class="ImageLoader" />
    <canvas
      v-show="false"
      ref="postview"
      width="64"
      height="64"
      class="ImageLoader"
    />
    <canvas
      v-show="false"
      ref="postmix"
      class="postview ImageLoader"
      width="256"
      height="256"
    />
  </div>
</template>

<script>
import logger from "/utils/logger";
import { Cropper } from "vue-advanced-cropper";
import DrawingTool from "/libs/DrawingTool";

export default {
  name: "ImageLoader",
  components: {
    Cropper
  },
  props: {
    patternType: Number,
    iiifUrl: {
      type: String
    }
  },
  data: function() {
    return {
      convert_method: "quantize",
      convert_quality: "high",
      convert_trans: 50,
      convert_samepal: false,
      draw: new DrawingTool(),
      fileName: "",
      muralWide: 1,
      muralTall: 1,
      outputs: []
    };
  },
  mounted() {
    this.draw.patternType = this.patternType;
    this.draw.addCanvas(this.$refs.postview);
    if (localStorage.getItem("author_acnl")) {
      this.draw.authorStrict = localStorage.getItem("author_acnl");
    }
    //this.$refs.files.click();
  },
  methods: {
    defPos(opt) {
      return { top: 0, left: 0 };
    },
    defSize(opt) {
      return { height: opt.imageHeight, width: opt.imageWidth };
    },
    onCrop({ coordinates, canvas }) {
      if (!(canvas instanceof HTMLCanvasElement)) {
        return;
      }
      this.outputs = [];
      const iSize = this.draw.width;
      let oSize = this.draw.width;
      const pattAspect = this.muralWide / this.muralTall;
      if (pattAspect < 1) {
        while (oSize * this.muralTall < 256) {
          oSize += 32;
        }
      } else {
        while (oSize * this.muralWide < 256) {
          oSize += 32;
        }
      }

      this.$refs.preview.width = iSize * this.muralWide;
      this.$refs.preview.height = iSize * this.muralTall;
      this.$refs.postmix.width = oSize * this.muralWide;
      this.$refs.postmix.height = oSize * this.muralTall;
      const pmCtx = this.$refs.postmix.getContext("2d");
      pmCtx.imageSmoothingEnabled = false;

      //Scale to intended size
      const ctx = this.$refs.preview.getContext("2d");
      if (this.convert_quality != "sharp") {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = this.convert_quality;
      } else {
        ctx.imageSmoothingEnabled = false;
      }
      ctx.drawImage(
        canvas,
        0,
        0,
        iSize * this.muralWide,
        iSize * this.muralTall
      );

      //Create palette for all at once
      if (this.convert_samepal) {
        const imgdata = ctx.getImageData(
          0,
          0,
          iSize * this.muralWide,
          iSize * this.muralTall
        );
        switch (this.convert_method) {
          case "quantize":
            this.image_quantize(imgdata);
            break;
          case "rgb":
            this.image_rgb(imgdata);
            break;
          case "yuv":
            this.image_yuv(imgdata);
            break;
          case "grey":
            this.image_grey(imgdata);
            break;
          case "sepia":
            this.image_sepia(imgdata);
            break;
          case "keep":
            this.image_keep(imgdata);
            break;
          case "lowest":
            this.image_lowestdistance(imgdata);
            break;
        }
      }

      for (let x = 0; x < this.muralWide; x++) {
        for (let y = 0; y < this.muralTall; y++) {
          const imgdata = ctx.getImageData(iSize * x, iSize * y, iSize, iSize);
          //Create separate palettes
          if (!this.convert_samepal) {
            switch (this.convert_method) {
              case "quantize":
                this.image_quantize(imgdata);
                break;
              case "rgb":
                this.image_rgb(imgdata);
                break;
              case "yuv":
                this.image_yuv(imgdata);
                break;
              case "grey":
                this.image_grey(imgdata);
                break;
              case "sepia":
                this.image_sepia(imgdata);
                break;
              case "keep":
                this.image_keep(imgdata);
                break;
              case "lowest":
                this.image_lowestdistance(imgdata);
                break;
            }
          }

          //Set each pixel to the nearest color from the palette
          const pixelCount = this.draw.pixelCount * 4;
          for (let i = 0; i < pixelCount; i += 4) {
            let x = (i >> 2) % iSize;
            let y = Math.floor((i >> 2) / iSize);
            if (imgdata.data[i + 3] < this.convert_trans * 2.55) {
              this.draw.setPixel(x, y, 15);
            } else {
              this.draw.setPixel(x, y, [
                imgdata.data[i],
                imgdata.data[i + 1],
                imgdata.data[i + 2]
              ]);
            }
          }
          this.draw.title =
            this.fileName.substring(0, 16) + " " + (x + 1) + "x" + (y + 1);
          this.draw.onLoad();
          this.outputs.push(this.draw.toString());

          //Set postmix image segment
          pmCtx.drawImage(
            this.$refs.postview,
            0,
            0,
            64,
            64,
            oSize * x,
            oSize * y,
            oSize,
            oSize
          );
        }
      }
      this.$emit("converted", this.outputs);
    },
    //Sets the palette to the top-15 closest RGB colors
    image_rgb(imgdata) {
      let palette = [];
      for (let i = 0; i < 256; i++) {
        palette.push({ n: i, c: 0 });
      }
      const pixelCount = imgdata.data.length;
      for (let i = 0; i < pixelCount; i += 4) {
        if (imgdata.data[i + 3] < this.convert_trans * 2.55) {
          continue;
        }
        palette[
          this.draw.findRGB([
            imgdata.data[i],
            imgdata.data[i + 1],
            imgdata.data[i + 2]
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
        this.draw.setPalette(i, palette[i].n);
      }
    },
    //Sets the palette to the top-15 closest YUV colors
    image_yuv(imgdata) {
      let palette = [];
      for (let i = 0; i < 256; i++) {
        palette.push({ n: i, c: 0 });
      }
      const pixelCount = imgdata.data.length;
      for (let i = 0; i < pixelCount; i += 4) {
        if (imgdata.data[i + 3] < this.convert_trans * 2.55) {
          continue;
        }
        palette[
          this.draw.findYUV([
            imgdata.data[i],
            imgdata.data[i + 1],
            imgdata.data[i + 2]
          ])
        ].c++;
      }
      palette.sort(function(a, b) {
        if (a.c > b.c) {
          return -1;
        }
        if (a.c < b.c) {
          return 1;
        }
        return 0;
      });
      for (let i = 0; i < 15; i++) {
        this.draw.setPalette(i, palette[i].n);
      }
    },
    //Set palette to greyscale
    image_grey(imgdata) {
      for (let i = 0; i < 15; i++) {
        this.draw.setPalette(i, 0x10 * i + 0xf);
      }
    },
    //Set palette to sepia
    image_sepia(imgdata) {
      for (let i = 0; i < 9; i++) {
        this.draw.setPalette(i, 0x30 + i);
      }
      for (let i = 9; i < 15; i++) {
        this.draw.setPalette(i, 0x60 + i - 6);
      }
    },
    image_quantize(imgdata) {
      const pixelCount = imgdata.data.length;
      let pixels = [];
      for (let i = 0; i < pixelCount; i += 4) {
        if (imgdata.data[i + 3] < this.convert_trans * 2.55) {
          continue;
        }
        pixels.push({
          r: imgdata.data[i],
          g: imgdata.data[i + 1],
          b: imgdata.data[i + 2]
        });
      }
      const medianCut = pixels => {
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
      const medianMultiCut = buckets => {
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
      const pushAvg = b => {
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
          Math.round(b_avg / b.length)
        ];
        let idx = this.draw.findRGB(rgb);
        if (!uniqCol.has(idx)) {
          colors.push(idx);
          uniqCol.add(idx);
        }
      };

      //Average the insides for colors.
      for (let i in buckets) {
        pushAvg(buckets[i]);
      }
      logger.info("Unique colors: " + uniqCol.size);

      if (uniqCol.size < 15) {
        //We could add more colors. Quantize some more and cross fingers!
        buckets = medianMultiCut(buckets); //splits into 32
        for (let i in buckets) {
          pushAvg(buckets[i]);
        }
        logger.info("Unique colors after further quantize: " + uniqCol.size);
        if (uniqCol.size < 15) {
          buckets = medianMultiCut(buckets); //splits into 64
          for (let i in buckets) {
            pushAvg(buckets[i]);
          }
          logger.info("Unique colors after further quantize: " + uniqCol.size);
          if (uniqCol.size < 15) {
            buckets = medianMultiCut(buckets); //splits into 128
            for (let i in buckets) {
              pushAvg(buckets[i]);
            }
            logger.info(
              "Unique colors after further quantize: " + uniqCol.size
            );
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
        uniqCol = new Set(colors);
        logger.info(
          "Unique colors after merge of closest two: " + uniqCol.size
        );
      }

      //Set palette to chosen colors
      let cNum = 0;
      for (let c of uniqCol) {
        if (cNum > 14) {
          break;
        }
        logger.info("Setting color " + cNum + " to " + c);
        this.draw.setPalette(cNum, c);
        cNum++;
      }
    },
    image_lowestdistance(imgdata) {
      var palette = [];
      var prepixels = [];
      const pixelCount = imgdata.data.length;
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
        if (imgdata.data[i + 3] < this.convert_trans * 2.55) {
          continue;
        }
        myPal(i / 4, imgdata.data[i], imgdata.data[i + 1], imgdata.data[i + 2]);
      }
      palette.sort(function(a, b) {
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
        this.draw.setPalette(i, best_chosen[i]);
      }
    },
    // commenting out because this wasn't being used - the @change on cropper seemed to take care of it
    // processImage: function(e) {
    //   this.onCrop(this.$refs.cropper.getResult());
    // },

    getAspectRatio() {
      return this.muralWide / this.muralTall;
    }
  }
};
</script>

<style lang="scss">
canvas.ImageLoader {
  border: 1px solid gray;
}
.vue-advanced-cropper {
  max-width: 100% !important;
}
</style>
