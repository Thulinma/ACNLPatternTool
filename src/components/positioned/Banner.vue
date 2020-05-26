<template>
  <router-link to="/">
    <div class="banner--container" title="Home">
      <IconBanner class="banner--icon" />
      <div class="banner--text">ACPatterns</div>
    </div>
  </router-link>
</template>

<script>
import IconBanner from "~/components/icons/IconBanner.vue";

export default {
  name: "Banner",
  components: {
    IconBanner
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/transitions";

.banner--container {
  user-select: none;
  position: absolute;
  top: 20px;
  left: 0px;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  padding: 8px 27px 8px 35px;

  background-color: $salmon;
  transition: background 0.15s $energetic;
  // background-image: url("../../assets/images/LeafBrushPatternTile.svg");
  // background-repeat: repeat;
  // background-size: 300px 300px;
  // background-position: 50% 50%;
  $border-radius: 5px;
  border-radius: 0px $border-radius $border-radius 0px;

  &:hover {
    background-size: 1000px 1000px;
  }
}

.banner--icon {
  height: 40px;
  margin-right: 7px;
}

.banner--text {
  color: white;
  font-size: 1.7rem;
}
</style>