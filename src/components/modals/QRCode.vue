<template>
            <button @click="onQROpen">
              <IconBase icon-name="qr" :icon-color="brown" class="svg nav white-circle">
                <IconQRCode />
              </IconBase><!-- qr code svg -->
              Generate QR Code
            </button><!-- generate QR code button -->
      <!-- <ModalContainer v-if="qrCode" @modal-close="qrCode=false">
      <template #window><div class="modal">
        <div class="modal-header">
          <IconBase icon-name="qr" :icon-color="white" height=20 width=20>
            <IconQRCode />
          </IconBase>
          Generate QR Code(s)
        </div>
        <div class="modal-window modal-centered">
          <ACNLQRGenerator :pattern="qrCode" />
          <button @click="downPNG">Save Image</button>
        </div>
      </div></template>
    </ModalContainer> -->
</template>

<script>
    // onQROpen: function() {
    //   this.closeColorPicker();
    //   const patStr = this.drawingTool.toString();
    //   this.qrCode = patStr;
    // },
export default {
  
}
</script>