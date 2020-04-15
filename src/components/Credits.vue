<template>
  <div>
    <h1 class="f-heading-5">Credits</h1>
    <hr />
    <div class="l-halves">
      <div class="l-halves__half">
        Animal Crossing: New Leaf Pattern Tool
      </div>
      <div class="l-halves__half  leftborder">
        <RichText :content="credits" contentType="markdown" />
      </div>
    </div>
  </div>
</template>

<script>
import { RichText } from "@thegetty/getty-ui";
import credits from "../data/credits.md";

export default {
  name: "Credits",
  components: {
    RichText
  },
  data() {
    return {
      credits
    };
  }
};
</script>
