<template>
  <VCard
    class="grid-item"
    flat
    outlined
    rounded="lg"
    @click="onClick($event, patternItemGroup)"
  >
    <div class="grid-item-preview-ctn">
      <MosaicPreview
        :class="{
          'grid-item-preview': true,
          'grid-item-preview--expanded': patternItemGroup.length === 1,
        }"
        :patternItemGroup="patternItemGroup"
        :expanded="true"
      />
    </div>
    <slot>
      <VCardText class="grid-item-title text-center text-truncate">
        {{ patternItem.drawingTool.title }}
      </VCardText>
    </slot>
  </VCard>
</template>


<script lang="ts">
import { first } from "lodash";
import {
  VCard,
  VCardText,
  VSpacer,
} from "vuetify/lib";
import {
  Vue,
  Component,
  Prop,
} from "vue-property-decorator";
import MosaicPreview from "@/components/PatternItems/MosaicPreview.vue";
import { PatternItem } from "@/libs/storage";

@Component({
  components: {
    VCard,
    VCardText,
    VSpacer,
    MosaicPreview,
  },
})
export default class GridItem extends Vue {
  @Prop({
    type: Array,
    required: true,
    validator: (patternItemGroup) => patternItemGroup.length >= 1,
  }) readonly patternItemGroup!: PatternItem[];
  
  /** The first pattern item of the pattern item group. */
  get patternItem(): PatternItem {
    return first(this.patternItemGroup) as PatternItem;
  }
  
  onClick(event: MouseEvent) {
    event.stopPropagation();
    this.$emit('click', event);
  }
};
</script>


<style lang="scss" scoped>
@use "styles/colors" as colors;

.grid-item {
  display: grid;
  grid-template-columns: 1fr;
  justify-content: stretch;
  justify-items: stretch;
  padding: 10px;
  background-color: transparent;
  transform: scale(1);

  .grid-item-preview-ctn {
    display: grid;
    justify-content: center;
  }
  
  .grid-item-preview {
    width: 150px;
    height: 150px;
    
    &::v-deep .single-preview {
      user-drag: none;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-drag: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
  }
  
  .grid-item-title {
    color: colors.$jambalaya;
  }
}
</style>