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
    
    <VDialog
      transition="fade-transition"
      :value="colorPicker != null"
      @input="onChangeColorPicker(null)"
      content-class="colorpicker--dialog"
      hide-overlay
      width="auto"
      origin="top center"
    >
      <div
        v-if="colorPicker != null"
        class="editor--color-picker-window"
        style="text-align: center"
      >
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
    </VDialog>

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
      :mainGrid="mainGrid"
      @update-main-grid="updateMainGrid"
    />

    <div class="menus">
      <VMenu
        open-on-click
        top
        offset-y
        left
        rounded="xl"
        :nudge-top="10"
      >
        <template #activator="{on, attrs}">
            <VBtn
              class="import-btn rounded-xl"
              elevation="0"
              v-bind="attrs"
              v-on="on"
              large
            >
              <VBtn class="icon-ctn" disabled fab x-small left>
                <VIcon class="icon">mdi-file-import</VIcon>
              </VBtn>
              Import
            </VBtn>
        </template>
        <VList class="import-list">
          <VListItem
            v-for="item in importMenuItems"
            :key="item.label"
            link
            @click="item.onSelect"
          >
            <VListItemTitle
              v-text="item.label"
            />
          </VListItem>
        </VList>
      </VMenu>
      
      <VMenu
        open-on-click
        top
        offset-y
        left
        rounded="xl"
        :nudge-top="10"
      >
        <template #activator="{on, attrs}">
            <VBtn
              class="export-btn rounded-xl"
              elevation="0"
              v-bind="attrs"
              v-on="on"
              large
            >
              <VBtn class="icon-ctn" disabled fab x-small left>
                <VIcon class="icon">mdi-content-save</VIcon>
              </VBtn>
              Export
            </VBtn>
        </template>
        <VList class="export-list">
          <VListItem
            v-for="item in exportMenuItems"
            :key="item.label"
            link
            @click="item.onSelect"
          >
            <VListItemTitle
              v-text="item.label"
            />
          </VListItem>
        </VList>
      </VMenu>
      
    </div>

    <FileLoader
      ref="patternFileLoader"
      fileType="acpattern"
      @load="load"
    />

    <FileLoader ref="imageFileLoader" fileType="image" @load="load" />

    <FileLoaderCollection
      @load="load"
      ref="collectionFileLoader"
    />
    
    <VDialog
      v-model="publishing"
      content-class="publish--dialog rounded-xl"
      width="auto"
    >
      <Publish
        v-if="publishing"
        :drawingTool="drawingTool"
        :patternDetails="patternDetails"
        @update-details="updatePatternDetails"
        @close="publishing = false"
      />
    </VDialog>
    
    <VDialog
      v-model="convertImage"
      content-class="convert--dialog rounded-xl"
      width="auto"
    >
      <ConvertImage
        v-if="convertImage"
        :sourcetool="drawingTool"
        @close="convertImage = false"
        @load="drawingTool.load($event)"
      />
    </VDialog>
  </main>
</template>

<script>
/* libs */
import DrawingTool from "~/libs/DrawingTool";
import origin from "~/libs/origin";
import saver from "~/libs/saver";
import lzString from "lz-string";

// components
import {
  VDialog,
  VMenu,
  VIcon,
  VBtn,
  VList,
  VListItem,
  VListItemTitle,
} from "vuetify/lib";
import ColorTools from "./ColorTools/ColorTools.vue";
import ConvertImage from "~/components/modals/ConvertImage";
import Publish from "~/components/modals/Publish.vue";
import ThreeDRender from "~/components/ThreeDRender.vue";
import Toolbar from "./Toolbar.vue";
import FileLoader from "~/components/FileLoader.vue";
import FileLoaderCollection from "~/components/positioned/FileLoaderCollection.vue";
import CancelButton from "~/components/modals/CancelButton.vue";

export default {
  name: "Editor",
  components: {
    VDialog,
    VMenu,
    VIcon,
    VBtn,
    VList,
    VListItem,
    VListItemTitle,
    ColorTools,
    ConvertImage,
    ThreeDRender,
    Toolbar,
    Publish,
    FileLoader,
    FileLoaderCollection,
    CancelButton,
  },
  data() {
    // randomize the gender
    const randomBinary = Math.floor(Math.random());
    return {
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

      // menu states
      forceShowImportMenu: false,
      forceShowExportMenu: false,

      // main pattern canvas settings
      mainGrid: true,
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
        return alert("This one has to stay transparent!");
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
    updateMainGrid: function (newGridStatus) {
      this.$data.mainGrid = newGridStatus;
      this.drawingTool.changeCanvasGrid(this.$refs.main, { grid: newGridStatus });
      this.drawingTool.render();
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
    this.drawingTool.addCanvas(this.$refs.main, { grid: this.$data.mainGrid });
    this.drawingTool.addCanvas(this.$refs.preview);
    this.drawingTool.render();

    this.drawingTool.onLoad(() => {
      this.syncPatternDetails();
    });
  },
};
</script>

<style lang="scss" scoped>
@use "styles/overrides" as overrides;
@use "styles/colors" as colors;
@use "styles/transitions" as transitions;
@use "styles/positioning" as positioning;
@use "styles/functions" as functions;
@use "styles/screens" as screens;

.v-menu__content {
  box-shadow: none;
}

.editor--container {
  transition: background-color 0.5s linear;
  background-color: colors.$ecru-white;
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
  background-color: colors.$pink-lace;

  @include screens.tablet-portrait {
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
  @include screens.desktop {
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
  position: relative;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  @include screens.tablet-portrait {
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

  @include colors.polkadots(
    colors.$olive-haze,
    colors.$donkey-brown
  );
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);

  @include screens.tablet-portrait {
    display: block;
  }
  @include screens.desktop {
    display: block;
  }
  @include screens.desktop-hd {
    padding: 32px;
  }
}

.editor--preview {
  width: functions.calc-canvas-size(3);
  height: functions.calc-canvas-size(3);
  background-color: white;

  @include screens.tablet-portrait {
    width: functions.calc-canvas-size(2);
    height: functions.calc-canvas-size(2);
  }
  @include screens.desktop-hd {
    width: functions.calc-canvas-size(3);
    height: functions.calc-canvas-size(3);
  }
}

.editor--preview-3d {
  grid-area: three-d;
  justify-self: center;
  display: block;

  @include screens.tablet-portrait {
    display: block;
  }
  @include screens.desktop {
    display: block;
  }
}

.editor--canvas-container {
  grid-area: canvas;
  justify-self: flex-end;

  box-sizing: content-box;
  @include positioning.flex-container--center;
  width: 100%;
  padding: 16px 0px;

  @include colors.polkadots(
    colors.$olive-haze,
    colors.$donkey-brown
  );
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);

  @include screens.tablet-portrait {
    width: auto;
    padding: 24px 24px;
    border-radius: 5px;
  }
  @include screens.tablet-landscape {
    padding: 32px 32px;
  }
  @include screens.desktop {
    width: auto;
    padding: 72px;
    border-radius: 8px;
  }
  @include screens.desktop-hd {
    padding: 96px;
  }
}

.editor--canvas {
  width: functions.calc-canvas-size(4);
  height: functions.calc-canvas-size(4);

  @include screens.phone-landscape {
    width: functions.calc-canvas-size(5);
    height: functions.calc-canvas-size(5);
  }
  @include screens.tablet-portrait {
    width: functions.calc-canvas-size(6);
    height: functions.calc-canvas-size(6);
  }
  @include screens.tablet-landscape {
    width: functions.calc-canvas-size(8);
    height: functions.calc-canvas-size(8);
  }
  @include screens.desktop-hd {
    width: functions.calc-canvas-size(9);
    height: functions.calc-canvas-size(9);
  }
}

.menus {
  position: fixed;
  right: 0px;
  bottom: 15px;

  display: grid;
  grid-template-columns: auto auto;
  justify-content: flex-end;
  column-gap: 10px;

  @include screens.phone-landscape {
    right: 5px;
    transform: translate(0px, 0px);
  }
  @include screens.tablet-portrait {
    right: 10px;
  }
  @include screens.tablet-landscape {
    right: 10px;
  }
  @include screens.desktop {
    right: 30px;
  }
}

.import-btn,
.export-btn {
  padding-left: 10px !important;
  @include screens.tablet-landscape { font-size: 1.2rem; }
  .icon-ctn.v-btn--disabled {
    background-color: colors.$ecru-white !important;
    margin-right: 5px;
  }
}

.import-btn {
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$olive-haze,
  );
  .icon-ctn.v-btn--disabled .icon {
    color: colors.$olive-haze !important;
  };
}

.import-list {
  @include overrides.v-list(
    colors.$ecru-white,
    colors.$olive-haze,
    colors.$jambalaya,
  ) { font-size: 1.1rem; };
}

.export-btn {
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$robin-egg-blue,
  );
  .icon-ctn.v-btn--disabled .icon {
    color: colors.$robin-egg-blue !important;
  };
}

.export-list {
  @include overrides.v-list(
    colors.$ecru-white,
    colors.$robin-egg-blue,
    colors.$persian-green,
  ) { font-size: 1.1rem; };
}
</style>

<style lang="scss">
.colorpicker--dialog,
.publish--dialog,
.convert--dialog {
  box-shadow: none;
}

.colorpicker--dialog {
  align-self: flex-start;
  margin: 0;
}
</style>