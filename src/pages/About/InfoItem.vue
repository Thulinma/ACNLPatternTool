<template>
  <li>
    <Fragment v-if="hasLink">
      <a :href="infoItem.url">
        <VIcon class="info-item-icon" :color="infoItem.iconFill">
          {{ infoItem.icon }}
        </VIcon>
        <span>
          {{ infoItem.label }}
        </span>
      </a>
    </Fragment>
    <Fragment v-else>
      <VIcon class="info-item-icon" :color="infoItem.iconFill">
        {{ infoItem.icon }}
      </VIcon>
      <span>
        {{ infoItem.label }}
      </span>
    </Fragment>
  </li>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { VIcon } from "vuetify/lib";
import { Fragment } from "vue-fragment";

export interface InfoItemOptions {
  icon?: string,
  iconFill?: string,
  label?: string,
  url?: string,
}

@Component({
  components: {
    VIcon,
    Fragment,
  },
})
export default class InfoItem extends Vue {
  @Prop({
    type: Object,
    required: true,
  }) infoItem!: InfoItemOptions;
  
  get hasLink() {
    return Boolean(this.infoItem.url);
  }
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
  
  &:hover,
  &:active {
    text-decoration: underline;
  }
}
.info-item-icon {
  vertical-align: text-top;
}
</style>