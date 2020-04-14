<template>
  <div>
    <div class="cropper-container" v-show="isCropping">
      <button v-show="!fileLoaded" @click="tryAgain">Upload an Image File</button>
      <div class="outercropper"><Cropper :src="dataurl" :stencilProps="{aspectRatio: getAspectRatio()}" :defaultPositon="defPos" :defaultSize="defSize" ref="cropper" @change="onCrop" /></div>
      <div class="muralInputArea" :v-if="patternType == 9">
        <div class="muralInputColumn">
          <label>Patterns Wide</label><br/>
          <input type="range" min="1" max="8" v-model="muralWide"/>
          <input type="number" min="1" max="50" v-model="muralWide"/>
        </div>
        <div class="muralInputColumn">
          <label>Patterns Tall</label><br/>
          <input type="range" min="1" max="8" v-model="muralTall"/>
          <input type="number" min="1" max="50" v-model="muralTall"/>
        </div>
      </div>
      <div class="buttons">
        <button @click="toggleView()">Next</button>
      </div>
    </div>
    <input v-show="false" type="file" ref="files" accept="image/*" @change="onFile" />
    <div class="preview-and-options" v-show="!isCropping">
      <h3>Please select your conversion type.</h3>
      <div class="preview">
        <canvas v-show="false" ref="preview" />
        <canvas v-show="false" ref="postview" width=64 height=64 />
        <canvas ref="postmix" class="postview" width=256 height=256 />

        <ul class="options">
          <li :class="{active: convert_method === 'quantize'}" @click="changeConversion('quantize')">Quantize by Median-Cut</li>
          <li :class="{active: convert_method === 'rgb'}" @click="changeConversion('rgb')">Nearest RGB Colors</li>
          <li :class="{active: convert_method === 'yuv'}" @click="changeConversion('yuv')">Nearest YUV Colors</li>
          <li :class="{active: convert_method === 'grey'}" @click="changeConversion('grey')">To Greyscale</li>
          <li :class="{active: convert_method === 'sepia'}" @click="changeConversion('sepia')">To Sepia</li>
        </ul>
        <ul class="options">
          <li :class="{active: convert_quality === 'high'}" @click="changeQuality('high')">High Quality</li>
          <li :class="{active: convert_quality === 'medium'}" @click="changeQuality('medium')">Medium Quality</li>
          <li :class="{active: convert_quality === 'low'}" @click="changeQuality('low')">Low Quality</li>
          <li :class="{active: convert_quality === 'sharp'}" @click="changeQuality('sharp')">Sharp Pixels</li>
        </ul>
        <ul class="options">
          <label>Transparency %</label><br/>
          <input type="range" min="1" max="100" v-model="convert_trans" @change="changeTrans" />
          <input type="number" min="1" max="100" v-model="convert_trans" @change="changeTrans" />
        </ul>
        <ul class="options" :v-if="muralTall > 1 || muralWide > 1">
          <li :class="{active: convert_samepal === true}" @click="changeSamepal(true)">Shared palette</li>
          <li :class="{active: convert_samepal === false}" @click="changeSamepal(false)">Split palette</li>
        </ul>
      </div>
      <div class="buttons">
        <button @click="toggleView()">Edit Crop</button>
        <button @click="$emit('converted', outputs)">Convert!</button>
      </div>
    </div>
  </div>
</template>

<script>
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
      convert_method: "quantize",
      convert_quality: "high",
      convert_trans: 50,
      convert_samepal: false,
      draw: new DrawingTool(),
      isCropping: true,
      fileLoaded: false,
      fileName: "",
      muralWide: 1,
      muralTall: 1,
      outputs: []
    };
  },
  mounted(){
    this.draw.patternType = this.patternType;
    this.draw.addCanvas(this.$refs.postview);
    if (localStorage.getItem("author_acnl")){
      this.draw.authorStrict = localStorage.getItem("author_acnl");
    }
    this.$refs.files.click();
  },
  methods: {
    defPos(opt){
      return {top:0, left:0};
    },
    defSize(opt){
      return {height:opt.imageHeight, width:opt.imageWidth};
    },
    onCrop({coordinates, canvas}){
      if (!(canvas instanceof HTMLCanvasElement)){return;}
      this.outputs = [];
      const iSize = this.draw.width;
      let oSize = this.draw.width;
      const pattAspect = this.muralWide/this.muralTall;
      if (pattAspect < 1){
        while (oSize*this.muralTall < 256){oSize += 32;}
      }else{
        while (oSize*this.muralWide < 256){oSize += 32;}
      }

      this.$refs.preview.width = iSize*this.muralWide;
      this.$refs.preview.height = iSize*this.muralTall;
      this.$refs.postmix.width = oSize*this.muralWide;
      this.$refs.postmix.height = oSize*this.muralTall;
      const pmCtx = this.$refs.postmix.getContext('2d');
      pmCtx.imageSmoothingEnabled = false;

      //Scale to intended size
      const ctx = this.$refs.preview.getContext('2d');
      if (this.convert_quality != "sharp"){
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = this.convert_quality;
      }else{
        ctx.imageSmoothingEnabled = false;
      }
      ctx.drawImage(canvas, 0, 0,iSize*this.muralWide, iSize*this.muralTall);

      //Create palette for all at once
      if (this.convert_samepal){
        const imgdata = ctx.getImageData(0, 0, iSize*this.muralWide, iSize*this.muralTall);
        switch (this.convert_method){
          case "quantize": this.image_quantize(imgdata); break;
          case "rgb": this.image_rgb(imgdata); break;
          case "yuv": this.image_yuv(imgdata); break;
          case "grey": this.image_grey(imgdata); break;
          case "sepia": this.image_sepia(imgdata); break;
          case "keep": this.image_keep(imgdata); break;
          case "lowest": this.image_lowestdistance(imgdata); break;
        }
      }

      for(let x = 0; x < this.muralWide; x++) {
        for(let y = 0; y < this.muralTall; y++) {
          const imgdata = ctx.getImageData(iSize*x, iSize*y, iSize, iSize);
          //Create separate palettes
          if (!this.convert_samepal){
            switch (this.convert_method){
              case "quantize": this.image_quantize(imgdata); break;
              case "rgb": this.image_rgb(imgdata); break;
              case "yuv": this.image_yuv(imgdata); break;
              case "grey": this.image_grey(imgdata); break;
              case "sepia": this.image_sepia(imgdata); break;
              case "keep": this.image_keep(imgdata); break;
              case "lowest": this.image_lowestdistance(imgdata); break;
            }
          }

          //Set each pixel to the nearest color from the palette
          const pixelCount = this.draw.pixelCount*4;
          for (let i = 0; i < pixelCount; i+=4){
            let x = (i >> 2) % iSize;
            let y = Math.floor((i >> 2) / iSize);
            if (imgdata.data[i+3] < this.convert_trans*2.55){
              this.draw.setPixel(x, y, 15);
            }else{
              this.draw.setPixel(x, y, [imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]]);
            }
          }
          if (!x && !y){
            this.draw.title = this.fileName;
          }else{
            this.draw.title = this.fileName.substring(0, 16)+" "+(x+1)+"x"+(y+1);
          }
          this.draw.onLoad();
          this.outputs.push(this.draw.toString());

          //Set postmix image segment
          pmCtx.drawImage(this.$refs.postview, 0, 0, 64, 64, oSize*x, oSize*y, oSize, oSize);
        }
      }
    },
    //Sets the palette to the top-15 closest RGB colors
    image_rgb(imgdata){
      let palette = [];
      for (let i = 0; i < 256; i++){palette.push({n: i, c:0});}
      const pixelCount = imgdata.data.length;
      for (let i = 0; i < pixelCount; i+=4){
        if (imgdata.data[i+3] < this.convert_trans*2.55){continue;}
        palette[this.draw.findRGB([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]])].c++;
      }
      palette.sort((a, b) => {
        if (a.c > b.c){return -1;}
        if (a.c < b.c){return 1;}
        return 0;
      });
      for (let i = 0; i < 15; i++){this.draw.setPalette(i, palette[i].n);}
    },
    //Sets the palette to the top-15 closest YUV colors
    image_yuv(imgdata){
      let palette = [];
      for (let i = 0; i < 256; i++){palette.push({n: i, c:0});}
      const pixelCount = imgdata.data.length;
      for (let i = 0; i < pixelCount; i+=4){
        if (imgdata.data[i+3] < this.convert_trans*2.55){continue;}
        palette[this.draw.findYUV([imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]])].c++;
      }
      palette.sort(function(a, b){
        if (a.c > b.c){return -1;}
        if (a.c < b.c){return 1;}
        return 0;
      });
      for (let i = 0; i < 15; i++){this.draw.setPalette(i, palette[i].n);}
    },
    //Set palette to greyscale
    image_grey(imgdata){
      for (let i = 0; i < 15; i++){
        this.draw.setPalette(i, 0x10*i + 0xF);
      }
    },
    //Set palette to sepia
    image_sepia(imgdata){
      for (let i = 0; i < 9; i++){
        this.draw.setPalette(i, 0x30+i);
      }
      for (let i = 9; i < 15; i++){
        this.draw.setPalette(i, 0x60+i-6);
      }
    },
    image_quantize(imgdata){
      const pixelCount = imgdata.data.length;
      let pixels = [];
      for (let i = 0; i < pixelCount; i+=4){
        if (imgdata.data[i+3] < this.convert_trans*2.55){continue;}
        pixels.push({r:imgdata.data[i], g:imgdata.data[i+1], b:imgdata.data[i+2]});
      }
      const medianCut = (pixels) => {
        let l = Math.floor(pixels.length/2);
        let r_min = null; let r_max = null;
        let g_min = null; let g_max = null;
        let b_min = null; let b_max = null;
        for (let i in pixels){
          if (pixels[i].r < r_min || r_min === null){r_min = pixels[i].r;}
          if (pixels[i].r > r_max || r_max === null){r_max = pixels[i].r;}
          if (pixels[i].g < g_min || g_min === null){g_min = pixels[i].g;}
          if (pixels[i].g > g_max || g_max === null){g_max = pixels[i].g;}
          if (pixels[i].b < b_min || b_min === null){b_min = pixels[i].b;}
          if (pixels[i].b > b_max || b_max === null){b_max = pixels[i].b;}
        }
        let r_dist = r_max-r_min;
        let g_dist = g_max-g_min;
        let b_dist = b_max-b_min;
        if (r_dist >= g_dist && r_dist >= b_dist){
          //Sort on red
          pixels.sort((a,b)=>(a.r-b.r));
        }else if(g_dist >= r_dist && g_dist >= b_dist){
          //Sort on green
          pixels.sort((a,b)=>(a.g-b.g));
        }else{
          //Sort on blue
          pixels.sort((a,b)=>(a.b-b.b));
        }
        return [pixels.slice(0, l),pixels.slice(l)];
      };
      const medianMultiCut = (buckets) => {
        let res = [];
        for (let i in buckets){
          const newBuck = medianCut(buckets[i]);
          if (newBuck[0].length){res.push(newBuck[0]);}
          if (newBuck[1].length){res.push(newBuck[1]);}
        }
        return res;
      };
      let buckets = medianCut(pixels);//creates 2 buckets
      buckets = medianMultiCut(buckets);//splits into 4
      buckets = medianMultiCut(buckets);//splits into 8
      buckets = medianMultiCut(buckets);//splits into 16

      //Now we have 16 buckets.
      let colors = [];
      let uniqCol = new Set();

      //Pushes average color of given bucket onto colors.
      const pushAvg = (b) => {
        let r_avg = 0;
        let g_avg = 0;
        let b_avg = 0;
        for (let i in b){
          r_avg += b[i].r;
          g_avg += b[i].g;
          b_avg += b[i].b;
        }
        let rgb = [Math.round(r_avg/b.length), Math.round(g_avg/b.length), Math.round(b_avg/b.length)];
        let idx = this.draw.findRGB(rgb);
        if (!uniqCol.has(idx)){
          colors.push(idx);
          uniqCol.add(idx);
        }
      };

      //Average the insides for colors.
      for (let i in buckets){pushAvg(buckets[i]);}
      console.log("Unique colors: "+uniqCol.size);

      if (uniqCol.size < 15){
        //We could add more colors. Quantize some more and cross fingers!
        buckets = medianMultiCut(buckets);//splits into 32
        for (let i in buckets){pushAvg(buckets[i]);}
        console.log("Unique colors after further quantize: "+uniqCol.size);
        if (uniqCol.size < 15){
          buckets = medianMultiCut(buckets);//splits into 64
          for (let i in buckets){pushAvg(buckets[i]);}
          console.log("Unique colors after further quantize: "+uniqCol.size);
          if (uniqCol.size < 15){
            buckets = medianMultiCut(buckets);//splits into 128
            for (let i in buckets){pushAvg(buckets[i]);}
            console.log("Unique colors after further quantize: "+uniqCol.size);
          }
        }
      }else if (uniqCol.size > 15){
        //We have 16 colors (one for each bucket)
        //Find the closest two colors and merge them
        let minDist = 255*255*3;
        let bucketA = null;
        let bucketB = null;
        for (let i in colors){
          for (let j in colors){
            if (i >= j){continue;}
            let rD = (colors[i][0] - colors[j][0]);
            let gD = (colors[i][1] - colors[j][1]);
            let bD = (colors[i][2] - colors[j][2]);
            let match = (rD*rD + gD*gD + bD*bD);
            if (match < minDist || bucketA===null){
              minDist = match;
              bucketA = i;
              bucketB = j;
            }
          }
        }
        //Merge bucket A and B into C
        let bucketC = buckets[bucketA].concat(buckets[bucketB]);
        colors.splice(bucketB);//Must remove B first, since B is guaranteed to be the latter entry
        colors.splice(bucketA);//Now we can remove A too, since it was before B and thus couldn't have shifted
        pushAvg(bucketC);
        uniqCol = new Set(colors);
        console.log("Unique colors after merge of closest two: "+uniqCol.size);
      }

      //Set palette to chosen colors
      let cNum = 0;
      for (let c of uniqCol){
        if (cNum > 14){break;}
        console.log("Setting color "+cNum+" to "+c);
        this.draw.setPalette(cNum, c);
        cNum++;
      }
    },
    image_lowestdistance(imgdata){
      var palette = [];
      var prepixels = [];
      const pixelCount = imgdata.data.length;
      for (let i = 0; i < 256; i++){palette.push({"n":i, "c":0});}
      function myPal(pixel, r, g, b){
        var matches = {};
        var best = 16581375;//there's no worse best score
        var bestno = 0;
        for (let i = 0; i < 256; i++){
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
      for (let i = 0; i < pixelCount; i+=4){
        if (imgdata.data[i+3] < this.convert_trans*2.55){continue;}
        myPal(i/4, imgdata.data[i], imgdata.data[i+1], imgdata.data[i+2]);
      }
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

      for (let i = 0; i < 15 && i < best_chosen.length; i++){
        this.draw.setPalette(i, best_chosen[i]);
      }
    },
    onFile: async function(e) {
      this.dataurl = await new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onerror = () => {
          fr.abort();
          reject(new DOMException("Problem parsing input file."));
        };
        fr.onload = (re) => {resolve(re.target.result);};
        this.fileName = e.target.files[0].name;
        fr.readAsDataURL(e.target.files[0]);
      });
      this.fileLoaded = true;
    },
    changeConversion(val){
      this.convert_method = val;
      this.onCrop(this.$refs.cropper.getResult());
    },
    changeQuality(val){
      this.convert_quality = val;
      this.onCrop(this.$refs.cropper.getResult());
    },
    changeTrans(val){
      this.onCrop(this.$refs.cropper.getResult());
    },
    changeSamepal(val){
      this.convert_samepal = val;
      this.onCrop(this.$refs.cropper.getResult());
    },
    toggleView(){
      this.isCropping = !this.isCropping;
    },
    tryAgain(){
      this.$refs.files.click();
    },
    getAspectRatio() {
      return this.muralWide/this.muralTall;
    }
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
    border-radius: 20px;
  }
  .preview-and-options .buttons {
    display: flex;
    justify-content: space-between;
    min-width: 220px;
  }
  .outercropper{
    width:400px;
    height:400px;
  }
  .postview{
    background: repeating-linear-gradient(-45deg, #ddd, #ddd 5px, #fff 5px, #fff 10px);
  }


  .muralInputArea {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-content: space-between;
  }

  .muralInputColumn {
    flex: 50%;
    flex-direction: column;
    align-content: space-between;
    text-align: center;
  }

  .muralInputColumn * {
    text-align: center;
    width: 60%;
  }
</style>
