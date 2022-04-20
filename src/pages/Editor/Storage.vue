<template>
  <PatternContainer
    @close="$emit('close')"
    :drawingTools="drawingTools"
    :options="options"
    :selected="selected"
    @select="toggleSelection"
  >
    <template #title>Storage</template>
  </PatternContainer>
</template>

<script>
import { first, uniq } from "lodash";
import PatternContainer from "@/components/positioned/PatternContainer.vue";
import saver from "@/libs/saver";

export default {
  name: "Storage",
  components: {
    PatternContainer,
  },
  data() {
    return {
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
          const drawingTool = first(selected);
          this.$emit("load", [drawingTool]);
          this.$emit("close");
        },
      };

      const del = {
        icon: 'mdi-trash-can',
        label: `Delete`,
        callback: async () => {
          const [
            message,
            source
          ] = selected.length !== 0
            ? [
              "Are you sure you want to delete these patterns from storage?",
              selected,
            ]
            : [
              "Are you sure you want to clear the storage?",
              drawingTools,
            ];
          if (!window.confirm(message)) return;
          saver.deleteDrawingToolsFromStorage(source);
          for (const drawingTool of source) {
            drawingTools.splice(drawingTools.indexOf(drawingTool), 1);
            selected.splice(selected.indexOf(drawingTool), 1);
          }
        },
      };

      const downloadAsPattern = {
        icon: 'mdi-file',
        label: `.ACNL/.ACNH`,
        callback: async () => {
          if (selected.length === 1) {
            const drawingTool = first(selected);
            await saver.saveDrawingToolAsPattern(drawingTool);
            return;
          }
          let source = selected.length
            ? drawingTools
            : selected;
          saver.saveDrawingToolsAsPattern(source);
        },
      };

      const downloadAsPng = {
        icon: 'mdi-image',
        label: `QR/PBL`,
        callback: async () => {
          if (selected.length === 1) {
            const drawingTool = first(selected);
            await saver.saveDrawingToolAsPng(drawingTool);
            return;
          }
          let source = selected.length
            ? drawingTools
            : selected;
          await saver.saveDrawingToolsAsPng(source);
        },
      };

      const downloadAsBoth = {
        icon: 'mdi-zip-box',
        label: `Both`,
        callback: async () => {
          if (selected.length === 1) {
            const drawingTool = first(selected);
            await saver.saveDrawingToolAsBoth(drawingTool);
            return;
          }
          let source = selected.length
            ? drawingTools
            : selected;
          await saver.saveDrawingToolsAsBoth(source);
        },
      };

      if (selected.length === 1)
        options.push(open);
      options.push(del);
      options.push(downloadAsPattern, downloadAsPng, downloadAsBoth);
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
  },
  async mounted() {
    const drawingTools = await saver.getDrawingToolsFromStorage();
    drawingTools.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0;
    });
    this.drawingTools = drawingTools.slice();
    this.selected = [];
  },
};
</script>

<style lang="scss" scoped>
</style>