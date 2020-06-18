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
@import "styles/positioning";
.icon--container {
  @include relative-in-place;
  display: inline-block;
  & svg {
    height: 100%;
    width: 100%;
  }
}
</style>