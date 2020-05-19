<template>
  <div class="toolbar--container">
    <div class="toolbar--options">
      <div v-show="tool === 'brush'" class="toolbar--options-set brush">
        <button
          @click="selectTool('brush', 'small')"
          :class="{
              'toolbar--option': true,
              'active': tool === 'brush' && option === 'small',
            }"
        >
          <IconBrushSmall class="toolbar--option-icon" />
        </button>
        <button
          @click="selectTool('brush', 'medium')"
          :class="{
              'toolbar--option': true,
              'active': tool === 'brush' && option === 'medium',
            }"
        >
          <IconBrushMedium class="toolbar--option-icon" />
        </button>
        <button
          @click="selectTool('brush', 'large')"
          :class="{
              'toolbar--option': true,
              'active': tool === 'brush' && option === 'large',
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
      <button class="toolbar--designs-button">
        <div class="toolbar--designs-icon-container">
          <IconScan class="toolbar--designs-icon" />
        </div>
        <span class="toolbar--designs-button-text">Designs</span>
      </button>

      <div class="toolbar--shortcuts-row colors">
        <button
          :class="{
              'toolbar--shortcut palette': true,
              'active': colorPicker === 'palettes',
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
                'active': colorPicker !== null && colorPicker !== 'palettes',
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
              'active': tool === 'brush',
              }"
          @click="selectTool('brush', 'small')"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconBrushLarge class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Brush</div>
        </button>

        <button
          :class="{
              'toolbar--shortcut fill': true,
              'active': tool === 'fill',
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
              'active': tool === 'eyeDropper',
              }"
          @click="selectTool('eyeDropper', null)"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconEyeDropper class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Eye Dropper</div>
        </button>
      </div>

      <div class="toolbar--shortcuts-divider"></div>

      <div class="toolbar--shortcuts-row etc">
        <button
          :class="{
              'toolbar--shortcut settings': true,
              'active': settingsActive,
              }"
          @click="onOpenSettings"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconDetail class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Settings</div>
        </button>
        <button
          :class="{
              'toolbar--shortcut preview': true,
              'active': previewActive,
              }"
          @click="onOpenSettings"
        >
          <div class="toolbar--shortcut-icon-container">
            <IconQRCode class="toolbar--shortcut-icon" />
          </div>
          <div class="toolbar--shortcut-tooltip">Preview QR Code</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";

// icons
import IconScan from "~/components/icons/IconScan.vue";
import IconPaintTube from "~/components/icons/IconPaintTube.vue";
import IconPalette from "~/components/icons/IconPalette.vue";
import IconBrushSmall from "~/components/icons/IconBrushSmall.vue";
import IconBrushMedium from "~/components/icons/IconBrushMedium.vue";
import IconBrushLarge from "~/components/icons/IconBrushLarge.vue";
import IconColorFill from "~/components/icons/IconColorFill.vue";
import IconEyeDropper from "~/components/icons/IconEyeDropper.vue";
import IconDetail from "~/components/icons/IconDetail.vue";
import IconQRCode from "~/components/icons/IconQRCode.vue";

// tool functions IIFE
const brush = (() => {
  const small = (x, y, tool) => {
    tool.drawPixel(x, y);
  };

  const medium = (x, y, tool) => {
    tool.drawPixel(x, y);
    tool.drawPixel(x - 1, y); // left
    tool.drawPixel(x + 1, y); // right
    tool.drawPixel(x, y + 1); // above
    tool.drawPixel(x, y - 1); // below
  };

  const large = (x, y, tool) => {
    tool.drawPixel(x, y);
    tool.drawPixel(x - 1, y); // left
    tool.drawPixel(x - 2, y); // left left
    tool.drawPixel(x + 1, y); // right
    tool.drawPixel(x + 2, y); // right right
    tool.drawPixel(x, y + 1); // top
    tool.drawPixel(x, y + 2); // top top
    tool.drawPixel(x, y - 1); // below
    tool.drawPixel(x, y - 2); // bottom bottom
    tool.drawPixel(x - 1, y + 1); // top left
    tool.drawPixel(x + 1, y + 1); // top right
    tool.drawPixel(x - 1, y - 1); // bottom left
    tool.drawPixel(x + 1, y - 1); // bottom right
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
    if (thisColor === prevColor && tool.setPixel(inX, inY, newColor) === newColor) {
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
    IconScan,
    IconPaintTube,
    IconPalette,
    IconBrushSmall,
    IconBrushMedium,
    IconBrushLarge,
    IconColorFill,
    IconEyeDropper,
    IconDetail,
    IconQRCode
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true
    },
    prevColorPicker: {
      type: String,
      required: false
    },
    colorPicker: {
      type: String,
      required: false
    },
    previewActive: {
      type: Boolean,
      required: true
    },
    settingsActive: {
      type: Boolean,
      required: true
    }
  },
  data: function() {
    return {
      tool: null,
      option: null
    };
  },
  methods: {
    onChangeColorPicker: function(mode) {
      this.$emit("change-color-picker", mode);
    },
    onOpenSettings: function() {
      this.$emit("open-settings");
    },
    onOpenPreview: function() {
      this.$emit("open-preview");
    },
    /**
     * Sets the tool to the mouse button
     *
     * @param {String} mode
     * @param {String} option
     */
    selectTool: function(newTool, newOption = null) {
      // no matching tool, bail
      if (!(newTool in toolMappings)) return;
      let tool = toolMappings[newTool];
      if (newOption && typeof toolMappings[newTool] === "object") {
        if (!(newOption in toolMappings[newTool])) return;
        tool = tool[newOption];
      }
      this.drawingTool.drawHandler = tool;
      this.tool = newTool;
      this.option = newOption;
    },
    // helps determines if the passed tool is the current tool drawHandler
    // can also determine if a tool has options
    // -1 means invalid, none matching
    // 0 counts itself
    // 1+ for options not counting itself
    countToolOptions: function(newTool, newOption) {
      if (!(newTool in toolMappings)) return -1;
      if (typeof toolMappings[newTool] === "function") return 0;
      if (typeof toolMappings[newTool] === "object") {
        if (newOption == null) return Object.keys(toolMappings[newTool]).length;
        if (!(newOption in toolMappings[newTool])) return -1;
        else return 0;
      }
      return -1;
    },
    cycleOptions: function() {
      const { tool, option } = this;
      if (this.option == null) return;
      const options = Object.keys(toolMappings[tool]);
      const idx = options.indexOf(option);
      const nextIdx = (idx + 1) % options.length;
      const nextOption = options[nextIdx];
      this.option = nextOption;
      this.selectTool(tool, nextOption);
    },
    onCycleOptions: function($event) {
      if (event.code !== "KeyT") return;
      this.cycleOptions();
    }
  },
  mounted: function() {
    this.selectTool("brush", "small");
    window.addEventListener("keydown", this.onCycleOptions);
  },
  beforeDestroy: function() {
    window.removeEventListener("keydown", this.onCycleOptions)
  }
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/animations";
@import "styles/transitions";

.toolbar--container {
  user-select: none;
  align-self: center;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;

  width: 350px;
  height: 650px;

  background-color: $pink;
  border-radius: 0px 50px 50px 0px;
  overflow: hidden;
}

.toolbar--options {
  position: relative;
  top: 0;
  left: 0;

  box-sizing: border-box;
  align-self: center;

  width: 80px;
  min-height: 225px;
  padding: 7px 10px 7px 3px;

  background-color: $misty-rose;
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
      background-color: $dust-storm;
    }
  }

  &.active {
    &:after {
      transform: scale(1);
      background-color: $tiffany-blue;
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

    fill: $bronco;
    width: 30px;
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
  background-color: $misty-rose;

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
    background-color: $sand-dune;
  }
}
.toolbar--shortcuts {
  position: relative;
  top: 0;
  left: 0;
  z-index: 999;

  margin-left: 20px;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: min-content;
  justify-items: left;
  align-items: start;
  align-content: start;
  height: 100%;
}

.toolbar--designs-button {
  // reset
  appearance: none;
  border: 0px;
  outline: none;
  font-family: inherit;
  padding: 0px;

  color: $sand-dune;
  display: inline-block;
  margin-top: 20px;
  background-color: $ecru-white;
  padding: 8px 8px;
  border-radius: 999px;
  cursor: pointer;
}

.toolbar--designs-icon-container {
  position: relative;
  top: 0;
  left: 0;

  display: inline-block;
  vertical-align: middle;
  width: 35px;
  height: 35px;

  background-color: $sand-dune;
  border-radius: 999px;
}

.toolbar--designs-icon {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 80%;
  height: 80%;

  transform: translate(-50%, -50%);
  fill: $ecru-white;
}

.toolbar--designs-button-text {
  display: inline-block;
  margin-left: 5px;
  margin-right: 15px;
  font-size: 1.7rem;
  font-weight: 600;
  vertical-align: middle;
  letter-spacing: 0.5px;
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

  &.colors {
    margin-top: 14px;
    margin-bottom: 10px;
  }

  &.drawing {
    margin-top: 14px;
    margin-bottom: 10px;
    & .toolbar--shortcut.active {
      .toolbar--shortcut-icon-container {
        background: transparent;
      }
      .toolbar--shortcut-icon {
        fill: $umber;
      }
    }
  }
}

.toolbar--shortcuts-divider {
  background-color: $salmon;
  width: 55%;
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
    width: 65px;
    height: 65px;

    position: relative;
    top: 0;
    left: 0;
    padding: 4px;
    border-radius: 999px;
  }

  .toolbar--shortcut-icon {
    position: relative;
    top: 50%;
    transform: translate(0%, -50%);

    width: 100%;
    height: 100%;
    fill: $blossom;
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
    transition: transform 0.15s cubic-bezier(0.5, 0.1, 0.3, 1.5);
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
    background-color: rgba($tiffany-blue, 0.9);
    border-radius: 10px;
    pointer-events: none;
    opacity: 0;
  }

  &:hover,
  &.active {
    .toolbar--shortcut-icon-container {
      background: repeating-linear-gradient(
        -45deg,
        $tiffany-blue-light,
        $tiffany-blue-light 15px,
        $tiffany-blue 15px,
        $tiffany-blue 30px
      );
      background-size: 200% 200%;
      animation: barberpole 3s linear infinite;
    }

    .toolbar--shortcut-icon {
      fill: $frosted-mint;
    }
  }

  &:hover .toolbar--shortcut-tooltip {
    opacity: 1;
    transform: translate(-50%, -10px) scale(1);
  }
}
</style>