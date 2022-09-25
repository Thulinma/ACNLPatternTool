<template>
  <button
    :class="{
      'menu-button--container': true,
      'open': open
    }"
    @click="open = true"
  >
    <div class="menu-button--icon-wrapper">
      <IconCompass class="menu-button--icon" />
    </div>

    <VDialog
      v-model="open"
      content-class="menu--dialog"
      width="auto"
    >
      <NavigationMenu v-if="open" @modal-close="open = false" />
    </VDialog>
  </button>
</template>

<script>
import { VDialog } from "vuetify/lib";
import NavigationMenu from "@/components/positioned/NavigationMenu.vue";
import IconCompass from "@/assets/icons/nookphone/compass.svg?inline";

export default {
  data: function () {
    return {
      open: false,
    };
  },
  components: {
    VDialog,
    NavigationMenu,
    IconCompass,
  },
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/transitions" as transitions;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;
@use "styles/resets" as resets;

.v-dialog {
  box-shadow: none;
}

// desktop
.menu-button--container {
  @include resets.reset-button;
  transition: transform 0.15s transitions.$energetic;

  position: absolute;
  top: 10px;
  right: 10px;

  width: 40px;
  height: 40px;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  align-content: center;

  background-color: colors.$van-cleef;
  border-radius: 12px;

  &:hover {
    cursor: pointer;
  }

  .menu-button--icon-wrapper {
    @include positioning.relative-in-place;
    width: 78%;
    height: 78%;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    background-color: colors.$ecru-white;
    border-radius: 999px;
  }

  .menu-button--icon {
    width: 86%;
    height: 86%;
    transition: transform 0.35s ease-in-out;
    transform: scale(1) rotate(30deg);
  }

  &:hover,
  &.menu-button--container.open {
    .menu-button--icon {
      transform: scale(0.9) rotate(-360deg);
    }
  }

  @include screens.phone-landscape {
    border-radius: 15px;
    width: 50px;
    height: 50px;
  }
  @include screens.tablet-portrait {
    border-radius: 15px;
    width: 60px;
    height: 60px;
  }
  @include screens.tablet-landscape {
    border-radius: 12px;
  }
  @include screens.desktop {
    top: 20px;
    right: 20px;
  }
}
</style>

<style lang="scss">
.menu--dialog {
  box-shadow: none;
}
</style>