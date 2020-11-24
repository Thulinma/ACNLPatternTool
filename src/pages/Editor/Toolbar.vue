<template>
  <div class="toolbar--container">
    <div class="toolbar--options">
      <div v-show="tool === 'brush'" class="toolbar--options-set brush">
        <button
          @click="selectTool('brush', 'small')"
          @contextmenu.prevent="selectTool('brush', 'small', true)"
          :class="{
            'toolbar--option brush-small': true,
            active: tool === 'brush' && option === 'small',
          }"
        >
          <IconBrushSmall class="toolbar--option-icon" />
        </button>
        <button
          @click="selectTool('brush', 'medium')"
          @contextmenu.prevent="selectTool('brush', 'medium', true)"
          :class="{
            'toolbar--option brush-medium': true,
            active: tool === 'brush' && option === 'medium',
          }"
        >
          <IconBrushMedium class="toolbar--option-icon" />
        </button>
        <button
          @click="selectTool('brush', 'large')"
          @contextmenu.prevent="selectTool('brush', 'large', true)"
          :class="{
            'toolbar--option brush-large': true,
            active: tool === 'brush' && option === 'large',
          }"
        >
          <IconBrushLarge class="toolbar--option-icon" />
        </button>
      </div>

      <div class="toolbar--options-toggle-hint">
        <button @click="cycleOptions" class="hint">T</button>
      </div>
    </div>

    <div class="toolbar--shortcuts">
      <button class="toolbar--storage-button" @click="storageOpen = true">
        <div class="toolbar--storage-icon-container">
          <IconInbox class="toolbar--storage-icon" />
        </div>
        <span class="toolbar--storage-button-text">Storage</span>
      </button>

      <div class="toolbar--shortcuts-row colors">
        <button
          :class="{
            'toolbar--shortcut palette': true,
            active: colorPicker === 'palettes',
          }"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconPalette class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Change Palette</div>
        </button>

        <button
          :class="{
            'toolbar--shortcut color-picker': true,
            active: colorPicker !== null && colorPicker !== 'palettes',
          }"
          @click="onChangeColorPicker(prevColorPicker)"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconPaintTube class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Change Color</div>
        </button>
      </div>

      <div class="toolbar--shortcuts-divider"></div>
      <div class="toolbar--shortcuts-row drawing">
        <button
          :class="{
            'toolbar--shortcut brush': true,
            active: tool === 'brush',
          }"
          @click="selectTool('brush', 'small')"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconBrushLarge
              v-if="tool === 'brush' && option === 'large'"
              class="toolbar--shortcut-icon"
            />
            <IconBrushMedium
              v-else-if="tool === 'brush' && option === 'medium'"
              class="toolbar--shortcut-icon"
            />
            <IconBrushSmall v-else class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Brush</div>
        </button>

        <button
          :class="{
            'toolbar--shortcut fill': true,
            active: tool === 'fill',
          }"
          @click="selectTool('fill', null)"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconColorFill class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Fill</div>
        </button>

        <button
          :class="{
            'toolbar--shortcut eye-dropper': true,
            active: tool === 'eyeDropper',
          }"
          @click="selectTool('eyeDropper', null)"
          @contextmenu.prevent="selectTool('eyeDropper', null, true)"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconEyeDropper class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Eye Dropper</div>
        </button>

        <button class="toolbar--shortcut placeholder">
          <div class="toolbar--shortcut-icon-container">
            <div class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Placeholder</div>
        </button>

        <button class="toolbar--shortcut" @click="drawingTool.undo()">
          <div class="toolbar--shortcut-icon-container">
            <IconUndo class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Undo</div>
          <div class="toolbar--shortcut-hint">CTRL + Z</div>
        </button>

        <button class="toolbar--shortcut" @click="drawingTool.redo()">
          <div class="toolbar--shortcut-icon-container">
            <IconRedo class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Redo</div>
          <div class="toolbar--shortcut-hint">CTRL + SHIFT+ Z</div>
        </button>
      </div>

      <div class="toolbar--shortcuts-divider"></div>

      <div class="toolbar--shortcuts-row etc">
        <button
          :class="{
            'toolbar--shortcut settings': true,
            active: settingsOpen,
          }"
          @click="settingsOpen = true"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconDetail class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Pattern Settings</div>
        </button>

        <button
          :class="{
            'toolbar--shortcut preview': true,
            active: previewOpen,
          }"
          @click="previewOpen = true"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconQRCode class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Preview</div>
          <div class="toolbar--shortcut-hint short">P</div>
        </button>
      </div>

      <div class="toolbar--toggle">
        <div class="toggle--wrapper">
          <input
            @click="changeGameModeWithWarning"
            :class="{
              'toggle--input': true,
              checked: gameMode,
            }"
            id="pattern-mode"
            type="checkbox"
          />
          <label class="toggle--label" for="pattern-mode"></label>
        </div>
      </div>
    </div>

    <PatternSettings
      v-if="settingsOpen"
      @close="settingsOpen = false"
      @update-details="$emit('update-details', $event)"
      :drawingTool="drawingTool"
      :types="drawingTool.allTypes"
      :patternDetails="patternDetails"
    />

    <Preview
      v-if="previewOpen"
      @close="previewOpen = false"
      :drawingTool="drawingTool"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
    />

    <Storage
      v-if="storageOpen"
      @close="storageOpen = false"
      @load="load"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
    />

    <Warning
      v-if="gameModeWarning"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
      @close="gameModeWarning = false"
      @dismiss="changeGameModeFromWarning"
      foreverDismissable
    >
      <template>
        <ACNHToACNLInfo v-if="gameMode" />
        <ACNLToACNHInfo v-else />
      </template>
    </Warning>
  </div>
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";
import PatternSettings from "~/components/modals/PatternSettings.vue";
import Preview from "~/components/modals/Preview.vue";
import Storage from "~/components/modals/Storage.vue";
import Warning from "~/components/modals/Warning.vue";
import ACNLToACNHInfo from "~/components/partials/ACNLToACNHInfo.vue";
import ACNHToACNLInfo from "~/components/partials/ACNHToACNLInfo.vue";

// icons
import IconInbox from "~/components/icons/IconInbox.vue";
import IconPaintTube from "~/components/icons/IconPaintTube.vue";
import IconPalette from "~/components/icons/IconPalette.vue";
import IconBrushSmall from "~/components/icons/IconBrushSmall.vue";
import IconBrushMedium from "~/components/icons/IconBrushMedium.vue";
import IconBrushLarge from "~/components/icons/IconBrushLarge.vue";
import IconColorFill from "~/components/icons/IconColorFill.vue";
import IconEyeDropper from "~/components/icons/IconEyeDropper.vue";
import IconUndo from "~/components/icons/IconUndo.vue";
import IconRedo from "~/components/icons/IconRedo.vue";
import IconDetail from "~/components/icons/IconDetail.vue";
import IconQRCode from "~/components/icons/IconQRCode.vue";

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
    IconQRCode,
    Warning,
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
  },
  data() {
    return {
      tool: null,
      option: null,
      settingsOpen: false,
      previewOpen: false,
      storageOpen: false,
      // isACNH
      gameMode: this.drawingTool.compatMode === "ACNH",
      gameModeWarning: false,
    };
  },
  methods: {
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
      const {
        ctrlKey,
        altKey,
        metaKey,
        shiftKey,
        code,
        preventDefault,
      } = event;
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
    changeGameModeWithWarning(event) {
      event.preventDefault(); // stop checkbox from automatically checking itself
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
@import "styles/colors";
@import "styles/positioning";
@import "styles/transitions";
@import "styles/screens";

// define most important variables when changing media queries
$toolbar--options-width: 75px;

.toolbar--container {
  user-select: none;
  grid-area: toolbar;
  justify-self: stretch;
  overflow: visible;
  align-self: center;

  display: grid;

  // grid-template-areas:
  //   "options"
  //   "tools";
  grid-template-columns: auto 1fr 75px;
  grid-template-rows: auto;
  justify-content: space-between;
  justify-items: center;
  align-content: stretch;
  align-items: flex-start;

  column-gap: 5px;

  background-color: $pink-lace;
  overflow: visible;

  @include phone-landscape {
  }
  @include tablet-portrait {
    grid-template-columns: auto 1fr 1fr;
    justify-self: start;
    align-self: stretch;
    width: 280px;
    height: auto;
    border-radius: 0px 50px 50px 0px;
  }
  @include tablet-landscape {
  }
  @include desktop {
    width: 320px;
    align-self: center;
    height: 650px;
  }
  @include desktop-hd {
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

  width: $toolbar--options-width;
  min-height: 225px;
  padding: 7px 10px 7px 3px;

  background-color: $provincial-pink;
  border-radius: 0px 40px 40px 0px;
}

.toolbar--options-set {
  width: 100%;

  display: grid;
  grid-auto-rows: auto;
  grid-auto-columns: 100%;
  row-gap: 5px;
}

.toolbar--option {
  // reset
  appearance: none;
  border: 0px;
  outline: none;
  font-family: inherit;
  padding: 0px;

  position: relative;
  top: 0px;
  left: 0px;

  box-sizing: border-box;
  width: 100%;

  cursor: pointer;
  background-color: transparent;

  &:after {
    transition: transform 0.15s $energetic;
    position: relative;
    top: 0;
    left: 0;
    display: block;
    content: "";
    transform: scale(0.8);
    padding-bottom: 100%;
    border-radius: 999px;
    background-color: transparent;
  }

  &:hover {
    &:after {
      transform: scale(1);
      background-color: $bon-jour;
    }
  }

  &.active {
    &:after {
      transform: scale(1);
      background-color: $robin-egg-blue;
    }
    .toolbar--option-icon {
      fill: white;
    }
  }

  .toolbar--option-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    transform: translate(-50%, -50%) scale(1.2);

    fill: $bison-hide;
    width: 30px;
  }

  &.brush-small .toolbar--option-icon {
    width: 32%;
  }
  &.brush-medium .toolbar--option-icon {
    width: 37%;
  }
  &.brush-large .toolbar--option-icon {
    width: 44%;
  }

  // for copy/pasting
  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
  }
  @include desktop {
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
  background-color: $provincial-pink;

  .hint {
    // reset
    appearance: none;
    border: 0px;
    outline: none;
    font-family: inherit;
    padding: 0px;

    width: 100%;
    height: 100%;

    font-size: 1.25rem;
    font-weight: 700;

    cursor: pointer;
    border-radius: 999px;
    color: white;
    background-color: $olive-haze;
  }
}

.toolbar--shortcuts {
  position: relative;
  top: 0;
  left: 0;
  z-index: 999;

  display: grid;
  grid-template-columns: auto;
  grid-template-rows: min-content;
  justify-items: left;
  align-items: start;
  align-content: start;
  height: 100%;
}

.toolbar--storage-button {
  // reset
  appearance: none;
  border: 0px;
  outline: none;
  font-family: inherit;
  padding: 0px;

  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;

  color: $olive-haze;
  margin-top: 20px;
  background-color: $ecru-white;
  padding: 8px 8px;
  border-radius: 23px;
  cursor: pointer;

  &:hover {
    @include polkadots($olive-haze, $donkey-brown);
    @include moving-polkadots(2s);
    .toolbar--storage-button-text {
      color: $ecru-white;
    }
    .toolbar--storage-icon-container {
      background-color: $ecru-white;
    }
    .toolbar--storage-icon {
      fill: $olive-haze;
    }
  }
}

.toolbar--storage-icon-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;

  width: 20px;
  height: 20px;

  background-color: $olive-haze;
  border-radius: 999px;

  @include phone-landscape {
  }
  @include tablet-portrait {
    width: 30px;
    height: 30px;
  }
  @include tablet-landscape {
  }
  @include desktop {
    width: 35px;
    height: 35px;
  }
}

.toolbar--storage-icon {
  width: 80%;
  height: 80%;
  fill: $ecru-white;
}

.toolbar--storage-button-text {
  margin-left: 10px;
  margin-right: 15px;
  font-size: 1rem;
  font-weight: 600;
  vertical-align: middle;
  letter-spacing: 0.5px;

  @include phone-landscape {
  }
  @include tablet-portrait {
    font-size: 1.2rem;
  }
  @include tablet-landscape {
  }
  @include desktop {
    font-size: 1.7rem;
  }
}

.toolbar--shortcuts-row {
  position: relative;
  top: 0;
  left: 0;

  display: grid;
  grid-template-columns: max-content max-content;
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
        fill: $jambalaya;
      }
    }
  }

  &.etc {
    margin-top: 14px;
    margin-bottom: 10px;
  }
}

.toolbar--shortcuts-divider {
  justify-self: center;
  background-color: $light-pink;
  width: 90%;
  height: 4px;
  border-radius: 999px;
}

.toolbar--shortcut {
  display: block;
  font-family: inherit;
  appearance: none;
  outline: none;
  padding: 0px;
  border: 0px;

  background: none;

  cursor: pointer;
  position: relative;
  top: 0;
  left: 0;

  .toolbar--shortcut-icon-container {
    box-sizing: border-box;
    width: 50px;
    height: 50px;

    position: relative;
    top: 0;
    left: 0;
    padding: 4px;
    border-radius: 999px;

    @include phone-landscape {
    }
    @include tablet-portrait {
    }
    @include tablet-landscape {
      width: 60px;
      height: 60px;
    }
    @include desktop {
      width: 65px;
      height: 65px;
    }
  }

  .toolbar--shortcut-icon {
    position: relative;
    top: 50%;
    transform: translate(0%, -50%);

    width: 100%;
    height: 100%;
    fill: $azalea;
  }

  &.placeholder {
    opacity: 0;
    pointer-events: none;
    cursor: default;
  }

  &.color-picker .toolbar--shortcut-icon,
  &.brush .toolbar--shortcut-icon,
  &.settings .toolbar--shortcut-icon {
    width: 85%;
    height: 85%;
  }
  &.brush .toolbar--shortcut-icon {
    width: 80%;
    height: 80%;
  }
  &.eye-dropper .toolbar--shortcut-icon {
    width: 90%;
    height: 90%;
  }
  &.preview .toolbar--shortcut-icon {
    width: 70%;
    height: 70%;
  }

  .toolbar--shortcut-tooltip {
    transition: transform 0.15s $energetic;
    display: inline-block;
    white-space: nowrap;
    padding: 10px 20px;

    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translate(-50%, -10px) scale(0.8);
    z-index: 999;

    font-size: 1.5rem;
    font-weight: 600;

    color: white;
    background-color: rgba($robin-egg-blue, 0.9);
    border-radius: 10px;
    pointer-events: none;
    opacity: 0;
  }

  &:hover,
  &.active {
    .toolbar--shortcut-icon-container {
      @include stripes($robin-egg-blue, $tiffany-blue, 15px);
      @include moving-stripes(3s);
    }

    .toolbar--shortcut-icon {
      fill: $frosted-mint;
    }
  }

  &:hover .toolbar--shortcut-tooltip {
    opacity: 1;
    transform: translate(-50%, -10px) scale(1);
  }

  /* keymap hint */
  .toolbar--shortcut-hint {
    @include invisible;
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(50%, 75%);

    display: inline-block;
    padding: 5px 10px;
    white-space: nowrap;

    font-size: 1rem;
    font-weight: 700;
    border-radius: 10px;
    background-color: $olive-haze;
    color: white;

    &.short {
      padding: 0px;
      text-align: center;
      font-size: 1.25rem;

      $size: 30px;
      line-height: $size;
      width: $size;
      height: $size;
      border-radius: 999px;
      transform: translate(0, 0);
    }
    &.persistent {
      @include visible;
    }
  }
  &:hover .toolbar--shortcut-hint {
    @include visible;
  }
}

.toolbar--toggle {
  overflow: hidden;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  * {
    box-sizing: border-box;
    &:before,
    &:after {
      content: "";
      position: absolute;
    }
  }

  .toggle--wrapper {
    position: relative;
    display: inline-block;
  }

  .toggle--input {
    height: 5px;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    width: 5px;

    &.checked + label {
      &:before {
        transform: translateX(50px);
        z-index: 20;
      }
      &:after {
        transform: translateX(20px);
        left: 0px;
        content: "NH";
      }
    }
  }

  .toggle--label {
    display: inline-block;
    border-radius: 50px;
    position: relative;
    transition: all 0.3s ease;
    transform-origin: 20% center;
    cursor: pointer;
    background: transparent;
    border: 3px solid $light-pink;
    height: 50px;
    width: 100px;

    &:before {
      display: block;
      border-radius: 100%;
      transition: 0.3s ease;
      border: 3px solid $azalea;
      width: 30px;
      height: 30px;
      top: 4px;
      left: 4px;
      background: $azalea;
      z-index: 20;
    }
    &:after {
      content: "NL";
      top: 15px;
      left: 2px;
      transform: translateX(50px);
    }
  }
}
</style>
