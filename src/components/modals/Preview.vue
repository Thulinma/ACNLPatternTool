<template>
  <ModalContainer
    @modal-close="$emit('close')"
    @scroll-freeze="$emit('scroll-freeze')"
    @scroll-unfreeze="$emit('scroll-unfreeze')"
  >
    <template #window>
      <div class="editor--qr-preview-window">
        <img class="editor--qr-preview" :src="dataURL" alt="QR Code" />
        <div class="editor--qr-buttons-container">
          <button @click="downloadPNG" class="editor--qr-save-button">
            Save QR
          </button>
          <button
            v-if="drawingTool.compatMode === 'ACNH'"
            @click="gameModeInfo = true"
            class="editor--qr-info-button"
          >
            No QR Code?
          </button>
        </div>
        <CancelButton class="cancel-button-adjust" @click="$emit('close')" />
        <Info
          v-if="gameModeInfo"
          @modal-close="$emit('close')"
          @scroll-freeze="$emit('scroll-freeze')"
          @scroll-unfreeze="$emit('scroll-unfreeze')"
          @close="gameModeInfo = false"
        >
          <ACNLToACNHInfo />
        </Info>
      </div>
    </template>
  </ModalContainer>
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import CancelButton from "~/components/modals/CancelButton.vue";
import Info from "~/components/modals/Info.vue";
import ACNLToACNHInfo from "~/components/partials/ACNLToACNHInfo.vue";

import ACNLQRGenerator from "~/components/ACNLQRGenerator.vue";

/* libs */
import generateACNLQR from "~/libs/ACNLQRGenerator";
import generateACNHPBL from "~/libs/ACNHPBLGenerator";

/* svg icons */
import IconBase from "~/components/icons/IconBase.vue";
import IconQRCode from "~/components/icons/IconQRCode.vue";

export default {
  name: "Preview",
  components: {
    ModalContainer,
    IconBase,
    IconQRCode,
    ACNLQRGenerator,
    CancelButton,
    Info,
    ACNLToACNHInfo,
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    },
  },
  data: function () {
    const dataURL = "";
    return {
      dataURL,
      gameModeInfo: false,
    };
  },
  methods: {
    async downloadPNG() {
      if (this.dataURL === "") return;
      saveAs(this.dataURL, this.drawingTool.title + ".png");
    },
  },
  async mounted() {
    if (this.drawingTool.compatMode == "ACNL") {
      this.dataURL = await generateACNLQR(this.drawingTool);
    } else {
      this.dataURL = await generateACNHPBL(this.drawingTool);
    }
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/screens";
@import "styles/resets";

.editor--qr-preview-window {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: 100%;
  transform: translate(-50%, -50%);
  z-index: 999;

  @include tablet-landscape {
    @include absolute-center;
  }
}

.editor--qr-preview {
  display: block;
  border-width: 5px;
  border-style: solid;
  border-color: $cannon-pink;
  background-color: $cannon-pink;
  border-radius: 30px;

  @include tablet-landscape {
    width: auto;
  }
}

.editor--qr-buttons-container {
  pointer-events: none;
  margin-top: 30px;
  display: grid;
  justify-content: center;
  justify-items: stretch;
  align-content: center;
  align-items: center;
  row-gap: 10px;
}

.editor--qr-save-button,
.editor--qr-info-button {
  @include reset-button;
  cursor: pointer;

  border-width: 4px;
  border-style: solid;
  border-color: $tiffany-blue;
  background: $tiffany-blue;
  pointer-events: auto;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 5px 30px;
  color: white;

  &:hover {
    border-color: $turquoise;
    @include stripes($tiffany-blue, $tiffany-blue-light, 15px);
    @include moving-stripes(3s);
  }
}

.cancel-button-adjust {
  top: -5px;
  right: -5px;
}
</style>
