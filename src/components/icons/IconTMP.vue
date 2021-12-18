<template>
  <div class="icon--container">
  </div>
</template>


<script>
export default {
  name: "IconTMP",
};
</script>

<style lang="scss" scoped>
@use "styles/positioning" as positioning;
.icon--container {
  @include positioning.relative-in-place;
  display: inline-block;
  & svg {
    height: 100%;
    width: 100%;
  }
}
</style>