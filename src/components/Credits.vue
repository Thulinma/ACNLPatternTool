<template>
  <div>
    <h1>Credits</h1>
    <div class="credits-container">
      <hr />
      <div class="l-halves">
        <div class="l-halves__half">
          <RichText :content="credits_p1" contentType="markdown" />
        </div>
        <div class="l-halves__half leftborder">
          <RichText :content="credits" contentType="markdown" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RichText } from "@thegetty/getty-ui";
import credits from "../data/credits.md";
import credits_p1 from "../data/credits_p1.md";

export default {
  name: "Credits",
  components: {
    RichText
  },
  data() {
    return {
      credits,
      credits_p1
    };
  }
};
</script>

<style lang="scss">
.credits-container {
  margin-top: 60px;
}
</style>
