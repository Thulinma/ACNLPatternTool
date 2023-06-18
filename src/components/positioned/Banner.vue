<template>
  <router-link to="/">
    <div class="banner--container" title="Home">
      <IconBanner class="banner--icon" />
      <div class="banner--text">ACPatterns</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import IconBanner from "@/assets/icons/banner.svg?inline";

@Component({
  components: {
    IconBanner,
  },
})
export default class Banner extends Vue {
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/transitions" as transitions;
@use "styles/screens" as screens;

.banner--container {
  user-select: none;
  position: absolute;
  top: 10px;
  left: 0px;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  padding: 8px 10px 8px 13px;
  border-radius: 0px 3px 3px 0px;

  background-color: colors.$salmon;
  transition: background 0.15s transitions.$energetic;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.05);

  @include screens.tablet-portrait {
    top: 20px;
  }
  @include screens.tablet-landscape {
    padding: 8px 27px 8px 35px;
    border-radius: 0px 5px 5px 0px;
  }
  @include screens.desktop {
    padding: 8px 27px 8px 20px;
  }
}

.banner--icon {
  height: 20px;
  margin-right: 3px;

  @include screens.tablet-portrait {
    height: 35px;
    margin-right: 7px;
  }
}

.banner--text {
  color: white;
  font-size: 1rem;
  display: none;

  @include screens.desktop {
    display: block;
    font-size: 1.65rem;
    transform: translate(0px, 2px);
  }
}
</style>