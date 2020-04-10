<template v-for="i in 1">
  <div class="editor">
    <UrlInput v-model="iiifUrl" />
    <ImageLoader
      class=""
      :pattern-type="patType"
      :iiif-url="iiifUrl.url"
      @converted="onConvert"
    />
    <main>
      <div class="previews">
        <div class="2D">
          <div class="pattern-info">
            <div class="pattern_title">{{ patTitle }}</div>
            <div class="pattern_author">by {{ patAuthor }}</div>
            <div class="pattern_town">from {{ patTown }}</div>
          </div>
        </div>
      </div>
    </main>

    <div class="">
      Generate QR Code(s)
      <ACNLQRGenerator :pattern="qrCode" />
      <button @click="downPNG">Save image</button>
    </div>
  </div>
</template>

<script>
import UrlInput from "/components/UrlInput.vue";
import ImageLoader from "/components/ImageLoader.vue";
import ACNLQRGenerator from "/components/ACNLQRGenerator.vue";
import DrawingTool from "/libs/DrawingTool";
import ACNLFormat from "/libs/ACNLFormat";
import origin from "/libs/origin";
import logger from "/utils/logger";
import lzString from "lz-string";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import barcodeSvg from "/assets/icons/bx-barcode-reader.svg";
import generateACNLQR from "/libs/ACNLQRGenerator";

export default {
  name: "Editor",
  components: {
    UrlInput,
    ImageLoader,
    ACNLQRGenerator
  },
  beforeRouteUpdate: function(to, from, next) {
    if (to.hash.length > 1) {
      if (to.hash.startsWith("#H:")) {
        origin.view(to.hash.substring(3)).then((r) => {
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
      iiifUrl: {
        url:
          "https://media.getty.edu/iiif/image/88001b5b-0261-4b9c-974b-a973e7d0824a/full/!300,300/0/default.jpg"
      },
      drawingTool: new DrawingTool(),
      qrCode: false,
      allTypes: [],
      storedAuthorHuman: false,
      patInfoModal: false,
      fragment: "",
      patType: 9,
      patTypeName: "",
      pickPatterns: false,
      multiName: "Local storage",
      allowMoveToLocal: true,
      // convertImage: false,
      mainMenu: false,
      barcodeSvg,
      pubStyleA: "",
      pubStyleB: "",
      pubStyleC: "",
      pubTypeA: "",
      pubTypeB: "",
      pubTypeC: "",
      pubNSFW: "",
      // publishModal: false,
      origin
    };
  },
  computed: {
    patAuthor() {
      //calculate author here, max length 9
      return "Author name";
    },
    patTitle() {
      //calculate pattern title here, max length 20
      return "Artwork title";
    },
    patTown() {
      // this could stay in data (what should be town name?) - max length 9
      return "Town name";
    }
  },
  methods: {
    async onPublish() {
      let uplStatus = await origin.upload(
        btoa(this.drawingTool.toString()),
        this.pubStyleA,
        this.pubStyleB,
        this.pubStyleC,
        this.pubTypeA,
        this.pubTypeB,
        this.pubTypeC,
        this.pubNSFW
      );
      if (uplStatus["upload"]) {
        this.$router.push({ hash: "H:" + uplStatus["upload"] });
      } else if (uplStatus.includes("error")) {
        window.alert(
          "A pattern just like this already exists in the database!"
        );
      }
      this.publishModal = false;
    },
    zipPicksAsACNL() {
      let zip = new JSZip();
      const titles = [];
      for (const i in this.pickPatterns) {
        let dt = this.pickPatterns[i];
        if (!(dt instanceof DrawingTool)) {
          dt = new DrawingTool(dt);
        }
        let title = dt.title + ".acnl";
        let k = 1;
        while (titles.includes(title)) {
          title = dt.title + "(" + k + ")" + ".ancl";
          k++;
        }
        zip.file(title, dt.toBytes());
        titles.push(title);
      }
      zip.generateAsync({ type: "blob" }).then((d) => {
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
      zip.generateAsync({ type: "blob" }).then((d) => {
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
        let ancl_title = dt.title + ".ancl";
        let k = 1;
        while (titles.includes(ancl_title)) {
          ancl_title = dt.title + "(" + k + ")" + ".ancl";
          k++;
        }
        const img_title = ancl_title.replace(".ancl", ".png");
        zip.file(ancl_title, dt.toBytes());
        const img = await generateACNLQR(dt);
        zip.file(img_title, img.substr(22), { base64: true });
        titles.push(ancl_title);
      }
      zip.generateAsync({ type: "blob" }).then((d) => {
        saveAs(d, "patterns.zip");
      });
    },
    async downPNG() {
      const img = await generateACNLQR(this.drawingTool);
      saveAs(img, this.drawingTool.title + ".png");
    },
    patInfoSave(publish = false) {
      const patTitle = this.patTitle.trim();
      const patTown = this.patTown.trim();
      const patAuthor = this.patAuthor.trim();
      const titleCheck = patTitle && patTitle !== "Empty";
      const townCheck = patTown && patTown !== "Unknown";
      const nameCheck = patAuthor && patAuthor !== "Unknown";
      if (titleCheck && townCheck && nameCheck) {
        this.drawingTool.title = this.patTitle;
        if (this.drawingTool.creator[0] !== this.patAuthor)
          this.drawingTool.creator = this.patAuthor;
        if (this.drawingTool.town[0] !== this.patTown)
          this.drawingTool.town = this.patTown;
        if (this.drawingTool.patternType !== this.patType) {
          this.drawingTool.patternType = this.patType;
          this.patTypeName = this.drawingTool.typeInfo.name;
        }
        this.patInfoModal = false;
        if (publish) this.onPublish();
        return;
      }
      alert(
        "Please provide a valid pattern name, town name, and player name for this pattern."
      );
    },
    async onOpenDB() {
      // this.$router.push("/browse");
    },
    // onLocalSave() {
    //   localStorage.setItem(
    //     "acnl_" + this.drawingTool.fullHash,
    //     lzString.compressToUTF16(this.drawingTool.toString())
    //   );
    // },
    picksToLocal() {
      for (const i in this.pickPatterns) {
        localStorage.setItem(
          "acnl_" + this.pickPatterns[i].fullHash,
          lzString.compressToUTF16(this.pickPatterns[i].toString())
        );
      }
    },

    onChangedCurrentColor: function(idx) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();
      logger.info(`changed current color: ${idx}`);
    },
    onLoad: async function(t) {
      let patStr = this.drawingTool.toString();
      this.patType = this.drawingTool.patternType;
      this.patTypeName = this.drawingTool.typeInfo.name;
      // this.patTitle = this.drawingTool.title;
      // this.patAuthor = this.drawingTool.creator[0];
      // this.patTown = this.drawingTool.town[0];

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
    onConvert: function(patterns) {
      // this.convertImage = false;
      if (patterns.length == 1) {
        this.extLoad(patterns[0]);
      } else {
        this.multiName = "Conversion result";
        this.pickPatterns = patterns;
        this.allowMoveToLocal = true;
      }
      const patStr = this.drawingTool.toString();
      this.qrCode = patStr;
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
    pickPattern: function(p) {
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
    saveAuthor() {
      this.storedAuthorHuman =
        this.drawingTool.creator[0] + " / " + this.drawingTool.town[0];
      localStorage.setItem("author_acnl", this.drawingTool.authorStrict);
    },
    loadAuthor() {
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];
    }
  },
  mounted: function() {
    if (localStorage.getItem("author_acnl")) {
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.storedAuthorHuman =
        this.drawingTool.creator[0] + " / " + this.drawingTool.town[0];
    }
    // this.drawingTool.addCanvas(this.$refs.canvas1, { grid: true });
    // this.drawingTool.addCanvas(this.$refs.canvas2);
    // this.drawingTool.addCanvas(this.$refs.canvas3);
    this.allTypes = this.drawingTool.allTypes;
    this.drawingTool.onLoad(this.onLoad);
    if (this.$router.currentRoute.hash.length > 1) {
      const hash = this.$router.currentRoute.hash.substring(1);
      if (hash.startsWith("H:")) {
        origin.view(hash.substring(2)).then((r) => {
          this.drawingTool.load(r);
        });
      } else {
        this.drawingTool.load(lzString.decompressFromEncodedURIComponent(hash));
      }
    } else {
      this.onLoad();
      this.drawingTool.render();
    }

    document.addEventListener("keydown", (e) => {
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
.iiif-input {
  width: 80%;
  margin: 1em;
}
button,
input[type="button"] {
  background-color: #7e7261;
  border: none;
  border-radius: 35px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 0 8px;
  color: #eff1d8;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 10px 14px;
}

button.editInfo {
  background-color: #60bb55;
  margin: 0 0 5px;
}
.editor {
  user-select: none;
  color: #7e7261;
}
.topbar-buttons {
  display: inline-flex;
  align-items: center;
  justify-content: space-evenly;
  height: 62px;
}
.topbar-buttons .menu-button {
  background-color: #dc8d69;
  color: #ffffff;
}
main {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
main .left,
.center,
.right {
  display: flex;
  flex-direction: column;
}
main .left {
  padding-right: 40px;
}
main .center canvas,
main .left canvas {
  box-shadow: 0px 12px 12px -3px rgba(0, 0, 0, 0.3);
}
main .center .colorPicker-menu {
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
}
main .center .colorPicker-menu button {
  display: block;
  margin: 0 auto;
}
.bottom-buttons {
  padding: 20px 10% 0 0;
  text-align: right;
}
.previews {
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 62px;
}
canvas.fordrawing {
  background: repeating-linear-gradient(
    -45deg,
    #ddd,
    #ddd 5px,
    #fff 5px,
    #fff 10px
  );
}
.pattern-info {
  margin: 10px 0;
  max-width: 196px;
  overflow: hidden;
}
</style>
