<template>
  <div>
    <h1 class="f-heading-4">B. Select one of our favorites</h1>
    <!-- image grid -->
    <div class="gallery">
      <div
        v-for="(img, index) in images"
        class="gallery-column"
        @click="changeImage(index)"
      >
        <img :src="getThumbnailUrl(img)" :class="getClass(index)" />
      </div>
    </div>
  </div>
</template>

<script>
import examples from "../data/example_images.json";
export default {
  name: "Gallery",
  components: {},

  data: function() {
    return {
      selectedImageIndex: -1,
      images: examples,
    };
  },
  computed: {},
  methods: {
    changeImage(index) {
      this.selectedImageIndex = index;
      this.$emit("selectedExample", index);
    },
    getClass(index) {
      if (index === this.selectedImageIndex) {
        return "thumbnail selected";
      }
      return "thumbnail";
    },
    getThumbnailUrl(img) {
      if (img.crop && img.crop.width) {
        let url = img.iiif_url.replace(
          "/full/",
          "/" +
            img.crop.top * 6 +
            "," +
            img.crop.left * 6 +
            "," +
            666 * 8 +
            "," +
            666 * 8 +
            "/"
        );
        return url;
      }
      return img.iiif_url;
    },
  },
};
</script>

<style lang="scss" scoped>
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

.gallery {
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
}

.gallery-column {
  flex: 1 0;
  margin: 8px;
}
</style>
