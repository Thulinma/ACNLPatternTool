<template>
  <VListItem
    v-if="item.onSelect"
    class="list-item"
    link
    @click="item.onSelect"
  >
    <VListItemTitle>
      {{item.label}}
    </VListItemTitle>
  </VListItem>
  
  <FileLoader
    v-else-if="item.onLoad"
    :exts="item.exts"
    @load="item.onLoad"
  >
    <template #activator="{ on }">
      <VListItem
        class="list-item"
        link
        v-on="on"
      >
        <VListItemTitle>
          {{item.label}}
        </VListItemTitle>
      </VListItem>
    </template>
  </FileLoader>

  <FileLoaderCollection
    v-else
    @load="item.onLoadCollection"
  >
    <template #activator="{ on }">
      <VListItem
        class="list-item"
        link
        v-on="on"
      >
        <VListItemTitle>
          {{item.label}}
        </VListItemTitle>
      </VListItem>
    </template>
  </FileLoaderCollection>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { VListItem, VListItemTitle } from "vuetify/lib";
import FileLoader from "@/components/wrapper/FileLoader.vue";
import FileLoaderCollection from "@/components/wrapper/FileLoaderCollection.vue";

export type MenuItem = { label: string } & ({
  onSelect: Function,
} | {
  exts: string[],
  onLoad: Function,
} | {
  onLoadCollection: Function,
});

@Component({
  components: {
    VListItem,
    VListItemTitle,
    FileLoader,
    FileLoaderCollection,
  },
})
export default class ImportMenuItem extends Vue {
  @Prop({
    type: Object,
    required: true,
  }) item!: MenuItem;
}
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/overrides" as overrides;


.list-item {
  @include overrides.v-list-item(
    colors.$ecru-white,
    colors.$olive-haze,
    colors.$jambalaya,
  ) { font-size: 1.1rem; };
}

</style>