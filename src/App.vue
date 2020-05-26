<template>
  <div id="app" :class="classes">
    <router-view></router-view>
    <Banner />
    <NavigationButton/>
    <ModalManager/>
  </div>
</template>

<script>
import NavigationButton from '~/components/positioned/NavigationButton.vue';
import ModalManager from '~/components/positioned/ModalManager.vue';
import Banner from '~/components/positioned/Banner.vue';
import { isMobile } from '~/utils/if-env';

export default {
  name: "App",
  components: {
    ModalManager,
    NavigationButton,
    Banner
  },
  data: function() {
    return {
      classes: {
        mobile: isMobile,
        desktop: !isMobile
      }
    };
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