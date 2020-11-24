<template>
  <div>
    <PatternContainer
      v-if="drawingTools.length > 0"
      @close="$emit('close')"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
      :drawingTools="drawingTools"
      :options="options"
      :selectedMap="selectedMap"
      @select="toggleSelection"
    />
    <FileLoader
      ref="collectionFileLoader"
      fileType="collection"
      @multiload="multiload"
    />
  </div>
</template>

<script>
import PatternContainer from "~/components/positioned/PatternContainer.vue";
import FileLoader from "~/components/FileLoader.vue";
import saver from "~/libs/saver";

import saveToStorageSvg from "~/assets/icons/utilitybar/bxs-inbox.svg";
import openSvg from "~/assets/icons/utilitybar/bxs-envelope-open.svg";
import removeSvg from "~/assets/icons/utilitybar/bxs-trash.svg";
import downloadAsPatternSvg from "~/assets/icons/utilitybar/bxs-file-blank.svg";
import downloadAsPngSvg from "~/assets/icons/utilitybar/bxs-image-alt.svg";
import downloadAsBothSvg from "~/assets/icons/utilitybar/bxs-file-archive.svg";

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
      return this.drawingTools.filter((dt, i) => this.selectedMap[i]);
    },
    options() {
      const { selected, selectedMap, drawingTools } = this;
      let options = [];
      if (drawingTools.length === 0) return options;

      const open = {
        imgSrc: openSvg,
        label: `Open`,
        callback: async () => {
          const drawingTool = selected[0];
          console.log(drawingTool);
          this.$emit("load", drawingTool.toString());
          this.$emit("close");
        },
      };

      const remove = {
        imgSrc: removeSvg,
        label: `Remove`,
        callback: async () => {
          for (const drawingTool of selected) {
            const idx = drawingTools.indexOf(drawingTool);
            drawingTools.splice(idx, 1);
            selectedMap.splice(idx, 1);
          }
        },
      };

      const saveToStorage = {
        imgSrc: saveToStorageSvg,
        label: `Storage`,
        callback: async () => {
          let source;
          let message;
          if (selected.length === 0) {
            source = drawingTools;
            message = "Saved all patterns to storage.";
          } else {
            source = [...selected];
            message = "Saved selected patterns to storage.";
          }
          await saver.saveDrawingToolsToStorage(source);
          window.alert(message);
        },
      };

      const downloadAsPattern = {
        imgSrc: downloadAsPatternSvg,
        label: `.ACNL / .ACNH`,
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
        imgSrc: downloadAsPngSvg,
        label: `QR / PBL`,
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
        imgSrc: downloadAsBothSvg,
        label: `Both`,
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
    },
  },
};
</script>