<template>
  <div>
    <div class="cropper-container" v-show="isCropping">
      <Cropper :src="dataurl" :stencilProps="{aspectRatio: 1}" ref="cropper" @change="onCrop" />
      <button @click="toggleView()">Next</button>
    </div>
    <input v-show="false" type="file" ref="files" accept="image/*" v-on:change="onFile" />
    <div class="preview-and-options" v-show="!isCropping">
      <h3>Please select your conversion type.</h3>
      <div class="preview">
        <canvas v-show="false" ref="preview" />
        <canvas ref="postview" width=256, height=256 />

        <ul class="options">
          <li :class="{active: convert_method === 'rgb'}" @click="changeConversion('rgb')">Nearest RGB Colors</li>
          <li :class="{active: convert_method === 'yuv'}" @click="changeConversion('yuv')">Nearest YUV Colors</li>
          <li :class="{active: convert_method === 'grey'}" @click="changeConversion('grey')">To Greyscale</li>
          <li :class="{active: convert_method === 'sepia'}" @click="changeConversion('sepia')">To Sepia</li>
        </ul>
      </div>
      <div class="buttons">
        <button @click="toggleView()">Edit Crop</button>
        <button @click="$emit('converted', draw)">Convert!</button>
      </div>
    </div>
  </div>
</template>

<script>
import logger from "/utils/logger";
import { Cropper } from 'vue-advanced-cropper'
import DrawingTool from '/libs/DrawingTool';

export default {
  name: "ImageLoader",
  components:{
    Cropper
  },
  props:{
    patternType: Number,
  },
  data: function() {
    return {
      dataurl: "",
      convert_method: "rgb",
      draw: new DrawingTool(),
      isCropping: true,
    };
  },
  mounted(){
    this.draw.patternType = this.patternType;
    this.draw.addCanvas(this.$refs.postview);
    this.$refs.files.click();
  },
  methods: {
    onCrop({coordinates, canvas}){
      if (!(canvas instanceof HTMLCanvasElement)){return;}
      this.$refs.preview.width = this.draw.width;
      this.$refs.preview.height = this.draw.height;
      const ctx = this.$refs.preview.getContext('2d');
      ctx.drawImage(canvas, 0, 0,this.draw.width, this.draw.height);
      const imgdata = ctx.getImageData(0, 0, this.draw.width, this.draw.height);
      switch (this.convert_method){
        case "rgb": this.image_rgb(imgdata); break;
        case "yuv": this.image_yuv(imgdata); break;
        case "grey": this.image_grey(imgdata); break;
        case "sepia": this.image_sepia(imgdata); break;
        case "keep": this.image_keep(imgdata); break;
        case "lowest": this.image_lowestdistance(imgdata); break;
      }
    },
    //Sets the palette to the top-15 closest RGB colors
    image_rgb(imgdata){
      let palette = [];
      for (let i = 0; i < 256; i++){palette.push({n: i, c:0});}
      const pixelCount = this.draw.pixelCount * 4;
      for (let i = 0; i < pixelCount; i+=4){
        palette[this.draw.findRGB([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]])].c++;
      }
      palette.sort((a, b) => {
        if (a.c > b.c){return -1;}
        if (a.c < b.c){return 1;}
        return 0;
      });
      for (let i = 0; i < 15; i++){this.draw.setPalette(i, palette[i].n);}

      //Set each pixel to the nearest color from the palette
      for (let i = 0; i < pixelCount; i+=4){
        let x = (i >> 2) % this.draw.width;
        let y = Math.floor((i >> 2) / this.draw.width);
        this.draw.setPixel(x, y, [imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]);
      }
      this.draw.onLoad();
    },

    //Sets the palette to the top-15 closest YUV colors
    image_yuv(imgdata){
      let palette = [];
      for (let i = 0; i < 256; i++){palette.push({n: i, c:0});}
      let pixelCount = this.draw.pixelCount * 4;
      for (let i = 0; i < pixelCount; i+=4){
        palette[this.draw.findYUV([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]])].c++;
      }
      palette.sort(function(a, b){
        if (a.c > b.c){return -1;}
        if (a.c < b.c){return 1;}
        return 0;
      });
      for (let i = 0; i < 15; i++){this.draw.setPalette(i, palette[i].n);}

      //Set each pixel to the nearest color from the palette
      for (let i = 0; i < pixelCount; i+=4){
        let x = (i >> 2) % this.draw.width;
        let y = Math.floor((i >> 2) / this.draw.width);
        this.draw.setPixel(x, y, this.draw.findPalYUV([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]));
      }
      this.draw.onLoad();
    },

    //Set palette to greyscale
    image_grey(imgdata){
      for (var i = 0; i < 15; i++){
        this.draw.setPalette(i, 0x10*i + 0xF);
      }

      function TripleY(rgb){
        return [rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000, rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000,rgb[0] *  .299000 + rgb[1] *  .587000 + rgb[2] *  .114000];
      }
      //Set each pixel to the nearest color from the palette
      let pixelCount = this.draw.pixelCount * 4;
      for (let i = 0; i < pixelCount; i+=4){
        let x = (i >> 2) % this.draw.width;
        let y = Math.floor((i >> 2) / this.draw.width);
        this.draw.setPixel(x, y, TripleY([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]));
      }
      this.draw.onLoad();
    },

    //Set palette to sepia
    image_sepia(imgdata){
      for (var i = 0; i < 9; i++){
        this.draw.setPalette(i, 0x30+i);
      }
      for (var i = 9; i < 15; i++){
        this.draw.setPalette(i, 0x60+i-6);
      }

      //Set each pixel to the nearest color from the palette
      let pixelCount = this.draw.pixelCount * 4;
      for (let i = 0; i < pixelCount; i+=4){
        let x = (i >> 2) % this.draw.width;
        let y = Math.floor((i >> 2) / this.draw.width);
        this.draw.setPixel(x, y, [imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]);
      }
      this.draw.onLoad();
    },

    image_lowestdistance(imgdata){
      var palette = [];
      var prepixels = [];
      let pixelCount = this.draw.pixelCount * 4;
      for (var i = 0; i < 256; i++){palette.push({"n":i, "c":0});}
      function myPal(pixel, r, g, b){
        var matches = {};
        var best = 16581375;//there's no worse best score
        var bestno = 0;
        for (var i = 0; i < 256; i++){
          if (ACNLFormat.RGBLookup[i] === null){continue;}
          let rgb = ACNLFormat.RGBLookup[i];
          var match = (rgb[0] - r)*(rgb[0] - r) + (rgb[1] - g)*(rgb[1] - g) + (rgb[2] - b)*(rgb[2] - b);
          if (match < best){
            best = match;
            bestno = i;
          }
          matches[i.toString()] = match;
        }
        palette[bestno].c++;
        prepixels[pixel] = matches;
      };
      for (var i = 0; i < pixelCount; i+=4){myPal(i/4, imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]);}
      palette.sort(function(a, b){
        if (a.c > b.c){return -1;}
        if (a.c < b.c){return 1;}
        return 0;
      });
      while (palette.length > 40){palette.pop();}
      var best_chosen = [];
      var scor_chosen = 0x200000;//we can always do better than this
      alert("Optimizing happens after you click ok - please stand by as this might take a while.");
      for (var z = 0; z < 4000 && palette.length > 16; z++){
        var chosen_ones = [];
        //pick random colors out of the top 40
        while (chosen_ones.length < 15 && chosen_ones.length < palette.length){
          var next = palette[Math.floor(Math.random()*palette.length)].n;
          if ($.inArray(next, chosen_ones) != -1){continue;}
          chosen_ones.push(next);
        }
        //score this random selection
        var curr_score = 0;
        for (var p in prepixels){
          var low_pixel = 750;
          for (var m in prepixels[p]){
            if ($.inArray(parseInt(m), chosen_ones) == -1){continue;}
            if (prepixels[p][m] < low_pixel){low_pixel = prepixels[p][m];}
          }
          curr_score += low_pixel;
          if (curr_score >= scor_chosen){break;}
        }
        if (curr_score < scor_chosen){
          scor_chosen = curr_score;
          best_chosen = chosen_ones;
        }
      }

      for (var i = 0; i < 15 && i < best_chosen.length; i++){
        this.draw.setPalette(i, best_chosen[i]);
      }
      //Set each pixel to the nearest color from the palette
      for (let i = 0; i < pixelCount; i+=4){
        let x = (i >> 2) % this.draw.width;
        let y = Math.floor((i >> 2) / this.draw.width);
        this.draw.setPixel(x, y, [imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]);
      }
      this.draw.onLoad();
    },

    onFile: async function(e) {
      this.dataurl = await new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onerror = () => {
          fr.abort();
          reject(new DOMException("Problem parsing input file."));
        };
        fr.onload = (re) => {resolve(re.target.result);};
        fr.readAsDataURL(e.target.files[0]);
      });
    },

    changeConversion(val){
      this.convert_method = val;
      this.onCrop(this.$refs.cropper.getResult());
    },

    toggleView(){
      this.isCropping = !this.isCropping;
    },
  }
}
</script>

<style lang="scss" scoped>
  button {
    border-radius: 35px;
    text-transform: uppercase;
    padding: 10px 14px;
    border: none;
    background-color: #00B6A7;
    color: #ffffff;
    box-shadow: rgba(0,0,0,0.2) 0 0 8px;
    cursor: pointer;
    font-weight: 800;
  }
  canvas {
    border: 1px solid gray;
  }
  .cropper-container, .preview-and-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    min-height: 400px;
    color: #ffffff;
  }
  .cropper-container.hidden, .preview-and-options.hidden {
    display: none;
  }
  .cropper-container Cropper{
    width: 50%;
    height: 50%;
  }
  .cropper-container button {
    margin: 20px 0 0 0;
  }
  .preview-and-options .preview {
    display: flex;
    align-items: flex-start;
  }
  .preview-and-options .options {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-left: 20px;
  }
  .preview-and-options .options li{
    cursor: pointer;
    padding: 10px;
    min-width: 200px;
  }
  .preview-and-options .options li.active {
    background-color: teal;
  }
  .preview-and-options .buttons {
    display: flex;
    justify-content: space-between;
    min-width: 220px;
  }
</style>
