<template>
  <div class="palette">
    <button v-on:click.prevent="pickToolPencil" v-on:contextmenu.prevent="pickToolPencil">Pencil</button>
    <button v-on:click.prevent="pickToolFloodFill" v-on:contextmenu.prevent="pickToolFloodFill">Flood fill</button>
    <button v-on:click.prevent="pickToolColorPicker" v-on:contextmenu.prevent="pickToolColorPicker">Color picker</button>
  </div>
</template>

<script>
export default {
  name: "ToolSelector",
  data: function() {
    return {};
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

<style scoped>
</style>
