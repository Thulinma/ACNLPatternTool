<template>
  <button @click="$emit('click')" class="container">X</button>
</template>

<script>
export default {
  name: "CancelButton",
  data: function () {
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/screens";
@import "styles/resets";

.container {
  @include reset-button;

  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 5px;
  border-radius: 999px;

  box-sizing: border-box;
  width: 25px;
  height: 25px;

  color: white;
  background-color: $olive-haze;

  @include tablet-landscape {
    top: 0;
    right: 0;
    width: 30px;
    height: 30px;
  }
}
</style>