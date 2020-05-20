<template>
  <div id="app" :class="classes">
    <router-view></router-view>
    <NavigationButton/>
    <ModalManager/>
  </div>
</template>

<script>
import NavigationButton from '~/components/positioned/NavigationButton.vue';
import ModalManager from '~/components/positioned/ModalManager.vue';
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
    NavigationButton
  },
}
</script>

<style lang="scss" scoped>
.app {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>