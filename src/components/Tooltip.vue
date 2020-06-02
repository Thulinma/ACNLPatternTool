<template>
  <div class="tooltip">
    ?
    <div class="tooltip-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "Tooltip"
}
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";

.tooltip {
  @include relative-in-place;
  display: inline-block;
  background-color: $geraldine;

  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 100%;


  // NOT WIDTH CONTROLLED, CONTROL WIDTH FROM SLOT CONTENT
  .tooltip-content {
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translate(20px, -50%);

    display: none;
    padding: 10px 20px;

    background-color: $domino;
    border-radius: 15px;
    text-align: left;
  }
  &:hover .tooltip-content {
    display: inline-block;
  }
}
</style>