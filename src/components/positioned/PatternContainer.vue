<template>
  <VCard elevation="0" class="card rounded-xl" :color="colors.ecruWhite">
    <VCardTitle class="card-title"><slot name="title"></slot></VCardTitle>
    <VCardText class="card-text">
      <div class="grid">
        <VBadge
          v-for="(patternItem) in patternItems"
          :key="patternItem.mosaicId"
          class="storage-item-ctn"
          :color="colors.robinEggBlue"
          icon="mdi-check"
          :value="isSelected(patternItem)"
          :offset-x="10"
          :offset-y="10"
        >
          <VCard
            :class="{
              'storage-item': true,
              'storage-item--active': isSelected(patternItem),
              'rounded-lg': true,
            }"
            outlined
            @click="$emit('select', patternItem)"
          >
            <PreviewGenerator
              class="pattern"
              :drawingTool="patternItem.drawingTool"
            />
            <VCardTitle class="pattern-title text-subtitle-2 text-center text-truncate">
              {{ patternItem.drawingTool.title }}
            </VCardTitle>
          </VCard>
        </VBadge>
      </div>
    </VCardText>
    <!-- <CancelButton class="cancel-button-adjust" @click="$emit('close')" /> -->
    <UtilityBar v-if="options.length > 0" :options="options" />
    <CancelButton @click="$emit('close')" />
  </VCard>
</template>

<script>
import {
  VToolbar,
  VToolbarTitle,
  VToolbarItems,
  VBtn,
  VIcon,
  VCard,
  VCardTitle,
  VCardText,
  VBadge,
  VAutocomplete,
  VScaleTransition,
} from "vuetify/lib";
import PreviewGenerator from "@/components/PreviewGenerator.vue";
import CancelButton from "@/components/modals/CancelButton.vue";
import UtilityBar from "@/components/positioned/UtilityBar.vue";

import colors from "@/styles/colors.scss";

export default {
  name: "PatternContainer",
  components: {
    VToolbar,
    VToolbarTitle,
    VToolbarItems,
    VBtn,
    VIcon,
    VCard,
    VCardTitle,
    VCardText,
    VBadge,
    VAutocomplete,
    VScaleTransition,
    PreviewGenerator,
    CancelButton,
    UtilityBar,
  },
  props: {
    patternItems: {
      type: Array,
      required: true,
      default: () => new Array(),
    },
    selected: {
      type: Array,
      required: true,
      default: () => new Array(),
    },
    options: {
      type: Array,
      required: false,
      default: () => new Array(),
    },
  },
  data: function () {
    return {
      colors,
      isOptionsOpen: false,
    };
  },
  methods: {
    isSelected(patternItem) {
      return this.selected.includes(patternItem);
    }
  }
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;

.card {
  overflow: hidden;
}
.card-title {
  color: colors.$jambalaya !important;
}
.card-text {
  padding: 24px !important;
}

.grid {
  @include positioning.relative-in-place;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(1, 225px);
  justify-content: center;
  justify-items: center;
  padding-bottom: 50px;
  row-gap: 20px;
  column-gap: 10px;

  @include screens.phone-landscape {
    grid-template-columns: repeat(2, 175px);
    justify-content: space-around;
  }
  @include screens.tablet-portrait {
    grid-template-columns: repeat(4, 175px);
  }
  @include screens.tablet-landscape {
    grid-template-columns: repeat(4, 175px);
    column-gap: 20px;
    row-gap: 30px;
    justify-content: space-between;
  }
  @include screens.desktop {
    grid-template-columns: repeat(5, 175px);
    column-gap: 40px;
    row-gap: 40px;
  }
}

.storage-item-ctn {
  justify-self: stretch;
}

.storage-item {
  cursor: pointer;
  @include positioning.relative-in-place;
  display: grid;
  justify-content: center;
  justify-items: center;
  padding: 10px;
  background-color: transparent;
  
  .pattern {
    border-radius: inherit;
  }
  
  .pattern-title {
    font-family: Nunito !important;
    color: colors.$jambalaya !important;
    user-select: none;
  }
  
  &.storage-item--active {
    background-color: rgba(colors.$persian-green, 0.25);
  }
}

.v-card--link:before {
  background-color: transparent !important;
}


.cancel-button-adjust {
  z-index: 3;
}
</style>