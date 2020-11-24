<template>
  <a class="browse--pattern-container" :href="pattern.url">
    <div class="browse--pattern-title">{{ pattern.title }}</div>
    <div class="browse--type-tags">
      <span v-if="pattern.f_type != null" class="browse--tag">
        {{ pattern.f_type }}
      </span>
      <span v-if="pattern.f_type_a != null" class="browse--tag">
        {{ pattern.f_type_a }}
      </span>
      <span v-if="pattern.f_type_b != null" class="browse--tag">
        {{ pattern.f_type_b }}
      </span>
    </div>
    <IconGenerator :pattern="pattern.bytes" width="150" height="150" />
    <div class="browse--pattern-details">
      <span>by {{ pattern.author }}</span>
      <span>from {{ pattern.town }}</span>
    </div>
    <div class="browse--style-tags">
      <span
        v-if="pattern.style_main != null"
        class="browse--tag"
        :style="tagClass(pattern.style_main)"
      >
        {{ pattern.style_main }}
      </span>
      <span
        v-if="pattern.style_sub_a != null"
        class="browse--tag"
        :style="tagClass(pattern.style_sub_a)"
      >
        {{ pattern.style_sub_a }}
      </span>
      <span
        v-if="pattern.style_sub_b != null"
        class="browse--tag"
        :style="tagClass(pattern.style_sub_b)"
      >
        {{ pattern.style_sub_b }}
      </span>
    </div>
  </a>
</template>

<script>
import IconGenerator from "~/components/IconGenerator.vue";

const colors = {
  natural: "#EAC558",
  cute: "#E96598",
  sporty: "#5EC299",
  cool: "#6BB6DC",
  rustic: "#74940D",
  hip: "#EB7E32",
  harmonious: "#DC3D32",
  elegant: "#D589E8",
  modern: "#5BC0B3",
  historical: "#8D2E4B",
  civic: "#4F57C8",
  silly: "#E64369",
  spooky: "#363655",
  "sci-fi": "#408877",
  aquatic: "#328BCE",
  floral: "#EA80DA",
  animal: "#AF2E33",
  holiday: "#48903B",
  food: "#B156FD",
  brand: "#E93F33",
  anime: "#EB8D77",
  "video-game": "#0D1010",
  meme: "#52307C",
};

export default {
  name: "BrowsePatternInfo",
  components: {
    IconGenerator,
  },
  props: {
    pattern: {
      type: Object,
      required: true,
    },
  },
  methods: {
    tagClass(tag) {
      if (tag != null)
        return {
          backgroundColor: `${colors[tag.toLowerCase().replace(" ", "-")]}`,
        };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/screens";

.browse--pattern-container {
  text-decoration: none;
  background-color: $turquoise;
  border-radius: 35px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 300px;
  max-width: 220px;
  max-height: 300px;
  margin: 10px;
  box-shadow: 5px 5px 12px -3px rgba(0, 0, 0, 0.2);
  background-image: radial-gradient($persian-green 20%, transparent 20%),
    radial-gradient($persian-green 20%, transparent 20%);
  background-position: 0 0, 5px 5px;
  background-size: 10px 10px;
  color: $jambalaya;
}
.browse--pattern-title {
}
.browse--pattern-details {
  background-color: $albescent-white;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 12px;
  width: 150px;
}
.browse--type-tags,
.browse--style-tags {
  min-height: 30px;

  display: flex;
  align-items: center;
}
.browse--tag {
  background-color: $silver-sand;
  border-radius: 35px;
  color: white;
  font-size: 11px;
  padding: 3px 5px;
  margin: 0 2px;
  text-transform: uppercase;
}
</style>