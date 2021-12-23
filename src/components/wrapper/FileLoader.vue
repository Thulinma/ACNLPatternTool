<template>
  <Fragment>
    <VFileInput
      v-show="false"
      v-model="files"
      ref="files"
      :accept="accept"
      :multiple="multiple"
      @change="onChange"
    />
    <slot name="activator" :on="{ click: open }">
    </slot>
  </Fragment>
</template>

<script>
import { Fragment } from "vue-fragment";
import { VFileInput } from "vuetify/lib";
import { zipExts, extsToRead } from "@/libs/reader";

export default {
  name: "FileLoader",
  components: {
    VFileInput,
    Fragment,
  },
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
      this.$refs.files.$el.querySelector("input").click();
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