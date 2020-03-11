<template>
  <div class="tool-selector">
    <button class="tool picked" v-on:click.prevent="pickToolPencil" v-on:contextmenu.prevent="pickToolPencil">
      <object class="svg nav brown-circle" :data=pencilSvg></object>
    </button>
    <button class="tool" v-on:click.prevent="pickToolFloodFill" v-on:contextmenu.prevent="pickToolFloodFill">
      <object class="svg nav brown-circle" :data=fillSvg></object>
    </button>
    <button class="tool" v-on:click.prevent="pickToolColorPicker" v-on:contextmenu.prevent="pickToolColorPicker">
      <object class="svg nav brown-circle" :data=dropperSvg></object>
    </button>
  </div>
</template>

<script>
import pencilSvg from '/assets/icons/bxs-pencil.svg'
import fillSvg from '/assets/icons/bxs-color-fill.svg';
import dropperSvg from '/assets/icons/bxs-eyedropper.svg';

export default {
  name: "ToolSelector",
  data: function() {
    return {
      pencilSvg,
      fillSvg,
      dropperSvg,
    };
  },
  methods: {
    pickToolPencil(e) {
      this.$emit("newtool"+(e.which == 1?"":"alt"), function(x, y, tool){
        tool.drawPixel(x, y);
      });
    },
    pickToolFloodFill(e) {
      this.$emit("newtool"+(e.which == 1?"":"alt"), function(x, y, tool){
        let newColor = tool.currentColor;
        let preColor = tool.getPixel(x, y);
        if (preColor === false){return;}//Abort if invalid pixel picked
        if (preColor === newColor){return;}//Abort if no color change
        let reColor = (x, y) => {
          let thisColor = tool.getPixel(x, y);
          if (thisColor === preColor){
            if (tool.setPixel(x, y, newColor) == newColor){
              //If there was a change, update neighbours
              reColor(x+1, y);
              reColor(x-1, y);
              reColor(x, y+1);
              reColor(x, y-1);
            }
          }
        };
        reColor(x, y);
        //Render changed version
        tool.render();
      });
    },
    pickToolColorPicker(e) {
      this.$emit("newtool"+(e.which == 1?"":"alt"), function(x, y, tool){
        let newCol = tool.getPixel(x, y);
        if (newCol !== false){
          tool.currentColor = newCol;
          tool.onColorChange();
        }
      });
    },
  }
}
</script>

<style lang="scss" scoped>
  .tool-selector {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    border-radius: 0 35px 35px 0;
    height: 200px;
    width: 75px;
    background-color: #fae4dc;
    box-shadow: rgba(0,0,0,0.2) 0 0 8px;
  }

  .tool-selector button {
    height: 50px;
    width: 50px;
    border-radius: 100%;
  }

  .tool-selector button.picked {
    background-color: #57B7A8;
    color: #ffffff;
  }
</style>
