<template>
  <!-- takes warnings in some markdown elements -->
  <!-- e.g. h1, h2, h3, p, img -->
  <Info
    @close="$emit('close')"
    @scroll-freeze="$emit('scroll-freeze')"
    @scroll-unfreeze="$emit('scroll-unfreeze')"
  >
    <template #default>
      <slot></slot>
    </template>
    <template #buttons>
      <div class="info--buttons">
        <div>
          <label class="warning--dismiss-container">
            <input
              v-if="foreverDismissable"
              class="warning--dismiss-check"
              type="checkbox"
              value="false"
              v-model="dismissForever"
            />
            <span>Dismiss Forever</span>
          </label>
        </div>
        <button @click="$emit('close')" class="info--button normal">
          Cancel
        </button>
        <button @click="$emit('dismiss', dismissForever)" class="info--button">
          Continue
        </button>
      </div>
    </template>
  </Info>
</template>

<script>
import Info from "~/components/modals/Info.vue";
import CancelButton from "~/components/modals/CancelButton.vue";

export default {
  name: "Warning",
  components: {
    Info,
    CancelButton,
  },
  props: {
    foreverDismissable: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  data: function () {
    return {
      dismissForever: false,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/screens";
@import "styles/positioning";
@import "styles/resets";

.warning--window {
  box-sizing: border-box;
  @include relative-in-place;
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: scroll;
  padding: 28px 46px;
  background-color: $ecru-white;
  color: $jambalaya;
}

input[type="checkbox"] {
  width: 30px;
  height: 30px;
  margin-right: 8px;
  cursor: pointer;
  font-size: 17px;
  visibility: hidden;
}

input[type="checkbox"]:after {
  content: "";
  display: inline-block;
  color: $olive-haze;
  width: 22px;
  height: 25px;
  visibility: visible;
  border: 1px solid $olive-haze;
  padding-left: 3px;
  border-radius: 5px;
}

input[type="checkbox"]:checked:after {
  content: "\2714";
  padding: -5px;
  font-size: 1.4rem;
}

.warning--dismiss-container {
  display: inline-flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  cursor: pointer;
}
</style>