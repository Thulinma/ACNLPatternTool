<template>
  <div>
    <h1 class="f-heading-5">Credits</h1>
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
