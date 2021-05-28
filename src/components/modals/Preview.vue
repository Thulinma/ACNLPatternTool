<template>
  <VCard elevation="0" class="card">
    <img class="preview" :src="dataURL" alt="QR Code" />
    <div class="editor--qr-buttons-container">
      <VBtn
        class="save-btn rounded-lg"
        @click="downloadPNG"
        elevation="0"
      >
        Save {{ drawingTool.compatMode === "ACNL" ? "QR" : "PBL" }}
      </VBtn>
      <VBtn
        v-if="drawingTool.compatMode === 'ACNH'"
        class="qr-info-btn rounded-lg"
        @click="gameModeInfo = true"
        elevation="0"
      >
        No QR Code?
      </VBtn>
      <VBtn
        v-if="drawingTool.compatMode === 'ACNH'"
        class="qr-info-btn rounded-lg"
        @click="copyKeypresses"
        elevation="0"
      >
        Copy Keypress Script
      </VBtn>
    </div>

    <VDialog
      v-model="gameModeInfo"
      content-class="qr-preview--dialog rounded-xl"
      max-width="600"
      width="auto"
    >
      <VCard :color="colors.ecruWhite" >
        <VCardTitle class="info-title" >Game Mode Info</VCardTitle>
        <VCardText class="info-content">
          <ACNLToACNHInfo />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            class="cancel-btn rounded-lg"
            @click="gameModeInfo = false"
            elevation="0"
          >
            Close
          </VBtn>
        </VCardActions>
        <CancelButton @click="gameModeInfo = false"></CancelButton>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script>
import {
  VDialog,
  VBtn,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSpacer,
} from "vuetify/lib";
import CancelButton from "@/components/modals/CancelButton.vue";
import DrawingTool from "@/libs/DrawingTool";
import ACNLToACNHInfo from "@/components/partials/ACNLToACNHInfo.vue";

import ACNLQRGenerator from "@/components/ACNLQRGenerator.vue";

/* libs */
import generateACNLQR from "@/libs/ACNLQRGenerator";
import generateACNHPBL from "@/libs/ACNHPBLGenerator";
import generateACNHKeypresses from "@/libs/ACNHKeypressGenerator";

import colors from "@/styles/colors.scss";

export default {
  name: "Preview",
  components: {
    VDialog,
    VBtn,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VSpacer,
    CancelButton,
    ACNLQRGenerator,
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
    async copyKeypresses(){
      let presses = await generateACNHKeypresses(this.drawingTool);
      try {
        await navigator.clipboard.writeText(presses);
      } catch (err) {
        alert("Error! Could not copy: "+e);
      }
      alert("Commands copied!");
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
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;

.card {
  background-color: transparent;
  @include positioning.relative-in-place;
}

.preview {
  display: block;
  border-width: 2px;
  border-style: solid;
  border-color: colors.$cannon-pink;
  background-color: colors.$cannon-pink;
  border-radius: 30px !important;
  max-width: 100%;
  max-height: 500px;
  @include screens.phone-landscape {
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
  @include overrides.v-btn(colors.$white, colors.$robin-egg-blue);
  font-size: 1.1rem;
  border: 4px solid colors.$robin-egg-blue;
  &:hover {
    @include colors.stripes(colors.$tiffany-blue, colors.$tiffany-blue-light, 20px);
    @include colors.moving-stripes(8s);
    border: 4px solid colors.$turquoise;
  }
}

.info-title,
.info-content {
  color: colors.$jambalaya !important;
}

.cancel-btn {
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$olive-haze,
  );
  &:hover {
    @include colors.polkadots(colors.$olive-haze, colors.$donkey-brown);
    @include colors.moving-polkadots;
  }
}

.continue-btn {
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$robin-egg-blue,
  );
  border: 4px solid colors.$robin-egg-blue;
  &:hover {
    @include colors.stripes(colors.$tiffany-blue, colors.$tiffany-blue-light, 20px);
    @include colors.moving-stripes(8s);
    border: 4px solid colors.$turquoise;
  }
}
</style>

<style lang="scss">
.qr-preview--dialog {
  box-shadow: none;
}
</style>