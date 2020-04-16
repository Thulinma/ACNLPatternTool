<template>
  <div>
    <div class="l-thirds">
      <div class="l-thirds__two-thirds">
        <RichText :content="step4Text" contentType="markdown" />
      </div>
    </div>

    <div class="l-thirds share-image-container">
      <div class="l-thirds__one-third">
        <img :src="share1" class="third" />
      </div>
      <div class="l-thirds__one-third">
        <img :src="share2" class="third" />
      </div>
      <div class="l-thirds__one-third">
        <img :src="share3" class="third" />
      </div>
    </div>
  </div>
</template>

<script>
import { RichText } from "@thegetty/getty-ui";
import share1 from "../assets/images/IMG_7807.JPG";
import share2 from "../assets/images/IMG_20200415_083020.jpg";
import share3 from "../assets/images/IMG_7822.JPG";
import step4Text from "../data/step4.md";

export default {
  name: "Share",
  components: {
    RichText
  },
  data() {
    return {
      share1,
      share2,
      share3,
      step4Text
    };
  }
};
</script>

<style lang="scss" scoped>
.share-image-container {
  margin-top: 40px;
}
</style>
