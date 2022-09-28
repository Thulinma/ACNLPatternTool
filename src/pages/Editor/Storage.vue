<template>
  <PatternContainer
    @close="$emit('close')"
    :patternItems="patternItems"
    :options="options"
    :selected="selected"
    @select="toggleSelection"
  >
    <template #title>Storage</template>
    <template #empty-message>Storage Empty</template>
  </PatternContainer>
</template>

<script>
import { first, without } from "lodash";
import {
  mapGetters,
  mapMutations,
  mapActions,
} from "vuex";
import PatternContainer from "@/components/positioned/PatternContainer.vue";
import {
  drawingToolToNamedPatternBlob,
  drawingToolToNamedImageBlob,
  namedBlobsToNamedZipBlob,
  downloadNamedBlob,
} from "@/libs/downloader";

export default {
  name: "Storage",
  components: {
    PatternContainer,
  },
  data() {
    return {
      selected: [],
    };
  },
  computed: {
    ...mapGetters("storage", ["patternItems"]),
    drawingTools() {
      return this.patternItems.map(pi => pi.drawingTool);
    },
    options() {
      const { selected, patternItems } = this;
      let options = [];
      if (patternItems.length === 0) return options;

      const open = {
        icon: 'mdi-application-edit',
        label: `Open`,
        callback: async () => {
          const patternItem = first(selected);
          this.$emit("load", [patternItem.drawingTool]);
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
              patternItems,
            ];
          if (!window.confirm(message))
            return;
          await this.remove(source);
          this.selected = without(
            this.selected,
            ...source,
          );
        },
      };

      const downloadAsPattern = {
        icon: 'mdi-file',
        label: `.ACNL/.ACNH`,
        callback: async () => {
          if (selected.length === 1) {
            const namedPatternBlob = await drawingToolToNamedPatternBlob(
              first(selected).drawingTool
            );
            await downloadNamedBlob(namedPatternBlob);
            return;
          }
          const source = selected.length
            ? selected
            : patternItems;
          const namedPatternBlobs = await Promise.all(
            source
              .map(pi => pi.drawingTool)
              .map(dt => drawingToolToNamedPatternBlob(dt))
          );
          const namedZipBlob = await namedBlobsToNamedZipBlob(namedPatternBlobs);
          await downloadNamedBlob(namedZipBlob);
        },
      };

      const downloadAsPng = {
        icon: 'mdi-image',
        label: `QR/PBL`,
        callback: async () => {
          if (selected.length === 1) {
            const namedImageBlob = await drawingToolToNamedImageBlob(
              first(selected).drawingTool
            );
            await downloadNamedBlob(namedImageBlob);
            return;
          }
          const source = selected.length
            ? patternItems
            : selected;
          const namedImageBlobs = await Promise.all(
            source
              .map(pi => pi.drawingTools)
              .map(dt => drawingToolToNamedImageBlob(dt))
          );
          const namedZipBlob = await namedBlobsToNamedZipBlob(namedImageBlobs);
          await downloadNamedBlob(namedZipBlob);
        },
      };

      const downloadAsBoth = {
        icon: 'mdi-zip-box',
        label: `Both`,
        callback: async () => {
          if (selected.length === 1) {
            const namedPatternBlob = await drawingToolToNamedPatternBlob(
              first(selected).drawingTool
            );
            const namedImageBlob = await drawingToolToNamedImageBlob(
              first(selected).drawingTool
            );
            const namedZipBlob = await namedBlobsToNamedZipBlob([
              namedPatternBlob,
              namedImageBlob,
            ]);
            await downloadNamedBlob(namedZipBlob);
            return;
          }
          let source = selected.length
            ? selected
            : patternItems;
          const namedPatternBlobs = await Promise.all(
            source
              .map(pi => pi.drawingTool)
              .map(dt => drawingToolToNamedPatternBlob(dt))
          );
          const namedImageBlobs = await Promise.all(
            source
              .map(pi => pi.drawingTool)
              .map(dt => drawingToolToNamedImageBlob(dt))
          );
          const namedZipBlob = await namedBlobsToNamedZipBlob([
            ...namedPatternBlobs,
            ...namedImageBlobs,
          ]);
          await downloadNamedBlob(namedZipBlob);
        },
      };

      if (selected.length === 1)
        options.push(open);
      options.push(del);
      options.push(
        downloadAsPattern,
        downloadAsPng,
        downloadAsBoth,
      );
      return options;
    },
  },
  methods: {
    ...mapMutations("storage", ["init"]),
    ...mapActions("storage", ["remove"]),
    toggleSelection(patternItem) {
      if (this.selected.includes(patternItem))
        this.selected = intersection(
          this.patternItems,
          this.selected.filter(pi => pi !== patternItem),
        );
      else
        this.selected = intersection(
          this.patternItems,
          this.selected.concat([patternItem]),
        );
    },
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
</style>