<template>
  <div>
    <div class="content">
      <section class="section">
        <RichText :content="introText" contentType="markdown" />
      </section>

      <hr />

      <section class="section">
        <div class="section">
          <h1 class="f-heading-5">Step 1: Select a work of art</h1>
          <Search @input="onSearchSelect" />
        </div>
        <div>
          <RichText :content="step3iiif" contentType="markdown" />
          <urlInput :value="iiif" />
        </div>
      </section>

      <hr />

      <section class="section">
        <div class="columns">
          <div class="half-column">
            <h1 class="f-heading-5">
              Step 2: Select the crop for your artwork
            </h1>
            <ImageLoader
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

      <hr />

      <section class="section">
        <Gallery />
      </section>

      <hr />

      <section class="section">
        <h1 class="f-heading-5">Credits</h1>
        <hr />
      </section>

      <img
        id="gettylogo"
        class="hidden"
        :src="gettyLogo"
        style="border:1px solid blue;"
      />
    </div>
  </div>
</template>

<script>
import gettyLogo from "/assets/images/getty-logo.png";
import saveIcon from "/assets/images/save-icon.svg";
import introText from "../data/intro_text.md";
import step3iiif from "../data/step3_iiif.md";
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
      gettyLogo,
      saveIcon,
      qrInstructions: qrInstructions,
      introText,
      step3iiif,
      iiif: {
        title: "Jeanne (Spring)",
        short_name: "Jeanne (Spring)",
        url:
          "https://media.getty.edu/iiif/image/8094f61e-e458-42bd-90cf-a0ed0dcc90b9/full/!1200,1200/0/default.jpg"
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
      this.$set(this.iiif, "url", data.large_iiif_url);
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
  padding: 74px 36px;
}
.content a {
  color: #1a47b8;
  text-decoration: none;
}
.columns {
  display: flex;
}
.half-column {
  width: 50%;
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
.section {
  margin-bottom: 48px;
}
</style>
