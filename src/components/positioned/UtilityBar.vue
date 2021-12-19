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
      v-for="(option, i) in options"
      :key="i"
      class="btn"
      value="''"
      @click="option.callback()"
    >
      <span class="label">{{ option.label }}</span>
      <VIcon>{{ option.icon }}</VIcon>
    </VBtn>
  </VBottomNavigation>
</template>


<script>
import {
  VBottomNavigation,
  VBtn,
  VIcon,
} from "vuetify/lib";
import colors from "@/styles/colors.scss";

/**
 * INTERFACE FOR OPTIONS
 * interface Option {
 *  imgSrc: string,
 *  label: string,
 *  callback: function,
 * }
 */
export default {
  name: "UtilityBar",
  components: {
    VBottomNavigation,
    VBtn,
    VIcon,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      colors,
    };
  }
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