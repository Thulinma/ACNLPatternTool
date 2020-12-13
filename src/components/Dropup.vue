<template>
  <div :class="{
    'dropup': true,
    'dropup--inverted': variant == variants.inverted,
    'dropup--action': variant == variants.action,
  }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <button
      class="button"
      @click="onButtonClick"
      @touchstart="onButtonTouchStart"
    >
      <span class="button__icon__container"><slot name="icon"></slot></span>
      <span class="button__text"><slot name="text"></slot></span>
      <BxCaretUp v-if="showMenu" class="button__indicator"/>
      <BxCaretDown v-else class="button__indicator"/>
    </button>
    <div :class="{
      'dropup__bridge': true,
      'dropup__bridge--active': showMenu
    }"></div>
    <div
      :class="{
        'menu': true,
        'menu--active': showMenu,
      }"
    >
      <button
        v-for="item in items"
        :key="item.name"
        class="menu__item"
        @click="item.onSelect()"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, toRefs } from "@vue/composition-api";

import BxCaretDown from "~/assets/icons/bx-caret-down.svg?inline";
import BxCaretUp from "~/assets/icons/bx-caret-up.svg?inline";

export const variants = Object.freeze({
  inverted: 1,
  action: 2,
});

export default {
  name: "Dropup",
  components: {
    BxCaretUp,
    BxCaretDown,
  },
  props: {
    variant: {
      type: Number,
      default: () => variants.plain,
      validator: (value) => {
        return Object.values(variants).includes(value);
      },
    },
    items: {
      // each item is an obj with name and callback
      type: Array,
      default: () => new Array(),
    },
  },
  setup(props) {
    const showMenu = ref(false);
    
    const onMouseEnter = () => {
      showMenu.value = true;
    };
    const onMouseLeave = () => {
      showMenu.value = false;
    };

    // need to make sure both don't trigger with preventDefault
    const onButtonClick = (event) => {
      showMenu.value = !showMenu.value;
      event.preventDefault();
    };
    const onButtonTouchStart = (event) => {
      showMenu.value = !showMenu.value;
      event.preventDefault();
    };

    return {
      variants,
      showMenu,
      onMouseEnter,
      onMouseLeave,
      onButtonClick,
      onButtonTouchStart,
    };
  },
};
</script>

<style lang="sass" scoped>
@use "styles/colors" as colors
@use "styles/resets" as resets
@use "styles/positioning" as positioning
@use "styles/transitions" as transitions
@use "styles/screens" as screens

.dropup
  display: inline-block
  @include positioning.relative-in-place

  &__bridge
    display: none
    position: absolute
    top: 1px // ensure connection, no mouseleave
    right: 0px
    transform: translate(0%, -100%)

    width: 100%
    height: 30px
    
    &--active
      display: block

.button
  @include resets.reset-button
  @include positioning.relative-in-place
  
  display: flex
  flex-direction: row
  justify-content: flex-start
  align-content: center
  align-items: center
  padding: 7px 10px

  background-color: colors.$olive-haze
  border-radius: 15px  
  &:hover
    cursor: pointer

  &__icon__container
    display: inline-flex
    flex-direction: row
    justify-content: center
    align-items: center
    align-content: center

    height: 20px
    width: 20px
    
    border-radius: 999px
    background-color: colors.$ecru-white

    @include screens.phone-landscape
      width: 30px
      height: 30px
    
    & > svg
      fill: colors.$olive-haze
      height: 14px
      @include screens.phone-landscape
        height: 22px

  &__text
    color: colors.$ecru-white
    margin-left: 5px
    margin-right: 5px
    font-size: 1rem
    font-weight: 600
    @include screens.phone-landscape
      margin-left: 10px
      marign-right: 5px
    @include screens.tablet-portrait
      font-size: 1.35rem

  &__indicator
    fill: colors.$ecru-white
    height: 14px
    width: 14px
    @include screens.phone-landscape
      height: 20px
      width: 20px

.menu
  display: grid
  grid-template-rows: auto
  grid-template-columns: auto
  justify-content: flex-start
  justify-items: flex-start
  row-gap: 16px
  padding: 15px 20px

  position: absolute
  top: -20px
  right: 0px
  transition: transform 0.15s transitions.$energetic
  background-color: colors.$olive-haze
  border-radius: 20px

  font-size: 0.9rem
  color: colors.$ecru-white
  
  pointer-events: none
  transform: translate(0, -100%) scale(0.8)
  opacity: 0
  &--active
    pointer-events: initial
    transform: translate(0, -100%) scale(1)
    opacity: 1

  @include screens.phone-landscape
    font-size: 1rem
  @include screens.tablet-portrait
    padding: 30px 40px
    font-size: 1.2rem

  &__item
    @include resets.reset-button
    @include positioning.relative-in-place
    display: block
    color: colors.$ecru-white
    font-weight: 600
    white-space: nowrap
    cursor: pointer
    
    &:after
      display: none
      width: calc(100% + 20px)
      height: 70%
      content: ""
      position: absolute
      left: 50%
      bottom: -3px
      z-index: -1
      transform: translate(-50%)
      background-color: colors.$jambalaya
      border-radius: 3px
      
    &:hover:after,
    &:focus:after
      display: block

// alternate variants
.dropup--inverted
  .button
    background-color: colors.$ecru-white
    &__icon__container
      background-color: colors.$olive-haze
      & > svg
        fill: colors.$ecru-white
    &__text
      color: colors.$olive-haze
    &__indicator
      fill: colors.$olive-haze
  .menu
    background-color: colors.$ecru-white
    &__item
      color: colors.$olive-haze
      &:after
        background-color: colors.$orange-white

.dropup--action
  .button
    background-color: colors.$robin-egg-blue
    &__icon__container
      & > svg
        fill: colors.$robin-egg-blue
  .menu
    background-color: colors.$robin-egg-blue
    &__item
      &:after
        background-color: colors.$persian-green
    
</style>