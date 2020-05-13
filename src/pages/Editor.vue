<template>
  <div class="editor">
    <main>
      <div id="left">
        <div class="previews">
          <div class="2D">
            <canvas class="fordrawing" ref="canvas2" width="128" height="128"/>
            <canvas class="fordrawing" ref="canvas3" width="64" height="64"/>
          </div><!-- flat canvases -->

          <PatternInfo
            @update="updatePatternData"
            :types="drawingTool.allTypes"
            :pattern-details="patternDetails"
          />

          <div class="render-preview">
            <ThreeDRender :width="196" :height="300" :drawing-tool="drawingTool"/>
          </div><!-- 3D preview -->
        </div>
      </div><!-- previews and pattern info -->

      <div id="center">
        <Palette
          ref="palette"
          :drawing-tool="drawingTool"
          @changed-current-color="onChangedCurrentColor"/>

        <ColorPicker
          ref="colorPickerMenu"
          :drawingTool="drawingTool"
          :acnlMode="acnlMode"
          @handler="colorPickerHandler"
          @color-picked="onColorPicked"
        />

        <canvas class="fordrawing" ref="canvas1" width="512" height="512"/>
      </div><!-- canvas and color palette -->

      <div id="right">
        <NavigationButton id="topbar-button"/><!-- navigation menu button -->

        <div class="tools-and-colors">
          <ToolSelector @newtool="toolChange" @newtoolalt="toolChangeAlt" /><!-- tool selection sidebar -->

          <div class="tool-buttons">
            <button id="scan-button" @click="$refs.fileloader.open()">
              <IconBase icon-name="scan" :icon-color="white" class="svg nav brown-circle">
                <IconScan />
              </IconBase><!-- scan svg -->
              Open ACNL File / Scan QR
            </button><!-- load file or scan qr button -->

            <button @click="colorPickerHandler">
              <IconBase icon-name="palette" :icon-color="brown" class="svg nav white-circle">
                <IconPalette />
              </IconBase><!-- palette svg full button -->
              Open Color Editor
            </button><!-- open palette button -->

            <button
              id="download-acnl"
              :value="$tc('editor.download')"
              @click="downACNL">
                <IconBase icon-name="save" :icon-color="teal" class="svg nav white-circle">
                  <IconSave />
                </IconBase><!-- save svg -->
                Save
            </button><!-- save acnl file button -->

            <button @click="onLocalSave">Store Locally</button><!-- store in local storage button -->

            <button @click="onOpenLocal">Open Storage</button><!-- open local storage button -->

            <button @click="downTex">Save Texture</button>

            <Publish
              @update="updatePatternData"
              :drawing-tool="drawingTool"
              :pattern-details="patternDetails"
            /><!-- publish pattern to database button -->

            <ConvertImage
              :drawing-tool="drawingTool"
              :type="patternDetails.patType"
            />
          </div><!-- side bar button -->
        </div><!-- tools and buttons container -->
      </div><!-- tools and buttons -->
    </main><!-- main editor parts -->

    <FileLoader v-show="false" ref="fileloader" @qr-load="extLoad" @qr-multiload="extMultiLoad" />

    <ModalContainer v-if="pickPatterns" @modal-close="closePicks">
      <div class="modal">
        <div class="modal-header">{{multiName}}</div>
        <div class="modal-window pattern-list">
          <button v-if="allowMoveToLocal" @click="picksToLocal">Store all in local storage</button>
          <button @click="zipPicksAsACNL">Download ACNL files as .zip file</button>
          <button @click="zipPicksAsPNG">Download QR codes as .zip file</button>
          <button @click="zipPicksAsBoth">Download ACNL+QR as .zip file</button>
          <br/>
          <IconGenerator
            v-for="(opt, idx) in pickPatterns"
            :key="idx"
            width=150 height=150 text="true" decoration="true"
            @pattclick="pickPattern"
            :pattern="opt" />
        </div>
      </div>
    </ModalContainer>
  </div>
</template>

<script>
import ACNLQRGenerator from '/components/ACNLQRGenerator.vue';
import IconGenerator from '/components/IconGenerator.vue';
import FileLoader from '/components/FileLoader.vue';
import ModalContainer from '/components/ModalContainer.vue';
import Palette from '/components/Palette.vue';
import ThreeDRender from '/components/ThreeDRender.vue';
import ToolSelector from '/components/ToolSelector.vue';


/* modals */
import ColorPicker from '/components/modals/ColorPicker.vue';
import ConvertImage from '/components/modals/ConvertImage.vue';
import PatternInfo from '/components/modals/PatternInfo.vue';
import Publish from '/components/modals/Publish.vue';

/* partials */
import NavigationButton from '/components/partials/NavigationButton.vue';

/* libs */
import DrawingTool from '/libs/DrawingTool';
import ACNLFormat from '/libs/ACNLFormat';
import ACNHFormat from '/libs/ACNHFormat';
import origin from '/libs/origin';
import generateACNLQR from "/libs/ACNLQRGenerator";
import lzString from 'lz-string';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

/* svg icons */
import IconBase from '/components/icons/IconBase.vue';
import IconPalette from '/components/icons/IconPalette.vue';
import IconPhone from '/components/icons/IconPhone.vue';
import IconSave from '/components/icons/IconSave.vue';
import IconScan from '/components/icons/IconScan.vue';

export default {
  name: 'Editor',
  components: {
    Palette,
    ThreeDRender,
    FileLoader,
    ACNLQRGenerator,
    IconGenerator,
    ModalContainer,
    NavigationButton,
    ToolSelector,
    ConvertImage,
    ColorPicker,
    PatternInfo,
    Publish,
    IconBase,
    IconPalette,
    IconPhone,
    IconSave,
    IconScan,
  },
  beforeRouteUpdate: function (to, from, next) {
    if (to.hash.length > 1) {
      if (to.hash.startsWith("#H:")){
        origin.view(to.hash.substring(3)).then((r)=>{
          this.drawingTool.load(r);
        });
        next();
        return;
      }
      let newHash = lzString.compressToEncodedURIComponent(this.drawingTool.toString());
      if (to.hash !== "#" + newHash) {
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(to.hash.substring(1)));
      }
    }
    next();
  },
  data: function() {
    return {
      drawingTool: new DrawingTool(),
      patternDetails: {
        patTitle: 'Empty',
        patAuthor: 'Unknown',
        patTown: 'Unknown',
        selectedTypes: [],
        selectedStyles: [],
        patType: 9,
      },
      storedAuthorHuman: false,
      fragment: "",
      patTypeName: "",
      pickPatterns: false,
      multiName: "Local Storage",
      allowMoveToLocal: true,
      origin,
      acnlMode: false,
      colorPicker: false,

      brown: '#7E7261',
      teal: '#57B7A8',
      orange: '#DC8D69',
      white: '#FFFFFF',
    };
  },
  methods: {
    colorPickerHandler(e, close=false) {
      if (this.drawingTool.currentColor !== 15) {
        const height = this.acnlMode ? 430 : 240;
        this.colorPicker = !this.colorPicker;
        if (close && this.colorPicker) this.colorPicker = false;
        this.$refs.colorPickerMenu.$el.style.height = `${((!this.colorPicker) ? 0 : height)}px`;
        return;
      }
      alert('This one has to stay transparent. :)');
    },
    updatePatternData(data) {
      console.log('hello!')
      this.patternDetails = {
        ...this.patternDetails,
        ...data,
      }
      // todo: can we make drawingTool accept an object and update all of these that way?
      const patTown = this.patternDetails.patTown;
      const patAuthor = this.patternDetails.patAuthor;
      this.drawingTool.title = this.patternDetails.patTitle;
      if (this.drawingTool.creator[0] !== patAuthor) this.drawingTool.creator = patAuthor;
      if (this.drawingTool.town[0] !== patTown) this.drawingTool.town = patTown;
      if (this.drawingTool.patternType !== this.patternDetails.patType) {
        this.drawingTool.patternType = this.patternDetails.patType;
        this.patTypeName = this.drawingTool.typeInfo.name;
      }
    },
    onOpenLocal() {
      this.closeColorPicker();
      let tmp = {};
      for (const i in localStorage){
        if (i.startsWith("acnl_")){
          tmp[i] = new DrawingTool(lzString.decompressFromUTF16(localStorage.getItem(i)));
        }
      }
      this.multiName = "Local Storage";
      this.pickPatterns = tmp;
      this.allowMoveToLocal = false;
    },
    zipPicksAsACNL() {
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        let ext = ".acnl";
        if (dt.pattern instanceof ACNHFormat){ext = ".acnh";}
        let title = dt.title + ext;
        let k = 1;
        while(titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ext;
          k++;
        }
        zip.file(title, dt.toBytes());
        titles.push(title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },
    async zipPicksAsPNG() {
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        const img = await generateACNLQR(dt);
        let title = dt.title + ".png";
        let k = 1;
        while(titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ".png";
          k++;
        }
        zip.file(title, img.substr(22), {base64:true});
        titles.push(title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },
    async zipPicksAsBoth() {
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        let ext = ".acnl";
        if (dt.pattern instanceof ACNHFormat){ext = ".acnh";}
        let ancl_title = dt.title + ext;
        let k = 1;
        while(titles.includes(ancl_title)) {
          ancl_title = dt.title + "(" + k + ")" + ext;
          k++;
        }
        const img_title = ancl_title.replace(ext, ".png");
        zip.file(ancl_title, dt.toBytes());
        const img = await generateACNLQR(dt);
        zip.file(img_title, img.substr(22), {base64:true});
        titles.push(ancl_title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },
    async downTex() {
      const img = this.$refs.canvas3.toDataURL("image/png");
      saveAs(img, this.drawingTool.title+"_texture.png");
    },
    async onOpenDB() {
      this.$router.push("/browse");
    },
    onLocalSave() {
      localStorage.setItem("acnl_"+this.drawingTool.fullHash, lzString.compressToUTF16(this.drawingTool.toString()));
    },
    picksToLocal() {
      for (const i in this.pickPatterns){
        localStorage.setItem("acnl_"+this.pickPatterns[i].fullHash, lzString.compressToUTF16(this.pickPatterns[i].toString()));
      }
    },
    toolChange(newTool) {
      this.drawingTool.drawHandler = newTool;
    },
    toolChangeAlt(newTool) {
      this.drawingTool.drawHandlerAlt = newTool;
    },
    downACNL() {
      const blob = new Blob([this.drawingTool.toBytes()], {"type": "application/octet-stream"});
      let ext = ".acnl";
      if (this.drawingTool.pattern instanceof ACNHFormat){ext = ".acnh";}
      saveAs(blob, this.drawingTool.title+ext);
    },
    onColorPicked: function(color) {
      const currentColor = this.drawingTool.currentColor;
      if (this.drawingTool.getPalette(currentColor) === color) return;
      this.drawingTool.pushUndo();
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      console.log(`color picked: ${color}`);
    },
    onChangedCurrentColor: function(idx) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();
      console.log(`changed current color: ${idx}`);
    },
    onLoad: async function(t) {
      let patStr = this.drawingTool.toString();
      this.patType = this.drawingTool.patternType;
      this.patTypeName = this.drawingTool.typeInfo.name;
      this.patTitle = this.drawingTool.title;
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];

      // need to wait 2 ticks before access ref in portal
      // AFTER setting isOpenModal to true
      // https://portal-vue.linusb.org/guide/caveats.html#provide-inject
      await this.$nextTick();
      await this.$nextTick();

      /*
      const newHash = lzString.compressToEncodedURIComponent(patStr);
      const newPixHash = "#H:"+this.drawingTool.pixelHash;
      if (this.$router.currentRoute.hash !== "#" + newHash && this.$router.currentRoute.hash !== newPixHash) {
        this.$router.push({ hash: newHash });
      }
      */
      return;
    },
    extLoad: function(data) {
      this.drawingTool.load(data);
    },
    extMultiLoad: function(data) {
      this.multiName = "Load which?";
      this.pickPatterns = data;
      this.allowMoveToLocal = true;
    },
    pickPattern: function(p) {
      this.extLoad(p);
      this.pickPatterns = false;
    },
    closePicks: function() {
      this.pickPatterns = false;
    },
    saveAuthor() {
      this.storedAuthorHuman = this.drawingTool.creator[0]+" / "+this.drawingTool.town[0];
      localStorage.setItem("author_acnl", this.drawingTool.authorStrict);
    },
    loadAuthor() {
      this.drawingTool.authorStrict = localStorage.getItem('author_acnl');
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];
    },
  },
  mounted: function() {
    if (localStorage.getItem('author_acnl')){
      this.drawingTool.authorStrict = localStorage.getItem('author_acnl');
      this.storedAuthorHuman = `${this.drawingTool.creator[0]} / ${this.drawingTool.town[0]}`;
    }
    this.drawingTool.addCanvas(this.$refs.canvas1, {grid:true});
    this.drawingTool.addCanvas(this.$refs.canvas2);
    this.drawingTool.addCanvas(this.$refs.canvas3);
    this.drawingTool.onLoad(this.onLoad);
    if (this.$router.currentRoute.hash.length > 1){
      const hash = this.$router.currentRoute.hash.substring(1);
      if (hash.startsWith("H:")) {
        origin.view(hash.substring(2)).then((r)=>{
          this.drawingTool.load(r);
        });
      } else {
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(hash));
      }
    }
    else{
      this.onLoad();
      this.drawingTool.render();
    }

    // todo: can make this more vue-like
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Z') {
        this.drawingTool.redo();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'z') {
        this.drawingTool.undo();
        e.preventDefault();
        return;
      }
    });
  },
}
</script>

<style lang="scss" scoped>
  $brown: #7E7261;
  $dark-brown: #4D3D36;
  $green: #5DBF98;
  $off-white: #F8F3E8;
  $orange: #DC8D69;
  $pink: #F4BFC6;
  $teal: #57B7A8;
  $white: #FFFFFF;
  $yellow: #F8CC61;

  button, input[type="button"] {
    background-color: $brown;
    border: none;
    border-radius: 35px;
    box-shadow: rgba(0,0,0,0.2) 0 0 8px;
    color: $off-white;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 10px 14px;

    &#download-acnl {
      background-color: $teal;
      color: $white;
    }
    &#edit-info-button {
      background-color: $green;
      color: $white;
      margin: 0 0 5px;
    }
    &#scan-button {
      background-color: $off-white;
      color: $brown;
      // width: 170px;
    }
    &.drawing-icon {
      background-color: transparent;
      border-radius: none;
      box-shadow: none;
      height: 100px;
      width: 100px;
    }
  }

  #topbar-button {
    display: inline-flex;
    align-items: center;
    justify-content: space-evenly;
    height: 62px;
  }

  main {
    display: flex;
    flex-direction: row;
    justify-content: center;

    #left, #center, #right {
      display: flex;
      flex-direction: column;
    }

    #left {
      padding-right: 40px;
    }

    #center canvas, #left canvas {
      box-shadow: 0px 12px 12px -3px rgba(0,0,0,0.3);
    }
  }

  .svg {
    padding: 5px;
    pointer-events: none;

    &.nav {
      border-radius: 100%;
      margin-right: 5px;
      height: 25px;
      width: 25px;
    }
    &.toolbar{
      height: 50px;
      width: 50px;
    }
    &.white-circle {
      background-color: $white;
    }
    &.brown-circle {
      background-color: $brown;
    }
  }

  .previews {
    display: inline-flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 62px;
    height: 512px;
  }

  .tools-and-colors {
    height: 512px;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    border-radius: 0 35px 35px 0;
    background-color: $pink;
  }

  .tool-buttons {
    display: inline-flex;
    flex-direction: column;
    align-items: right;

    button{
      margin: 5px;
    }
  }

  canvas.fordrawing {
    background: repeating-linear-gradient(-45deg, #ddd, #ddd 5px, #fff 5px, #fff 10px);
  }

  .render-preview {
    border: 3px solid $brown;
    width: 196px;
    height: 300px;
    border-radius: 5px;
  }
</style>