<template>
  <div class="tool-selector">
    <button
      class="tool"
      :class="{ picked: pickedPencil }"
      @click.prevent="pickToolPencil"
      @contextmenu.prevent="pickToolPencil"
    >
      <IconBase icon-name="pencil" :icon-color="pencilColor">
        <IconPencil />
      </IconBase>
    </button>
    <button
      class="tool"
      :class="{ picked: pickedFloodFill }"
      @click.prevent="pickToolFloodFill"
      @contextmenu.prevent="pickToolFloodFill"
    >
      <IconBase icon-name="fill" :icon-color="fillColor"><IconFill /></IconBase>
    </button>
    <button
      class="tool"
      :class="{ picked: pickedColorPicker }"
      @click.prevent="pickToolColorPicker"
      @contextmenu.prevent="pickToolColorPicker"
    >
      <IconBase icon-name="fill" :icon-color="pickerColor"
        ><IconPicker
      /></IconBase>
    </button>
  </div>
</template>

<script>
import IconBase from "~/components/icons/IconBase.vue";
import IconPencil from "~/components/icons/IconPencil.vue";
import IconFill from "~/components/icons/IconFill.vue";
import IconPicker from "~/components/icons/IconPicker.vue";

export default {
  name: "ToolSelector",
  data: function () {
    return {
      pickedPencil: true,
      pickedFloodFill: false,
      pickedColorPicker: false,
      pencilColor: "#FFFFFF",
      fillColor: "#7E7261",
      pickerColor: "#7E7261",
    };
  },
  components: {
    IconBase,
    IconPencil,
    IconFill,
    IconPicker,
  },
  methods: {
    pickToolPencil(e) {
      this.setToolClass("pickedPencil");

      this.$emit("newtool" + (e.which == 1 ? "" : "alt"), function (
        x,
        y,
        tool
      ) {
        tool.drawPixel(x, y);
      });
    },
    pickToolFloodFill(e) {
      this.setToolClass("pickedFloodFill");
      this.$emit("newtool" + (e.which == 1 ? "" : "alt"), function (
        x,
        y,
        tool
      ) {
        let newColor = tool.currentColor;
        let preColor = tool.getPixel(x, y);
        if (preColor === false) {
          return;
        } //Abort if invalid pixel picked
        if (preColor === newColor) {
          return;
        } //Abort if no color change
        let reColor = (x, y) => {
          let thisColor = tool.getPixel(x, y);
          if (thisColor === preColor) {
            if (tool.setPixel(x, y, newColor) == newColor) {
              //If there was a change, update neighbours
              reColor(x + 1, y);
              reColor(x - 1, y);
              reColor(x, y + 1);
              reColor(x, y - 1);
            }
          }
        };
        reColor(x, y);
        //Render changed version
        tool.render();
      });
    },
    pickToolColorPicker(e) {
      this.setToolClass("pickedColorPicker");
      this.$emit("newtool" + (e.which == 1 ? "" : "alt"), function (
        x,
        y,
        tool
      ) {
        let newCol = tool.getPixel(x, y);
        if (newCol !== false) {
          tool.currentColor = newCol;
          tool.onColorChange();
        }
      });
    },
    setToolClass(tool) {
      this.pickedPencil = false;
      this.pickedFloodFill = false;
      this.pickedColorPicker = false;
      this.$data[tool] = true;

      // set svg fill colors
      this.pencilColor = this.pickedPencil ? "#FFFFFF" : "#7E7261";
      this.fillColor = this.pickedFloodFill ? "#FFFFFF" : "#7E7261";
      this.pickerColor = this.pickedColorPicker ? "#FFFFFF" : "#7E7261";
    },
  },
};
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
  box-shadow: rgba(0, 0, 0, 0.2) 0 0 8px;
}

.tool-selector button {
  height: 50px;
  width: 50px;
  border-radius: 100%;
}

.tool-selector button.picked {
  background-color: #57b7a8;
}
</style>
