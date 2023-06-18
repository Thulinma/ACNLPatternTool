<template>
  <div>
    <VFileInput
      v-model="file"
      :color="colors.oliveHaze"
      accept="image/*"
      placeholder="Image to convert..."
      prepend-icon="mdi-camera"
      truncate-length="20"
    >
      <template #selection="{ text }">
        <VChip
          :color="colors.oliveHaze"
          dark
          label
          small
        >
          {{ text }}
        </VChip>
      </template>
    </VFileInput>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import {
  VFileInput,
  VChip,
} from "vuetify/lib";

import colors from "@/styles/colors.scss";

@Component({
  components: {
    VFileInput,
    VChip,
  },
})
export default class UploadingStage extends Vue {
  
  readonly colors = colors;
  
  file: File | null = null;
  
  async onFileChange() {
    if (this.file == null)
      return;
    const filename = this.file.name.split(".")[0];
    const fileReader = new FileReader();
    const dataURL = await new Promise((resolve, reject) => {
      fileReader.onerror = () => {
        fileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.readAsDataURL(this.file as File);
    });
    this.$emit("update:filename", filename);
    this.$emit("update:dataURL", dataURL);
    this.$emit("next");
  }
  
  @Watch('file')
  onFileChanged() {
    this.onFileChange();
  }
};
</script>