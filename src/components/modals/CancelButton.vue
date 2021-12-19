<template>
  <VBtn
    class="close-btn"
    @click="$emit('click')"
    outlined
    fab
    x-small
    :color="colors.jambalaya"
    elevation="0"
  >
    <VIcon>mdi-close</VIcon>
  </VBtn>
</template>

<script>
import {
  VIcon,
  VBtn,
} from "vuetify/lib";

import colors from '@/styles/colors.scss';

export default {
  name: "CancelButton",
  components: {
    VIcon,
    VBtn,
  },
  data: function () {
    return {
      colors,
    };
  },
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/screens" as screens;
@use "styles/resets" as resets;


.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>