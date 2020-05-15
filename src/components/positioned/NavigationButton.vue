<template>
  <button
    :class="{
      'menu-button--container': true,
      'menu-button--container--open': open
    }"
    @click="open=true">
    <div class="menu-button--icon-wrapper">
      <IconCompass class="menu-button--icon" />
    </div>

    <ModalContainer v-if="open" @modal-close="open=false">
      <template #window>
        <NavigationMenu @modal-close="open = false"/>
      </template>
    </ModalContainer>
  </button>
</template>

<script>
import NavigationMenu from "~/components/positioned/NavigationMenu.vue";
import ModalContainer from '~/components/positioned/ModalContainer.vue';
import IconCompass from "~/components/icons/IconCompass.vue";

export default {
  data: function() {
    return {
      open: false,
    };
  },
  components: {
    ModalContainer,
    NavigationMenu,
    IconCompass
  }
};
</script>

<style lang="scss" scoped>
@import "styles/colors";

// desktop
$menu-button-size: 74px;
.menu-button--container {
  transition: transform 0.1s ease-in-out;
  width: $menu-button-size;
  height: $menu-button-size;

  position: absolute;
  top: 10px;
  right: 10px;

  -webkit-appearance: none;
  background-color: $van-cleef;
  border-radius: 15px;
  outline: none;

  transform: scale(1);

  border: 0px;
  &:hover {
    cursor: pointer;
    transform: scale(1.1);
  }

  .menu-button--icon-wrapper {
    width: 78%;
    height: 78%;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);

    background-color: $ecru-white;
    border-radius: 999px;
  }

  .menu-button--icon {
    width: 86%;
    height: auto;

    transition: transform 0.45s cubic-bezier(.5,-1.5,.5,1.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(30deg);
  }

  &:hover, &.menu-button--container--open {
    .menu-button--icon {
      transform: translate(-50%, -50%) rotate(0deg);
    }
  }
}
</style>