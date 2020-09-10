<template>
  <ModalContainer @modal-close="$emit('close')">
    <template #window>
      <div class="storage--window">
        <CancelButton @click="$emit('close')" />
        <div class="storage--patterns-grid">
          <div
            v-for="(drawingTool, idx) in drawingTools"
            :key="idx"
            :class="{
              'storage--pattern-container': true,
              'selected': selectedMap[idx],
            }"
          >
            <div class="storage--pattern-wrapper">
              <PreviewGenerator
                class="storage--pattern"
                :drawingTool="drawingTool"
                @click="toggleSelection(drawingTool)"
              />
              <div class="storage--pattern-selected-border"></div>
              <div class="storage--pattern-selected-icon-container">
                <IconCheck class="storage--pattern-selected-icon" />
              </div>
            </div>
            <div class="storage--pattern-text">{{ drawingTool.title }}</div>
          </div>
        </div>

        <div @click="isOptionsOpen = !isOptionsOpen" class="storage--options-container">
          <IconKebab class="storage--options-icon" />
        </div>

        <div v-if="isOptionsOpen" class="storage--options-menu">
          <div class="storage--option" v-if="selectedCount === 1" @click="load">Open</div>
          <div class="storage--option" v-if="selectedCount != 0" @click="deleteSelection">Delete</div>
          <div class="storage--option" @click="saveSelectionAsACNL">
            Download
            <span v-if="selectedCount === 0">all as</span> ACNLs
          </div>
          <div class="storage--option" @click="saveSelectionAsPNG">
            Download
            <span v-if="selectedCount === 0">all as</span> QRs
          </div>
          <div class="storage--option" @click="saveSelectionAsBoth">
            Download
            <span v-if="selectedCount === 0">all as</span> Both
          </div>
        </div>
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
import lzString from "lz-string";
import saver from "~/libs/saver";

export default {
  name: "Storage",
  components: {
    ModalContainer,
    PreviewGenerator,
    IconCheck,
    IconKebab,
    CancelButton,
  },
  data: function () {
    const drawingTools = [];
    for (let i = 0; i < localStorage.length; ++i) {
      const key = localStorage.key(i);
      if (key.startsWith("acnl_")) {
        const fromStorage = new DrawingTool(
          lzString.decompressFromUTF16(localStorage.getItem(key))
        );
        // console.log(`loading into storage acnl_${fromStorage.fullHash}`);
        drawingTools.push(fromStorage);
      }
    }

    return {
      // map of drawingTools selected true/false
      selectedMap: drawingTools.map(() => false),
      drawingTools,
      isOptionsOpen: false,
    };
  },
  computed: {
    selected: function () {
      return this.drawingTools.filter((dt, i) => this.selectedMap[i]);
    },
    selectedCount: function () {
      return this.selectedMap.filter((b) => b).length;
    },
  },
  methods: {
    load() {
      this.$emit("load", this.selected[0].toString());
    },
    toggleSelection(drawingTool) {
      const idx = this.drawingTools.indexOf(drawingTool);
      const isSelected = this.selectedMap[idx];
      this.selectedMap.splice(idx, 1, !isSelected);
    },
    deleteSelection() {
      const message = "Are you sure you want to delete these patterns?";
      if (!window.confirm(message)) return;
      for (const drawingTool of this.selected) {
        console.log("deleting", "acnl_" + drawingTool.fullHash);
        localStorage.removeItem("acnl_" + drawingTool.fullHash);
        // reflect changes in component data
        const idx = this.drawingTools.indexOf(drawingTool);
        this.drawingTools.splice(idx, 1);
        this.selectedMap.splice(idx, 1);
      }
    },
    async saveSelectionAsACNL() {
      const { selectedMap, selectedCount, selected, drawingTools } = this;

      if (selectedCount === 1) {
        await saver.saveDrawingToolAsAcnl(selected[0]);
        return;
      }

      const selection = selectedCount === 0 ? drawingTools : selected;
      await saver.saveDrawingToolsAsAcnl(selection);
    },
    async saveSelectionAsPNG() {
      const { selectedMap, selectedCount, selected, drawingTools } = this;

      if (selectedCount === 1) {
        await saver.saveDrawingToolAsPng(selected[0]);
        return;
      }

      const selection = selectedCount === 0 ? drawingTools : selected;
      await saver.saveDrawingToolsAsPng(selection);
    },
    async saveSelectionAsBoth() {
      const { selectedMap, selectedCount, selected, drawingTools } = this;

      if (selectedCount === 1) {
        await saver.saveDrawingToolAsBoth(selected[0]);
        return;
      }

      const selection = selectedCount === 0 ? drawingTools : selected;
      await saver.saveDrawingToolsAsBoth(selection);
    },
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
  overflow-y: scroll;
  box-shadow: 0px 3px 20px rgba(0, 0, 0, 0.16);
  
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-content: center;
  justify-items: center;
  align-items: flex-start;
  align-content: flex-start;
  
  
  
  @include tablet-landscape {
    @include absolute-center;
    box-sizing: content-box;
    padding: 50px;
    width: auto;
    height: auto;
    max-height: 100%;
    overflow-y: visible;
    border-radius: 60px;
  }
}

.storage--patterns-grid {
  @include relative-in-place;
  display: grid;
  grid-template-columns: repeat(1, 200px);
  justify-content: space-between;
  justify-items: center;
  row-gap: 20px;
  row-gap: 20px;
  
  padding: 50px 0px;
  
  @include phone-landscape {
    grid-template-columns: repeat(2, 200px);
  }
  @include tablet-portrait {
    grid-template-columns: repeat(4, 200px);
  }
  @include tablet-landscape {
    grid-template-columns: repeat(5, 200px);
    padding: 0px;
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
</style>