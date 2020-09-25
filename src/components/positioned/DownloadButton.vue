<template>
  <ModalContainer @modal-close="$emit('close')">
    <template #window>
      <div class="window">
        <button class="download-button" @click="download">
          Open {{ toDownload.filename }}
        </button>
      </div>
    </template>  
  </ModalContainer>
</template>

<script>
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import { saveAs } from "file-saver";

export default {
  name: "Download",
  components: {
    ModalContainer
  },
  props: {
    toDownload: {
      type: Object,
      required: true,
      default: () => ({ content: "", filename: "Empty File" }),
    }
  },
  methods: {
    download() {
      saveAs(this.toDownload.content, this.toDownload.filename);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/resets";

.window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  
  width: auto;
  padding: 5px;
  border-radius: 5px;
  background-color: $ecru-white;
}

.download-button {
  @include reset-button;
  background-color: $olive-haze;
  color: $ecru-white;
  padding: 10px 15px;
  font-weight: 600;
  border-radius: 3px;
  
  &:hover {
    cursor: pointer;
  }
}
</style>