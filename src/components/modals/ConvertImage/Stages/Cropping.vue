<template>
  <div class="stage">
    <Cropper
      v-if="dataURL != null"
      class="cropping--cropper"
      backgroundClass="cropping--cropper-background"
      ref="cropper"
      :src="dataURL"
      :stencilProps="{ aspectRatio: aspectRatio }"
    />
    <div class="btns">
      <VBtn
        v-if="dataURL"
        class="tile-btn rounded-lg"
        elevation="0"
        @click="showAdvanced = !showAdvanced"
      >
        <VIcon v-if="!showAdvanced" left>mdi-eye-off</VIcon>
        <VIcon v-else left>mdi-eye</VIcon>
        <span>Tiling Options</span>
      </VBtn>

      <VBtn
        class="upload-btn rounded-lg"
        elevation="0"
        @click="$refs.inputFiles.click()"
      >
        Upload Image
      </VBtn>

      <VBtn
        v-if="dataURL != null"
        class="next-btn rounded-lg"
        elevation="0"
        @click="onNext"
      >
        Next
      </VBtn>
    </div>

    <div v-if="showAdvanced && dataURL != null" class="tiling-controls">
      <VSlider
        class="slider"
        :min="1"
        :max="12"
        :value="rows"
        @input="onRowsInput"
        :color="colors.oliveHaze"
        :track-color="colors.oliveHaze"
        :thumb-color="colors.oliveHaze"
        :thumb-label="false"
        ticks="always"
        :tick-size="4"
        dense
      />
      <VTextField
        class="text-field"
        label="Rows"
        type="number"
        style="test"
        min="1"
        :value="rows"
        @input="onRowsInput"
        hint="The number of pattern rows to split the image into."
        outlined
        persistent-hint
      />
      <VSlider
        class="slider"
        :min="1"
        :max="12"
        :value="columns"
        @input="onColumnsInput"
        :color="colors.oliveHaze"
        :track-color="colors.oliveHaze"
        :thumb-color="colors.oliveHaze"
        :thumb-label="false"
        ticks="always"
        :tick-size="4"
        dense
      />
      <VTextField
        class="text-field"
        label="Columns"
        type="number"
        style="test"
        min="1"
        :value="columns"
        @input="onColumnsInput"
        hint="The number of pattern columns to split the image into."
        outlined
        persistent-hint
      />
    </div>

    <input
      class="cropping--image-select"
      type="file"
      ref="inputFiles"
      accept="image/*"
      @change="onFileChange"
    />
  </div>
</template>


<script>
import { VIcon, VBtn, VSlider, VTextField } from "vuetify/lib";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

import colors from "~/styles/colors.scss";

export default {
  name: "Cropping",
  components: {
    VIcon,
    VBtn,
    VSlider,
    VTextField,
    Cropper,
  },
  props: {
    dataURL: {
      type: [String, null],
      required: false,
    },
    rows: {
      type: Number,
      required: true,
    },
    columns: {
      type: Number,
      required: true,
    },
  },
  data: function () {
    return {
      colors,
      showAdvanced: false,
    };
  },
  computed: {
    aspectRatio() {
      return this.columns / this.rows;
    },
  },
  methods: {
    onRowsInput(value) {
      const rows = Number(value);
      this.$forceUpdate();
      if (Number.isNaN(rows)) return;
      if (!Number.isInteger(rows)) return;
      if (rows <= 0) return;
      this.$emit("update:rows", rows);
    },
    onColumnsInput(value) {
      const columns = Number(value);
      this.$forceUpdate();
      if (Number.isNaN(columns)) return;
      if (!Number.isInteger(columns)) return;
      if (columns <= 0) return;
      this.$emit("update:columns", columns);
    },
    onNext(event) {
      const { canvas: croppedCanvas } = this.$refs.cropper.getResult();
      this.$emit("next", croppedCanvas);
    },
    async onFileChange(event) {
      if (event.target.files.length <= 0) return;
      const fileReader = new FileReader();
      const dataURL = await new Promise((resolve, reject) => {
        fileReader.onerror = () => {
          fileReader.abort();
          reject(new DOMException("Problem parsing input file."));
        };
        fileReader.onload = () => {
          resolve(fileReader.result);
        };
        const file = event.target.files[0];
        const filename = file.name.split(".")[0];
        this.$emit("update:filename", filename);
        fileReader.readAsDataURL(file);
      });
      this.$emit("update:dataURL", dataURL);
    },
  },
};
</script>


<style lang="scss" scoped>
// can't scope style here or everything breaks lmao
@use "styles/overrides" as overrides;
@use "styles/colors" as colors;
@use "styles/screens" as screens;

.stage {
  padding: 0px 24px 24px 24px;
  max-width: 250px;
  @include screens.phone-landscape {
    max-width: 350px;
  }
  @include screens.tablet-portrait {
    max-width: 500px;
  }
  @include screens.desktop {
    max-width: 600px;
  }
  @include screens.desktop-hd {
    max-width: 695px;
  }
}

.cropping--cropper {
  @include colors.polkadots(colors.$olive-haze, colors.$donkey-brown);
  @include colors.moving-polkadots(2s);
  border-radius: 5px;
  max-width: 100%;
  min-height: 250px;
  justify-self: stretch;
  overflow: visible;

  max-height: 300px;

  display: flex;
  justify-content: center;
  justify-items: center;
  align-content: center;

  &.loaded {
    min-height: auto;
  }

  // for copy/pasting
  @include screens.phone-landscape {
    max-width: 100%;
    max-height: 300px;
  }
  @include screens.tablet-portrait {
    max-width: 100%;
    max-height: 300px;
  }
  @include screens.tablet-landscape {
    max-width: 100%;
    max-height: 300px;
  }
  @include screens.desktop {
    max-width: 100%;
    max-height: 380px;
  }
  @include screens.desktop-hd {
    max-width: 100%;
    max-height: 400px;
  }
}

.cropping--image-select {
  display: none;
}

.btns {
  display: grid;
  grid-template-areas:
    "upload"
    "next"
    "tile";
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-auto-columns: auto;
  grid-auto-rows: auto;
  grid-auto-flow: row;
  column-gap: 10px;
  row-gap: 10px;

  margin-top: 25px;

  justify-content: space-between;
  justify-items: stretch;
  align-content: center;

  @include screens.tablet-portrait {
    grid-template-areas: "tile upload next";
    grid-template-columns: 1fr 1fr 1fr;
    justify-items: auto;
    column-gap: 20px;
  }
}

.tile-btn {
  grid-area: tile;
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$olive-haze
  );
  &:hover {
    @include colors.polkadots(
      colors.$olive-haze,
      colors.$donkey-brown
    );
    @include colors.moving-polkadots;
  }
}
.upload-btn {
  grid-area: upload;
  @include overrides.v-btn(
    colors.$ecru-white,
    colors.$olive-haze
  );
  &:hover {
    @include colors.polkadots(
      colors.$olive-haze,
      colors.$donkey-brown
    );
    @include colors.moving-polkadots;
  }
}
.next-btn {
  grid-area: next;
  @include overrides.v-btn(colors.$white, colors.$robin-egg-blue);
  &:hover {
    @include colors.stripes(
      colors.$tiffany-blue,
      colors.$tiffany-blue-light,
      20px
    );
    @include colors.moving-stripes(8s);
    border: 4px solid colors.$turquoise;
  }
}

.tiling-controls {
  margin-top: 10px;
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr 1fr;
  row-gap: 0px;
  column-gap: 15px;
}

.slider::v-deep {
  .v-slider__thumb-container--active {
    .v-slider__thumb:before {
      transform: scale(1.2) !important;
    }
  }
}

.text-field {
  @include overrides.v-text-field(
    colors.$jambalaya,
    colors.$ecru-white,
    colors.$olive-haze
  );
}
</style>

<style lang="scss">
.cropping--cropper {
  .vue-simple-handler {
    border: 1px solid black;
  }
  .cropping--cropper-background {
    background-color: transparent;
  }
}
</style>