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

<script>
import { VIcon } from "vuetify/lib";
import { Fragment } from "vue-fragment";

export default {
  components: {
    VIcon,
    Fragment,
  },
  props: {
    infoItem: {
      type: Object,
      required: true,
    },
  },
  computed: {
    hasLink() {
      return this.infoItem.url;
    },
  },
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