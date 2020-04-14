<template>
  <div class="l-halves">
    <div class="l-halves__half">
      <div class="url-input-container">
        <input
          class="iiif-input"
          placeholder="IIIF Url Goes Here"
          v-model="iiifManifestUrl"
        />
        <button class="a-btn a-btn--text" @click="updateUrl">Submit</button>
      </div>
    </div>
    <div class="l-halves__half">
      <RichText :content="step3iiif" contentType="markdown" />
    </div>
  </div>
</template>

<script>
import { Button, RichText } from "@thegetty/getty-ui";
import step3iiif from "../data/step3_iiif.md";

export default {
  name: "UrlInput",
  components: {
    RichText,
    Button
  },
  data() {
    return {
      iiifManifestUrl: undefined,
      step3iiif
    };
  },
  methods: {
    updateUrl() {
      this.$emit("updateIiif", this.iiifManifestUrl);
    }
  }
};
</script>

<style lang="scss" scoped>
.url-input-container {
  display: flex;
  align-items: stretch;
  max-width: 93%;
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
