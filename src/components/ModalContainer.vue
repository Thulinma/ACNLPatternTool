<template>
  <!-- teleport modal contents to manager -->
  <portal to="ModalManager">
    <div class="modal">
      <!-- window content -->
      <slot
        name="window">
      </slot>

      <!-- provided overlayed -->
      <slot
        v-if="$slots.overlay"
        name="overlay"
        @click.self="onOverlayClick($event)">
      </slot>

      <!-- default overlay -->
      <div
        v-if="!$slots.overlay"
        class="modal--overlay--default"
        @click.self="onOverlayClick($event)">
      </div>
    </div>
  </portal>
</template>

<script>
class MissingContentError extends Error {
  constructor(message) {
    super(message);
    this.name = "MissingContentError";
  }
}

// use this component to wrap all modals
export default {
  name: "ModalContainer",
  data: function() {return {};},
  methods: {
    onOverlayClick: function(event) {
      this.$emit("modal-close");
    },
    onKeyEscape: function(event) {
      if (event.keyCode === 27) {
        this.$emit("modal-close");
      }
    }
  },
  created: function() {
    // as early as possible for responsive canceling, don't wait for mount
    window.addEventListener("keyup", this.onKeyEscape);
  },
  mounted: function() {
    if (this.$slots.window == null) {
      throw new MissingContentError("");
    }
    this.$emit("modal-open");
  },
  destroyed: function() {
    window.removeEventListener("keyup", this.onKeyEscape);
    this.$emit("modal-close");
  }
}
</script>

<style lang="scss" scoped>
.modal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 999;
}

.modal--overlay--default {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0,0,0,.8);
  display:table-cell;
  vertical-align:middle;
  overflow:auto;
  z-index: -999;

  &:hover {
    cursor: pointer;
  }
}
</style>
