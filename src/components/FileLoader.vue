<template>
  <VFileInput
    v-show="false"
    v-model="files"
    :accept="accept"
    :multiple="multiple"
    @change="onChange"
  />
</template>

<script>
import { VFileInput } from "vuetify/lib";
import { zipExts, extsToRead } from "@/libs/reader";

export default {
  name: "FileLoader",
  components: { VFileInput },
  props: {
    exts: {
      type: Array,
      required: true,
    },
  },
  data: function() {
    // single file (not in array) if not multiple
    return {
      files: null,
    };
  },
  computed: {
    accept() { return this.exts.join(","); },
    multiple() { return this.exts === zipExts; }
  },
  methods: {
    open() {
      this.$el.querySelector("input").click();
    },
    async onChange() {
      const drawingTools = await extsToRead.get(this.exts)(
        this.multiple
        ? this.files
        : [this.files]
      );;
      if (drawingTools.length === 1)
        this.$emit("load", drawingTools);
      else if (drawingTools.length > 1)
        this.$emit("load", drawingTools);
      else
        window.alert(`no pattern(s) could not be parsed`);
      this.files = null; // reset
    },
  },
};
</script>