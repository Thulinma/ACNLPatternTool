<template>
  <Fragment>
    <VDialog
      :value="showDialog"
      @input="close"
      content-class="collection--dialog"
      :transition="$vuetify.breakpoint.mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
      :fullscreen="$vuetify.breakpoint.mobile"
      scrollable
    >
      <PatternContainer
        @close="close"
        :patternItems="patternItems"
        :options="options"
        @select="selected = $event"
      >
        <template #title>Files loaded</template>
        <template #empty-message>No pattern(s) found.</template>
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

<script lang="ts">
import { first } from "lodash";
import { Vue, Component } from "vue-property-decorator";
import { namespace } from "vuex-class";
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
import { UtilityBarOption } from "@/components/positioned/UtilityBar.vue";
import { PatternItem, createPatternItem } from "@/libs/storage";
import { zipExts } from "@/libs/reader";
import DrawingTool from "@/libs/DrawingTool";

const storageModule = namespace('storage');

@Component({
  components: {
    VDialog,
    Fragment,
    PatternContainer,
    FileLoader,
  },
})
export default class FileLoaderCollection extends Vue {
  $refs! : { collectionFileLoader: FileLoader; }
  
  zipExts = zipExts;
  
  showDialog: boolean = false;
  
  patternItems: PatternItem[] = [];
  
  selected: PatternItem[] = [];
  
  get options(): UtilityBarOption[] {
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
    if (selected.length >= 1)
      options.push(remove);
    options.push(
      saveToStorage,
      downloadAsPattern,
      downloadAsPng,
      downloadAsBoth
    );
    return options;
  }
  
  @storageModule.Action('add') add: any;
  
  open() {
    // will trigger multiload which clears
    this.$refs.collectionFileLoader.open();
  }
  
  close() {
    Object.assign(this, {
      showDialog: false,
      patternItem: [],
      selected: [],
    });
  }
  
  multiload(drawingTools: DrawingTool[]) {
    // clear
    const date = new Date();
    Object.assign(this, {
      showDialog: true,
      patternItems: drawingTools.map(
        drawingTool => createPatternItem({
          drawingTool,
          createdDate: new Date(date.getTime()),
        })
      ),
      selected: [],
    });
  }
};
</script>

<style lang="scss">
.collection--dialog {
  box-shadow: none;
  height: 100%;
}
</style>