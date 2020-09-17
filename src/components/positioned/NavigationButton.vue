<template>
  <button
    :class="{
      'menu-button--container': true,
      'open': open
    }"
    @click="open=!open"
  >
    <div class="menu-button--icon-wrapper">
      <IconCompass class="menu-button--icon" />
    </div>

    <ModalContainer
      v-if="open"
      @modal-close="open=false"
      @scroll-freeze="$emit('scroll-freeze')"
      @scroll-unfreeze="$emit('scroll-unfreeze')"
    >
      <template #window>
        <NavigationMenu @modal-close="open = false" />
      </template>
    </ModalContainer>
  </button>
</template>

<script>
import NavigationMenu from "~/components/positioned/NavigationMenu.vue";
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import IconCompass from "~/components/icons/IconCompass.vue";

export default {
  data: function () {
    return {
      open: false,
    };
  },
  components: {
    ModalContainer,
    NavigationMenu,
    IconCompass,
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/transitions";
@import "styles/positioning";
@import "styles/screens";
@import "styles/resets";

// desktop
.menu-button--container {
  @include reset-button;
  transition: transform 0.15s $energetic;

  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 999;

  width: 40px;
  height: 40px;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  align-content: center;

  background-color: $van-cleef;
  border-radius: 12px;

  &:hover {
    cursor: pointer;
  }

  .menu-button--icon-wrapper {
    @include relative-in-place;
    width: 78%;
    height: 78%;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    background-color: $ecru-white;
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

  @include phone-landscape {
    border-radius: 15px;
    width: 50px;
    height: 50px;
  }
  @include tablet-portrait {
    border-radius: 15px;
    width: 60px;
    height: 60px;
  }
  @include tablet-landscape {
    border-radius: 12px;
  }
  @include desktop {
    top: 20px;
    right: 20px;
  }
}
</style>