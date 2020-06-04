<template>
  <div id="app" :class="{
      mobile,
      desktop,
      portrait,
    }">
    <router-view></router-view>
    <ModalManager/>
    <Banner v-if="$route.path !== '/editor'" />
    <NavigationButton/>
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
      mobile: isMobile,
      desktop: !isMobile,
      windowHeight: null,
      windowWidth: null,
    };
  },
  computed: {
    portrait: function() {
      return this.windowHeight > this.windowWidth;
    }
  },
  methods: {
    onWindowResize: function() {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
    }
  },
  mounted: function() {
    this.onWindowResize();
    window.addEventListener("resize", this.onWindowResize);
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.onWindowResize);
  }
}
</script>

<style lang="scss" scoped>
#app {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>