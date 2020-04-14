<template>
  <div class="url-input-container">
    <input
      class="iiif-input"
      placeholder="IIIF Url Goes Here"
      v-model="iiifUrl"
    />
    <button class="a-btn a-btn--text" @click="updateUrl">Submit</button>
  </div>
</template>

<script>
import { Button } from "@thegetty/getty-ui";
export default {
  name: "UrlInput",
  data() {
    return {
      iiifUrl: undefined
    };
  },
  methods: {
    updateUrl() {
      this.$emit("updateUrl", this.iiifUrl);
    }
  }
};
</script>

<style lang="scss" scoped>
.url-input-container {
  display: flex;
  align-items: stretch;
  margin-top: 4px;
}
.a-btn--text {
  font-size: 15px;
  padding: 11px 16px;
  background-color: #1947b8;
}
input {
  flex-grow: 1;
  margin-right: 4px;
  padding: 0 10px;
  border: 1px solid black;
}
</style>
