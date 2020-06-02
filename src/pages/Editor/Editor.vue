<template>
  <main class="editor--container">
    <div style="text-align: center">
      <ColorTools
        :drawingTool="drawingTool"
        @change-current-color="onChangeCurrentColor"
        @color-picked="onColorPicked"
      />
    </div>
    <ModalContainer v-if="colorPicker != null" @modal-close="onChangeColorPicker(null)">
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
      <!-- transparent overlay -->
      <template #overlay>
        <div @click="onChangeColorPicker(null)" class="editor--color-picker-overlay"></div>
      </template>
    </ModalContainer>

    <div class="editor--middle-components">
      <!-- need this to control canvas ratio -->
      <div class="editor--previews">
        <div class="editor--preview-container">
          <canvas class="editor--preview" width="192" height="192" ref="preview" />
        </div>
        <div>
          <ThreeDRender :width="250" :height="450" :drawingTool="drawingTool" />
        </div>
      </div>
      <!-- width/height must be multiples of 32 and ratio of 1:1 -->
      <div class="editor--canvas-container">
        <canvas class="editor--canvas" width="576" height="576" ref="main" />
      </div>

      <Toolbar
        :drawingTool="drawingTool"
        :prevColorPicker="prevColorPicker"
        :colorPicker="colorPicker"
        @change-color-picker="onChangeColorPicker"
        @update-details="updatePatternDetails"
        :patternDetails="patternDetails"
      />
    </div>

    <div class="editor--dropups">
      <div class="editor--dropup import">
        <div class="editor--dropup-button">
          <div class="editor--dropup-icon-container">
            <IconImport class="editor--dropup-icon" />
          </div>
          <div class="editor--dropup-text">Import</div>
          <div class="editor--dropup-icon-container indicator">
            <IconCaretUp class="editor--dropup-icon" />
          </div>
        </div>
        <div class="editor--dropup-bridge"></div>
        <div class="editor--dropup-menu">
          <button class="editor--dropup-menu-item">Convert from IMG</button>
          <button class="editor--dropup-menu-item">Scan from QR Code</button>
          <button class="editor--dropup-menu-item">Open .ACNL File</button>
        </div>
      </div>

      <div class="editor--dropup save">
        <div class="editor--dropup-button">
          <div class="editor--dropup-icon-container">
            <IconSave class="editor--dropup-icon" />
          </div>
          <div class="editor--dropup-text">Save</div>
          <div class="editor--dropup-icon-container indicator">
            <IconCaretUp class="editor--dropup-icon" />
          </div>
        </div>
        <div class="editor--dropup-bridge"></div>
        <div class="editor--dropup-menu">
          <button @click="downloadBinary" class="editor--dropup-menu-item">as .ACNL</button>
          <button class="editor--dropup-menu-item">as QR Code</button>
          <button class="editor--dropup-menu-item">to Designs</button>
          <button class="editor--dropup-menu-item">Publish</button>
        </div>
      </div>
    </div>
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

// icons
import IconImport from "~/components/icons/IconImport.vue";
import IconSave from "~/components/icons/IconSave.vue";
import IconCaretUp from "~/components/icons/IconCaretUp.vue";

// components
import ColorTools from "./ColorTools/ColorTools.vue";
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import ThreeDRender from "~/components/ThreeDRender.vue";
import Toolbar from "./Toolbar.vue";
import Settings from "~/components/modals/Settings.vue";

export default {
  name: "Editor",
  components: {
    ColorTools,
    ModalContainer,
    ThreeDRender,
    Toolbar,
    IconImport,
    IconSave,
    IconCaretUp,
    Settings
  },
  data: function() {
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
          name: "Unknown"
        },
        type: 9,
        // publishing data
        selectedTypes: new Array(3).fill(undefined),
        selectedStyles: new Array(3).fill(undefined),
      },

      // colorTool & toolbar fields
      prevColorPicker: "acnl",
      colorPicker: null, // color picker mode

      pickPatterns: false,
      multiName: "Local Storage",
      allowMoveToLocal: true,
      origin
    };
  },
  methods: {
    // ------------------
    // REACTION FUNCTIONS
    // ------------------
    onColorPicked: function(color, log = true) {
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
    onChangeCurrentColor: function(idx, log = true) {
      if (this.drawingTool.currentColor === idx) return;
      this.drawingTool.currentColor = idx;
      this.drawingTool.onColorChange();
      if (log) console.log(`changed current color: ${idx}`);
    },
    onChangeColorPicker: function(mode) {
      if (this.colorPicker != null) this.prevColorPicker = this.colorPicker;
      this.colorPicker = mode;
    },
    updatePatternDetails: function(patternDetails) {
      // update current with incoming
      this.patternDetails = {
        ...this.patternDetails,
        ...patternDetails
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
    downloadBinary() {
      const blob = new Blob([this.drawingTool.toBytes()], {
        type: "application/octet-stream"
      });
      let ext = "acnl";
      const isACNL = this.drawingTool.pattern instanceof ACNLFormat;
      if (!isACNL) ext = "acnh";
      saveAs(blob, `${this.drawingTool.title}.${ext}`);
    },
    // ---------------------------------------------
    // ROUTE LOADING / COMPONENT MOUNTING  FUNCTIONS
    // ---------------------------------------------
    // sets up an new (already existing) instance of drawingTool
    initializePattern: async function() {
      // intial color palette
      const initialColors = [
        "#FFFFFF", "#888888", "#000000", "#FF0000", "#FF6600", "#FFFF00",
        "#22DD22", "#008833", "#00CDFF", "#1077FF", "#0000FF", "#CC00FF",
        "#FF00CC", "#FFAA88", "#993200"
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
    loadFromRoute: async function() {
      const isPatternInUrlHash = this.$router.currentRoute.hash.length > 1;
      if (!isPatternInUrlHash) {
        this.initializePattern();
        return;
      };
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
    syncPatternDetails: async function() {
      // copy details from drawingTool
      const { creator, town } = this.patternDetails;
      this.patternDetails.title = this.drawingTool.title;
      this.patternDetails.type = this.drawingTool.patternType;
      [creator.name, creator.id, creator.gender] = this.drawingTool.creator;
      [town.name, town.id] = this.drawingTool.town;
    },

  },
  mounted: async function() {
    // setup drawingTool
    await this.loadFromRoute();
    this.syncPatternDetails();

    // mount canvases and render
    this.drawingTool.addCanvas(this.$refs.main, { grid: true });
    this.drawingTool.addCanvas(this.$refs.preview);
    this.drawingTool.render();
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/transitions";
@import "styles/positioning";
@import "styles/functions";

.editor--container {
  min-width: 800px;
  min-height: 100%;
  transition: background-color;
  background-color: $ecru-white;

  // &.pink-out {
  //   background-color: $cinderella;
  // }
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
  grid-template-columns: 1fr max-content 1fr;
  grid-template-rows: auto;
  justify-content: center;
  align-items: flex-start;
}

.editor--previews {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: repeat(2, max-content);

  div {
    margin-left: auto;
    margin-right: auto;
  }
}

.editor--preview-container {
  margin-top: 30px;
  @include flex-container--center;
  padding: 48px;

  @include polkadots($sand-dune, $donkey-brown);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
}

// .editor--preview {
// }

.editor--canvas-container {
  padding: 96px;
  box-sizing: content-box;
  @include flex-container--center;
  overflow: hidden;

  border-radius: 8px;
  @include polkadots($sand-dune, $donkey-brown);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
}

// .editor--canvas {
// }

.editor--dropups {
  position: fixed;
  right: 30px;
  bottom: 15px;
  z-index: 999;

  display: flex;
  justify-content: flex-end;
}

.editor--dropup {
  user-select: none;
  margin-right: 10px;
  @include relative-in-place;

  .editor--dropup-button {
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    background-color: $sand-dune;
    border-radius: 15px;
    @include relative-in-place;
    padding: 7px 10px;

    &:hover {
      cursor: pointer;
    }
    &:hover ~ .editor--dropup-menu {
      display: block;
    }
  }
  &.save .editor--dropup-button {
    background-color: $tiffany-blue;
  }

  .editor--dropup-icon-container {
    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-content: center;

    width: 30px;
    @include relative-in-place;
    background-color: $ecru-white;
    border-radius: 999px;

    &.indicator {
      background-color: transparent;
      .editor--dropup-icon {
        fill: $ecru-white;
      }
    }

    &:after {
      display: block;
      content: "";
      padding-bottom: 100%;
    }
  }

  .editor--dropup-icon {
    width: 70%;
    fill: $sand-dune;
  }
  &.save .editor--dropup-icon {
    fill: $tiffany-blue;
  }

  .editor--dropup-text {
    display: inline-block;
    margin-left: 10px;
    margin-right: 2px;

    color: $ecru-white;
    font-size: 1.35rem;
    font-weight: 600;
  }

  $bridge-distance: 20px;
  .editor--dropup-bridge {
    display: none;
    position: absolute;
    top: 1px; // ensure connection
    right: 0;
    transform: translate(0%, -100%);
    width: 100%;
    height: $bridge-distance;
  }
  &:hover .editor--dropup-bridge {
    display: block;
  }

  .editor--dropup-menu {
    display: block;
    // pretend display: none
    pointer-events: none;
    opacity: 0;
    position: absolute;
    top: -$bridge-distance;
    right: 0;
    transition: transform 0.15s $energetic;
    transform: translate(0, -100%) scale(0.8);
    background-color: $sand-dune;
    padding: 30px 40px;
    border-radius: 20px;
  }
  &.save .editor--dropup-menu {
    background-color: $tiffany-blue;
  }
  &:hover .editor--dropup-menu {
    pointer-events: initial;
    transform: translate(0, -100%) scale(1);
    opacity: 1;
  }

  .editor--dropup-menu-item {
    @include reset-button-properties;
    @include relative-in-place;
    display: block;
    color: $ecru-white;
    font-size: 1.25rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &:after {
      display: none;
      width: calc(100% + 20px);
      height: 70%;
      content: "";

      position: absolute;
      left: 50%;
      bottom: -3px;
      z-index: -1;
      transform: translate(-50%);

      background-color: $domino;
      border-radius: 3px;
    }
    &:hover:after {
      display: block;
    }

    &:nth-child(1) ~ .editor--dropup-menu-item {
      margin-top: 16px;
    }
  }
  &.save .editor--dropup-menu-item:after {
    background-color: $pine-green;
  }
}
</style>