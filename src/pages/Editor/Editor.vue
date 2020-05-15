<template>
  <main class="editor--container">
    <div style="text-align: center">
      <ColorTools :drawingTool="drawingTool" @change-current-color="onChangeCurrentColor" />
    </div>
    <ModalContainer v-if="colorPicker != null">
      <template #window>
        <div class="editor--color-picker-window" style="text-align: center">
          <ColorTools
            :drawingTool="drawingTool"
            :colorPicker="colorPicker"
            @change-color-picker="onChangeColorPicker"
            @change-current-color="onChangeCurrentColor"
            @color-picked="onColorPicked"
          />
        </div>
      </template>
      <template #overlay>
        <div @click="onChangeColorPicker(null)" class="editor--color-picker-overlay"></div>
      </template>
    </ModalContainer>

    <div class="editor--middle-components">
      <!-- need this to control canvas ratio -->
      <div class="editor--previews"></div>
      <div class="editor--canvas-container">
        <canvas class="editor--canvas" width=800 height=800 ref="main" />
      </div>

      <Toolbar
        :drawingTool="drawingTool"
        :prevColorPicker="prevColorPicker"
        :colorPicker="colorPicker"
        @change-color-picker="onChangeColorPicker"
        :settingsActive="false"
        @open-settings="onChangeSettingsActive(true)"
        :previewActive="false"
        @open-preview="onChangePreviewActive(true)"
      />
    </div>

    <div class="editor--main"></div>
    <div class="editor--buttons"></div>
  </main>
</template>

<script>
/* libs */
import DrawingTool from "/libs/DrawingTool";
import ACNLFormat from "/libs/ACNLFormat";
import ACNHFormat from "/libs/ACNHFormat";
import origin from "/libs/origin";
import generateACNLQR from "/libs/ACNLQRGenerator";
import lzString from "lz-string";
import { saveAs } from "file-saver";
import JSZip from "jszip";

// components
import ColorTools from "./ColorTools/ColorTools.vue";
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import Toolbar from "./Toolbar.vue";

export default {
  name: "Editor",
  components: {
    ColorTools,
    ModalContainer,
    Toolbar
  },
  beforeRouteUpdate: function(to, from, next) {
    if (to.hash.length > 1) {
      if (to.hash.startsWith("#H:")) {
        origin.view(to.hash.substring(3)).then(r => {
          this.drawingTool.load(r);
        });
        next();
        return;
      }
      let newHash = lzString.compressToEncodedURIComponent(
        this.drawingTool.toString()
      );
      if (to.hash !== "#" + newHash) {
        this.drawingTool.load(
          lzString.decompressFromEncodedURIComponent(to.hash.substring(1))
        );
      }
    }
    next();
  },
  data: function() {
    return {
      drawingTool: new DrawingTool(),
      patternDetails: {
        patTitle: "Empty",
        patAuthor: "Unknown",
        patTown: "Unknown",
        selectedTypes: [],
        selectedStyles: [],
        patType: 9
      },
      prevColorPicker: "acnl",
      colorPicker: null,
      previewActive: false,
      settingsActive: false,

      acnlMode: false,
      storedAuthorHuman: false,
      fragment: "",
      patTypeName: "",
      pickPatterns: false,
      multiName: "Local Storage",
      allowMoveToLocal: true,
      origin,

      brown: "#7E7261",
      teal: "#57B7A8",
      orange: "#DC8D69",
      white: "#FFFFFF"
    };
  },
  methods: {
    update: function(data) {
      if (data.details) {
        this.patternDetails = {
          ...this.patternDetails,
          ...data.details
        };
      }

      if (data.storedAuthorHuman) {
        this.storedAuthorHuman = data.storedAuthorHuman;
      }

      // todo: can we make drawingTool accept an object and update all of these that way?
      const patTown = this.patternDetails.patTown;
      const patAuthor = this.patternDetails.patAuthor;
      this.drawingTool.title = this.patternDetails.patTitle;
      if (this.drawingTool.creator[0] !== patAuthor)
        this.drawingTool.creator = patAuthor;
      if (this.drawingTool.town[0] !== patTown) this.drawingTool.town = patTown;
      if (this.drawingTool.patternType !== this.patternDetails.patType) {
        this.drawingTool.patternType = this.patternDetails.patType;
        this.patTypeName = this.drawingTool.typeInfo.name;
      }
    },
    onOpenLocal: function() {
      this.closeColorPicker();
      let tmp = {};
      for (const i in localStorage) {
        if (i.startsWith("acnl_")) {
          tmp[i] = new DrawingTool(
            lzString.decompressFromUTF16(localStorage.getItem(i))
          );
        }
      }
      this.multiName = "Local Storage";
      this.pickPatterns = tmp;
      this.allowMoveToLocal = false;
    },
    zipPicksAsACNL: function() {
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns) {
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)) {
          dt = new DrawingTool(dt);
        }
        let ext = ".acnl";
        if (dt.pattern instanceof ACNHFormat) {
          ext = ".acnh";
        }
        let title = dt.title + ext;
        let k = 1;
        while (titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ext;
          k++;
        }
        zip.file(title, dt.toBytes());
        titles.push(title);
      }
      zip.generateAsync({ type: "blob" }).then(d => {
        saveAs(d, "patterns.zip");
      });
    },
    async zipPicksAsPNG() {
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns) {
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)) {
          dt = new DrawingTool(dt);
        }
        const img = await generateACNLQR(dt);
        let title = dt.title + ".png";
        let k = 1;
        while (titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ".png";
          k++;
        }
        zip.file(title, img.substr(22), { base64: true });
        titles.push(title);
      }
      zip.generateAsync({ type: "blob" }).then(d => {
        saveAs(d, "patterns.zip");
      });
    },
    async zipPicksAsBoth() {
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns) {
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)) {
          dt = new DrawingTool(dt);
        }
        let ext = ".acnl";
        if (dt.pattern instanceof ACNHFormat) {
          ext = ".acnh";
        }
        let ancl_title = dt.title + ext;
        let k = 1;
        while (titles.includes(ancl_title)) {
          ancl_title = dt.title + "(" + k + ")" + ext;
          k++;
        }
        const img_title = ancl_title.replace(ext, ".png");
        zip.file(ancl_title, dt.toBytes());
        const img = await generateACNLQR(dt);
        zip.file(img_title, img.substr(22), { base64: true });
        titles.push(ancl_title);
      }
      zip.generateAsync({ type: "blob" }).then(d => {
        saveAs(d, "patterns.zip");
      });
    },
    async downTex() {
      const img = this.$refs.canvas3.toDataURL("image/png");
      saveAs(img, this.drawingTool.title + "_texture.png");
    },
    async onOpenDB() {
      this.$router.push("/browse");
    },
    onLocalSave() {
      localStorage.setItem(
        "acnl_" + this.drawingTool.fullHash,
        lzString.compressToUTF16(this.drawingTool.toString())
      );
    },
    picksToLocal() {
      for (const i in this.pickPatterns) {
        localStorage.setItem(
          "acnl_" + this.pickPatterns[i].fullHash,
          lzString.compressToUTF16(this.pickPatterns[i].toString())
        );
      }
    },
    downACNL() {
      const blob = new Blob([this.drawingTool.toBytes()], {
        type: "application/octet-stream"
      });
      let ext = ".acnl";
      if (this.drawingTool.pattern instanceof ACNHFormat) {
        ext = ".acnh";
      }
      saveAs(blob, this.drawingTool.title + ext);
    },
    onColorPicked: function(color) {
      if (this.drawingTool.currentColor === 15) {
        alert("this one has to stay transparent");
        return;
      }
      const currentColor = this.drawingTool.currentColor;
      if (this.drawingTool.getPalette(currentColor) === color) return;
      this.drawingTool.pushUndo();
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      console.log(`color picked: ${color}`);
    },
    onChangeCurrentColor: function(idx) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();
      console.log(`changed current color: ${idx}`);
    },
    onChangeColorPicker: function(mode) {
      if (this.colorPicker != null) this.prevColorPicker = this.colorPicker;
      this.colorPicker = mode;
    },
    onChangeSettingsActive: function(isActive) {
      this.settingsActive = isActive;
    },
    onChangePreviewActive: function(isActive) {
      this.previewActive = isActive;
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
    }
  },
  mounted: function() {
    if (localStorage.getItem("author_acnl")) {
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.storedAuthorHuman = `${this.drawingTool.creator[0]} / ${this.drawingTool.town[0]}`;
    }
    this.drawingTool.addCanvas(this.$refs.main, { grid: true });
    if (this.$router.currentRoute.hash.length > 1) {
      const hash = this.$router.currentRoute.hash.substring(1);
      if (hash.startsWith("H:")) {
        origin.view(hash.substring(2)).then(r => {
          this.drawingTool.load(r);
        });
      } else {
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(hash));
      }
    } else {
      this.onLoad();
      this.drawingTool.render();
    }
    // todo: can make this more vue-like
    // undo/redo functionality
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.key === "Z") {
        this.drawingTool.redo();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === "z") {
        this.drawingTool.undo();
        e.preventDefault();
        return;
      }
    });
  }
};
</script>

<style lang="scss" scoped>
@import "styles/colors";

.editor--container {
}

.editor--color-picker-window {
  display: inline-block;
  position: relative;
  top: 0;
  left: 50%;

  transform: translate(-50%, 0%);
  z-index: 999;
}

.editor--color-picker-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 0;
}

.editor--middle-components {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto;
  justify-content: center;
}

.editor--canvas-container {
  position: relative;
  top: 0;
  left: 0;
  // must be a multiple of 32
  width: 800px;

  &:after {
    content: "";
    display: block;
    // force 1x1 ratio
    padding-bottom: 100%;
  }
}

.editor--previews {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: repeat(1, auto);
}

.editor--canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: $sand-dune;
  border-radius: 8px;
}
</style>