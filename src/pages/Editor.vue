<template>
  <div>
    <div class="content">
      <!-- Introduction -->
      <section class="section">
        <RichText :content="introText" contentType="markdown" />
      </section>
      <hr />

      <!-- Step 1 -->
      <section class="section">
        <h1 id="step1" class="f-heading-5">
          Step 1: Select an image
        </h1>
        <RichText :content="step1Text" contentType="markdown" />
        <Search @input="onSearchSelect" />
      </section>

      <section class="section">
        <Gallery />
      </section>

      <section class="section">
        <div>
          <h1 class="f-heading-4">C. Use an IIIF image from another museum</h1>
          <urlInput @updateIiif="updateIiifData" />
        </div>
      </section>
      <hr />

      <section class="section">
        <div class="l-halves">
          <!-- Step 2 -->
          <div class="l-halves__half">
            <h1 id="step2" ref="step2" class="f-heading-5">
              Step 2: Select the crop for your artwork
            </h1>
            <ImageLoader
              :pattern-type="patType"
              :iiif-url="iiif.url"
              @converted="onConvert"
            />
          </div>
          <!-- Step 3 -->
          <div class="l-halves__half leftborder">
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
      <hr class="hr-dark" />

      <!-- credits -->
      <section class="section">
        <Credits />
      </section>

      <!-- hidden image used for QR code image -->
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
import Credits from "/components/Credits.vue";
import gettyLogo from "/assets/images/getty-logo.png";
import saveIcon from "/assets/images/save-icon.svg";
import introText from "../data/intro_text.md";
import step1Text from "../data/step1_text.md";
import qrInstructions from "../data/qr_instructions.md";
import { RichText } from "@thegetty/getty-ui";
import UrlInput from "/components/UrlInput.vue";
import ImageLoader from "/components/ImageLoader.vue";
import Gallery from "/components/Gallery.vue";
import ACNLQRGenerator from "/components/ACNLQRGenerator.vue";
import Search from "/components/Search.vue";
import DrawingTool from "/libs/DrawingTool";
import origin from "/libs/origin";
import logger from "/utils/logger";
import lzString from "lz-string";
import { saveAs } from "file-saver";
import generateACNLQR from "/libs/ACNLQRGenerator";

export default {
  name: "Editor",
  components: {
    Credits,
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
      step1Text,
      introText,
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
      multiName: "Local storage",
      allowMoveToLocal: true,
      // convertImage: false,
      mainMenu: false,
      origin
    };
  },
  methods: {
    async downPNG() {
      const img = await generateACNLQR(this.drawingTool);
      saveAs(img, this.drawingTool.title + ".png");
    },
    // patInfoSave(publish = false) {
    //   const patTitle = this.patTitle.trim();
    //   const patTown = this.patTown.trim();
    //   const patAuthor = this.patAuthor.trim();
    //   const titleCheck = patTitle && patTitle !== "Empty";
    //   const townCheck = patTown && patTown !== "Unknown";
    //   const nameCheck = patAuthor && patAuthor !== "Unknown";
    //   if (titleCheck && townCheck && nameCheck) {
    //     this.drawingTool.title = this.patTitle;
    //     if (this.drawingTool.creator[0] !== this.patAuthor)
    //       this.drawingTool.creator = this.patAuthor;
    //     if (this.drawingTool.town[0] !== this.patTown)
    //       this.drawingTool.town = this.patTown;
    //     if (this.drawingTool.patternType !== this.patType) {
    //       this.drawingTool.patternType = this.patType;
    //       this.patTypeName = this.drawingTool.typeInfo.name;
    //     }
    //     this.patInfoModal = false;
    //     if (publish) this.onPublish();
    //     return;
    //   }
    //   alert(
    //     "Please provide a valid pattern name, town name, and player name for this pattern."
    //   );
    // },
    // onLocalSave() {
    //   localStorage.setItem(
    //     "acnl_" + this.drawingTool.fullHash,
    //     lzString.compressToUTF16(this.drawingTool.toString())
    //   );
    // },
    onLoad: async function(t) {
      let patStr = this.drawingTool.toString();
      this.patType = this.drawingTool.patternType;
      this.patTypeName = this.drawingTool.typeInfo.name;

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
      this.$refs["step2"].scrollIntoView();
    },
    onConvert: function(patterns) {
      // this.convertImage = false;
      let title = "untitled";
      if (patterns.length == 1) {
        title = this.iiif.short_name;
        this.extLoad(patterns[0]);
      } else {
        this.multiName = "Conversion result";
        this.allowMoveToLocal = true;
      }
      if (this.searchResult && this.searchResult.short_name) {
        title = this.searchResult.short_name;
      }

      this.drawingTool.title = title;
      const patStr = this.drawingTool.toString();
      this.qrCode = patStr;
    },
    onQROpen: function() {
      const patStr = this.drawingTool.toString();
      this.qrCode = patStr;
    },
    updateIiifData(manifestUrl) {
      // TODO: extract data from manifest url
      this.searchResult = {
        full_name: "placeholder",
        iiif_url: manifestUrl,
        large_iiif_url: manifestUrl,
        short_name: "placeholder",
        webpage: undefined
      };
      this.$set(this.iiif, "url", manifestUrl);
    }
  },
  mounted: function() {
    if (localStorage.getItem("author_acnl")) {
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.storedAuthorHuman =
        this.drawingTool.creator[0] + " / " + this.drawingTool.town[0];
    }
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
.content a {
  color: #1a47b8;
  text-decoration: none;
}
.leftborder {
  padding: 12px 0 12px 12px;
  border-left: 1px solid #e6e6e6;
}
@media (max-width: 767px) {
  .l-halves {
    margin-left: 0px;
  }
  .l-halves .l-halves__half {
    margin-left: 0px;
    width: 100%;
  }
  .leftborder {
    margin-top: 20px;
    padding: 0;
    border: none;
  }
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
