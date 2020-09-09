<template>
    <ModalContainer @modal-close="$emit('close')">
      <template #window>
        <div class="editor--qr-preview-window">
          <CancelButton class="cancel-button-adjust" @click="$emit('close')" />
          <img class="editor--qr-preview" :src="dataURL" />
          <div class="editor--qr-save-button-container">
            <button @click="downloadPNG" class="editor--qr-save-button">Save QR</button>
          </div>
        </div>
      </template>
    </ModalContainer>
</template>

<script>
import ModalContainer from '~/components/positioned/ModalContainer.vue';
import CancelButton from "~/components/modals/CancelButton.vue";
import DrawingTool from '~/libs/DrawingTool';

import ACNLQRGenerator from '~/components/ACNLQRGenerator.vue';


/* libs */
import generateACNLQR from "~/libs/ACNLQRGenerator";

/* svg icons */
import IconBase from '~/components/icons/IconBase.vue';
import IconQRCode from '~/components/icons/IconQRCode.vue';

export default {
  name: 'QRCode',
  components: {
    ModalContainer,
    IconBase,
    IconQRCode,
    ACNLQRGenerator,
    CancelButton,
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    }
  },
  data: function() {
    const dataURL = "";
    return {
      dataURL,
    };
  },
  methods: {
    async downloadPNG(){
      if (this.dataURL === "") return;
      saveAs(this.dataURL, this.drawingTool.title + ".png");
    },
  },
  async mounted() {
    this.dataURL = await generateACNLQR(this.drawingTool);
  }
}
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/screens";
@import "styles/resets";

.editor--qr-preview-window {
  position: fixed;
  top: 15px;
  left: 50%;
  transform: translate(-50%, 0px);
  z-index: 999;
  
  
  
  @include tablet-landscape {
    @include absolute-center;
  }
}

.editor--qr-preview {
  display: block;
  object-fit: contain;
  width: 300px;
  height: 300px;
  border-width: 5px;
  border-style: solid;
  border-color: $cannon-pink;
  background-color: $cannon-pink;
  border-radius: 30px;
  
  
  @include tablet-landscape {
    width: auto;
  }
}

.editor--qr-save-button-container {
  pointer-events: none;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.editor--qr-save-button {
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