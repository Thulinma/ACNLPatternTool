<template>
  <div
    :class="{
      'container': true,
      picking: isPicking,
    }"
  >
    <Palette
      :drawingTool="drawingTool"
      @change-color-picker="$emit('change-color-picker', prevColorPicker)"
      @change-current-color="$emit('change-current-color', $event)"
    />

    <div v-show="isPicking" class="color-pickers">

      <VTabs
        grow
        class="tabs"
        :value="modeIndex"
        @change="onModeIndex"
      >
        <VTabsSlider :color="colors.jambalaya"></VTabsSlider>
        <VTab
          class="tab"
          v-for="mode in modes"
          :key="mode"
        >
          {{ mode }}  
        </VTab>
      </VTabs>
      
      <VTabsItems
        class="tabs-items"
        :value="modeIndex"
        @change="onModeIndex"
      >
        <VTabItem>
          <VCard class="card" flat>
            <VCardText>
              <ACNLColorPicker
                v-if="isACNL"
                :drawingTool="drawingTool"
                @color-picked="$emit('color-picked', $event)"
              />
            </VCardText>
          </VCard>
        </VTabItem>
        <VTabItem>
          <VCard class="card" flat>
            <VCardText>
              <ACNHColorPicker
                v-if="isACNH"
                :drawingTool="drawingTool"
                @color-picked="$emit('color-picked', $event)"
              />
            </VCardText>
          </VCard>
        </VTabItem>
      </VTabsItems>
      
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import {
  VCard,
  VCardText,
  VTabs,
  VTab,
  VTabsItems,
  VTabItem,
} from "vuetify/lib";
import Palette from "./Palette.vue";
import DrawingTool from "@/libs/DrawingTool";
import ACNLColorPicker from "./ACNLColorPicker.vue";
import ACNHColorPicker from "./ACNHColorPicker.vue";

import colors from "@/styles/colors.scss";

@Component({
  components: {
    VCard,
    VCardText,
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
    Palette,
    ACNLColorPicker,
    ACNHColorPicker,
  },
})
export default class ColorTools extends Vue {
  @Prop({
    type: DrawingTool,
    required: true,
  }) drawingTool!: DrawingTool;
  
  @Prop({
    type: String,
    required: false,
  }) prevColorPicker!: "acnl" | "acnh" | null;
  
  @Prop({
    type: String,
    required: false,
  }) colorPicker!: "acnl" | "acnh" | null;
  
  readonly colors = colors;
  readonly modes = ["acnl", "acnh"];
  
  get isPicking(): boolean {
    return this.colorPicker != null;
  }
  
  get isACNL(): boolean {
    return this.colorPicker === "acnl";
  }
  
  get isACNH(): boolean {
    return this.colorPicker === "acnh";
  }
  
  get modeIndex(): number {
    if (this.colorPicker == null)
      return 0;
    return this.modes.indexOf(this.colorPicker);
  }
  
  onModeIndex(modeIndex: number): void {
    this.$emit("change-color-picker", this.modes[modeIndex]);
  }
  
  // also responsible for closing, send null to close
  onChangeColorPicker(colorPickerMode: "acnl" | "acnh" | null): void {
    this.$emit("change-color-picker", colorPickerMode);
  }
  
  onChangeCurrentColor(idx: number): void {
    this.$emit("change-current-color", idx);
  }
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/overrides" as overrides;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;

// size dictated by palette
.container {
  grid-area: color-tools;
  justify-items: center;
  width: 100%;
  display: grid;

  user-select: none;

  background: colors.$pink-lace;

  text-align: left;
  padding-top: 5px;
  padding-bottom: 5px;

  @include screens.tablet-portrait {
    width: auto;
    display: inline-block;
    padding-top: 0px;
    padding-right: 10px;
    padding-left: 10px;
    border-radius: 0px 0px 40px 40px;
  }
  @include screens.tablet-landscape {
    padding-top: 0px;
    padding-right: 25px;
    padding-left: 25px;
    border-radius: 0px 0px 50px 50px;
  }

  &:hover {
    @include colors.stripes(
      colors.$pink-lace,
      colors.$piggy-pink,
      20px
    );
    @include colors.moving-stripes;
  }

  &.picking {
    @include colors.stripes(
      colors.$pink-lace,
      colors.$piggy-pink,
      20px
    );
    @include colors.moving-stripes(20s);
    position: relative;
    height: 100%;
    padding-bottom: 0px;
    border-radius: 0px;

    @include screens.tablet-portrait {
      height: auto;
      $full-thickness: 25px;
      border-radius: 0px 0px 20px 20px;
      padding-right: $full-thickness;
      padding-bottom: $full-thickness;
      padding-left: $full-thickness;
    }
    @include screens.tablet-landscape {
      $full-thickness: 30px;
      padding-right: $full-thickness;
      padding-bottom: $full-thickness;
      padding-left: $full-thickness;
    }
  }
}

.color-pickers {
  margin-top: 15px;
  width: 100%;

  @include screens.tablet-portrait {
    width: auto;
  }
}

.tabs {
  @include overrides.v-tabs(
    colors.$jambalaya,
    colors.$pink-lace,
  ) {
    border-radius: 15px 15px 0px 0px;
  }
}

.tab {
  @include overrides.v-tab(colors.$jambalaya) {
    &::before {
      border-radius: 15px;
    }
  };
}

.tabs-items {
  @include overrides.v-tabs-items(colors.$pink-lace);
  border-radius: 0px 0px 15px 15px;
}

.card {
  background-color: colors.$pink-lace;
}
</style>