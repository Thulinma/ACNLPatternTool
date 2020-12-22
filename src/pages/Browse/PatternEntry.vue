<template>
  <router-link class="pattern-entry" :to="patternEntry.url">
    <div class="card">
      <IconGenerator
        class="preview"
        :pattern="patternEntry.bytes"
        :width="150"
        :height="150"
      />
      <div class="information">
        <div>
          {{ patternEntry.author || "Unknown" }}
        </div>
        <div>
          {{ patternEntry.town || "Unknown" }}
        </div>
      </div>
    </div>
    <div class="title">
      {{ patternEntry.title }}
    </div>
    <div class="overlay"></div>
  </router-link>
</template>


<script>
import IconGenerator from "~/components/IconGenerator.vue";

export default {
  name: "PatternEntry",
  components: {
    IconGenerator,
  },
  props: {
    patternEntry: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {};
  },
  methods: {},
};
</script>


<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/screens" as screens;
@use "styles/transitions" as transitions;
@use "styles/positioning" as positioning;

.pattern-entry {
  @include positioning.relative-in-place;
  display: inline-grid;
  justify-content: stretch;
  justify-items: center;
  transition: transform transitions.$energetic 0.15s;
  transform: scale(1);
  padding: 12px 5px 20px 5px;

  .overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 100%;
    width: 100%;
    transform: translate(-50%, -50%) scale(0);
    z-index: -1;
    pointer-events: none;
    border-radius: 8px;
    background: colors.$robin-egg-blue;
    transition:
      transform 0.10s linear;
  }

  &:hover .overlay {
    transform: translate(-50%, -50%) scale(1);
    transition:
      transform 0.25s transitions.$energetic;
  }

  &:active .overlay {
      background-color: colors.$tiffany-blue;
    }


  .card {
    @include positioning.relative-in-place;
    background: linear-gradient(
      to right,
      colors.$soapstone,
      #f1ebdf 50%,
      colors.$soapstone 100%
    );
    border: 8px solid white;
    border-radius: 5px;
    box-shadow: 3px 6px 6px rgba(#000000, 0.16);

    width: auto;
    display: grid;
    justify-content: stretch;
    justify-items: center;
  }

  .preview::v-deep {
    width: 150px;
    height: 150px;
    padding: 5px 0px;
  }

  .information {
    justify-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    background-color: colors.$salmon;
    text-align: center;
    font-size: 1rem;
    font-family: Nunito;
    font-weight: 600;
    color: colors.$white;
    line-height: 1.4;
  }

  .title {
    margin-top: 15px;
    text-align: center;
    font-size: 1.1rem;
    font-family: Nunito;
    font-weight: 600;
    color: colors.$olive-haze;
    z-index: 10;
  }
  &:hover .title {
    transition: color 0.25s transitions.$energetic;
  }

  &:hover .title {
    color: colors.$white;
  }
}
</style>