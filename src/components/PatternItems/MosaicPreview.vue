<template>
  <div
    :class="{
      'mosaic-preview': true,
      'mosiac-preview--expanded': expanded,
    }"
    :style="{
      'grid-template-rows': `repeat(${rows}, ${100/(expanded ? size: rows)}%)`,
      'grid-template-columns': `repeat(${cols}, ${100/(expanded ? size : cols)}%)`,
    }"
  >
    <SinglePreview
      v-for="patternItem of processedPatternItems"
      :key="patternItem.fullHash"
      :style="{
        'grid-row': patternItem.row + 1 - minRowVal,
        'grid-column': patternItem.col + 1 - minColVal,
      }"
      :patternItem="patternItem"
    />
  </div>
</template>

<script lang="ts">
import {
  min,
  max,
  uniqBy,
  sortBy,
} from "lodash";
import { Vue, Component, Prop } from "vue-property-decorator";
import SinglePreview from "@/components/PatternItems/SinglePreview.vue"
import { PatternItem } from "@/libs/storage";

@Component({
  components: {
    SinglePreview,
  },
})
export default class MosaicPreview extends Vue {
  /**
   * The pattern item group to render.
   */
  @Prop() readonly patternItemGroup!: PatternItem[];
  
  /**
   * When true, generates a square preview.
   */
  @Prop({
    type: Boolean,
    default: (): boolean => false,
  }) readonly expanded!: boolean;
  
  /**
   * The pattern items filtered down.
   */
  get processedPatternItems(): PatternItem[] {
    return uniqBy(sortBy(
      this.patternItemGroup,
      pi => pi.row,
      pi => pi.col,
    ), pi => `${pi.row} ${pi.col}`);
  }
  
  /** The row indexes. */
  get rowVals(): number[] {
    return this.processedPatternItems.map(pi => pi.row);
  }
  
  /** The column indexes. */
  get colVals(): number[] {
    return this.processedPatternItems.map(pi => pi.col);
  }
  
  /** The minimum row index. */
  get minRowVal(): number {
    return min(this.rowVals) as number;
  }
  
  /** The maxiumum row index. */
  get maxRowVal(): number {
    return max(this.rowVals) as number;
  }

  /** The minimum column index. */
  get minColVal(): number {
    return min(this.colVals) as number;
  }
  
  /** The maximum column index. */
  get maxColVal(): number {
    return max(this.colVals) as number;
  }
  
  /** The number of rows. */
  get rows(): number {
    return this.maxRowVal - this.minRowVal + 1;
  }
  
  /** The number of columns. */
  get cols(): number {
    return this.maxColVal - this.minColVal + 1;
  }
  
  /** The maximum size as a square */
  get size(): number {
    return max([this.rows, this.cols]) as number;
  }
}
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;

.mosaic-preview {
  display: inline-grid;
  grid-auto-flow: row;
  justify-content: flex-start;
  justify-items: stretch;
  align-content: flex-start;
  align-items: stretch;
  position: relative;
  
  &.mosiac-preview--expanded {
    display: grid;
    justify-content: center;
    align-content: center;
  }
}
</style>