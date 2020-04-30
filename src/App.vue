<template>
  <div id=app :class="classes">
    <Header/>
    <router-view></router-view>
    <ModalManager/>
  </div>
</template>

<script>
import ModalManager from '/components/ModalManager.vue';
import Header from '/components/layout/Header.vue';
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
    ModalManager,
    Header
  },
}
</script>

<style lang="scss" scoped>
/* Global app styles */
#app {
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
}
</style>
