<template>
  <div>
    <h1 class="f-heading-5">Getty museum artwork examples</h1>
    <!-- image grid -->
    <div class="columns is-mobile is-multiline">
      <div
        v-for="(img, index) in images"
        class="column is-one-quarter"
        @click="changeImage(index)"
      >
        <img :src="img.src" :class="getClass(index)" />
      </div>
    </div>
    <!-- selected image preview -->
    <div v-if="selectedImageIndex > -1" class="selected-container">
      <img :src="images[selectedImageIndex].qrSrc" />
    </div>
    <div></div>
  </div>
</template>

<script>
import irises from "/assets/images/irises.png";
import irisesQR from "/assets/images/irises-qr.png";
import yawn from "/assets/images/yawn.png";
import yawnQR from "/assets/images/yawn-qr.png";

export default {
  name: "Gallery",
  components: {},

  data: function() {
    return {
      selectedImageIndex: -1,
      images: [
        {
          alt: "image alt",
          id: "123",
          src: irises,
          qrSrc: irisesQR,
          title: "Irises Title"
        },
        {
          alt: "image alt",
          id: "123",
          src: yawn,
          qrSrc: yawnQR,
          title: "Yawn Title"
        },
        {
          alt: "image alt",
          id: "123",
          src: irises,
          qrSrc: irisesQR,
          title: "Irises Title"
        },
        {
          alt: "image alt",
          id: "123",
          src: yawn,
          qrSrc: yawnQR,
          title: "Yawn Title"
        },
        {
          alt: "image alt",
          id: "123",
          src: yawn,
          qrSrc: yawnQR,
          title: "Yawn Title"
        },
        {
          alt: "image alt",
          id: "123",
          src: irises,
          qrSrc: irisesQR,
          title: "Irises Title"
        },
        {
          alt: "image alt",
          id: "123",
          src: yawn,
          qrSrc: yawnQR,
          title: "Yawn Title"
        },
        {
          alt: "image alt",
          id: "123",
          src: irises,
          qrSrc: irisesQR,
          title: "Irises Title"
        }
      ]
    };
  },
  computed: {},
  methods: {
    changeImage(index) {
      this.selectedImageIndex = index;
    },
    getClass(index) {
      if (index === this.selectedImageIndex) {
        return "thumbnail selected";
      }
      return "thumbnail";
    }
  }
};
</script>

<style lang="scss" scoped>
.f-heading-5 {
  margin-bottom: 28px;
}
.selected-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.selected {
  border: 3px solid pink;
}
.thumbnail {
  width: 100%;
}
</style>
