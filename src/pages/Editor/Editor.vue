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
          <ImportMenuItem
            v-for="item in importMenuItems"
            :key="item.label"
            :item="item"
          />
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
        @load="load"
      />
    </VDialog>
  </main>
</template>

<script lang="ts">
/* libs */
import DrawingTool from "@/libs/DrawingTool";
import { view } from "@/libs/origin";
import {
  drawingToolToNamedPatternBlob,
  drawingToolToNamedImageBlob,
  downloadNamedBlob,
} from "@/libs/downloader";
import lzString from "lz-string";
import {
  patternExts,
  qrImageExts,
} from "@/libs/reader";
import { PatternItem, createPatternItem } from "@/libs/storage";
// components
import { Vue, Component } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { mapActions } from "vuex";
import {
  VDialog,
  VMenu,
  VIcon,
  VBtn,
  VList,
  VListItem,
  VListItemTitle,
} from "vuetify/lib";
import ImportMenuItem from "./ImportMenuItem.vue";
import ColorTools from "./ColorTools/ColorTools.vue";
import ConvertImage from "./ConvertImage";
import Publish from "@/components/modals/Publish.vue";
import ThreeDRender from "@/components/ThreeDRender.vue";
import Toolbar from "./Toolbar.vue";
import CancelButton from "@/components/modals/CancelButton.vue";

const storageModule = namespace('storage');

/**
 * Mirrored pattern details in an object to sync w/ pattern as it changes.
 */
export interface PatternDetails {
  title: string,
  creator: {
    id: number,
    name: string,
    gender?: "Male" | "Female",
  },
  town: {
    id: number,
    name: string,
  },
  type: number,
}

export type ColorPickerMode = "acnl" | "acnh";

@Component({
  name: "Editor",
  components: {
    VDialog,
    VMenu,
    VIcon,
    VBtn,
    VList,
    VListItem,
    VListItemTitle,
    ImportMenuItem,
    ColorTools,
    ConvertImage,
    ThreeDRender,
    Toolbar,
    Publish,
    CancelButton,
  },
})
export default class Editor extends Vue {
  $refs!: {
    main: HTMLCanvasElement,
    preview: HTMLCanvasElement,
  };
  
  readonly patternExts!: typeof patternExts;
  readonly qrImageExts!: typeof qrImageExts;
  
  drawingTool: DrawingTool = new DrawingTool();
  
  /**
   * Mirrored pattern details in an object to sync w/DrawingTool as it changes.
   * Cannot completely track internal drawing tool changes (vue limitation).
   */
  patternDetails: PatternDetails = {
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
  };
  
  /**
   * The current color picker opened or null if not open.
   */
  colorPicker: ColorPickerMode | null = null;
  /**
   * Used to track the last opened color picker type to re-open if tools need them.
   */
  prevColorPicker: ColorPickerMode = "acnl";
  
  /**
   * Whether the convert image modal is open.
   */
  convertImage: boolean = false;
  /**
   * Whether the publishing modal is open.
   */
  publishing: boolean = false;
  
  // menu states
  forceShowImportMenu: boolean = false;
  forceShowExportMenu: boolean = false;
  
  // main pattern canvas settings
  mainGrid: boolean = true;
  
  get importMenuItems() {
    const items = [
      {
        label: "Convert from IMG",
        onSelect: () => {
          this.convertImage = true;
        }
      },
      {
        label: "Open QR Code",
        exts: qrImageExts,
        onLoad: this.load,
      },
      {
        label: "Open .ACNL / .ACNH",
        exts: patternExts,
        onLoad: this.load,
      },
      {
        label: "Open .ZIP / .DAT",
        onLoadCollection: this.load,
      }
    ];
    return items;
  };
  
  
  get exportMenuItems() {
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
  }
  
  @storageModule.Action('add')
  add!: (patternItems: PatternItem[]) => Promise<void>
  
  // ------------------
  // REACTION FUNCTIONS
  // ------------------
  load([drawingTool]: DrawingTool[]) {
    this.drawingTool.load(drawingTool.toString());
    this.drawingTool.render();
    this.syncPatternDetails();
  }
  
  
  /**
   * When a color is picked, update the drawing tool with the color picked.
   * @param color The css hex color string to attempt changing to.
   * @param log Whether to log the change.
   */
  onColorPicked(color: string, log = true) {
    if (this.drawingTool.currentColor === 15) {
      return alert("This one has to stay transparent!");
    }
    const currentColor = this.drawingTool.currentColor;
    if (this.drawingTool.getPalette(currentColor) === color) return;
    this.drawingTool.pushUndo();
    this.drawingTool.setPalette(this.drawingTool.currentColor, color);
    if (log) console.log(`color picked: ${color}`);
  }
  
  
  /**
   * When the current color is changed,
   * @param idx The index of the current color.
   * @param log Whether to log the change.
   */
  onChangeCurrentColor(idx: number, log = true) {
    if (this.drawingTool.currentColor === idx) return;
    this.drawingTool.currentColor = idx;
    this.drawingTool.onColorChange();
    if (log) console.log(`changed current color: ${idx}`);
  }
  
  
  /**
   * When the color picker changes between ACNL and ACNH modes.
   * Updates color picker mode and tracking data.
   */
  onChangeColorPicker(mode: ColorPickerMode | null) {
    if (this.colorPicker != null) this.prevColorPicker = this.colorPicker;
    this.colorPicker = mode;
  }
  
  
  /**
   * When the previous color picker mode changes.
   */
  onChangePrevColorPicker(mode: ColorPickerMode) {
    if (!["acnh", "acnl"].includes(mode)) return;
    else this.prevColorPicker = mode;
  }
  
  
  /**
   * Updates the current pattern details with new pattern details.
   */
  updatePatternDetails(patternDetails: PatternDetails) {
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
  }
  
  
  /**
   * Update the canvas by setting or unsetting grid lines.
   * @param newGridStatus Whether the grid lines should be turned on.
   */
  updateMainGrid(newGridStatus: boolean) {
    this.mainGrid = newGridStatus;
    this.drawingTool.changeCanvasGrid(this.$refs.main, { grid: newGridStatus });
    this.drawingTool.render();
  }
  
  
  // ------------------
  // SAVING FUNCTIONS
  // ------------------
  /**
   * Downloads the pattern file for the current pattern.
   */
  async downloadBinary() {
    const namedPatternBlob = await drawingToolToNamedPatternBlob(this.drawingTool);
    await downloadNamedBlob(namedPatternBlob);
  }
  
  /**
   * Downloads the qr code for the current pattern.
   */
  async downloadQR() {
    const namedImageBlob = await drawingToolToNamedImageBlob(this.drawingTool);
    await downloadNamedBlob(namedImageBlob);
  }
  
  
  /**
   * Saves the current pattern in the drawing tool to the storage.
   */
  async saveToStorage() {
    const copy = new DrawingTool(this.drawingTool.toString());
    await this.add([createPatternItem({
      drawingTool: copy,
      createdDate: new Date(),
    })]);
    window.alert("Successfully saved to Storage!");
  }
  
  
  // MODAL REACTION
  beginPublishing() {
    if (this.drawingTool.compatMode === "ACNH") {
      window.alert(
        "Publishing is not available for ACNH formatted patterns."
      );
      return;
    }
    this.publishing = true;
  }

  // ---------------------------------------------
  // ROUTE LOADING / COMPONENT MOUNTING  FUNCTIONS
  // ---------------------------------------------
  /**
   * sets up an new (already existing) instance of drawingTool
   */
  async initializePattern(): Promise<void> {
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
  }
  
  
  /**
   * Load a pattern from the route, set up new pattern if none in route
   * Returns true when successfully loaded from url.
   */
  async loadFromRoute(): Promise<boolean | undefined> {
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
      const bytes = await view(hash);
      this.drawingTool.load(bytes);
    } else {
      this.drawingTool.load(lzString.compressToUTF16("TEST"));
    }
    return true;
  }
  
  
  /**
   * Syncs relevant details between the drawing tool and the pattern details.
   */
  syncPatternDetails() {
    // copy details from drawingTool
    const { creator, town } = this.patternDetails;
    this.patternDetails.title = this.drawingTool.title;
    this.patternDetails.type = this.drawingTool.patternType;
    [creator.name, creator.id] = this.drawingTool.creator;
    // [creator.name, creator.id, creator.gender] = this.drawingTool.creator;
    [town.name, town.id] = this.drawingTool.town;
  }
  
  
  /**
   * To force import menu to open when touching.
   */
  onImportTouchStart() {
    this.forceShowImportMenu = !this.forceShowImportMenu;
  }
  
  
  /**
   * To force export menu to open when touhcing.
   */
  onExportTouchStart() {
    this.forceShowExportMenu = !this.forceShowExportMenu;
  }
  
  
  async mounted() {
    // setup drawingTool
    await this.loadFromRoute();
    this.syncPatternDetails();

    // mount canvases and render
    this.drawingTool.addCanvas(this.$refs.main, { grid: this.mainGrid });
    this.drawingTool.addCanvas(this.$refs.preview);
    this.drawingTool.render();

    this.drawingTool.onLoad(() => {
      this.syncPatternDetails();
    });
  }
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
    background-color: colors.$ecru-white;
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