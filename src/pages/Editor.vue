<template v-for="i in 1">
  <div class="editor">
    <main>
      <div class="left">
        <div class="previews">
          <div class="2D">
            <canvas class="fordrawing" ref="canvas2" width="128" height="128"/>
            <canvas class="fordrawing" ref="canvas3" width="64" height="64"/>
            <div class="pattern-info">
              <div class="pattern_title">{{patTitle}}</div>
              <div class="pattern_author">by {{patAuthor}}</div> 
              <div class="pattern_town">from {{patTown}}</div>
              <div class="pattern_typename">{{patTypeName}}</div>
            </div>
            <button class="editInfo" @click="patInfoModal=true">Change</button>
          </div>
          <div class="render-preview">
            <ThreeDRender :width="196" :height="300" :drawing-tool="drawingTool"/>
          </div>
        </div>
      </div>

      <div class="center">
        <Palette
          ref="palette"
          :drawing-tool="drawingTool"
          @changed-current-color="onChangedCurrentColor"/>
        <canvas class="fordrawing" ref="canvas1" width="512" height="512"/>
        <div class="colorPicker-menu" ref="colorPickerMenu">
          <ColorPicker
            ref="colorPicker"
            :drawing-tool="drawingTool"
            @color-picked="onColorPicked"/>
            <button @click="closeColorPicker">Close Menu</button>
        </div>
      </div>

      <div class="right">
        <div class="topbar-buttons">
          <button class="menu-button" @click="onMainMenu">
            <object class="svg nav white-circle" :data="phoneSvg"></object>
            Menu
            <object class="svg-small" :data="downArrowSvg"></object>
          </button>
        </div>
        <div class="tools-and-colors">
          <ToolSelector @newtool="toolChange" @newtoolalt="toolChangeAlt" />
          <div class="tool-buttons">
            <button @click="openColorPicker">
              <object class="svg nav brown-circle" :data="paletteSvg"></object>
              Open Color Editor
            </button>
            <button @click="convertImage=true;closeColorPicker()">
              <object class="svg nav brown-circle" :data="imageAddSvg"></object>
              Convert
            </button>
            <button @click="$refs.fileloader.open()">
                <object class="svg nav brown-circle" :data="scanSvg"></object>
                Load file / code
            </button>
            <FileLoader v-show="false" ref="fileloader" @qr-load="extLoad" @qr-multiload="extMultiLoad"  />
            <button class="downACNL" :value="$tc('editor.download')" @click="downACNL">
              <object class="svg nav white-circle" :data="saveSvg"></object>
              Save
              <!-- <object class="svg-small" :data="upArrowSvg"></object> -->
            </button>
            <button @click="onOpenLocal();closeColorPicker()">Open Storage</button>
            <button @click="publishModal=true;closeColorPicker();">Publish</button>
            <button @click="onLocalSave();closeColorPicker();">Store Locally</button>
            <button @click="onQROpen();closeColorPicker();">
              <object class="svg nav brown-circle" :data="barcodeSvg"></object>
              Generate QR Code
            </button>
          </div>
        </div>
      </div>
    </main>

    <ModalContainer v-if="qrCode" @modal-close="qrCode=false">
      <div class="modal">
        <div class="modal-header">
          <object class="svg nav" :data="barcodeSvg"></object>
          Generate QR Code(s)
        </div>
        <div class="modal-window modal-centered">
          <ACNLQRGenerator :pattern="qrCode" />
          <button @click="downPNG">Save image</button>
        </div>
      </div>
    </ModalContainer>

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

    <ModalContainer v-if="convertImage" @modal-close="convertImage=false">
      <div class="modal">
        <div class="modal-header">
          <object class="svg nav" :data="imageAddSvg"></object>
          Convert Image
        </div>
        <ImageLoader class="modal-window" :pattern-type="patType" @converted="onConvert" />
      </div>
    </ModalContainer>

    <ModalContainer v-if="patInfoModal" @modal-close="patInfoSave">
      <div class="modal">
        <div class="modal-header">
          Edit Pattern Details
        </div>
        <div class="modal-window" id="change-info-modal">
          <div class="edit-info">
              <span>Title: <input type="text" maxlength="20" v-model="patTitle"></span>
              <span>Author: <input type="text" maxlength="9" v-model="patAuthor"></span>
              <span>Town: <input type="text" maxlength="9" v-model="patTown"></span>
              <span>Type:
                <select v-model="patType">
                  <option
                    v-for="(ti, no) in allTypes"
                    :key="no"
                    :value="no">{{ti.name}}
                  </option>
                </select>
              </span>
          </div>
          <div v-if="storedAuthorHuman">Stored: {{storedAuthorHuman}}</div>
          <div class="edit-notice">
            <p>
              IMPORTANT: AC:NH reads these patterns as AC:NL patterns; therefore, 
              they will not be editable in-game since the game can't 
              determine that they were originally made by you.
            </p>
            <p>
              <br>
              Similarly, patterns with transparency will look corrupted 
              when scanned in the NSO application but will look fine in game.
            </p>
          </div>
          <div class="edit-buttons">
            <button @click="saveAuthor">Copy author information</button>
            <button @click="loadAuthor">Load copied author information</button>
            <button @click="patInfoSave(false)">Save</button>
            <button @click="patInfoModal=false; onLoad()">Cancel</button>
          </div>
        </div>
      </div>
    </ModalContainer>

    <ModalContainer v-if="publishModal" @modal-close="publishModal=false">
      <div class="modal">
        <div class="modal-header">
          Publish to Public Database
        </div>
        <div class="modal-window" id="publish-modal">
            <div class="left">
              <p>
              Really cool that you want to publish your pattern!<br />
              Publishing means everyone will be able to search for and link to your pattern easily, hopefully allowing many others to enjoy your work.<br />
              Please do keep the following in mind:
              </p>
              <ol>
                <li>Published patterns cannot be deleted or edited. So, please don't publish unfinished works.</li>
                <li>Please try to title and tag your pattern appropriately, so that it can be found easily.</li>
                <li>If any pattern might be inappropriate for children, please flag it accordingly to protect the innocent.</li>
                <li>Be nice to authors! It's okay to publish the work of others, but please don't change an existing work's author name/town to your own. Respect their skills!</li>
              </ol>
              <p>
                Not following the above rules may lead to your published pattern being deleted from the database.
              </p>
            </div>
            <div class="right">
              <IconGenerator :pattern="drawingTool" width=150 height=150 />
              <div class="dropdowns">
                <span>Title: <input type="text" maxlength="20" v-model="patTitle"></span>
                <span>Author: <input type="text" maxlength="9" v-model="patAuthor"></span>
                <span>Town: <input type="text" maxlength="9" v-model="patTown"></span>
                <span>Type:
                  <select v-model="patType">
                    <option
                      v-for="(ti, no) in allTypes"
                      :key="no"
                      :value="no">{{ti.name}}
                    </option>
                  </select>
                </span>
                <div class="dropdown">
                <span>Main Style:</span>
                <select v-model="pubStyleA">
                  <option value="">-</option>
                  <option
                    v-for="(s, no) in origin.tags_style"
                    :key="no"
                    :value="s">
                    {{s}}
                  </option>
                </select>
                </div>
                <div class="dropdown">
                  <span>Additional Style:</span>
                  <select v-model="pubStyleB">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_style"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Additional Style:</span>
                  <select v-model="pubStyleC">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_style"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Main Type:</span>
                  <select v-model="pubTypeA">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_type"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Additional Type:</span>
                  <select v-model="pubTypeB">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_type"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Additional Type:</span>
                  <select v-model="pubTypeC">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_type"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select> 
                </div>   
              </div>
              <div>
                <input type="checkbox" value="Y" v-model="pubNSFW">This pattern is not appropriate for children</input>
              </div>
              <div class="publish-buttons">
                <button @click="patInfoSave(true)">Save</button>
                <button @click="publishModal=false; onLoad()">Cancel</button>
              </div>
            </div>
        </div>
      </div>
    </ModalContainer>

    <ModalContainer v-if="false">
      <div class="modal-info">
        <div class="info-text">
          <p>Please select files with the <span>.acnl</span> extension.</p>
        </div>
      </div>
    </ModalContainer>

    <ModalContainer v-if="mainMenu" @modal-close="mainMenu=false">
      <div class="modal">
        <NookPhoneMenu v-model="mainMenu"/>
      </div>
    </ModalContainer>
  </div>
</template>

<script>
import ColorPicker from '/components/ColorPicker.vue';
import Palette from '/components/Palette.vue';
import ThreeDRender from '/components/ThreeDRender.vue';
import FileLoader from '/components/FileLoader.vue';
import ImageLoader from '/components/ImageLoader.vue';
import ACNLQRGenerator from '/components/ACNLQRGenerator.vue';
import IconGenerator from '/components/IconGenerator.vue';
import ModalContainer from '/components/ModalContainer.vue';
import ToolSelector from '/components/ToolSelector.vue';
import NookPhoneMenu from '/components/NookPhoneMenu.vue';
import DrawingTool from '/libs/DrawingTool';
import ACNLFormat from '/libs/ACNLFormat';
import origin from '/libs/origin';
import logger from '/utils/logger';
import lzString from 'lz-string';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import IconBase from '/components/icons/IconBase.vue';

import saveSvg from '/assets/icons/bxs-save.svg';
import scanSvg from '/assets/icons/bx-scan.svg';
import paintSvg from '/assets/icons/bxs-paint.svg';
import paletteSvg from '/assets/icons/bxs-palette.svg';
import imageAddSvg from '/assets/icons/bxs-image-add.svg';
import barcodeSvg from '/assets/icons/bx-barcode-reader.svg';
import phoneSvg from '/assets/icons/bxs-mobile.svg';
import downArrowSvg from '/assets/icons/bxs-down-arrow.svg';
import upArrowSvg from '/assets/icons/bxs-up-arrow.svg';
import generateACNLQR from "/libs/ACNLQRGenerator";

export default {
  name: "Editor",
  components: {
    ColorPicker,
    Palette,
    ThreeDRender,
    FileLoader,
    ImageLoader,
    ACNLQRGenerator,
    IconGenerator,
    ModalContainer,
    ToolSelector,
    NookPhoneMenu,
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
      qrCode: false,
      patTitle: "Empty",
      patAuthor: "Unknown",
      patTown: "Unknown",
      allTypes: [],
      storedAuthorHuman: false,
      patInfoModal: false,
      fragment: "",
      patType: 9,
      patTypeName: "",
      pickPatterns: false,
      multiName: "Local storage",
      allowMoveToLocal: true,
      convertImage: false,
      mainMenu: false,
      saveSvg,
      scanSvg,
      paintSvg,
      barcodeSvg,
      paletteSvg,
      imageAddSvg,
      phoneSvg,
      downArrowSvg,
      upArrowSvg,
      pubStyleA: "",
      pubStyleB: "",
      pubStyleC: "",
      pubTypeA: "",
      pubTypeB: "",
      pubTypeC: "",
      pubNSFW: "",
      publishModal: false,
      origin,
    };
  },
  methods: {
    async onPublish(){
      let uplStatus = await origin.upload(btoa(this.drawingTool.toString()), this.pubStyleA, this.pubStyleB, this.pubStyleC, this.pubTypeA, this.pubTypeB, this.pubTypeC, this.pubNSFW);
      if (uplStatus["upload"]){
        this.$router.push({ hash: "H:"+uplStatus["upload"] });
      } else if (uplStatus.includes("error")) {
        window.alert("A pattern just like this already exists in the database!");
      }
      this.publishModal = false;
    },
    onOpenLocal(){
      let tmp = {};
      for (const i in localStorage){
        if (i.startsWith("acnl_")){
          tmp[i] = new DrawingTool(lzString.decompressFromUTF16(localStorage.getItem(i)));
        }
      }
      this.multiName = "Local storage";
      this.pickPatterns = tmp;
      this.allowMoveToLocal = false;
    },
    zipPicksAsACNL(){
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        let title = dt.title + ".acnl";
        let k = 1;
        while(titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ".ancl";
          k++;
        }
        zip.file(title, dt.toBytes());
        titles.push(title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },
    async zipPicksAsPNG(){
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
    async zipPicksAsBoth(){
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns){
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)){dt = new DrawingTool(dt);}
        let ancl_title = dt.title + ".ancl";
        let k = 1;
        while(titles.includes(ancl_title)) {
          ancl_title = dt.title + "(" + k + ")" + ".ancl";
          k++;
        }
        const img_title = ancl_title.replace(".ancl", ".png");
        zip.file(ancl_title, dt.toBytes());
        const img = await generateACNLQR(dt);
        zip.file(img_title, img.substr(22), {base64:true});
        titles.push(ancl_title);
      }
      zip.generateAsync({type:"blob"}).then((d)=>{saveAs(d, "patterns.zip");});
    },
    async downPNG(){
      const img = await generateACNLQR(this.drawingTool);
      saveAs(img, this.drawingTool.title+".png");
    },
    patInfoSave(publish=false){
      const patTitle = this.patTitle.trim();
      const patTown = this.patTown.trim();
      const patAuthor = this.patAuthor.trim();
      const titleCheck = patTitle && patTitle !== 'Empty';
      const townCheck = patTown && patTown !== 'Unknown';
      const nameCheck = patAuthor && patAuthor !== 'Unknown';
      if (titleCheck && townCheck && nameCheck){
        this.drawingTool.title = this.patTitle;
        if (this.drawingTool.creator[0] !== this.patAuthor) this.drawingTool.creator = this.patAuthor;
        if (this.drawingTool.town[0] !== this.patTown) this.drawingTool.town = this.patTown;
        if (this.drawingTool.patternType !== this.patType){
          this.drawingTool.patternType = this.patType;
          this.patTypeName = this.drawingTool.typeInfo.name;
        }
        this.patInfoModal = false;
        if (publish) this.onPublish();
        return;
      }
      alert('Please provide a valid pattern name, town name, and player name for this pattern.');
    },
    async onOpenDB(){
      this.$router.push("/browse");
    },
    onLocalSave(){
      localStorage.setItem("acnl_"+this.drawingTool.fullHash, lzString.compressToUTF16(this.drawingTool.toString()));
    },
    picksToLocal(){
      for (const i in this.pickPatterns){
        localStorage.setItem("acnl_"+this.pickPatterns[i].fullHash, lzString.compressToUTF16(this.pickPatterns[i].toString()));
      }
    },
    toolChange(newTool){
      this.drawingTool.drawHandler = newTool;
    },
    toolChangeAlt(newTool){
      this.drawingTool.drawHandlerAlt = newTool;
    },
    downACNL(){
      const blob = new Blob([this.drawingTool.toBytes()], {"type": "application/octet-stream"});
      saveAs(blob, this.drawingTool.title+".acnl");
    },
    onColorPicked: function(color) {
      const currentColor = this.drawingTool.currentColor;
      if (this.drawingTool.getPalette(currentColor) === color) return;
      this.drawingTool.pushUndo();
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      logger.info(`color picked: ${color}`);
    },
    onChangedCurrentColor: function(idx) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();
      logger.info(`changed current color: ${idx}`);
    },
    onLoad: async function(t){
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
    onConvert: function(patterns){
      this.convertImage = false;
      if (patterns.length == 1){
        this.extLoad(patterns[0]);
      }else{
        this.multiName = "Conversion result";
        this.pickPatterns = patterns;
        this.allowMoveToLocal = true;
      }
    },
    extMultiLoad: function(data) {
      this.multiName = "Load which?";
      this.pickPatterns = data;
      this.allowMoveToLocal = true;
    },
    onQROpen: function() {
      const patStr = this.drawingTool.toString();
      this.qrCode = patStr;
    },
    pickPattern: function(p){
      this.extLoad(p);
      this.pickPatterns = false;
    },
    closePicks: function() {
      this.pickPatterns = false;
    },
    onMainMenu: function() {
      // this.$router.push("/");
      this.mainMenu = true;
    },
    openColorPicker: function() {
      if (this.drawingTool.currentColor !== 15) {
        this.$data.colorPickerMenu = !this.$data.colorPickerMenu;
        this.$refs.colorPickerMenu.style.height = ((!this.$data.colorPickerMenu)?0:315)+'px';
        return;
      }
      alert('This one has to stay transparent. :)');
    },
    closeColorPicker: function() {
      this.$refs.colorPickerMenu.style.height = '0px';
      this.$data.colorPickerMenu = false;
    },
    saveAuthor(){
      this.storedAuthorHuman = this.drawingTool.creator[0]+" / "+this.drawingTool.town[0];
      localStorage.setItem("author_acnl", this.drawingTool.authorStrict);
    },
    loadAuthor(){
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];
    }
  },
  mounted: function() {
    if (localStorage.getItem("author_acnl")){
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.storedAuthorHuman = this.drawingTool.creator[0]+" / "+this.drawingTool.town[0];
    }
    this.drawingTool.addCanvas(this.$refs.canvas1, {grid:true});
    this.drawingTool.addCanvas(this.$refs.canvas2);
    this.drawingTool.addCanvas(this.$refs.canvas3);
    this.allTypes = this.drawingTool.allTypes;
    this.drawingTool.onLoad(this.onLoad);
    if (this.$router.currentRoute.hash.length > 1){
      const hash = this.$router.currentRoute.hash.substring(1);
      if (hash.startsWith("H:")){
        origin.view(hash.substring(2)).then((r)=>{
          this.drawingTool.load(r);
        });
      }else{
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(hash));
      }
    }
    else{
      this.onLoad();
      this.drawingTool.render();
    }

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Z'){
        this.drawingTool.redo();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'z'){
        this.drawingTool.undo();
        e.preventDefault();
        return;
      }
    });
  },
}
</script>

<style lang="scss" scoped>
button, input[type="button"] {
  background-color: #7e7261;
  border: none;
  border-radius: 35px;
  box-shadow: rgba(0,0,0,0.2) 0 0 8px;
  color: #eff1d8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 10px 14px;

  &.downACNL {
    background-color: #57b7a8;
    color: #ffffff;
  }
  &.editInfo {
    background-color: #60BB55;
    margin: 0 0 5px;
  }
}
.editor {
  user-select: none;
  color: #7e7261;
}
.modal {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  display:flex;
  margin:50px auto;
  max-width: 80%;
}
.modal-centered {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  display:flex;
}
.modal-header {
  background-color: rgba(47, 31, 14, 0.9);
  border-radius: 45px 45px 0 0;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 30px 0;
  min-width: 300px;
}
.modal-window {
  color: #FFFFFF;
  background-color: rgba(47, 31, 14, 0.9);
  border-radius: 35px;
  padding: 25px;
  min-width: 600px;
}
.modal-info {
  display: flex;
  justify-content: center;
  width: 100%;
  position: fixed;
  top: 55%;
  color: #ffffff;
  font-size: 32px;
  text-align: center;
}
.info-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(21, 50, 69, 0.7);
  border-radius: 35px;
  padding: 40px;
  min-width: 800px;
  min-height: 150px;
  max-width: 60%;
  max-height: 60%;

  p {
    width: 350px;
    display: inline-block;
    line-height: 40px;
  }
  
  span {
  color: #00C3C9;
  }
}
.topbar-buttons {
  display: inline-flex;
  align-items: center;
  justify-content: space-evenly;
  height: 62px;

  .menu-button {
  background-color: #DC8D69;
  color: #FFFFFF;
  }
}
main {
  display: flex;
  flex-direction: row;
  justify-content: center;

  .left, .center, .right {
    display: flex;
    flex-direction: column;
  }

  .left {
    padding-right: 40px;
  }

  .center canvas, .left canvas {
    box-shadow: 0px 12px 12px -3px rgba(0,0,0,0.3);
  }

  .colorPicker-menu {
    height: 0;
    position: fixed;
    z-index: 1;
    overflow: hidden;
    transition: 0.5s;
    top: 60px;
    border-radius: 0 0 35px 35px;
    background-color: #f1b5c1;
    left: 50%;
    transform: translate(-50%);

    button {
      display: block;
      margin: 0 auto;
    }
  }
}
.bottom-buttons {
  padding: 20px 10% 0 0;
  text-align: right;
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
    background-color: #ffffff;
  }
  &.svg.brown-circle {
    background-color: #EFF1D8;
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
  background-color: #f1b5c1;
}
.tool-buttons {
  display: inline-flex;
  flex-direction: column;
  align-items: right;

  button{
    margin:5px;
  }
}
canvas.fordrawing {
  background: repeating-linear-gradient(-45deg, #ddd, #ddd 5px, #fff 5px, #fff 10px);
}
.pattern-info {
  margin: 10px 0;
  max-width: 196px;
  overflow: hidden;
}
.render-preview {
  border: 3px solid #7e7261;;
  width: 196px;
  height: 300px;
  border-radius: 5px;
}
#change-info-modal.modal-window {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .edit-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 500px;
    max-width: 60%;

    span {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 60%;
    }
  }
  .edit-notice {
    max-width: 600px;
    margin: 20px;
  }
}
#publish-modal.modal-window{
  display: flex;
  flex-direction: row;
  align-items: center;

  ol {
    list-style: decimal;
    margin: 10px 0;
    padding: 0 0 0 30px;
  }
  .left, .right {
    flex: 1 1 0;
    align-items: center;
    max-width: 400px;
  }
  .dropdowns {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .dropdown, span {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
