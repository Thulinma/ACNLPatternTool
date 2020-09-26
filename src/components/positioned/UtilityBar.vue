<template>
  <div class="container">
    <button
      v-for="(option, i) in options"
      :key="i"
      class="item"
      @click="option.callback()"
    >
      <img
        v-if="option.imgSrc != null"
        class="item-icon"
        :src="option.imgSrc"
      /><span class="item-label">{{ option.label }}</span>
    </button>
  </div>
</template>


<script>
import openSvg from "~/assets/icons/utilitybar/bxs-envelope-open.svg";
import deleteSvg from "~/assets/icons/utilitybar/bxs-trash.svg";
import downloadAsPatternSvg from "~/assets/icons/utilitybar/bxs-file-blank.svg";
import downloadAsPngSvg from "~/assets/icons/utilitybar/bxs-image-alt.svg";
import downloadBothSvg from "~/assets/icons/utilitybar/bxs-file-archive.svg";

/**
 * INTERFACE FOR OPTIONS
 * interface Option {
 *  imgSrc: string,
 *  label: string,
 *  callback: function,
 * }
 */
export default {
  name: "UtilityBar",
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/resets";
@import "styles/screens";

.container {
  justify-self: auto;
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 1px);
  background-color: $pink-lace;
  padding: 8px 15px;
  border-radius: 10px 10px 0px 0px;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: flex-start;
  align-items: center;
}

.item {
  @include reset-button;
  padding: 5px 5px;
  background-color: $light-pink;
  border-radius: 4px 4px;
  white-space: nowrap;

  &:hover {
    cursor: pointer;
    background-color: $salmon;
  }

  &:nth-child(1) ~ & {
    margin-left: 10px;
  }

  .item-icon {
    height: 26px;
    vertical-align: middle;
    user-select: none;
  }

  .item-label {
    display: none;
    margin-left: 5px;
    color: $white;
    font-weight: 600;
    font-size: 1rem;
    vertical-align: middle;
  }
  
  @include tablet-portrait {
    .item-label {
      display: inline;
    }
  }
}
</style>