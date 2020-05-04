<template>
  <div id=app :class="classes">
    <div class="app-background"></div>
    <Header/>
    <div class="content-wrapper">
      <router-view></router-view>
    </div>
    <Footer/>
    <ModalManager/>
  </div>
</template>

<script>
import ModalManager from '/components/ModalManager.vue';
import Header from '/components/layout/Header.vue';
import Footer from '/components/layout/Footer.vue';
import { isMobile } from '~/utils/if-env';
import bgPattern from '/assets/images/leaf-brush-pattern.svg';

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
    Header,
    Footer
  },
}
</script>

<style lang="scss" scoped>
/* Global app styles */
.app-background {
  position: absolute;
  background-image: url('/assets/images/leaf-brush-pattern.svg');
  height: 100%;
  width: 100%;
  filter: invert(1) opacity(15%);
  background-size: 500px;
  z-index: -10;
}

#app {
  min-height: 100vh;
  width: 100%;
  display: block;
  position: relative;

  .content-wrapper {
    margin-top: 50px;
    height: 100%;
    padding-bottom: 40vh;
  }
}
</style>
