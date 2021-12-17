<template>
  <div>
    <VDialog
      :value="drawingTools.length > 0"
      @input="$emit('close')"
      content-class="collection--dialog"
      scrollable
      width="auto"
    >
      <PatternContainer
        v-if="drawingTools.length > 0"
        @close="$emit('close')"
        :drawingTools="drawingTools"
        :options="options"
        :selectedMap="selectedMap"
        @select="toggleSelection"
      />
    </VDialog>
    <FileLoader
      ref="collectionFileLoader"
      fileType="collection"
      @multiload="multiload"
    />
  </div>
</template>

<script>
import { VDialog } from "vuetify/lib";
import PatternContainer from "~/components/positioned/PatternContainer.vue";
import FileLoader from "~/components/FileLoader.vue";
import saver from "~/libs/saver";

export default {
  name: "FileLoaderCollection",
  components: {
    VDialog,
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
        icon: 'mdi-application-edit',
        label: `Open`,
        callback: async () => {
          const drawingTool = selected[0];
          console.log(drawingTool);
          this.$emit("load", drawingTool.toString());
          this.$emit("close");
        },
      };

      const remove = {
        icon: 'mdi-trash-can',
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
        icon: 'mdi-file-cabinet',
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
        icon: 'mdi-file',
        label: `.ACNL/.ACNH`,
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
        icon: 'mdi-image',
        label: `QR/PBL`,
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
        icon: 'mdi-zip-box',
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

<style lang="scss">
.collection--dialog {
  box-shadow: none;
}
</style>