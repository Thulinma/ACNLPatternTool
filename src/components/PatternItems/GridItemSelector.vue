<template>
  <VBadge
    :class="{
      'grid-item-selector': true,
      'grid-item-selector--active': value,
    }"
    icon="mdi-check"
    :color="colors.robinEggBlue"
    :offset-x="10"
    :offset-y="10"
    :value="value"
  >
    <slot :value="{ value }"></slot>
  </VBadge>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { VBadge } from "vuetify/lib";
import colors from "@/styles/colors.scss";

@Component({
  components: {
    VBadge,
  }
})
export default class GridItemSelector extends Vue {
  @Prop({
    type: Boolean,
    default: () => false
  }) readonly value!: boolean;
  
  readonly colors = colors;
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;

.grid-item-selector {
  &.grid-item-selector--active {
    ::v-deep .grid-item {
      background-color: rgba(colors.$persian-green, 0.25);
    }
  }
}
</style>