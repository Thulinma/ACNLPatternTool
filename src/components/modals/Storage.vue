<template>
  <PatternContainer
    @close="$emit('close')"
    @scroll-freeze="$emit('scroll-freeze')"
    @scroll-unfreeze="$emit('scroll-unfreeze')"
    :drawingTools="drawingTools"
    :options="options"
    :selectedMap="selectedMap"
    @select="toggleSelection"
  />
</template>

<script>
import PatternContainer from "~/components/positioned/PatternContainer.vue";
import saver from "~/libs/saver";
import openSvg from "~/assets/icons/utilitybar/bxs-envelope-open.svg";
import deleteSvg from "~/assets/icons/utilitybar/bxs-trash.svg";
import downloadAsPatternSvg from "~/assets/icons/utilitybar/bxs-file-blank.svg";
import downloadAsPngSvg from "~/assets/icons/utilitybar/bxs-image-alt.svg";
import downloadAsBothSvg from "~/assets/icons/utilitybar/bxs-file-archive.svg";

export default {
  name: "Storage",
  components: {
    PatternContainer,
  },
  data() {
    return {
      drawingTools: [],
      selectedMap: [],
    };
  },
  computed: {
    selected() {
      const selectedArr = this.drawingTools.filter(
        (dt, i) => this.selectedMap[i]
      );
      const selected = new Set();
      for (const selectedItem of selectedArr) {
        selected.add(selectedItem);
      }
      return selected;
    },
    options() {
      const { selected, selectedMap, drawingTools } = this;
      let options = [];
      if (drawingTools.length === 0) return options;

      const isNone = selected.size === 0;
      const isSingle = selected.size === 1;
      const isMultiple = selected.size > 1;

      const open = {
        imgSrc: openSvg,
        label: `Open`,
        callback: async () => {
          const [drawingTool, ..._] = [...selected];
          this.$emit("load", drawingTool.toString());
          this.$emit("close");
        },
      };

      const del = {
        imgSrc: deleteSvg,
        label: `Delete`,
        callback: async () => {
          let message;
          let source;
          if (selected.size !== 0) {
            message =
              "Are you sure you want to delete these patterns from storage?";
            source = [...selected];
          } else {
            message = "Are you sure you want to clear the storage?";
            source = [...drawingTools];
          }
          if (!window.confirm(message)) return;
          saver.deleteDrawingToolsFromStorage(source);
          for (const drawingTool of source) {
            const idx = drawingTools.indexOf(drawingTool);
            drawingTools.splice(idx, 1);
            selectedMap.splice(idx, 1);
          }
        },
      };

      const downloadAsPattern = {
        imgSrc: downloadAsPatternSvg,
        label: `.ACNL / .ACNH`,
        callback: async () => {
          if (selected.size === 1) {
            const [drawingTool, ..._] = [...selected];
            await saver.saveDrawingToolAsPattern(drawingTool);
            return;
          }
          let source;
          if (selected.size === 0) source = drawingTools;
          else source = [...selected];
          saver.saveDrawingToolsAsPattern(source);
        },
      };

      const downloadAsPng = {
        imgSrc: downloadAsPngSvg,
        label: `QR / PBL`,
        callback: async () => {
          if (selected.size === 1) {
            const [drawingTool, ..._] = [...selected];
            await saver.saveDrawingToolAsPng(drawingTool);
            return;
          }
          let source;
          if (selected.size === 0) source = drawingTools;
          else source = [...selected];
          await saver.saveDrawingToolsAsPng(source);
        },
      };

      const downloadAsBoth = {
        imgSrc: downloadAsBothSvg,
        label: `Both`,
        callback: async () => {
          if (selected.size === 1) {
            const [drawingTool, ..._] = [...selected];
            return;
          }
          let source;
          if (selected.size === 0) source = drawingTools;
          else source = [...selected];
          await saver.saveDrawingToolsAsBoth(source);
        },
      };

      if (selected.size === 1) {
        options.push(open);
      }
      options.push(del);
      options.push(downloadAsPattern, downloadAsPng, downloadAsBoth);
      return options;
    },
  },
  methods: {
    toggleSelection(drawingTool) {
      const idx = this.drawingTools.indexOf(drawingTool);
      const isSelected = this.selectedMap[idx];
      this.selectedMap.splice(idx, 1, !isSelected);
    },
  },
  async mounted() {
    const drawingTools = await saver.getDrawingToolsFromStorage();
    drawingTools.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0;
    });
    for (const drawingTool of drawingTools) {
      this.drawingTools.push(drawingTool);
      this.selectedMap.push(false);
    }
  },
};
</script>

<style lang="scss" scoped>
</style>