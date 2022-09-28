<template>
  <div
    :class="{
      'mosaic-preview': true,
      'mosiac-preview--expanded': expanded,
    }"
    :style="{
      'grid-template-rows': `repeat(${rows}, ${100/(expanded ? size: rows)}%)`,
      'grid-template-column': `repeat(${cols}, ${100/(expanded ? size : cols)}%)`,
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

<script>
import {
  min,
  max,
  uniqBy,
  sortBy,
} from "lodash";
import { PatternItem } from "@/libs/storage";
import SinglePreview from "@/components/PatternItems/SinglePreview.vue"

// will not always produce a square image when 
// there are missing patterns in the mosaic
// or if mosaic rows & cols is not equal
export default {
  components: {
    SinglePreview,
  },
  props: {
    /**
     * A group of pattern items that share a `mosaicId` value.
     * @type {PatternItem[]}
     */
    patternItemGroup: {
      type: Array,
      required: true,
      default: () => new Array(),
    },
    expanded: {
      type: Boolean,
      default: () => false,
    }
  },
  data() {
    return {};
  },
  computed: {
    /** @type {PatternItem[]} */
    processedPatternItems() {
      return uniqBy(sortBy(
        this.patternItemGroup,
        pi => pi.row,
        pi => pi.col,
      ), pi => `${pi.row} ${pi.col}`);
    },
    rowVals() {
      return this.processedPatternItems.map(pi => pi.row);
    },
    colVals() {
      return this.processedPatternItems.map(pi => pi.col);
    },
    /** @type {number} The minimum row index. */
    minRowVal() {
      return min(this.rowVals);
    },
    /** @type {number} The maximum row index. */
    maxRowVal() {
      return max(this.rowVals);
    },
    /** @type {number} The minimum column index. */
    minColVal() {
      return min(this.colVals)
    },
    /** @type {number} The maximum column index. */
    maxColVal() {
      return max(this.colVals)
    },
    /** @type {number} The number of rows. */
    rows() {
      return this.maxRowVal - this.minRowVal + 1;
    },
    /** @type {number} The number of columns. */
    cols() {
      return this.maxColVal - this.minColVal + 1;
    },
    /** @type {number} The maximum size as a square */
    size() {
      return max([this.rows, this.cols])
    },
  },
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