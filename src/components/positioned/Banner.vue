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
    IconBanner,
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/transitions";
@import "styles/screens";

.banner--container {
  user-select: none;
  position: absolute;
  top: 10px;
  left: 0px;
  z-index: 999;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  padding: 8px 10px 8px 13px;
  border-radius: 0px 3px 3px 0px;

  background-color: $salmon;
  transition: background 0.15s $energetic;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.05);

  @include phone-landscape {
  }
  @include tablet-portrait {
    top: 20px;
  }
  @include tablet-landscape {
    padding: 8px 27px 8px 35px;
    border-radius: 0px 5px 5px 0px;
  }
  @include desktop {
    padding: 8px 27px 8px 20px;
  }
}

.banner--icon {
  height: 20px;
  margin-right: 3px;

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
  }
  @include desktop {
  }
  @include tablet-portrait {
    height: 35px;
    margin-right: 7px;
  }
}

.banner--text {
  color: white;
  font-size: 1rem;
  display: none;

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
  }
  @include desktop {
    display: block;
    font-size: 1.65rem;
    transform: translate(0px, 2px);
  }
}
</style>