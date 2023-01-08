<template>
  <div class="icon--container">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="84.76"
      height="47.586"
      viewBox="0 0 84.76 47.586"
      role="presentation"
    >
      <path
        id="Path_173"
        data-name="Path 173"
        d="M10122.24-2343l16.054,20.705-16.054,26.881H10207V-2343Z"
        transform="translate(-10122.24 2343)"
        fill="#fca4b1"
      />
    </svg>
  </div>
</template>


<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({
  name: "IconRibbonTailLeft"
})
export default class IconRibbonTailLeft extends Vue  {
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