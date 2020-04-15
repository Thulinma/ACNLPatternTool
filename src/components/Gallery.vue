<template>
  <div ref="gallery-section">
    <h1 class="f-heading-4">B. Select one of our favorites</h1>
    <!-- image grid -->
    <div class="gallery" ref="gallery">
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
if (typeof window !== "undefined") {
  let smoothscroll = require("smoothscroll-polyfill");
  smoothscroll.polyfill();
}

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
      this.scrollTo(this.$refs["gallery-section"]);
    },
    scrollTo(el) {
      const scroll = el.offsetTop - 110;
      if (window.pageYOffset - 220 <= scroll) {
        return;
      }
      window.scrollTo({
        top: scroll,
        behavior: "smooth",
      });
    },

    getClass(index) {
      if (index === this.selectedImageIndex) {
        return "thumbnail selected";
      }
      return "thumbnail";
    },
    getThumbnailUrl(img) {
      if (img.crop && img.crop.width) {
        const fullWidth = img.crop.full_width;
        const fullHeight = img.crop.full_height;

        let url = img.iiif_url.replace(
          "/full/",
          "/pct:" +
            Math.round((img.crop.left / fullWidth) * 100) +
            "," +
            Math.round((img.crop.top / fullHeight) * 100) +
            "," +
            Math.round((img.crop.width / fullWidth) * 100) +
            "," +
            Math.round((img.crop.height / fullHeight) * 100) +
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
.gallery {
  display: flex;
  flex-wrap: no-wrap;
  margin: 24px 0;
}
.gallery-column {
  flex: 1 0;
  margin: 0 6px;
}
.gallery-column:first-child {
  margin-left: 0;
}
.gallery-column:last-child {
  margin-right: 0;
}
@media (max-width: 767px) {
  .gallery {
    flex-wrap: wrap;
  }
  .gallery-column {
    flex: 1 0 15%;
    margin: 3px;
  }
  .gallery-column:first-child,
  .gallery-column:last-child {
    margin: 3px;
  }
}
@media (max-width: 500px) {
  .gallery-column {
    flex: 1 0 13%;
  }
}
.selected {
  border: 6px solid white;
  outline: 2px solid #675102;
}
.thumbnail {
  width: 100%;
}
</style>
