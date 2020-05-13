<template>
  <div>
    <button @click="open!=open">
      <IconBase icon-name="qr" icon-color="#7E7261" class="svg nav white-circle">
        <IconQRCode />
      </IconBase><!-- qr code svg -->
      Generate QR Code
    </button><!-- generate QR code button -->

    <ModalContainer v-if="open" @modal-close="open=false">
      <template #window>
        <div>
          <h1>
            <IconBase icon-name="qr" :icon-color="white" height=20 width=20>
              <IconQRCode />
            </IconBase>
            Generate QR Code(s)
          </h1>

          <ACNLQRGenerator :pattern="pattern" />
          <button @click="downloadPNG">Save Image</button>
        </div>
      </template>
    </ModalContainer> 
  </div>
</template>

<script>
import ModalContainer from '/components/ModalContainer.vue';

/* libs */
import generateACNLQR from "/libs/ACNLQRGenerator";

/* svg icons */
import IconBase from '/components/icons/IconBase.vue';
import IconQRCode from '/components/icons/IconQRCode.vue';

export default {
  name: 'QRCode',
  components: {
    ModalContainer,
    IconBase,
    IconQRCode,
  },
  props: {
    drawingTool: {
      type: Object,
    }
  },
  data: function() {
    return {
      open: false,
      pattern: undefined,
    }
  },
  methods: {
    async downPNG(){
      const img = await generateACNLQR(this.drawingTool);
      saveAs(img, `${this.drawingTool.title}.png`);
    },
  },
  watch: {
    open: function() {
      this.pattern = this.drawingTool.toString();
    }
  }
}
</script>