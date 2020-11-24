<template>
  <div class="container">
    <div class="left-side">
      <div class="preview-container">
        <img class="preview" :src="previewDataURL" />
      </div>
    </div>

    <div class="right-side">
      <div class="radio-options">
        <div class="radio-options-title">Save Method</div>
        <label
          v-for="(option, index) in savingMethodOptions"
          :key="index"
          :class="{
            'radio-option': true,
            active: option.savingMethod === savingMethod,
          }"
        >
          <span class="radio-option-indicator"></span>
          <span>{{ option.name }}</span>
          <input
            v-show="false"
            name="savingMethod"
            type="radio"
            :checked="option.savingMethod === savingMethod"
            :value="option.savingMethod"
            @change="savingMethod = option.savingMethod"
          />
        </label>
      </div>

      <button class="save-button" @click="save">Save</button>
    </div>
  </div>
</template>

<script>
import saver from "~/libs/saver";
import DrawingTool from "~/libs/DrawingTool";

const savingMethodOptions = [
  {
    name: "To Storage",
    savingMethod: saver.saveDrawingToolsToStorage,
  },
  {
    name: "QRs as .ZIP",
    savingMethod: saver.saveDrawingToolsAsPng,
  },
  {
    name: "ACNLs as .ZIP",
    savingMethod: saver.saveDrawingToolsAsAcnl,
  },
  {
    name: "Both as .ZIP",
    savingMethod: saver.saveDrawingToolsAsBoth,
  },
];

export default {
  name: "Saving",
  components: {},
  props: {
    isMural: {
      type: Boolean,
      required: true,
    },
    previewDataURL: {
      type: String,
      required: true,
    },
    outputs: {
      type: Array,
      required: true,
    },
  },
  data: function () {
    return {
      savingMethodOptions,
      savingMethod: saver.saveDrawingToolsToStorage,
    };
  },
  methods: {
    async save() {
      const drawingTools = this.outputs.map((output) => {
        const drawingTool = new DrawingTool(output);
        return drawingTool;
      });
      await this.savingMethod(drawingTools);
      if (this.savingMethod === saver.saveDrawingToolsToStorage) {
        window.alert("Patterns successfully saved to Storage.");
      }
    },
  },
};
</script>


<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/resets";
@import "styles/screens";

@import "./shared";

.save-button {
  justify-self: flex-start;
  align-self: flex-end;
  cursor: pointer;
  @include reset-button;

  padding: 10px 45px;

  border-radius: 8px;
  color: $white;
  background-color: $robin-egg-blue;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

.right-side {
  padding-bottom: 30px;
  @include tablet-landscape {
    padding-bottom: 0px;
  }
}
</style>
