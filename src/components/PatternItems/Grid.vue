<template>
  <div class="grid-comp">
    <transition-group
      v-if="patternItems.length > 0"
      name="grid-item-transition"
      tag="div"
      class="grid-comp-layout"
    >
      <GridItemSelector
        v-for="mosaicItem in mosaicItems"
        :key="mosaicItem.id"
        :value="selectedPatternItemGroups.includes(mosaicItem.patternItemGroup)"
      >
        <GridItem
          :patternItemGroup="mosaicItem.patternItemGroup"
          @click="onClick($event, mosaicItem.patternItemGroup)"
        />
      </GridItemSelector>
    </transition-group>
  </div>
</template>


<script lang="ts">
import {
  without,
  concat,
  first,
  last,
  groupBy,
  sortBy,
  uniq,
  min,
  max,
} from "lodash";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { VContainer, VSpacer } from "vuetify/lib";
import GridItemSelector from "@/components/PatternItems/GridItemSelector.vue"
import GridItem from "@/components/PatternItems/GridItem.vue";
import { PatternItem } from "@/libs/storage";

type PatternItemGroup = PatternItem[];

@Component({
  components: {
    GridItem,
    GridItemSelector,
    VContainer,
    VSpacer,
  },
})
export default class Grid extends Vue {
  @Prop({
    type: Boolean,
    default: () => false,
  }) readonly expandMosaics!: boolean;

  @Prop({
    type: Array,
    required: true,
  }) readonly patternItems!: PatternItem[];
  
  /** The selected slices when repeated shift/ctrl selecting. */
  selectedPatternItemGroupSlices: PatternItemGroup[][] = [];
  
  /**
   * The pattern items grouped by mosaic id or pseudo mosaic ids.
   * In expanded mode gives each pattern item a unique generated mosaic id.
   */
  get patternItemsGrouped() {
    const grouped = groupBy(
      this.patternItems,
      patternItem => patternItem.mosaicId,
    );
    if (!this.expandMosaics)
      return grouped;
    // modify the groups
    const psuedoGrouped = Object.entries(grouped)
      .reduce<typeof grouped>((acc, [id, group]) => {
        if (group.length === 1)
          acc[id] = group
        else
          for (let i = 0; i < group.length; ++i)
            acc[`${id}-${i}`] = [group[i]];
        return acc;
      }, {});
    return psuedoGrouped;
  }
  
  /**
   * Wrapped pattern groups in objects with mosaic ids for list rendering.
   * Also sorts mosaic items by date, row, col.
   */
  get mosaicItems() {
    const mosaicItems = Object.entries(this.patternItemsGrouped)
      .map(([
        mosaicId,
        patternItemGroup,
      ]) => ({
        id: mosaicId,
        patternItemGroup,
      }));
    return sortBy(
      mosaicItems,
      [
        ({ patternItemGroup }) => -(first(patternItemGroup) as PatternItem).createdDate.getTime(),
        ({ patternItemGroup }) => (first(patternItemGroup) as PatternItem).row,
        ({ patternItemGroup }) => (first(patternItemGroup) as PatternItem).col,
      ],
    );
  }
  
  /**
   * The cumalative pattern item groups of all mosaics.
   */
  get patternItemGroups() {
    return this.mosaicItems
      .map(mosaicItem => mosaicItem.patternItemGroup);
  }
  
  /**
   * Reverse mapping of pattern item groups to their index.
   */
  get patternItemGroupToIdx() {
    return new Map(Array.from(
      this.patternItemGroups
        .entries()
    ).map(([k, v]) => [v, k]));
  }
  
  /**
   * The selected pattern item groups.
   */
  get selectedPatternItemGroups() {
    return sortBy(
      uniq(concat(...this.selectedPatternItemGroupSlices)),
      patternItemGroup => this.patternItemGroupToIdx.get(patternItemGroup),
    );
  }
  
  /**
   * The selected pattern items.
   */
  get selectedPatternItems() {
    return this.selectedPatternItemGroups.flat(2);
  }
  
  onClick(event: MouseEvent, patternItemGroup: PatternItem[]) {
    if (event.shiftKey) {
      const initialIdx = this.patternItemGroupToIdx.get(
        first(last(this.selectedPatternItemGroupSlices) as PatternItemGroup[]) as PatternItemGroup
      ) as number;
      const currIdx = this.patternItemGroups.indexOf(patternItemGroup);
      const willReverse = initialIdx > currIdx;
      const patternItemGroupSlice = this.patternItemGroups
        .slice(
          min([initialIdx, currIdx]),
          (max([initialIdx, currIdx]) as number) + 1,
        );
      if (willReverse)
        patternItemGroupSlice.reverse();
      this.selectedPatternItemGroupSlices = !event.ctrlKey
        ? [patternItemGroupSlice]
        : concat(
          this.selectedPatternItemGroupSlices,
          [patternItemGroupSlice]
        );
    }
    else if (event.ctrlKey && !event.shiftKey) {
      // remove pattern group from all slices
      if (this.selectedPatternItemGroups.includes(patternItemGroup))
        this.selectedPatternItemGroupSlices = this.selectedPatternItemGroupSlices
          .map(patternItemGroupSlice => without(patternItemGroupSlice, patternItemGroup))
          .filter(patternItemGroupSlice => Boolean(patternItemGroupSlice.length));
      else // add single pattern group as a slice
        this.selectedPatternItemGroupSlices = concat(
          this.selectedPatternItemGroupSlices,
          [[patternItemGroup]],
        );
    }
    else
      this.selectedPatternItemGroupSlices = [[patternItemGroup]];
    this.$emit('selectPatternItems', this.selectedPatternItems);
    this.$emit('selectPatternItemGroups', this.selectedPatternItemGroups);
  }
  
  @Watch('patternItems')
  onPatternItemsChanged() {
    this.selectedPatternItemGroupSlices = [];
  }
}
</script>

<style lang="scss" scoped>
.grid-comp {
  user-select: none;
}

.grid-comp-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill,  190px);
  justify-content: space-around;
  column-gap: 20px;
  row-gap: 30px;
}

.grid-item-transition-move, /* apply transition to moving elements */
.grid-item-transition-enter-active,
.grid-item-transition-leave-active {
  transition: all 0.5s ease;
}

.grid-item-transition-enter {
  transform: scale(0);
}

.grid-item-transition-leave-to {
  opacity: 0;
  transform: translate(100vh, -300px);
}



// ensure leaving items are taken out of layout flow so that moving
// animations can be calculated correctly.
.grid-item-transition-leave-active {
  position: absolute;
}
</style>