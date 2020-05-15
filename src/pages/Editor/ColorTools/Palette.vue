<template>
  <div class="palette--container">
    <div class="palette--colors">
      <div
        :class="{
          'palette--color-container': true,
          'picked': drawingTool.currentColor === i-1
        }"
        v-for="i in 15"
        :key="i"
        @click="onColorClick($event, i-1)"
        @mousemove="onColorMousemove($event, i-1)"
      >
        <IconColorBlob class="palette--color" :color="paletteColors[i-1]" />

        <div class="palette--selected-indicator"></div>
      </div>

      <div
        :class="{
          'palette--color-container': true,
          'picked': drawingTool.currentColor === 15
        }"
        @click="onColorClick($event, 15)"
        @mousemove="onColorMousemove($event, 15)"
      >
        <IconTransparentBlob class="palette--color" />
        <div class="palette--selected-indicator"></div>
      </div>
    </div>

    <div
      class="palette--button-hint left"
      @click="onColorClick($event, drawingTool.currentColor - 1)">
      <div class="hint">L</div>
    </div>
    <div
      class="palette--button-hint right"
      @click="onColorClick($event, drawingTool.currentColor + 1)">
      <div class="hint">R</div>
    </div>
  </div>
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";

// svg icons
import IconColorBlob from "~/components/icons/IconColorBlob.vue";
import IconTransparentBlob from "~/components/icons/IconTransparentBlob.vue";

export default {
  name: "Palette",
  components: {
    IconColorBlob,
    IconTransparentBlob
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true
    }
  },
  data: function() {
    const paletteColors = [];
    for (let i = 0; i < 15; ++i)
      paletteColors.push(this.drawingTool.getPalette(i));
    return {
      paletteColors,
    };
  },
  methods: {
    invalidIdx: function(idx) {
      if (idx > 15 ||idx < 0) {
        console.log("detected invalid current color value:", idx);
        return true;
      }
    },
    onColorClick: function(event, idx) {
      if (this.invalidIdx(idx)) return;
      this.$emit("change-current-color", idx);
    },
    onColorMousemove: function(event, idx) {
      if (event.buttons === 1) {
        if (this.invalidIdx(idx)) return;
        this.$emit("change-current-color", idx);
      }
    }
  },
  mounted: function() {
    this.drawingTool.onColorChange(() => {
      for (let i = 0; i < 15; ++i) {
        const paletteColor = this.drawingTool.getPalette(i);
        this.paletteColors.splice(i, 1, paletteColor);
      }
    });
  }
};
</script>

<style lang="scss" scoped>
@import "../../../styles/colors";

// ONLY THING THAT SHOULD BE CHANGED
// NEEDS A CLASS APPLIED TO CONTROL SIZE
$palette--container-size: 800px;
.palette--container {
  width: $palette--container-size;
  display: inline-block;
  user-select: none;

  position: relative;
  top: 0;
  left: 0;
}

.palette--colors {
  box-sizing: border-box;
  width: 100%;
  padding: 15px 30px;

  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: 1fr;
  column-gap: 10px;
  justify-items: center;

  background-color: $pink;
  border-radius: 30px;
}

.palette--color-container {
  transition: transform 0.10s ease-in-out;
  display: inline-block;
  cursor: pointer;
  transform: scale(1);
  &:hover {
    transform: scale(1.2);
  }

  .palette--selected-indicator {
    width: 30px;
    height: 6px;

    position: absolute;
    left: 50%;
    bottom: -8px;
    transform: translate(-50%, 0px) scale(0);

    transition: transform 0.10s ease-in-out;
    background-color: $tiffany-blue;
    border-radius: 4px;
    opacity: 0;
  }
  &.picked .palette--selected-indicator {
    transform: translate(-50%, 0px) scale(1);
    opacity: 1;
  }
}

.palette--color {
  width: 100%;
}

.palette--button-hint {
  position: absolute;
  background-color: $pink;
  padding: 5px;
  box-sizing: content-box;
  bottom: 8px;
  $horizontal-correction: 10px;


  &.left {
    left: $horizontal-correction;
    transform: translate(-50%, 50%);
  }
  &.right {
    right: $horizontal-correction;
    transform: translate(50%, 50%);
  }

  display: block;
  color: white;
  border-radius: 999px;

  width: 30px;
  height: 30px;

  .hint {
    width: 30px;
    height: 30px;
    font-size: 1.25rem;
    line-height: 30px;
    text-align: center;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    background-color: $sand-dune;
    border-radius: 999px;

    cursor: pointer;
  }
}

</style>
