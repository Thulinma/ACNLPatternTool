<template>
  <div class="cropping--container">
    <div
      :class="{
        'cropping--cropper': true,
        loaded: dataURL != null,
      }"
    >
      <Cropper
        v-if="dataURL != null"
        class="cropping--cropper"
        backgroundClassname="cropping--cropper-background"
        ref="cropper"
        :src="dataURL"
        :stencilProps="{ aspectRatio: aspectRatio }"
      />
    </div>

    <div class="cropping--buttons">
      <button
        v-if="dataURL != null"
        class="cropping--button cropping--button--advanced"
        @click="showAdvanced = !showAdvanced"
      >
        <span>Tiling Mode</span>
        <IconChevronDown
          :class="{
            'cropping--advanced-expand-icon': true,
            active: showAdvanced,
          }"
        />
      </button>
      <button
        class="cropping--button cropping--button--upload"
        @click="$refs.inputFiles.click()"
      >
        Upload Image
      </button>
      <button
        v-if="dataURL != null"
        class="cropping--button cropping--button--next"
        @click="onNext"
      >
        Next
      </button>
    </div>

    <div v-show="showAdvanced && dataURL != null" class="cropping--size-inputs">
      <div class="cropping--size-input">
        <input
          :value="rows"
          type="range"
          min="1"
          max="9"
          step="1"
          @input="onRowsInput"
        />
        <div class="cropping--manual-size-input">
          <span>Rows:</span>
          <input :value="rows" type="number" min="1" @input="onRowsInput" />
        </div>
      </div>
      <div class="cropping--size-input">
        <input
          :value="columns"
          type="range"
          min="1"
          max="9"
          step="1"
          @input="onColumnsInput"
        />
        <div class="cropping--manual-size-input">
          <div>Columns:</div>
          <input
            :value="columns"
            type="number"
            min="1"
            @input="onColumnsInput"
          />
        </div>
      </div>
    </div>

    <!-- to trigger file dialog -->
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
import { Cropper } from "vue-advanced-cropper";
import DrawingTool from "~/libs/DrawingTool";
import IconChevronDown from "~/components/icons/IconChevronDown.vue";

export default {
  name: "Cropping",
  components: {
    Cropper,
    IconChevronDown,
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
      // new stuff
      showAdvanced: false,
    };
  },
  computed: {
    aspectRatio() {
      return this.columns / this.rows;
    },
  },
  methods: {
    onRowsInput(event) {
      let rows = Number(event.target.value);
      this.$forceUpdate();
      if (Number.isNaN(rows)) return;
      if (!Number.isInteger(rows)) return;
      if (rows <= 0) return;
      this.$emit("update:rows", rows);
    },
    onColumnsInput(event) {
      let columns = Number(event.target.value);
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


<style lang="scss">
// can't scope style here or everything breaks lmao
@import "styles/colors";
@import "styles/resets";
@import "styles/screens";

.cropping--container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: center;
  justify-items: stretch;

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
    padding: 35px 35px 30px 35px;
  }
  @include desktop {
  }
  @include desktop-hd {
  }
}

.cropping--cropper {
  @include polkadots($olive-haze, $donkey-brown);
  @include moving-polkadots(2s);
  border-radius: 5px;
  min-width: 250px;
  min-height: 250px;
  justify-self: stretch;
  overflow: hidden;

  max-height: 300px;

  display: flex;
  justify-content: center;
  justify-items: center;
  align-content: center;

  &.loaded {
    min-height: auto;
  }

  // for copy/pasting
  @include phone-landscape {
    max-width: 100%;
    max-height: 300px;
  }
  @include tablet-portrait {
    max-width: 100%;
    max-height: 300px;
  }
  @include tablet-landscape {
    max-width: 100%;
    max-height: 300px;
  }
  @include desktop {
    max-width: 100%;
    max-height: 380px;
  }
  @include desktop-hd {
    max-width: 100%;
    max-height: 400px;
  }
}

.cropping--cropper-background {
  background-color: transparent;
}

.cropping--image-select {
  display: none;
}

.cropping--buttons {
  display: grid;
  grid-template-areas:
    "upload"
    "next"
    "advanced";
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

  @include phone-landscape {
  }
  @include tablet-portrait {
    grid-template-areas: "advanced upload next";
    grid-template-columns: 1fr 1fr 1fr;
    justify-items: auto;
    column-gap: 20px;
  }
  @include tablet-landscape {
  }
  @include desktop {
  }
  @include desktop-hd {
  }
}

.cropping--buttons {
  .cropping--button {
    @include reset-button;

    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    align-content: center;

    color: white;
    background-color: $olive-haze;
    font-size: 0.9rem;
    font-weight: 600;

    text-align: center;

    padding: 10px 0px;

    border-radius: 10px;
    &:hover {
      cursor: pointer;
    }

    &.cropping--button--upload {
      grid-area: upload;
    }

    &.cropping--button--next {
      background-color: $robin-egg-blue;
    }

    @include phone-landscape {
    }
    @include tablet-portrait {
      min-width: 150px;
    }
    @include tablet-landscape {
    }
    @include desktop {
    }
    @include desktop-hd {
    }
  }
}

.cropping--advanced-expand-icon {
  display: inline-block;
  vertical-align: center;
  margin-left: 10px;
  fill: white;
  width: 16px;

  &.active {
    transform: rotate(180deg);
  }
}

.cropping--size-inputs {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: auto;
  grid-template-rows: auto;
  grid-auto-rows: auto;
  column-gap: 20px;
  row-gap: 30px;

  margin-top: 30px;

  @include tablet-portrait {
    grid-template-columns: 1fr;
  }
}

.cropping--size-input {
  display: grid;
  grid-template-columns: auto;
  grid-auto-columns: auto;
  grid-template-rows: auto;
  grid-auto-rows: auto;

  row-gap: 15px;
}

.cropping--manual-size-input {
  background-color: $albescent-white;
  color: $jambalaya;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 1rem;
  line-height: normal;
  font-weight: 600;

  display: grid;
  grid-template-columns: auto 1fr;
  grid-auto-columns: auto;
  grid-template-rows: auto;
  grid-auto-rows: auto;
  justify-content: space-between;
  align-self: center;
  align-content: center;
  column-gap: 20px;

  & > input {
    @include reset-input;
    font-size: 1rem;
    color: $jambalaya;
    text-align: center;
    background-color: $ecru-white;

    border-radius: 5px;
    font-weight: 600;
  }
}
</style>