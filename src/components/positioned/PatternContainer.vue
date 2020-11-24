<template>
  <ModalContainer
    @modal-close="$emit('close')"
    @scroll-freeze="$emit('scroll-freeze')"
    @scroll-unfreeze="$emit('scroll-unfreeze')"
  >
    <template #window>
      <div class="storage--window">
        <CancelButton class="cancel-button-adjust" @click="$emit('close')" />
        <div class="storage--patterns-grid-container">
          <div class="storage--patterns-grid">
            <div
              v-for="(drawingTool, idx) in drawingTools"
              :key="idx"
              :class="{
                'storage--pattern-container': true,
                selected:
                  selectedMap.length === drawingTools.length &&
                  selectedMap[idx],
              }"
            >
              <div class="storage--pattern-wrapper">
                <PreviewGenerator
                  class="storage--pattern"
                  :drawingTool="drawingTool"
                  @click="$emit('select', drawingTool)"
                />
                <div class="storage--pattern-selected-border"></div>
                <div class="storage--pattern-selected-icon-container">
                  <IconCheck class="storage--pattern-selected-icon" />
                </div>
              </div>
              <div class="storage--pattern-text">{{ drawingTool.title }}</div>
            </div>
          </div>
        </div>
        <UtilityBar v-if="options.length > 0" :options="options" />
      </div>
    </template>
  </ModalContainer>
</template>

<script>
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import PreviewGenerator from "~/components/PreviewGenerator.vue";
import CancelButton from "~/components/modals/CancelButton.vue";
import DrawingTool from "~/libs/DrawingTool";
import IconCheck from "~/components/icons/IconCheck.vue";
import IconKebab from "~/components/icons/IconKebab.vue";
import UtilityBar from "~/components/positioned/UtilityBar.vue";

export default {
  name: "PatternContainer",
  components: {
    ModalContainer,
    PreviewGenerator,
    IconCheck,
    IconKebab,
    CancelButton,
    UtilityBar,
  },
  props: {
    drawingTools: {
      type: Array,
      required: true,
    },
    selectedMap: {
      type: Array,
      required: false,
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
      isOptionsOpen: false,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/screens";

.storage--window {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  background-color: $ecru-white;

  z-index: 100;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: visible;
  box-shadow: 0px 3px 20px rgba(0, 0, 0, 0.16);

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-content: center;
  justify-items: center;
  align-items: flex-start;
  align-content: flex-start;

  @include tablet-landscape {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    width: 970px;
    height: auto;
    min-height: 300px;
    max-width: unset;
    max-height: unquote("min(#{90%}, 700px)");
    overflow: visible;
    border-radius: 40px;
    padding: 0px 40px;
  }
  @include desktop {
    width: 1100px;
  }
}

.storage--patterns-grid-container {
  @include relative-in-place;
  z-index: 0;
  box-sizing: border-box;
  width: 100%;
  max-height: 100%;
  overflow: scroll;
  padding: 50px 20px 80px 20px;
  display: flex;
  flex-direction: column;
}

.storage--patterns-grid {
  @include relative-in-place;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(1, 200px);
  justify-content: center;
  justify-items: center;
  row-gap: 20px;
  column-gap: 10px;

  @include phone-landscape {
    grid-template-columns: repeat(2, 200px);
    justify-content: space-around;
  }
  @include tablet-portrait {
    grid-template-columns: repeat(4, 150px);
  }
  @include tablet-landscape {
    grid-template-columns: repeat(5, 150px);
    column-gap: 30px;
    justify-content: space-between;
  }
  @include desktop {
  }
}

.storage--pattern-container {
  @include relative-in-place;
  display: grid;
  grid-template-rows: auto;
  justify-content: center;
  justify-items: center;

  .storage--pattern {
    @include relative-in-place;
    z-index: 10;
    border-radius: 5px;
    cursor: pointer;
  }

  .storage--pattern-wrapper {
    @include relative-in-place;
  }

  .storage--pattern-selected-border {
    @include absolute-center;
    display: none;
    width: 100%;
    height: 100%;
    background-color: $robin-egg-blue;
    border-radius: 10px;
    padding: 8px;
  }

  .storage--pattern-selected-icon-container {
    display: none;
    position: absolute;
    top: 0;
    left: 100%;
    z-index: 11;
    transform: translate(calc(-50% + 4px), calc(-50% - 4px));
    background-color: $robin-egg-blue;
    border-radius: 999px;
    padding: 3px;
  }
  .storage--pattern-selected-icon {
    height: 15px;
    width: 15px;
    display: block;
    fill: white;
  }

  .storage--pattern-text {
    margin-top: 20px;
    width: 100%;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
  }

  &.selected {
    .storage--pattern-selected-border {
      display: block;
    }
    .storage--pattern-selected-icon-container {
      display: block;
    }
  }
}

.storage--options-container {
  position: absolute;
  top: 45px;
  right: 20px;
  width: 30px;
  height: 30px;
  border-radius: 999px;

  .storage--options-icon {
    @include absolute-center;
    width: 24px;
    height: 24px;
  }

  &:hover {
    background-color: rgba(#bababa, 0.5);
    cursor: pointer;
  }
}

.storage--options-menu {
  position: absolute;
  top: 100px;
  right: 20px;
  padding: 20px;
  border-radius: 20px;
  z-index: 10;
  background-color: $robin-egg-blue;

  display: grid;
  grid-auto-columns: auto;
  grid-auto-rows: auto;
  justify-content: flex-start;
  justify-items: flex-start;
  grid-auto-flow: row;
  row-gap: 15px;
}

.storage--option {
  @include relative-in-place;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  z-index: initial;
  cursor: pointer;

  &:after {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 50%;
    z-index: -1;
    transform: translate(-50%, 0px);

    display: none;
    width: calc(100% + 10px);
    height: 70%;

    border-radius: 3px;
    background-color: $persian-green;
  }
  &:hover {
    &:after {
      display: block;
    }
  }
}

.cancel-button-adjust {
  z-index: 3;
}
</style>