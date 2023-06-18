<template>
  <VBottomNavigation
    class="bottom-nav"
    elevation1
    :input-value="true"
    :background-color="colors.salmon"
    :value="''"
    dark
  >
    <VBtn
      v-for="(option) in options"
      :key="option.label"
      class="btn"
      value="''"
      @click="option.callback()"
    >
      <span class="label">{{ option.label }}</span>
      <VIcon>{{ option.icon }}</VIcon>
    </VBtn>
  </VBottomNavigation>
</template>


<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import {
  VBottomNavigation,
  VBtn,
  VIcon,
} from "vuetify/lib";
import colors from "@/styles/colors.scss";


export interface UtilityBarOption {
  icon: string,
  label: string,
  callback: Function,
}

@Component({
  components: {
    VBottomNavigation,
    VBtn,
    VIcon,
  },
})
export default class UtilityBar extends Vue {
  @Prop({
    type: Array,
    default: () => [],
  }) readonly options!: UtilityBarOption[];
  
  readonly colors = colors;
};
</script>

<style lang="scss" scoped>
@use "styles/screens" as screens;

.bottom-nav {
  box-shadow: none;
}

.btn {
  min-width: auto !important;
  padding: 0 3px !important;
  @include screens.phone-landscape {
    padding: 0 8px !important;
  }
  @include screens.tablet-portrait {
    padding: 0 16px !important;
  }
}

.label {
  display: none;
  @include screens.tablet-portrait {
    display: inline;
  }
}
</style>