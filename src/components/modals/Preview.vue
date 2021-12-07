<template>
  <VCard elevation="0" class="preview--card">
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
      
      <VDialog
        v-model="gameModeInfo"
        content-class="qr-preview--dialog"
        width="auto"
      >
        <Info v-if="gameModeInfo" @close="gameModeInfo = false">
          <ACNLToACNHInfo />
        </Info>
      </VDialog>
    </div>
  </VCard>
</template>

<script>
import {
  VDialog,
  VCard,
} from "vuetify/lib";
import DrawingTool from "~/libs/DrawingTool";
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
    VDialog,
    VCard,
    IconBase,
    IconQRCode,
    ACNLQRGenerator,
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

.preview--card {
  background-color: transparent;
  position: relative;
}

.editor--qr-preview-window {
  max-width: 100%;
  z-index: 999;
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

<style lang="scss">
.qr-preview--dialog {
  box-shadow: none;
}
</style>