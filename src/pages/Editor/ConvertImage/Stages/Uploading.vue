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

<script>
import {
  VFileInput,
  VChip,
} from "vuetify/lib";

import colors from "@/styles/colors.scss";

export default {
  name: "Uploading",
  components: {
    VFileInput,
    VChip,
  },
  props: {
    value: {
      type: File,
      required: false,
    },
  },
  data() {
    return {
      colors,
      file: null,
    };
  },
  methods: {
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
        fileReader.readAsDataURL(this.file);
      });
      this.$emit("update:filename", filename);
      this.$emit("update:dataURL", dataURL);
      this.$emit("next");
    },
  },
  watch: {
    file() {
      this.onFileChange();
    },
  }
};
</script>