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


<script>
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
import { VContainer, VSpacer } from "vuetify/lib";
import GridItemSelector from "@/components/PatternItems/GridItemSelector.vue"
import GridItem from "@/components/PatternItems/GridItem.vue";

export default {
  components: {
    GridItem,
    GridItemSelector,
    VContainer,
    VSpacer,
  },
  props: {
    expandMosaics: {
      type: Boolean,
      default: () => false,
    },
    patternItems: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedPatternItemGroupSlices: [],
    };
  },
  computed: {
    patternItemsGrouped() {
      const grouped = groupBy(
        this.patternItems,
        patternItem => patternItem.mosaicId,
      );
      if (!this.expandMosaics)
        return grouped;
      // modify the groups
      const hold = Object.entries(grouped)
        .reduce((acc, [id, group]) => {
          if (group.length === 1)
            acc[id] = group
          else
            for (let i = 0; i < group.length; ++i)
              acc[`${id}-${i}`] = [group[i]];
          return acc;
        }, {});
      console.log(hold);
      return hold;
    },
    mosaicItems() {
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
          ({ patternItemGroup }) => -first(patternItemGroup).createdDate.getTime(),
          ({ patternItemGroup }) => first(patternItemGroup).row,
          ({ patternItemGroup }) => first(patternItemGroup).col,
        ],
      );
    },
    patternItemGroups() {
      return this.mosaicItems
        .map(mosaicItem => mosaicItem.patternItemGroup);
    },
    // reverse array mapping
    patternItemGroupToIdx() {
      return new Map(Array.from(
        this.patternItemGroups
          .entries()
      ).map(([k, v]) => [v, k]));
    },
    selectedPatternItemGroups() {
      return sortBy(
        uniq(concat(...this.selectedPatternItemGroupSlices)),
        patternItemGroup => this.patternItemGroupToIdx.get(patternItemGroup),
      );
    },
    selectedPatternItems() {
      return this.selectedPatternItemGroups.flat(2);
    },
  },
  methods: {
    onClick(event, patternItemGroup) {
      if (event.shiftKey) {
        const initialIdx = this.patternItemGroupToIdx.get(
          first(last(this.selectedPatternItemGroupSlices))
        );
        const currIdx = this.patternItemGroups.indexOf(patternItemGroup);
        const willReverse = initialIdx > currIdx;
        const patternItemGroupSlice = this.patternItemGroups
          .slice(
            min([initialIdx, currIdx]),
            max([initialIdx, currIdx]) + 1,
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
  },
  watch: {
    patternItems() {
      this.selectedPatternItemGroupSlices = [];
    }
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