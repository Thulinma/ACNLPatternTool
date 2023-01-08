<template>
  <PatternContainer
    @close="$emit('close')"
    :patternItems="patternItems"
    :options="options"
    @select="selected = $event"
  >
    <template #title>Storage</template>
    <template #empty-message>Storage Empty</template>
  </PatternContainer>
</template>

<script lang="ts">
import { first, without } from "lodash";
import { namespace } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import PatternContainer from "@/components/positioned/PatternContainer.vue";
import { UtilityBarOption } from "@/components/positioned/UtilityBar.vue"
import { PatternItem } from "@/libs/storage";
import {
  drawingToolToNamedPatternBlob,
  drawingToolToNamedImageBlob,
  namedBlobsToNamedZipBlob,
  downloadNamedBlob,
} from "@/libs/downloader";

const storageModule = namespace('storage');

@Component({
  name: "Storage",
  components: {
    PatternContainer,
  },
})
export default class Storage extends Vue {
  selected: PatternItem[] = [];
  
  @storageModule.Getter('patternItems') readonly patternItems!: PatternItem[];
  
  get drawingTools() {
    return this.patternItems.map(pi => pi.drawingTool);
  }
  
  get options() {
    const { selected, patternItems } = this;
    let options: UtilityBarOption[] = [];
    if (patternItems.length === 0) return options;

    const open = {
      icon: 'mdi-application-edit',
      label: `Open`,
      callback: async () => {
        const patternItem = first(selected) as PatternItem;
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
            (first(selected) as PatternItem).drawingTool
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
            (first(selected) as PatternItem).drawingTool
          );
          await downloadNamedBlob(namedImageBlob);
          return;
        }
        const source = selected.length
          ? selected
          : patternItems;
        const namedImageBlobs = await Promise.all(
          source
            .map(pi => pi.drawingTool)
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
            (first(selected) as PatternItem).drawingTool
          );
          const namedImageBlob = await drawingToolToNamedImageBlob(
            (first(selected) as PatternItem).drawingTool
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
  }
  
  @storageModule.Mutation('init')
  init!: () => Promise<void>;
  
  @storageModule.Action('remove')
  remove!: (patternItems: PatternItem[]) => Promise<void>
  
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
</style>