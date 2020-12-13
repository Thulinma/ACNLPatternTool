<template>
  <main
    :class="{
      'editor--container': true,
    }"
  >
    <ColorTools
      :drawingTool="drawingTool"
      :prevColorPicker="prevColorPicker"
      @change-color-picker="onChangeColorPicker"
      @change-current-color="onChangeCurrentColor"
      @color-picked="onColorPicked"
    />
    <ModalContainer
      v-if="colorPicker != null"
      @modal-close="onChangeColorPicker(null)"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
    >
      <template #window>
        <div class="editor--color-picker-window" style="text-align: center">
          <ColorTools
            :drawingTool="drawingTool"
            :colorPicker="colorPicker"
            @change-color-picker="onChangeColorPicker"
            @change-current-color="onChangeCurrentColor"
            @color-picked="onColorPicked"
          />
          <CancelButton
            class="editor--color-picker-close"
            @click="onChangeColorPicker(null)"
          />
        </div>
      </template>
      <!-- transparent overlay -->
      <template #overlay>
        <div
          @click="onChangeColorPicker(null)"
          class="editor--color-picker-overlay"
        ></div>
      </template>
    </ModalContainer>
    <!-- color picker dropdown -->

    <!-- need this to control canvas ratio -->
    <div class="editor--preview-container">
      <canvas class="editor--preview" ref="preview" />
    </div>
    <ThreeDRender
      class="editor--preview-3d"
      :width="250"
      :height="450"
      :drawingTool="drawingTool"
    />
    <!-- width/height must be multiples of 32 and ratio of 1:1 -->
    <div class="editor--canvas-container">
      <canvas class="editor--canvas" ref="main" />
    </div>
    <!-- main canvas -->

    <Toolbar
      :drawingTool="drawingTool"
      :prevColorPicker="prevColorPicker"
      :colorPicker="colorPicker"
      @change-color-picker="onChangeColorPicker"
      @change-prev-color-picker="onChangePrevColorPicker"
      @update-details="updatePatternDetails"
      :patternDetails="patternDetails"
      @load="load"
    />

    <div class="dropups">
      <Dropup :items="importMenuItems">
        <template #icon>
          <BxsFileImport />
        </template>
        <template #text>Import</template>
      </Dropup>
      
      <Dropup :items="exportMenuItems" :variant="DropupVariants.action">
        <template #icon>
          <BxsSave />
        </template>
        <template #text>Save</template>
      </Dropup>
    </div>

    <FileLoader
      ref="patternFileLoader"
      fileType="acpattern"
      @load="load"
    />

    <FileLoader ref="imageFileLoader" fileType="image" @load="load" />

    <FileLoaderCollection
      v-if="fileLoadingCollection"
      @load="load"
      ref="collectionFileLoader"
      @close="fileLoadingCollection = false"
    />

    <Publish
      v-if="publishing"
      :drawingTool="drawingTool"
      :patternDetails="patternDetails"
      @update-details="updatePatternDetails"
      @close="publishing = false"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
    />

    <ConvertImage
      v-if="convertImage"
      :sourcetool="drawingTool"
      @close="convertImage = false"
      @load="drawingTool.load($event)"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
    />
  </main>
</template>

<script>
/* libs */
import DrawingTool from "~/libs/DrawingTool";
import ACNLFormat from "~/libs/ACNLFormat";
import ACNHFormat from "~/libs/ACNHFormat";
import origin from "~/libs/origin";
import generateACNLQR from "~/libs/ACNLQRGenerator";
import saver from "~/libs/saver";
import lzString from "lz-string";
import { saveAs } from "file-saver";
import JSZip from "jszip";

// icons

import BxsFileImport from "~/assets/icons/bxs-file-import.svg?inline";
import BxsSave from "~/assets/icons/bxs-save.svg?inline";

// components
import ColorTools from "./ColorTools/ColorTools.vue";
import ConvertImage from "~/components/modals/ConvertImage";
import Publish from "~/components/modals/Publish.vue";
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import ThreeDRender from "~/components/ThreeDRender.vue";
import Toolbar from "./Toolbar.vue";
import FileLoader from "~/components/FileLoader.vue";
import FileLoaderCollection from "~/components/positioned/FileLoaderCollection.vue";
import CancelButton from "~/components/modals/CancelButton.vue";
import Dropup, { variants as DropupVariants } from "~/components/Dropup.vue";

import BxsFileArchiveSvg from "~/assets/icons/utilitybar/bxs-file-archive.svg?inline";

export default {
  name: "Editor",
  components: {
    ColorTools,
    ConvertImage,
    ModalContainer,
    ThreeDRender,
    Toolbar,
    Publish,
    FileLoader,
    FileLoaderCollection,
    CancelButton,
    Dropup,
    BxsFileImport,
    BxsSave,
  },
  data() {
    // randomize the gender
    const randomBinary = Math.floor(Math.random());
    return {
      DropupVariants,
      drawingTool: new DrawingTool(),
      patternDetails: {
        // redundant mirrored properties, need these to sync
        title: "Empty",
        creator: {
          id: 0,
          name: "Unknown",
        },
        town: {
          id: 0,
          name: "Unknown",
        },
        type: 9,
      },

      // colorTool & toolbar fields
      prevColorPicker: "acnl",
      colorPicker: null, // color picker mode

      // modals
      convertImage: null,
      publishing: false,
      fileLoadingCollection: false,

      // menu states
      forceShowImportMenu: false,
      forceShowExportMenu: false,
    };
  },
  computed: {
    importMenuItems() {
      const items = [
        {
          label: "Convert from IMG",
          onSelect: () => {
            this.convertImage = true;
          }
        },
        {
          label: "Open QR Code",
          onSelect: this.readQRCode,
        },
        {
          label: "Open .ACNL / .ACNH",
          onSelect: this.openPattern,
        },
        {
          label: "Open .ZIP / .DAT",
          onSelect: this.openCollection,
        }
      ];
      return items;
    },
    exportMenuItems() {
      const items = [];
      if (this.drawingTool.compatMode === "ACNL") {
        items.push(
          {
            label: "as .ACNL",
            onSelect: this.downloadBinary,
          },
          {
            label: "as QR Code",
            onSelect: this.downloadQR,
          },
        );
      }
      if (this.drawingTool.compatMode === "ACNH") {
        items.push(
          {
            label: "as .ACNH",
            onSelect: this.downloadBinary,
          },
          {
            label: "as PBL",
            onSelect: this.downloadQR,
          },
        );
      }
      items.push({
        label: "to Storage",
        onSelect: this.saveToStorage,
      });
      if (this.drawingTool.compatMode === "ACNL") {
        items.push({
              label: "Publish",
              onSelect: this.beginPublishing,
        });
      }
      return items;
    },
  },
  methods: {
    // ------------------
    // REACTION FUNCTIONS
    // ------------------
    // data can be binary string or any drawingTool accepted data type
    load(data) {
      console.log("debug here");
      this.drawingTool.load(data);
      this.drawingTool.render();
      this.syncPatternDetails();
    },
    onColorPicked: function (color, log = true) {
      if (this.drawingTool.currentColor === 15) {
        alert("this one has to stay transparent");
        return;
      }
      const currentColor = this.drawingTool.currentColor;
      if (this.drawingTool.getPalette(currentColor) === color) return;
      this.drawingTool.pushUndo();
      this.drawingTool.setPalette(this.drawingTool.currentColor, color);
      if (log) console.log(`color picked: ${color}`);
    },
    onChangeCurrentColor: function (idx, log = true) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();
      if (log) console.log(`changed current color: ${idx}`);
    },
    onChangeColorPicker: function (mode) {
      if (this.colorPicker != null) this.prevColorPicker = this.colorPicker;
      this.colorPicker = mode;
    },
    onChangePrevColorPicker: function (mode) {
      if (!["acnh", "acnl"].includes(mode)) return;
      else this.prevColorPicker = mode;
    },
    updatePatternDetails: function (patternDetails) {
      // update current with incoming
      this.patternDetails = {
        ...this.patternDetails,
        ...patternDetails,
      };

      // alias everything and update drawingTool
      const { title, creator, town, type } = this.patternDetails;
      this.drawingTool.title = title;
      this.drawingTool.patternType = type;
      this.drawingTool.creator = [creator.name, creator.id];
      this.drawingTool.town = [town.name, town.id];
    },
    // ------------------
    // SAVING FUNCTIONS
    // ------------------
    async downloadBinary() {
      saver.saveDrawingToolAsPattern(this.drawingTool);
    },
    async downloadQR() {
      await saver.saveDrawingToolAsPng(this.drawingTool);
    },
    async saveToStorage() {
      await saver.saveDrawingToolsToStorage([this.drawingTool]);
      window.alert("Successfully saved to Storage!");
    },

    // MODAL REACTION
    beginPublishing() {
      if (this.drawingTool.compatMode === "ACNH") {
        window.alert(
          "Publishing is not available for ACNH formatted patterns."
        );
        return;
      }
      this.publishing = true;
    },

    // ---------------------------------------------
    // ROUTE LOADING / COMPONENT MOUNTING  FUNCTIONS
    // ---------------------------------------------
    // sets up an new (already existing) instance of drawingTool
    initializePattern: async function () {
      // intial color palette
      const initialColors = [
        "#FFFFFF",
        "#888888",
        "#000000",
        "#FF0000",
        "#FF6600",
        "#FFFF00",
        "#22DD22",
        "#008833",
        "#00CDFF",
        "#1077FF",
        "#0000FF",
        "#CC00FF",
        "#FF00CC",
        "#FFAA88",
        "#993200",
      ];
      let currentColor = 0;
      for (const color of initialColors) {
        this.onChangeCurrentColor(currentColor, false);
        this.onColorPicked(color, false);
        ++currentColor;
      }
      // generate stitching patterns
      const stichingColor = initialColors.indexOf("#FFAA88");
      this.onChangeCurrentColor(stichingColor, false);
      for (let i = 1; i < 32; ++i) {
        this.drawingTool.setPixel(15, i); // vertical stiches
        this.drawingTool.setPixel(i, 15); // horizontal stiches
        if ((i + 1) % 3 === 0) ++i;
      }
      this.drawingTool.setPixel(15, 15);
      // reset current color back to normal
      this.onChangeCurrentColor(0, false);
      console.log("new pattern initialized");
    },
    // load a pattern from the route, set up new pattern if none in route
    loadFromRoute: async function () {
      const isPatternInUrlHash = this.$router.currentRoute.hash.length > 1;
      if (!isPatternInUrlHash) {
        this.initializePattern();
        return;
      }
      // pattern stored in URL
      const fragment = this.$router.currentRoute.hash.substring(1);
      // determine protocols
      const isHashProtocol = fragment.startsWith("H:");
      if (isHashProtocol) {
        const hash = fragment.substring(2);
        const bytes = await origin.view(hash);
        this.drawingTool.load(bytes);
      } else {
        this.drawingTool.load(lzString.compressToUTF16("TEST"));
      }
      return true;
    },
    // syncs relevant details for updateDetails
    syncPatternDetails: async function () {
      // copy details from drawingTool
      const { creator, town } = this.patternDetails;
      this.patternDetails.title = this.drawingTool.title;
      this.patternDetails.type = this.drawingTool.patternType;
      [creator.name, creator.id, creator.gender] = this.drawingTool.creator;
      [town.name, town.id] = this.drawingTool.town;
    },
    // IMPORTING / EXPORTING FUNCTIONS
    readQRCode() {
      this.$refs.imageFileLoader.open();
    },
    openPattern() {
      this.$refs.patternFileLoader.open();
    },
    async openCollection() {
      this.fileLoadingCollection = true;
      await this.$nextTick();
      this.$refs.collectionFileLoader.open();
      console.log("opening collection");
    },

    onImportTouchStart() {
      this.forceShowImportMenu = !this.forceShowImportMenu;
    },
    onExportTouchStart() {
      this.forceShowExportClick = !this.forceShowExportClick;
    },
  },
  mounted: async function () {
    // setup drawingTool
    await this.loadFromRoute();
    this.syncPatternDetails();

    // mount canvases and render
    this.drawingTool.addCanvas(this.$refs.main, { grid: true });
    this.drawingTool.addCanvas(this.$refs.preview);
    this.drawingTool.render();

    this.drawingTool.onLoad(() => {
      this.syncPatternDetails();
    });
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/transitions";
@import "styles/positioning";
@import "styles/functions";
@import "styles/screens";

.editor--container {
  transition: background-color 0.5s linear;
  background-color: $ecru-white;
  min-height: 100%;

  display: grid;
  grid-template-areas:
    "color-tools"
    "canvas"
    "preview" // hide this b/c user not sure which version to use on mobile
    "toolbar"
    "three-d";
  grid-template-columns: 1fr;
  grid-template-rows: min-content;
  justify-content: center;
  justify-items: center;
  align-items: flex-start;
  padding-bottom: 100px;
  background-color: $pink-lace;

  @include tablet-portrait {
    grid-template-areas:
      "color-tools color-tools"
      "canvas toolbar"
      "canvas toolbar"
      "three-d preview";
    grid-template-columns: max-content max-content;
    grid-template-rows: min-content;
    justify-content: center;
    padding-bottom: 0px;
    background-color: transparent;
    row-gap: 20px;
  }
  @include tablet-landscape {
  }
  @include desktop {
    grid-template-areas:
      "color-tools color-tools color-tools"
      "preview canvas toolbar"
      "three-d canvas toolbar";
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: repeat(3, max-content);
    row-gap: 0px;
  }
}

.editor--color-picker-window {
  display: inline-block;
  position: fixed;
  top: 0;
  left: 50%;

  transform: translate(-50%, 0%);
  z-index: 999;
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  @include tablet-portrait {
    width: auto;
    height: auto;
    max-height: 100%;
    overflow-y: scroll;
  }
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

.editor--preview-container {
  grid-area: preview;
  display: none;
  justify-self: center;
  margin-top: 30px;
  padding: 24px;

  @include polkadots($olive-haze, $donkey-brown);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);

  @include tablet-portrait {
    display: block;
  }
  @include desktop {
    display: block;
  }
  @include desktop-hd {
    padding: 32px;
  }
}

.editor--preview {
  width: calc-canvas-size(3);
  height: calc-canvas-size(3);
  background-color: white;

  @include tablet-portrait {
    width: calc-canvas-size(2);
    height: calc-canvas-size(2);
  }
  @include desktop-hd {
    width: calc-canvas-size(3);
    height: calc-canvas-size(3);
  }
}

.editor--preview-3d {
  grid-area: three-d;
  justify-self: center;
  display: block;

  @include tablet-portrait {
    display: block;
  }
  @include desktop {
    display: block;
  }
}

.editor--canvas-container {
  grid-area: canvas;
  justify-self: flex-end;

  box-sizing: content-box;
  @include flex-container--center;
  width: 100%;
  padding: 16px 0px;

  @include polkadots($olive-haze, $donkey-brown);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);

  @include tablet-portrait {
    width: auto;
    padding: 24px 24px;
    border-radius: 5px;
  }
  @include tablet-landscape {
    padding: 32px 32px;
  }
  @include desktop {
    width: auto;
    padding: 72px;
    border-radius: 8px;
  }
  @include desktop-hd {
    padding: 96px;
  }
}

.editor--canvas {
  width: calc-canvas-size(4);
  height: calc-canvas-size(4);

  @include phone-landscape {
    width: calc-canvas-size(5);
    height: calc-canvas-size(5);
  }
  @include tablet-portrait {
    width: calc-canvas-size(6);
    height: calc-canvas-size(6);
  }
  @include tablet-landscape {
    width: calc-canvas-size(8);
    height: calc-canvas-size(8);
  }
  @include desktop {
    // width: 512px;
    // height: 512px;
  }
  @include desktop-hd {
    width: calc-canvas-size(9);
    height: calc-canvas-size(9);
  }
}

.dropups {
  position: fixed;
  right: 0px;
  bottom: 15px;
  z-index: 999;

  display: grid;
  grid-template-columns: auto auto;
  justify-content: flex-end;
  column-gap: 10px;

  @include phone-landscape {
    right: 5px;
    transform: translate(0px, 0px);
  }
  @include tablet-portrait {
    right: 10px;
  }
  @include tablet-landscape {
    right: 10px;
  }
  @include desktop {
    right: 30px;
  }
}
</style>
