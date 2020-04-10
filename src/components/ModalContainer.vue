<template>
  <portal to="ModalManager">
    <div class="modal-container" @click.self="onOverlayClick($event)">
      <slot></slot>
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
    if (!this.$slots.default) {
      throw new MissingContentError("");
    }
    window.addEventListener("keyup", this.onKeyEscape);
  },
  mounted: function() {
    this.$emit("modal-open");
  },
  destroyed: function() {
    window.removeEventListener("keyup", this.onKeyEscape);
    this.$emit("modal-close");
  }
}
</script>

<style lang="scss" scoped>
.modal-container{
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0,0,0,.8);
  display: table-cell;
  vertical-align: middle;
  overflow: auto;
  z-index: 10;
}
</style>
