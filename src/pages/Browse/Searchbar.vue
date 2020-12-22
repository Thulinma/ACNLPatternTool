<template>
  <div class="searchbar">
    <button
      :class="{
        'search-button': true,
        'should-refresh': isOptionsChanged,
      }"
      @click="$emit('search')"
    >
      <BxSearch class="search-icon" />
    </button>
    <input
      class="query"
      type="text"
      placeholder="Search..."
      @input="$emit('input', $event.target.value)"
      @keyup.enter="$emit('search')"
    />
  </div>
</template>

<script>
import BxSearch from "~/assets/icons/bx-search.svg?inline";

export default {
  name: "Searchbar",
  components: {
    BxSearch,
  },
  props: {
    value: {
      type: String,
      required: true,
      default: () => "",
    },
    isOptionsChanged: {
      value: {
        type: Boolean,
        required: false,
        default: () => false,
      }
    }
  },
};
</script>


<style lang="sass" scoped>
@use "styles/colors" as colors
@use "styles/positioning" as positioning
@use "styles/screens" as screens
@use "styles/resets" as resets

.searchbar
  @include positioning.relative-in-place
  justify-self: stretch

  .search-button
    @include resets.reset-button
    display: flex
    flex-direction: row
    justify-content: center
    justify-items: center
    align-content: center
    align-items: center
    position: absolute
    height: 100%
    width: 60px
    background-color: transparent
    border-radius: 10px 0px 0px 10px
    
    &:hover
      cursor: pointer
      background-color: colors.$robin-egg-blue
    &.should-refresh
      background-color: colors.$robin-egg-blue
    &:active
      background-color: colors.$tiffany-blue
      
    .search-icon
      width: 25px
      left: 20px
      fill: colors.$jambalaya
    .refresh-icon
      width: 25px
      left: 20px
      fill: colors.$jambalaya
      
    &:hover, &.should-refresh, &:active
      .search-icon, .refresh-icon
        fill: colors.$ecru-white
      
  .query
    box-sizing: border-box
    text-align: center
    border-radius: 10px
    outline: none
    border: 0px solid transparent
    padding-top: 10px
    padding-bottom: 10px
    padding-left: 55px
    padding-right: 10px
    height: 55px
    width: 100%
    background-color: colors.$soapstone

    font-size: 1.1rem
    font-family: Nunito
    font-weight: 400
    color: colors.$jambalaya

    &::placeholder
      color: rgba(colors.$jambalaya, 0.5)
</style>