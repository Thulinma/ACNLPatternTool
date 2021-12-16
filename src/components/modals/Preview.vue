<template>
  <VCard elevation="0" class="card">
    <img class="preview" :src="dataURL" alt="QR Code" />
    <div class="editor--qr-buttons-container">
      <VBtn
        class="save-btn rounded-lg"
        @click="downloadPNG"
        elevation="0"
      >
        Save QR
      </VBtn>
      <VBtn
        v-if="drawingTool.compatMode === 'ACNH'"
        class="qr-info-btn rounded-lg"
        @click="gameModeInfo = true"
        elevation="0"
      >
        No QR Code?
      </VBtn>
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
  </VCard>
</template>

<script>
import { VDialog, VBtn, VCard } from "vuetify/lib";
import DrawingTool from "~/libs/DrawingTool";
import Info from "~/components/modals/Info.vue";
import ACNLToACNHInfo from "~/components/partials/ACNLToACNHInfo.vue";

import ACNLQRGenerator from "~/components/ACNLQRGenerator.vue";

/* libs */
import generateACNLQR from "~/libs/ACNLQRGenerator";
import generateACNHPBL from "~/libs/ACNHPBLGenerator";

import colors from "~/styles/colors.scss";

export default {
  name: "Preview",
  components: {
    VDialog,
    VBtn,
    VCard,
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
      colors,
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
@use "styles/overrides" as overrides;
@import "styles/colors";
@import "styles/positioning";
@import "styles/screens";
@import "styles/resets";

.card {
  background-color: transparent;
  @include relative-in-place;
}

.preview {
  display: block;
  border-width: 2px;
  border-style: solid;
  border-color: $cannon-pink;
  background-color: $cannon-pink;
  border-radius: 30px !important;
  max-width: 100%;
  max-height: 500px;
  @include phone-landscape {
    border-width: 5px;
  }
}

.editor--qr-buttons-container {
  margin-top: 30px;
  display: grid;
  justify-content: center;
  justify-items: stretch;
  align-content: center;
  align-items: center;
  row-gap: 10px;
}

.save-btn,
.qr-info-btn {
  @include overrides.v-btn($white, $robin-egg-blue);
  font-size: 1.1rem;
  border: 4px solid $robin-egg-blue;
  &:hover {
    @include stripes($tiffany-blue, $tiffany-blue-light, 20px);
    @include moving-stripes(8s);
    border: 4px solid $turquoise;
  }
}

</style>

<style lang="scss">
.qr-preview--dialog {
  box-shadow: none;
}
</style>