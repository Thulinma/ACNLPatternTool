<template>
  <Fragment>
    <VDialog
      :value="showDialog"
      @input="close"
      content-class="collection--dialog"
      scrollable
      width="auto"
    >
      <PatternContainer
        @close="close"
        :patternItems="patternItems"
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
import { mapActions } from "vuex";
import { first, intersection } from "lodash";
import { VDialog } from "vuetify/lib";
import { Fragment } from "vue-fragment";
import PatternContainer from "@/components/positioned/PatternContainer.vue";
import FileLoader from "@/components/wrapper/FileLoader.vue";
import {
  drawingToolToNamedPatternBlob,
  drawingToolToNamedImageBlob,
  namedBlobsToNamedZipBlob,
  downloadNamedBlob,
} from "@/libs/downloader";
import { createPatternItem } from "@/libs/storage";
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
      showDialog: false,
      zipExts,
      patternItems: [],
      selected: [],
    };
  },
  computed: {
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

      const remove = {
        icon: 'mdi-trash-can',
        label: `Remove`,
        callback: async () => {
          this.patternItems = this.patternItems.filter(pi => !selected.includes(pi));
          this.selected = this.selected.filter(pi => !selected.includes(pi));
        },
      };

      const saveToStorage = {
        icon: 'mdi-file-cabinet',
        label: `Storage`,
        callback: async () => {
          const [
            message,
            source
          ] = selected.length === 0
            ? [
              "Saved all patterns to storage.",
              patternItems,
            ]
            : [
              "Saved selected patterns to storage.",
              selected,
            ];
          await this.add(source);
          window.alert(message);
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
      if (selected.length >= 1)
        options.push(remove);
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
    ...mapActions("storage", ["add"]),
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
    open() {
      // will trigger multiload which clears
      this.$refs.collectionFileLoader.open();
    },
    close() {
      Object.assign(this, {
        showDialog: false,
        patternItem: [],
        selected: [],
      });
    },
    multiload(drawingTools) {
      // clear
      Object.assign(this, {
        showDialog: true,
        patternItems: drawingTools.map(
          drawingTool => createPatternItem({
            drawingTool,
            createdDate: new Date(),
          })
        ),
        selected: [],
      });
    },
  },
};
</script>

<style lang="scss">
.collection--dialog {
  box-shadow: none;
}
</style>