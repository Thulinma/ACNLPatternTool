<template>
  <Fragment>
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
        :selected="selected"
        @select="toggleSelection"
      >
        <template #title>Files loaded</template>
      </PatternContainer>
    </VDialog>
    <FileLoader
      ref="collectionFileLoader"
      :exts="zipExts"
      @load="multiload"
    >
      <template #activator="{ on }">
        <slot name="activator" :on="on">
        </slot>
      </template>
    </FileLoader>
  </Fragment>
</template>

<script>
import { VDialog } from "vuetify/lib";
import { Fragment } from "vue-fragment";
import PatternContainer from "@/components/positioned/PatternContainer.vue";
import FileLoader from "@/components/wrapper/FileLoader.vue";
import saver from "@/libs/saver";
import { zipExts } from "@/libs/reader";

export default {
  name: "FileLoaderCollection",
  components: {
    VDialog,
    Fragment,
    PatternContainer,
    FileLoader,
  },
  data() {
    return {
      zipExts,
      drawingTools: [],
      selected: [],
    };
  },
  computed: {
    options() {
      const { selected, drawingTools } = this;
      let options = [];
      if (drawingTools.length === 0) return options;

      const open = {
        icon: 'mdi-application-edit',
        label: `Open`,
        callback: async () => {
          const drawingTool = selected[0];
          this.$emit("load", drawingTool.toString());
          this.$emit("close");
        },
      };

      const remove = {
        icon: 'mdi-trash-can',
        label: `Remove`,
        callback: async () => {
          for (const drawingTool of selected) {
            drawingTools.splice(drawingTools.indexOf(drawingTool), 1);
            selected.splice(drawingTools.indexOf(drawingTool), 1);
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
      if (this.selected.includes(drawingTool))
        this.selected.splice(this.selected.indexOf(drawingTool), 1);
      else
        this.selected.push(drawingTool);
    },
    open() {
      // clear
      this.drawingTools.splice(0, this.drawingTools.length);
      this.$refs.collectionFileLoader.open();
    },
    multiload(drawingTools) {
      // clear
      this.drawingTools = drawingTools.slice();
      this.selected = [];
    },
  },
};
</script>

<style lang="scss">
.collection--dialog {
  box-shadow: none;
}
</style>