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

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Fragment } from "vue-fragment";
import { VFileInput } from "vuetify/lib";
import { zipExts, extsToRead } from "@/libs/reader";
import { read } from "@/libs/reader";

@Component({
  components: {
    VFileInput,
    Fragment,
  },
})
export default class FileLoader extends Vue {
  $refs!: { files: Vue; }
  
  @Prop({
    type: Array,
    required: true,
  }) readonly exts!: string[];
  
  files: File | File[] | null = null;
  
  get accept() { return this.exts.join(","); }
  
  get multiple() { return this.exts === zipExts; }
  
  /** Forcefully opens the browser file dialog. */
  open() {
    (
      this.$refs.files.$el
        .querySelector("input") as HTMLInputElement
    )
    .click();
  }
  
  async onChange() {
    const drawingTools = await (extsToRead.get(this.exts) as read)((
      this.multiple
      ? this.files
      : [this.files]
    ) as File[]);
    this.$emit("load", drawingTools);
    this.files = null; // reset
  }
};
</script>