<template>
  <portal to="ModalManager">
    <div class="modal">
      <!-- window content -->
      <slot name="window"> </slot>

      <!-- provided overlayed -->
      <slot
        v-if="!!$slots.overlay"
        name="overlay"
        @click.self="onOverlayClick($event)"
      >
      </slot>

      <!-- default overlay -->
      <div
        v-if="!$slots.overlay"
        class="overlay--default"
        @click.self="onOverlayClick($event)"
      ></div>
    </div>
  </portal>
</template>

<script>
// use this component to wrap all modals
class MissingContentError extends Error {
  constructor(message) {
    super(message);
    this.name = "MissingContentError";
  }
}

export default {
  name: "ModalContainer",
  data: function () {
    return {};
  },
  methods: {
    onOverlayClick: function (event) {
      this.$emit("modal-close");
    },
    onKeyEscape: function (event) {
      if (event.keyCode === 27) {
        this.$emit("modal-close");
      }
    },
  },
  created: function () {
    window.addEventListener("keyup", this.onKeyEscape);
  },
  mounted: function () {
    if (this.$slots.window == null) {
      throw new MissingContentError("");
    }
    this.$emit("modal-open");
    this.$emit("scroll-freeze");
  },
  destroyed: function () {
    window.removeEventListener("keyup", this.onKeyEscape);
    this.$emit("modal-close");
    this.$emit("scroll-unfreeze");
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";

.modal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 999;
}

.window {
  display: inline-block;
  z-index: 999;
}

.overlay--default {
  display: block;
  height: 100%;
  width: 100%;

  position: fixed;
  top: 0;
  left: 0;

  background-color: $silver-sand;
  opacity: 0.5;
  overflow: auto;
  z-index: 0;

  &:hover {
    cursor: pointer;
  }
}
</style>
