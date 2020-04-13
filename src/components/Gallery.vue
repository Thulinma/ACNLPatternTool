<template>
  <div>
    <div>
      <h1 class="f-heading-5">Getty museum images</h1>
      <div class="l-quarters">
        <div
          v-for="(img, index) in images"
          class="l-quarters__quarter"
          @click="changeImage(index)"
        >
          <img src="../assets/images/1.png" class="test" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Gallery",
  components: {},

  data: function() {
    return {
      images: [
        {
          alt: "image alt",
          id: "123",
          src: "/images/1.png",
          title: "Test Title"
        },
        {
          alt: "image alt",
          id: "123",
          src:
            "https://media.getty.edu/iiif/image/e5d29650-11f8-4897-9540-54a9dd65b04f/square/!300,300/0/default.jpg",
          title: "Test Title"
        },
        {
          alt: "image alt",
          id: "123",
          src:
            "https://media.getty.edu/iiif/image/e5d29650-11f8-4897-9540-54a9dd65b04f/square/!300,300/0/default.jpg",
          title: "Test Title"
        },
        {
          alt: "image alt",
          id: "123",
          src:
            "https://media.getty.edu/iiif/image/e5d29650-11f8-4897-9540-54a9dd65b04f/square/!300,300/0/default.jpg",
          title: "Test Title"
        }
      ]
    };
  },
  computed: {},
  methods: {
    changeImage(index) {
      console.log("index", index);
    }
  }
};
</script>

<style lang="scss" scoped>
.f-heading-5 {
  margin-bottom: 28px;
}
</style>
