<template>
  <div>
    <RichText :content="iiifIntro" contentType="markdown" />

    <div class="url-input-container">
      <input
        class="iiif-input"
        placeholder="IIIF Url Goes Here"
        v-model="iiifManifestUrl"
      />
      <Button name="search" class="a-btn a-btn--text" @click="updateUrl"
        >Submit</Button
      >
    </div>
    <div class="l-thirds">
      <div class="l-thirds__two-thirds">
        <RichText :content="step1iiif" contentType="markdown" />
      </div>
    </div>
  </div>
</template>

<script>
import { Button, RichText } from "@thegetty/getty-ui";
import step1iiif from "../data/step1_iiif.md";
import iiifIntro from "../data/iiifIntro.md";

export default {
  name: "UrlInput",
  components: {
    RichText,
    Button,
  },
  data() {
    return {
      iiifManifestUrl: undefined,
      step1iiif,
      iiifIntro,
    };
  },
  methods: {
    updateUrl() {
      this.$emit("updateIiif", this.iiifManifestUrl);
    },
  },
};
</script>

<style lang="scss" scoped>
.url-input-container {
  display: flex;
  align-items: stretch;
  max-width: 100%;
  margin-top: 4px;
}
.a-btn--text {
  font-size: 15px;
  padding: 11px 16px;
  background-color: #fff;
  color: #1947b8;
}

input {
  border: 0;
  outline: 0;
}
input:focus {
  outline: none !important;
}

input {
  flex-grow: 1;
  margin-right: 0px;
  outline: none;
  padding: 0 10px;
  border-bottom: 1px solid black;
}
</style>
