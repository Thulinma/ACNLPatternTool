<template>
    <ModalContainer @modal-close="$emit('close')">
      <template #window>
        <div class="editor--qr-preview-window">
          <ACNLQRGenerator class="editor--qr-preview" :pattern="drawingTool.toString()" />
          <div class="editor--qr-save-button-container">
            <button @click="downloadPNG" class="editor--qr-save-button">Save QR</button>
          </div>
        </div>
      </template>
    </ModalContainer>
</template>

<script>
import DrawingTool from '~/libs/DrawingTool';
import ModalContainer from '~/components/positioned/ModalContainer';
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
  },
  props: {
    drawingTool: {
      type: DrawingTool,
      required: true,
    }
  },
  data: function() {
    return {
      qrImageSrc: "",
    }
  },
  methods: {
    async downloadPNG(){
      const img = await generateACNLQR(this.drawingTool);
      saveAs(img, this.drawingTool.title + ".png");
    },
  }
}
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";

.editor--qr-preview-window {
  @include absolute-center;
  z-index: 999;
}

.editor--qr-preview {
  display: block;
  height: 300px;
  border-width: 5px;
  border-style: solid;
  border-color: $cannon-pink;
  border-radius: 30px;
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
  @include reset-button-properties;
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
    @include tiffany-stripes(15px);
    @include moving-stripes(3s);
  }
}
</style>