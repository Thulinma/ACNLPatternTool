<template>
  <div>
    <input
      class="iiif-input"
      placeholder="IIIF Url Goes Here"
      v-model="inputUrl"
      ref="url"
    />
  </div>
</template>

<script>
export default {
  name: "UrlInput",
  data: function() {
    return { inputUrl: "" };
  },
  watch: {
    inputUrl() {
      this.$emit("updateUrl", this.inputUrl);
    }
  },
  methods: {
    updateInputUrl(url) {
      this.inputUrl = url;
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
