<template>
  <div class="toolbar--container">
    <div class="toolbar--options">
      <div v-if="tool === 'brush'" class="toolbar--options-set brush">
        <VBtn
          :class="{
            'option-btn': true,
            'option-btn__active': tool == 'brush' && option === 'small',
          }"
          @click="selectTool('brush', 'small')"
          elevation="0"
        >
          <IconBrushSmall/>
        </VBtn>
        
        <VBtn
          :class="{
            'option-btn': true,
            'option-btn__active': tool == 'brush' && option === 'medium',
          }"
          @click="selectTool('brush', 'medium')"
          elevation="0"
        >
          <IconBrushMedium/>
        </VBtn>
        
        <VBtn
          :class="{
            'option-btn': true,
            'option-btn__active': tool == 'brush' && option === 'large',
          }"
          @click="selectTool('brush', 'large')"
          elevation="0"
        >
          <IconBrushLarge/>
        </VBtn>
      </div>
      <div class="toolbar--options-toggle-hint">
        <button @click="cycleOptions" class="hint">T</button>
      </div>
    </div>

    <div class="toolbar--shortcuts">
      <VBtn
        class="storage-btn rounded-xl"
        @click="storageOpen = true"
        elevation="0"
      >
        <VBtn
          class="storage-btn-icon-ctn rounded-xl"
          :ripple="false"
          elevation="0"
        >
          <IconInbox class="storage-btn-icon"/>
        </VBtn>
        <span>Storage</span>
      </VBtn>

      <div class="toolbar--shortcuts-row colors">
        <!-- PALETTES PLACEHOLDER -->
        <div></div>

        <!-- CHANGE COLOR -->
        <VTooltip
          content-class="shortcut--tooltip rounded-lg"
          open-on-hover
          top
          :color="colors.robinEggBlue"
        >
          <template #activator="{ on, attrs }">
            <VBtn
              :class="{
                'shortcut-btn': true,
                'shortcut-btn__color': true,
              }"
              v-bind="attrs"
              v-on="on"
              @click="onChangeColorPicker(prevColorPicker)"
              :ripple="false"
              elevation="0"
            >
              <IconPaintTube class="shortcut-icon" />
            </VBtn>
          </template>
          <div>Change Color</div>
        </VTooltip>
      </div>

      <VDivider class="toolbar-divider" />

      <div class="toolbar--shortcuts-row drawing">
        <!-- BRUSH -->
        <VTooltip
          content-class="shortcut--tooltip rounded-lg"
          open-on-hover
          top
          :color="colors.robinEggBlue"
        >
          <template #activator="{ on, attrs }">
            <VBtn
              :class="{
                'shortcut-btn': true,
                'shortcut-btn__brush': true,
                'shortcut-btn--active': tool === 'brush',
              }"
              v-bind="attrs"
              v-on="on"
              @click="selectTool('brush', 'small')"
              :ripple="false"
              elevation="0"
            >
              <IconBrushLarge
                v-if="tool === 'brush' && option === 'large'"
                class="shortcut-icon"
              />
              <IconBrushMedium
                v-else-if="tool === 'brush' && option === 'medium'"
                class="shortcut-icon"
              />
              <IconBrushSmall v-else class="shortcut-icon" />
            </VBtn>
          </template>
          <div>Brush</div>
        </VTooltip>
        
        <!-- FILL -->
        <VTooltip
          content-class="shortcut--tooltip rounded-lg"
          open-on-hover
          top
          :color="colors.robinEggBlue"
        >
          <template #activator="{ on, attrs }">
            <VBtn
              :class="{
                'shortcut-btn': true,
                'shortcut-btn__fill': true,
                'shortcut-btn--active': tool === 'fill',
              }"
              v-bind="attrs"
              v-on="on"
              @click="selectTool('fill', null)"
              :ripple="false"
              elevation="0"
            >
              <IconColorFill class="shortcut-icon" />
            </VBtn>
          </template>
          <div>Fill</div>
        </VTooltip>

        <!-- EYE DROPPER -->
        <VTooltip
          content-class="shortcut--tooltip rounded-lg"
          open-on-hover
          top
          :color="colors.robinEggBlue"
        >
          <template #activator="{ on, attrs }">
            <VBtn
              :class="{
                'shortcut-btn': true,
                'shortcut-btn__eyedropper': true,
                'shortcut-btn--active': tool === 'eyeDropper',
              }"
              v-bind="attrs"
              v-on="on"
              @click="selectTool('eyeDropper', null)"
              :ripple="false"
              elevation="0"
            >
              <IconEyeDropper class="shortcut-icon" />
            </VBtn>
          </template>
          <div>Eye Dropper</div>
        </VTooltip>

        <!-- placeholder -->
        <div></div>

        <!-- UNDO -->
        <VTooltip
          content-class="key--tooltip rounded-lg"
          open-on-hover
          bottom
          nudge-right="10"
          nudge-top="15"
          :color="colors.oliveHaze"
        >
          <template #activator="{ on: key }">
            <VTooltip
              content-class="shortcut--tooltip rounded-lg"
              open-on-hover
              top
              :color="colors.robinEggBlue"
            >
              <template #activator="{ on: shortcut }">
                <VBtn
                  :class="{
                    'shortcut-btn': true,
                    'shortcut-btn__undo': true,
                  }"
                  v-on="combineOns(key, shortcut)"
                  @click="drawingTool.undo()"
                  :ripple="false"
                  elevation="0"
                >
                  <IconUndo class="shortcut-icon" />
                </VBtn>
              </template>
              <div>Undo</div>
            </VTooltip>
          </template>
          <div>Ctrl + Z</div>
        </VTooltip>

        <!-- REDO -->
        <VTooltip
          content-class="key--tooltip rounded-lg"
          open-on-hover
          bottom
          nudge-right="40"
          nudge-top="15"
          :color="colors.oliveHaze"
        >
          <template #activator="{ on: key }">
            <VTooltip
              content-class="shortcut--tooltip rounded-lg"
              open-on-hover
              top
              :color="colors.robinEggBlue"
            >
              <template #activator="{ on: shortcut }">
                <VBtn
                  :class="{
                    'shortcut-btn': true,
                    'shortcut-btn__redo': true,
                  }"
                  v-on="combineOns(key, shortcut)"
                  @click="drawingTool.redo()"
                  :ripple="false"
                  elevation="0"
                >
                  <IconRedo class="shortcut-icon" />
                </VBtn>
              </template>
              <div>Redo</div>
            </VTooltip>
          </template>
          <div>Ctrl + Shift + Z</div>
        </VTooltip>
      </div>

      <VDivider class="toolbar-divider" />

      <div class="toolbar--shortcuts-row etc">
        <!-- Pattern Settings -->
        <VTooltip
          content-class="shortcut--tooltip rounded-lg"
          open-on-hover
          top
          :color="colors.robinEggBlue"
        >
          <template #activator="{ on, attrs }">
            <VBtn
              :class="{
                'shortcut-btn': true,
              }"
              v-bind="attrs"
              v-on="on"
              @click="settingsOpen = true"
              :ripple="false"
              elevation="0"
            >
              <IconDetail class="shortcut-icon" />
            </VBtn>
          </template>
          <div>Pattern Settings</div>
        </VTooltip>

        <!-- PREVIEW -->
        <VTooltip
          content-class="key--tooltip rounded-xl"
          open-on-hover
          bottom
          nudge-right="20"
          nudge-top="25"
          :color="colors.oliveHaze"
        >
          <template #activator="{ on: key }">
            <VTooltip
              content-class="shortcut--tooltip rounded-lg"
              open-on-hover
              top
              :color="colors.robinEggBlue"
            >
              <template #activator="{ on: shortcut }">
                <VBtn
                  :class="{
                    'shortcut-btn': true,
                    'shortcut-btn__preview': true,
                  }"
                  v-on="combineOns(key, shortcut)"
                  @click="previewOpen = true"
                  :ripple="false"
                  elevation="0"
                >
                  <IconQRCode class="shortcut-icon" />
                </VBtn>
              </template>
              <div>Preview</div>
            </VTooltip>
          </template>
          <div>P</div>
        </VTooltip>
      </div>

      <div class="toolbar--shortcuts-row grid">
        <VTooltip
          content-class="shortcut--tooltip rounded-lg"
          open-on-hover
          top
          :color="colors.robinEggBlue"
        >
          <template #activator="{ on, attrs }">
            <VBtn
              :class="{
                'shortcut-btn': true,
                'shortcut-btn--active': mainGrid,
              }"
              v-bind="attrs"
              v-on="on"
              @click="$emit('update-main-grid', !mainGrid)"
              :ripple="false"
              elevation="0"
            >
              <IconGrid class="shortcut-icon" />
            </VBtn>
          </template>
          <div>Turn Grid {{ mainGrid ? 'Off' : 'On' }}</div>
        </VTooltip>
      </div>
      
      <VSwitch
        class="mode-toggle"
        :label="this.drawingTool.compatMode === 'ACNH' ? 'ACNH' : 'ACNL'"
        :color="colors.jambalaya"
        :value="gameMode"
        readonly
        @click="changeGameModeWithWarning"
        inset
      />
    </div>

    <VDialog
      v-model="settingsOpen"
      content-class="settings--dialog"
      width="auto"
    >
      <PatternSettings
        v-if="settingsOpen"
        @close="settingsOpen = false"
        @update-details="$emit('update-details', $event)"
        :drawingTool="drawingTool"
        :types="drawingTool.allTypes"
        :patternDetails="patternDetails"
      />
    </VDialog>

    <VDialog v-model="previewOpen" content-class="preview--dialog" width="auto">
      <Preview
        v-if="previewOpen"
        @close="previewOpen = false"
        :drawingTool="drawingTool"
      />
    </VDialog>

    <VDialog
      v-model="storageOpen"
      content-class="storage--dialog"
      scrollable
      width="auto"
    >
      <Storage v-if="storageOpen" @close="storageOpen = false" @load="load" />
    </VDialog>

    <VDialog
      v-model="gameModeWarning"
      content-class="warning--dialog rounded-xl"
      max-width="600"
      width="auto"
    >
      <VCard :color="colors.ecruWhite" >
        <VCardTitle class="warning-title" >Game Mode Warning</VCardTitle>
        <VCardText class="warning-content">
          <ACNHToACNLInfo v-if="gameMode" />
          <ACNLToACNHInfo v-else />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            class="cancel-btn rounded-lg"
            @click="gameModeWarning = false"
            elevation="0"
          >
            Cancel
          </VBtn>
          <VBtn
            class="continue-btn rounded-lg"
            @click="changeGameModeFromWarning(dismissForever)"
            elevation="0"
          >
            Continue
          </VBtn>
        </VCardActions>
        <CancelButton @click="gameModeWarning = false"></CancelButton>
      </VCard>
    </VDialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import {
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSpacer,
  VBtn,
  VBadge,
  VIcon,
  VTooltip,
  VDivider,
  VCheckbox,
  VSwitch,
} from "vuetify/lib";
import CancelButton from "@/components/modals/CancelButton.vue";
import DrawingTool from "@/libs/DrawingTool";
import PatternSettings from "./PatternSettings.vue";
import Preview from "./Preview.vue";
import Storage from "./Storage.vue";
import ACNLToACNHInfo from "./ACNLToACNHInfo.vue";
import ACNHToACNLInfo from "./ACNHToACNLInfo.vue";
import { combineOns } from "@/libs/component-helpers";

// icons
import IconInbox from "@/components/icons/IconInbox.vue";
import IconPaintTube from "@/components/icons/IconPaintTube.vue";
import IconPalette from "@/components/icons/IconPalette.vue";
import IconBrushSmall from "@/components/icons/IconBrushSmall.vue";
import IconBrushMedium from "@/components/icons/IconBrushMedium.vue";
import IconBrushLarge from "@/components/icons/IconBrushLarge.vue";
import IconColorFill from "@/components/icons/IconColorFill.vue";
import IconEyeDropper from "@/components/icons/IconEyeDropper.vue";
import IconUndo from "@/components/icons/IconUndo.vue";
import IconRedo from "@/components/icons/IconRedo.vue";
import IconDetail from "@/components/icons/IconDetail.vue";
import IconQRCode from "@/components/icons/IconQRCode.vue";
import IconGrid from "@/components/icons/IconGrid.vue";


import colors from "@/styles/colors.scss";

// tool functions IIFE
const brush = (() => {
  const small = (x, y, tool) => {
    tool.drawPixel(x, y);
  };

  const medium = (x, y, tool) => {
    const color = tool.setPixel(x, y);
    tool.setPixel(x - 1, y, color); // left
    tool.setPixel(x + 1, y, color); // right
    tool.setPixel(x, y + 1, color); // above
    tool.setPixel(x, y - 1, color); // below
    tool.render();
  };

  const large = (x, y, tool) => {
    const color = tool.setPixel(x, y, color);
    tool.setPixel(x - 1, y, color); // left
    tool.setPixel(x - 2, y, color); // left left
    tool.setPixel(x + 1, y, color); // right
    tool.setPixel(x + 2, y, color); // right right
    tool.setPixel(x, y + 1, color); // top
    tool.setPixel(x, y + 2, color); // top top
    tool.setPixel(x, y - 1, color); // below
    tool.setPixel(x, y - 2, color); // bottom bottom
    tool.setPixel(x - 1, y + 1, color); // top left
    tool.setPixel(x + 1, y + 1, color); // top right
    tool.setPixel(x - 1, y - 1, color); // bottom left
    tool.setPixel(x + 1, y - 1, color); // bottom right
    tool.render(); // rerenders everything
  };
  return { small, medium, large };
})();

const eyeDropper = (x, y, tool) => {
  let newColor = tool.getPixel(x, y);
  if (newColor !== false) {
    tool.currentColor = newColor;
    tool.onColorChange();
  }
};

const fill = (x, y, tool) => {
  const prevColor = tool.getPixel(x, y);
  const newColor = tool.currentColor;
  if (prevColor === false) return; // invalid pixel
  if (prevColor === newColor) return; // nothing to flood
  let counter = 0;
  const reColor = (inX, inY) => {
    const thisColor = tool.getPixel(inX, inY);
    // not we're setting color on pixel data, has not been rendered, speed optimization
    if (
      thisColor === prevColor &&
      tool.setPixel(inX, inY, newColor) === newColor
    ) {
      reColor(inX - 1, inY);
      reColor(inX + 1, inY);
      reColor(inX, inY - 1);
      reColor(inX, inY + 1);
    }
  };
  reColor(x, y);
  // render all changes at once
  tool.render();
};

// string to handler mappings
const toolMappings = {
  brush,
  fill,
  eyeDropper,
};

export default {
  name: "ToolBar",
  components: {
    VDialog,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VSpacer,
    VBtn,
    VBadge,
    VIcon,
    VTooltip,
    VDivider,
    VCheckbox,
    VSwitch,
    CancelButton,
    PatternSettings,
    Preview,
    Storage,
    IconInbox,
    IconPaintTube,
    IconPalette,
    IconBrushSmall,
    IconBrushMedium,
    IconBrushLarge,
    IconColorFill,
    IconEyeDropper,
    IconUndo,
    IconRedo,
    IconDetail,
    IconGrid,
    IconQRCode,
    ACNLToACNHInfo,
    ACNHToACNLInfo,
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    },
    prevColorPicker: {
      type: String,
      required: false,
    },
    colorPicker: {
      type: String,
      required: false,
    },
    patternDetails: {
      type: Object,
      required: true,
    },
    mainGrid: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      colors,
      tool: null,
      option: null,
      settingsOpen: false,
      previewOpen: false,
      storageOpen: false,
      // isACNH
      gameMode: this.drawingTool.compatMode === "ACNH",
      gameModeWarning: false,
      dismissForever: false,
      // component metadata
      gridInputId: uuidv4(),
    };
  },
  methods: {
    combineOns,
    load: function (binaryString) {
      this.$emit("load", binaryString);
    },
    onChangeColorPicker: function (mode) {
      this.$emit("change-color-picker", mode);
    },
    /**
     * Sets the tool to the mouse button
     *
     * @param {String} mode
     * @param {String} option
     */
    selectTool: function (newTool, newOption = null, alt = false) {
      // no matching tool, bail
      if (!(newTool in toolMappings)) return;
      let tool = toolMappings[newTool];
      if (newOption && typeof toolMappings[newTool] === "object") {
        if (!(newOption in toolMappings[newTool])) return;
        tool = tool[newOption];
      }
      if (alt) this.drawingTool.drawHandlerAlt = tool;
      else {
        this.drawingTool.drawHandler = tool;
        this.tool = newTool;
        this.option = newOption;
      }
    },
    // helps determines if the passed tool is the current tool drawHandler
    // can also determine if a tool has options
    // -1 means invalid, none matching
    // 0 counts itself
    // 1+ for options not counting itself
    countToolOptions: function (newTool, newOption) {
      if (!(newTool in toolMappings)) return -1;
      if (typeof toolMappings[newTool] === "function") return 0;
      if (typeof toolMappings[newTool] === "object") {
        if (newOption == null) return Object.keys(toolMappings[newTool]).length;
        if (!(newOption in toolMappings[newTool])) return -1;
        else return 0;
      }
      return -1;
    },
    cycleOptions: function () {
      const { tool, option } = this;
      if (this.option == null) return;
      const options = Object.keys(toolMappings[tool]);
      const idx = options.indexOf(option);
      const nextIdx = (idx + 1) % options.length;
      const nextOption = options[nextIdx];
      this.option = nextOption;
      this.selectTool(tool, nextOption);
    },
    onKey: async function (event) {
      const { ctrlKey, altKey, metaKey, shiftKey, code, preventDefault } =
        event;
      const noMod = !ctrlKey && !altKey && !metaKey && !shiftKey;
      if (noMod) {
        // cycle tool options
        if (code === "KeyT") {
          this.cycleOptions();
          return;
        }
        // qrPreview
        else if (code === "KeyP") {
          this.settingsOpen = false;
          this.$emit("change-color-picker", null);
          // need to wait 2 ticks for portal to process
          await this.$nextTick();
          await this.$nextTick();
          this.previewOpen = true;
          return;
        }
      }
      // undo redos
      if (ctrlKey && !altKey && !metaKey) {
        if (code === "KeyZ") {
          if (shiftKey) this.drawingTool.redo();
          else this.drawingTool.undo();
        }
      }
    },
    changeGameModeWithWarning() {
      const targetCompatMode =
        this.drawingTool.compatMode === "ACNH" ? "ACNL" : "ACNH";
      const currentCompatMode = targetCompatMode === "ACNH" ? "ACNL" : "ACNH";
      const dismissForever =
        localStorage.getItem(
          `dismiss${currentCompatMode}To${targetCompatMode}`
        ) === "true";
      if (!dismissForever) {
        this.gameModeWarning = true;
        return;
      }
      this.drawingTool.compatMode = targetCompatMode;
      this.gameMode = this.drawingTool.compatMode === "ACNH";
      this.$emit(
        "change-prev-color-picker",
        this.drawingTool.compatMode.toLowerCase()
      );
    },
    changeGameModeFromWarning(dismissForever) {
      this.gameModeWarning = false;
      const targetCompatMode =
        this.drawingTool.compatMode === "ACNH" ? "ACNL" : "ACNH";
      const currentCompatMode = targetCompatMode === "ACNH" ? "ACNL" : "ACNH";
      if (dismissForever) {
        localStorage.setItem(
          `dismiss${currentCompatMode}To${targetCompatMode}`,
          true
        );
      }
      this.drawingTool.compatMode = targetCompatMode;
      this.gameMode = this.drawingTool.compatMode === "ACNH";
      this.$emit(
        "change-prev-color-picker",
        this.drawingTool.compatMode.toLowerCase()
      );
    },
  },
  mounted() {
    this.selectTool("brush", "small");
    this.selectTool("eyeDropper", null, true);
    window.addEventListener("keydown", this.onKey);
    this.drawingTool.onLoad((t) => {
      this.gameMode = t.compatMode == "ACNH";
    });
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.onKey);
  },
};
</script>

<style lang="scss" scoped>
@use "styles/overrides" as overrides;
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/transitions" as transitions;
@use "styles/screens" as screens;

// define most important variables when changing media queries
$toolbar--options-width: 75px;

.toolbar--container {
  user-select: none;
  grid-area: toolbar;
  justify-self: stretch;
  overflow: visible;
  align-self: center;

  display: grid;
  grid-template-columns: auto 1fr 75px;
  grid-template-rows: auto;
  justify-content: space-between;
  justify-items: center;
  align-content: stretch;
  align-items: flex-start;

  column-gap: 10px;

  background-color: colors.$pink-lace;
  overflow: visible;

  @include screens.tablet-portrait {
    grid-template-columns: auto 1fr 1fr;
    justify-self: start;
    align-self: stretch;
    width: 280px;
    height: auto;
    border-radius: 0px 50px 50px 0px;
  }
  @include screens.tablet-landscape {
    column-gap: 15px;
  }
  @include screens.desktop {
    width: 320px;
    align-self: center;
    height: 650px;
  }
  @include screens.desktop-hd {
    height: 700px;
  }
}

.toolbar--options {
  // grid-area: options;
  position: relative;
  top: 0;
  left: 0;

  box-sizing: border-box;
  align-self: center;
  display: grid;
  grid-template-rows: 1fr;
  justify-items: stretch;

  width: $toolbar--options-width;
  min-height: 225px;
  padding: 7px 10px 10px 3px;

  background-color: colors.$provincial-pink;
  border-radius: 0px 40px 40px 0px;
}

.toolbar--options-set {
  width: 100%;
  height: 100%;
  display: grid;
  grid-auto-rows: 1fr 1fr 1fr;
  grid-auto-columns: 100%;
  justify-content: stretch;
  justify-items: stretch;
  row-gap: 5px;
}

.option-btn {
  @include overrides.v-btn(
    colors.$bison-hide,
    transparent
  ) { z-index: 1; };
  @include positioning.relative-in-place;
  width: 100%;
  height: 100%;
  min-width: 0 !important;
  height: auto !important;
  border-radius: 100%;
  fill: colors.$bison-hide;
  
  svg { width: 30px; }
  
  &::after {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    content: "";
    background-color: colors.$bon-jour;
    transition: transform 0.15s transitions.$energetic;
    display: block;
    width: 100%;
    height: 100%;
    transform: scale(0.8);
    transform-origin: 50% 50%;
    border-radius: 100%;
    z-index: 0;
  }
  
  &:hover:not(.option-btn__active) {
    &::after {
      opacity: 1;
      transform: scale(1.0);
    }
  }
  &.option-btn__active {
    @include overrides.v-btn(colors.$white, colors.$robin-egg-blue);
    fill: colors.$white;
  }
}

.toolbar--options-toggle-hint {
  position: absolute;
  bottom: 0px;
  right: 20px;
  transform: translate(50%, 50%);

  padding: 5px;
  width: 30px;
  height: 30px;

  border-radius: 999px;
  background-color: colors.$provincial-pink;

  .hint {
    // reset
    appearance: none;
    border: 0px;
    outline: none;
    font-family: inherit;
    padding: 0px;

    width: 100%;
    height: 100%;

    font-size: 1rem;
    font-weight: 700;

    cursor: pointer;
    border-radius: 999px;
    color: white;
    background-color: colors.$olive-haze;
  }
}

.toolbar--shortcuts {
  position: relative;
  top: 0;
  left: 0;

  display: grid;
  grid-template-columns: auto;
  grid-template-rows: max-content;
  justify-items: left;
  align-items: start;
  align-content: start;
  height: 100%;
}

.toolbar--shortcuts-row {
  position: relative;
  top: 0;
  left: 0;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content;
  column-gap: 10px;
  justify-content: center;
  justify-self: center;

  &.colors {
    margin-top: 14px;
    margin-bottom: 10px;
  }

  .toolbar--shortcut.palette {
    visibility: hidden;
  }

  &.drawing {
    margin-top: 14px;
    margin-bottom: 10px;
    & .toolbar--shortcut.active {
      .toolbar--shortcut-icon-container {
        background: transparent;
      }
      .toolbar--shortcut-icon {
        fill: colors.$jambalaya;
      }
    }
  }

  &.etc {
    margin-top: 14px;
    margin-bottom: 10px;
  }
  
  &.grid {
    margin-top: 0px;
    margin-bottom: 5px;
    direction: rtl;
  }
}

.storage-btn {
  justify-self: center;
  @include overrides.v-btn(
    colors.$olive-haze,
    colors.$ecru-white
  ) {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 5px;
  };
  margin-top: 20px;
  height: auto !important;
  padding: 8px 16px 8px 8px !important;
  font-weight: 700;
  font-size: 1.2rem;
  fill: colors.$ecru-white;
  @include screens.tablet-portrait { font-size: 1.2rem; }
  @include screens.desktop { font-size: 1.7rem; }
  
  &:hover {
    @include overrides.v-btn(colors.$ecru-white, colors.$olive-haze);
    @include colors.polkadots(colors.$olive-haze, colors.$donkey-brown);
    @include colors.moving-polkadots(2s);
    fill: colors.$olive-haze;
  }
  &:hover {
    .storage-btn-icon-ctn {
      @include overrides.v-btn(
        colors.$olive-haze,
        colors.$ecru-white
      );
    }
  }
  
  .storage-btn-icon-ctn {
    @include overrides.v-btn(
      colors.$ecru-white,
      colors.$olive-haze
    ) {
      display: grid;
      justify-content: center;
      justify-items: center;
      align-items: center;
      align-content: center;
    };
    min-width: auto;
    height: auto;
    padding: 4px !important;
  }
}

.shortcut-btn {
  @include overrides.v-btn(colors.$azalea, transparent);
  @include positioning.relative-in-place;
  display: grid;
  justify-content: stretch;
  justify-items: stretch;
  align-content: stretch;
  align-items: stretch;
  border-radius: 999px;
  min-width: auto !important;
  width: 60px !important;
  height: 60px !important;
  padding: 10px !important;
  @include screens.tablet-landscape {
    width: 65px !important;
    height: 65px !important;
  }

  &.shortcut-btn__brush {
    padding: 10px !important;
  }
  &.shortcut-btn__preview {
    padding: 15px !important;
  }
  .shortcut-icon {
    fill: colors.$azalea;
    width: 100%;
    height: 100%;
  }
  &:hover {
    &:not(.shortcut-btn--active) {
      @include colors.stripes(
        colors.$robin-egg-blue,
        colors.$tiffany-blue,
        15px
      );
      @include colors.moving-stripes(3s);
      .shortcut-icon {
        fill: colors.$frosted-mint;
      }
    }
  }
  &.shortcut-btn--active {
    .shortcut-icon {
      fill: colors.$jambalaya;
    }
  }
}

.toolbar-divider {
  justify-self: center;
  width: 90%;
  border: 2px solid colors.$light-pink;
  border-radius: 2px;
}

.mode-toggle {
  justify-self: center;
}

.key--tooltip {
  padding: 5px 10px;
  text-transform: uppercase;
  transition-duration: 100ms !important;
  font-size: 1.1rem;
}
.shortcut--tooltip {
  padding: 15px 20px;
  font-size: 1.5rem;
  font-weight: 700;
  transition-duration: 100ms !important;
}

.warning-title,
.warning-content {
  color: colors.$jambalaya !important;
}

.cancel-btn {
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$olive-haze,
  );
  &:hover {
    @include colors.polkadots(
      colors.$olive-haze,
      colors.$donkey-brown
    );
    @include colors.moving-polkadots;
  }
}

.continue-btn {
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$robin-egg-blue,
  );
  border: 4px solid colors.$robin-egg-blue;
  &:hover {
    @include colors.stripes(
      colors.$tiffany-blue,
      colors.$tiffany-blue-light,
      20px
    );
    @include colors.moving-stripes(8s);
    border: 4px solid colors.$turquoise;
  }
}
</style>

<style lang="scss">
.settings--dialog,
.preview--dialog,
.storage--dialog,
.warning--dialog {
  box-shadow: none;
}
</style>
