<template>
  <!-- takes warnings in some markdown elements -->
  <!-- e.g. h1, h2, h3, p, img -->
  <VCard elevation="0">
    <div class="info--window">
      <CancelButton @click="$emit('close')" />
      <div class="info--info">
        <div class="info--content">
          <slot>No Content Provided.</slot>
        </div>
        <slot name="buttons">
          <div class="info--buttons">
            <button class="info--button" @click="$emit('close')">Ok</button>
          </div>
        </slot>
      </div>
    </div>
  </VCard>
</template>

<script>
import { VCard } from "vuetify/lib";
import CancelButton from "~/components/modals/CancelButton.vue";

export default {
  name: "Info",
  components: {
    VCard,
    CancelButton,
  },
  data: function () {
    return {};
  },
};
</script>

<style lang="scss">
@import "styles/colors";
@import "styles/screens";
@import "styles/positioning";
@import "styles/resets";

.info--window {
  box-sizing: border-box;
  @include relative-in-place;
  width: 100%;
  height: 100%;
  overflow: scroll;
  padding: 30px 40px 0px 40px;
  background-color: $ecru-white;
  color: $jambalaya;
  z-index: 99999;
  display: grid;
  justify-content: center;

  @include tablet-landscape {
    width: auto;
    height: auto;
    overflow: visible;
  }
}

.info--info {
  width: 240px;
  @include phone-landscape {
    width: 410px;
  }
  @include tablet-portrait {
    width: 600px;
  }
  @include tablet-landscape {
    width: 650px;
    max-height: calc(80vh - 80px);
    overflow: scroll;
  }
}

.info--content {
  justify-self: stretch;
  margin-bottom: 30px;
  font-weight: 600;
  line-height: 1.5;
  font-size: 1rem;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
  }

  ul {
    margin-top: 10px;
    margin-bottom: 10px;
    list-style: outside;
    padding-left: 1em;
  }

  strong {
    font-weight: bolder;
  }

  h1 {
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  h2 {
  }

  h3 {
  }

  h4 {
  }

  h5 {
  }

  h6 {
  }

  p {
    margin-bottom: 10px;
  }

  img {
  }
}

.info--buttons {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 10px;
  margin-bottom: 30px;
}

.info--button {
  @include reset-button;
  cursor: pointer;

  padding: 8px 0px;
  box-sizing: border-box;
  border-radius: 8px;
  border-width: 4px;
  border-style: solid;
  color: white;
  background-color: $robin-egg-blue;

  &.normal {
    background-color: $olive-haze;
  }
}
</style>