<template>
  <div id="palette">
    <div id="palette-color-row">
      <IconBase
        v-for="i in 15"
        :class="{picked: drawingTool.currentColor === i-1}"
        :key="i-1"
        class="blob"
        @click.native="onColorClick($event, i-1)"
        @mousemove="onColorMousemove($event, i-1)"
        icon-name="color" 
        :icon-color="paletteColors[i-1]"
        :viewBox="colorBlobViewBox"
        width="28"
        height="28">
        <IconColorBlob />
      </IconBase>
      <div class="img-border picked">
        <img
          class="blob"
          :class="{picked: drawingTool.currentColor === 15}"
          :src="transparentBlob"
          @click="onColorClick($event, 15)"
          @mousemove="onColorMousemove($event, 15)"
        >
      </div>
    </div>
  </div>
</template>

<script>
import DrawingTool from "/libs/DrawingTool";

// svg icons
import IconBase from '/components/icons/IconBase.vue';
import IconColorBlob from '/components/icons/IconColorBlob.vue';
import transparentBlob from '/assets/icons/transparent-blob.svg'

export default {
  name: "Palette",
  components: {
    IconBase,
    IconColorBlob,
  },
  props: {
    drawingTool: DrawingTool,
  },
  data: function() {
    const paletteColors = [];
    for (let i = 0; i < 15; ++i)
      paletteColors.push(this.drawingTool.getPalette(i));

    return {
      paletteColors,
      transparentBlob,
      colorBlobViewBox: "0 0 1002.2 992.31",
    };
  },
  methods: {
    onColorClick: function(event, idx) {
      this.$emit('changed-current-color', idx);
    },
    onColorMousemove: function(event, idx) {
      if (event.buttons === 1)
        this.$emit('changed-current-color', idx);
    },
  },
  mounted: function(){
    this.drawingTool.onColorChange(() => {
      let paletteColors = [];
      for (let i = 0; i < 15; ++i)
        paletteColors[i] = this.drawingTool.getPalette(i);
      this.$data.paletteColors = paletteColors;
    });
  }
}
</script>

<style lang="scss" scoped>
$pink: #F1B5C1;
$teal: #5DBF98;

#palette {
  user-select: none;
  border-radius: 0 0 35px 35px;
  background-color: $pink;
  padding: 15px;
  width: 480px;
  box-shadow: rgba(0,0,0,0.2) 0 0 8px;

  #palette-color-row {
  height: 32px;
  display: flex;
  justify-content: center;
  }
  .blob {
    cursor: pointer;
    padding: 0 3px 5px;
    height: 28px;
    width: 28px;
    box-sizing: content-box;

    &.picked{
      border-bottom: 4px solid $teal;
    }
  }
  img.blob {
    width: 24px;
  }
}
</style>
