<template>
  <div>
    <RichText :content="iiif1" contentType="markdown" />
    <!-- Input and Submit Button -->
    <div class="url-input-container">
      <input
        class="iiif-input"
        placeholder="Paste IIIF Url Here"
        v-model="iiifManifestUrl"
      />
      <Button
        name="search"
        class="a-btn a-btn--text"
        :eventBindings="{ click: updateUrl }"
        >Submit</Button
      >
    </div>
    <!-- IIIF explanation section -->
    <div class="l-thirds">
      <div class="l-thirds__two-thirds">
        <h3 class="f-heading-3">What is IIIF?</h3>
        <RichText :content="iiif2" contentType="markdown" />
      </div>
    </div>
  </div>
</template>

<script>
import { Button, RichText } from "@thegetty/getty-ui";
import iiif1 from "../data/iiif_1.md";
import iiif2 from "../data/iiif_2.md";

export default {
  name: "IIIFInput",
  components: {
    RichText,
    Button
  },
  data() {
    return {
      iiifManifestUrl: undefined,
      iiif1,
      iiif2
    };
  },
  methods: {
    updateUrl() {
      console.log("updateUrl");
      this.$emit("updateIiif", this.iiifManifestUrl);
    }
  }
};
</script>

<style lang="scss" scoped>
.url-input-container {
  display: flex;
  align-items: flex-end;
  max-width: 100%;
  margin-top: 30px;
}
.a-btn--text {
  font-size: 15px;
  padding: 0 4px;
  background-color: #fff;
  color: #1947b8;
  margin-bottom: -4px;
}
input {
  border: 0;
  flex-grow: 1;
  margin-right: 0px;
  outline: none;
  border-bottom: 1px solid black;
}
input:focus {
  outline: none !important;
}
</style>
