<template>
  <div class="tooltip">
    <div class="question-mark">?</div>
    <div class="tooltip-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "Tooltip",
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";

.tooltip {
  @include relative-in-place;
  display: inline-flex;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  background-color: $geraldine;

  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 100%;

  .question-mark {
    text-align: center;
    color: white;
    font-size: 1rem;
    vertical-align: middle;
  }

  // NOT WIDTH CONTROLLED, CONTROL WIDTH FROM SLOT CONTENT
  .tooltip-content {
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translate(20px, -50%);
    z-index: 999;

    display: none;
    padding: 10px 20px;

    background-color: $domino;
    color: white;
    font-size: 1rem;
    line-height: 1.2;
    border-radius: 15px;
    text-align: left;
  }
  &:hover .tooltip-content {
    display: inline-block;
  }
}
</style>