<template>
  <div id=app :class="classes">
    <router-view></router-view>
    <ModalManager/>
  </div>
</template>

<script>
import ModalManager from '/components/ModalManager.vue';
import { isMobile } from '~/utils/if-env';

export default {
  name: "App",
  data: function() {
    return {
      classes: {
        mobile: isMobile,
        desktop: !isMobile
      }
    };
  },
  components: {
    ModalManager
  },
}
</script>

<style lang="scss" scoped>
#app {
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
}
</style>