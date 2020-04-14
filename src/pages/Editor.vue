<template>
  <div>
    <section class="content">
      <RichText :content="introText" contentType="markdown" />
    </section>

    <section class="content">
      <h1 class="f-heading-5">Step 1: Select a work of art</h1>
      <Search @input="onSearchSelect" />
    </section>

    <section class="content">
      <div class="columns">
        <div class="half-column">
          <h1 class="f-heading-5">Step 2: Select the crop for your artwork</h1>
          <ImageLoader
            class="test"
            :pattern-type="patType"
            :iiif-url="iiif.url"
            @converted="onConvert"
          />
        </div>
        <div class="half-column">
          <h1 class="f-heading-5">
            Step 3: Import your artwork into Animal Crossing
          </h1>
          <div class="generated-image">
            <ACNLQRGenerator :pattern="qrCode" />
            <span class="save-button" @click="downPNG">
              <a>Download artwork and QR code </a
              ><object class="save-icon" :data="saveIcon"></object>
            </span>
          </div>
          <RichText :content="qrInstructions" contentType="markdown" />
        </div>
      </div>
    </section>

    <img
      id="gettylogo"
      class="hidden"
      src="data:image/png;base64,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"
    />

    <section>
      <Gallery />
    </section>
  </div>
</template>

<script>
import saveIcon from "/assets/images/save-icon.svg";
import introText from "../data/intro_text.md";
import qrInstructions from "../data/qr_instructions.md";
import { RichText } from "@thegetty/getty-ui";
import UrlInput from "/components/UrlInput.vue";
import ImageLoader from "/components/ImageLoader.vue";
import Gallery from "/components/Gallery.vue";
import ACNLQRGenerator from "/components/ACNLQRGenerator.vue";
import Search from "/components/Search.vue";
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
    Search,
    ImageLoader,
    Gallery,
    ACNLQRGenerator,
    RichText
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
      saveIcon: saveIcon,
      qrInstructions: qrInstructions,
      introText: introText,
      iiif: {
        title: "Jeanne (Spring)",
        short_name: "Jeanne (Spring)",
        url:
          "https://media.getty.edu/iiif/image/8094f61e-e458-42bd-90cf-a0ed0dcc90b9/full/!300,300/0/default.jpg"
      },
      searchResult: {},
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
      zip.generateAsync({ type: "blob" }).then(d => {
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
    onSearchSelect: function(data) {
      this.searchResult = data;
      this.$set(this.iiif, "url", data.iiif_url);
    },
    onConvert: function(patterns) {
      // this.convertImage = false;
      let title = "untitled";
      if (patterns.length == 1) {
        title = this.iiif.short_name;
        this.extLoad(patterns[0]);
      } else {
        this.multiName = "Conversion result";
        this.pickPatterns = patterns;
        this.allowMoveToLocal = true;
      }
      if (this.searchResult && this.searchResult.short_name) {
        title = this.searchResult.short_name;
      }

      this.drawingTool.title = title;
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

<style lang="scss">
.content {
  margin-top: 48px;
  padding: 26px 36px;
}
.content a {
  color: #1a47b8;
  text-decoration: none;
}
.columns {
  display: flex;
}
.half-column {
  flex: 1;
}
.half-column:first-child {
  padding: 12px 12px 12px 0;
  margin-right: 4px;
}
.half-column:last-child {
  padding: 12px 0 12px 12px;
  margin-left: 4px;
  border-left: 1px solid #e6e6e6;
}
.generated-image {
  margin-bottom: 40px;
}
.hidden {
  display: none;
}
.o-hero__title {
  font-size: 28px !important;
}
.save-button {
  width: auto;
  display: flex;
  align-items: center;
}
.save-icon {
  margin-left: 12px;
  height: 12px;
  width: 12px;
  cursor: pointer;
}
</style>
