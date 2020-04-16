<template>
  <div>
    <h1>Disclaimer</h1>
    <div class="disclaimer-container">
      <hr />
      <div class="l-thirds__two-thirds">
        <RichText :content="disclaimer" contentType="markdown" />
      </div>
    </div>
  </div>
</template>

<script>
import { RichText } from "@thegetty/getty-ui";
import disclaimer from "../data/disclaimer.md";

export default {
  name: "disclaimer",
  components: {
    RichText
  },
  data() {
    return {
      disclaimer
    };
  }
};
</script>

<style lang="scss">
.disclaimer-container {
  margin-top: 60px;
}
</style>
