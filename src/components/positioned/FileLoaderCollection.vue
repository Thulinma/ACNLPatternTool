<template>
  <div>
    <PatternContainer
      @close="$emit('close')"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
      :drawingTools="drawingTools"
      :options="options"
      :selectedMap="selectedMap"
      @select="toggleSelection"
    />
    <FileLoader ref="collectionFileLoader" fileType="collection" @multiload="multiload" />
  </div>
</template>

<script>
import PatternContainer from "~/components/positioned/PatternContainer.vue";
import FileLoader from "~/components/FileLoader.vue";
import saver from "~/libs/saver";
import { saveAs } from "file-saver";

export default {
  name: "FileLoaderCollection",
  components: {
    PatternContainer,
    FileLoader,
  },
  data() {
    return {
      drawingTools: [],
      selectedMap: [],
    };
  },
  computed: {
    selected() {
      return this.drawingTools.filter(
        (dt, i) => this.selectedMap[i]
      );
    },
    options() {
      const { selected, drawingTools } = this;
      let options = [];
      if (drawingTools.length === 0) return options;

      const open = {
        label: `Open`,
        callback: async () => {
          const drawingTool = selected[0];
          console.log(drawingTool);
          this.$emit("load", drawingTool.toString());
        },
      };

      const remove = {
        label: `Remove`,
        callback: async () => {
          for (const drawingTool of selected) {
            const idx = drawingTools.indexOf(drawingTool);
            drawingTools.splice(idx, 1);
          }
        },
      };

      const saveToStorage = {
        label: `Save ${selected.length === 0 ? "all " : ""}to Storage`,
        callback: async () => {
          let source;
          if (selected.length === 0) source = drawingTools;
          else source = [...selected];
          await saver.saveDrawingToolsToStorage(source);
        },
      };

      const downloadAsPattern = {
        label: `Download ${selected.length === 0 ? "all " : ""}as .ACNL / .ACNH`,
        callback: async () => {
          if (selected.length === 1) {
            const drawingTool = selected[0];
            await saver.saveDrawingToolAsPattern(drawingTool);
            return;
          }
          let source;
          if (selected.length === 0) source = drawingTools;
          else source = selected;
          await saver.saveDrawingToolsAsPattern(source);
        },
      };

      const downloadAsPng = {
        label: `Download ${selected.length === 0 ? "all " : ""}as QR / PBL`,
        callback: async () => {
          if (selected.length === 1) {
            const drawingTool = selected[0];
            await saver.saveDrawingToolAsPng(drawingTool);
            return;
          }
          let source;
          if (selected.length === 0) source = drawingTools;
          else source = selected;
          await saver.saveDrawingToolsAsPng(source);
        },
      };

      const downloadAsBoth = {
        label: `Download ${selected.length === 0 ? "all " : ""}as Both`,
        callback: async () => {
          if (selected.length === 1) {
            const drawingTool = selected[0];
            await saver.saveDrawingToolAsBoth(drawingTool);
            return;
          }
          let source;
          if (selected.length === 0) source = drawingTools;
          else source = selected;
          await saver.saveDrawingToolsAsBoth(source);
        },
      };

      if (selected.length === 1) {
        options.push(open);
      }
      if (selected.length >= 1) {
        options.push(remove);
      }
      options.push(
        saveToStorage,
        downloadAsPattern,
        downloadAsPng,
        downloadAsBoth
      );
      return options;
    },
  },
  methods: {
    toggleSelection(drawingTool) {
      const idx = this.drawingTools.indexOf(drawingTool);
      const isSelected = this.selectedMap[idx];
      this.selectedMap.splice(idx, 1, !isSelected);
    },
    open() {
      // clear
      this.drawingTools.splice(0, this.drawingTools.length);
      this.$refs.collectionFileLoader.open();
    },
    multiload(drawingTools) {
      // clear
      this.drawingTools.splice(0, this.drawingTools.length);
      for (const drawingTool of drawingTools) {
        this.drawingTools.push(drawingTool);
        this.selectedMap.push(false);
      }
    }
  },
  mounted() {
    this.open();
  }
};
</script>