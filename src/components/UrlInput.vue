<template>
  <div>
    <input
      class="iiif-input"
      placeholder="IIIF Url Goes Here"
      v-model="value.url"
    />
  </div>
</template>

<script>
export default {
  name: "UrlInput",
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  watch: {
    value() {
      this.$emit("input", this.value);
    }
  }
};
</script>

<style lang="scss" scoped>
.iiif-input {
  width: 80%;
  margin: 1em;
}
</style>
