<template>
  <div class="stage">
    <div class="left-side">
      <div class="preview-container">
        <img class="preview" :src="previewDataURL" />
      </div>
    </div>

    <div class="right-side">
      <div>
        <div class="text-h6">Saving Method</div>
        <VRadioGroup
          :value="savingMethod"
          :value-comparator="(a, b) => a === b"
          @change="savingMethod = $event"
        >
          <VRadio
            v-for="option in savingMethodOptions"
            :key="option.text"
            :label="option.text"
            :value="option.value"
            :color="colors.jambalaya"
          />
        </VRadioGroup>
      </div>

      <VBtn class="save-btn rounded-lg" elevation="0" @click="save">
        Save
      </VBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { VBtn, VRadio, VRadioGroup } from "vuetify/lib";
import { v4 as uuidv4 } from "uuid";
import { namespace } from "vuex-class";
import { createPatternItem, PatternItem } from "@/libs/storage";
import {
  drawingToolToNamedPatternBlob,
  drawingToolToNamedImageBlob,
  namedBlobsToNamedZipBlob,
  downloadNamedBlob,
} from "@/libs/downloader";
import DrawingTool from "@/libs/DrawingTool";

import colors from "@/styles/colors.scss";

const storageModule = namespace('storage');

const dtToStorage = async function(this: SavingStage, drawingTools: DrawingTool[]) {
  const mosaicId = uuidv4(); // share id so they can be rendered together
  const date = new Date();
  const mockedPatternItems = drawingTools.map((drawingTool, i) => createPatternItem({
    drawingTool,
    createdDate: new Date(date.getTime()),
    mosaicId,
    row: Math.floor(i / this.columns),
    col: i % this.columns,
  }));
  await this.add(mockedPatternItems);
};

const dtAsImageZip = async function(drawingTools: DrawingTool[]) {
  const namedImageBlobs = await Promise.all(drawingTools.map(dt =>
    drawingToolToNamedImageBlob(dt)
  ));
  const namedZipBlob = await namedBlobsToNamedZipBlob(namedImageBlobs);
  downloadNamedBlob(namedZipBlob);
};

const dtAsPatternZip =  async function(drawingTools: DrawingTool[]) {
  const namedPatternBlobs = await Promise.all(drawingTools.map(dt =>
    drawingToolToNamedPatternBlob(dt)
  ));
  const namedZipBlob = await namedBlobsToNamedZipBlob(namedPatternBlobs);
  downloadNamedBlob(namedZipBlob);
};

const dtAsBothZip = async function(drawingTools: DrawingTool[]) {
  const namedBothBlobs = await Promise.all([
    ...drawingTools.map(dt => drawingToolToNamedPatternBlob(dt)),
    ...drawingTools.map(dt => drawingToolToNamedImageBlob(dt)),
  ]);
  const namedZipBlob = await namedBlobsToNamedZipBlob(namedBothBlobs);
  downloadNamedBlob(namedZipBlob);
};

@Component({
  components: {
    VBtn,
    VRadio,
    VRadioGroup,
  },
})
export default class SavingStage extends Vue {
  @Prop({
    type: String,
    required: true,
  }) readonly previewDataURL!: string;
  
  @Prop({
    type: Number,
    required: true,
  }) readonly columns!: number;
  
  @Prop({
    type: Array,
    required: true,
  }) readonly outputs!: DrawingTool[];
  
  readonly colors = colors;
  
  savingMethod: (...args: any[]) => Promise<void> = this.outputs.length === 1
    ? this.load
    : dtToStorage;
  
  get savingMethodOptions() {
    const loadIntoEditor = {
      text: "Onto Pattern",
      value: this.load,
    };
    const saveToStorage = {
      text: "To Storage",
      value: dtToStorage,
    };
    const saveAsQrs = {
      text: "QRs as .ZIP",
      value: dtAsImageZip,
    };
    const saveAsPattern = {
      text: "ACNLs/ACNHs as .ZIP",
      value: dtAsPatternZip,
    };
    const saveAsBoth = {
      text: "Both as .ZIP",
      value: dtAsBothZip,
    };
    
    const options = [
      saveToStorage,
      saveAsQrs,
      saveAsPattern,
      saveAsBoth,
    ];
    
    if (this.outputs.length === 1)
      return [
        loadIntoEditor,
        saveToStorage,
        saveAsQrs,
        saveAsPattern,
        saveAsBoth,
      ];
    return [
      saveToStorage,
      saveAsQrs,
      saveAsPattern,
      saveAsBoth,
    ];
  }
  
  @storageModule.Action('add') add!:
    (patternItems: PatternItem[]) => Promise<void>;
  
  async load(): Promise<void> {
    this.$emit("load", this.outputs);
    window.alert("Conversion successfully loaded onto pattern.")
  }
  
  async save(): Promise<void> {
    const drawingTools = this.outputs.map((output) => {
      const drawingTool = new DrawingTool(output.toString());
      return drawingTool;
    });
    await this.savingMethod(drawingTools);
    if (this.savingMethod === dtToStorage)
      window.alert("Patterns successfully saved to Storage.");
  }
};
</script>


<style lang="scss" scoped>
@use "styles/overrides" as overrides;
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;

.stage {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  justify-content: center;
  column-gap: 50px;
  row-gap: 30px;
  overflow-y: auto;
  padding: 24px 24px 24px 24px;

  @include screens.tablet-landscape {
    grid-template-columns: auto auto;
    overflow-y: auto;
    max-height: 425px;
  }
}

.left-side {
  justify-self: center;
  align-self: flex-start;

  position: relative;
  top: 0;
  left: 0;

  display: grid;
  grid-template-areas: "preview preview";
  row-gap: 30px;
  grid-template-rows: auto;
  grid-template-columns: auto;

  justify-content: center;
  justify-items: center;
  align-content: space-between;
  align-items: auto;

  @include screens.tablet-landscape {
    position: sticky;
  }
}

.preview-container {
  @include positioning.relative-in-place;
  grid-area: preview;

  display: flex;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  overflow: hidden;

  @include colors.polkadots(
    colors.$olive-haze,
    colors.$donkey-brown
  );
  @include colors.moving-polkadots(2s);
  min-width: 200px;
  height: 300px;
  padding: 20px;
  border-radius: 8px;

  &::before {
    // overlay
    content: "";
    display: block;
    @include positioning.absolute-center;
    width: 100%;
    height: 100%;
    background: black;
    opacity: 0.5;
  }
  @include screens.phone-landscape {
    width: 350px;
  }
}

.preview {
  @include positioning.relative-in-place;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  // need this or its blurry
  image-rendering: pixelated;
}

.right-side {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: stretch;
  justify-items: stretch;
  align-content: space-between;
  row-gap: 15px;
}

.text-h6 {
  color: colors.$jambalaya;
}

.save-btn {
  @include overrides.v-btn(
    colors.$white,
    colors.$robin-egg-blue
  );
  padding: 0px 20px !important;
  @include overrides.v-btn(
    colors.$white,
    colors.$robin-egg-blue
  );
  border: 4px solid colors.$robin-egg-blue;
  &:hover {
    @include colors.stripes(
      colors.$tiffany-blue,
      colors.$tiffany-blue-light,
      20px
    );
    @include colors.moving-stripes(8s);
    border: 4px solid colors.$turquoise;
  }
}
</style>
