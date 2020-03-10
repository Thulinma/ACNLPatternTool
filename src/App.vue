<template>
  <div id=app>
    <router-view></router-view>
    <ModalManager/>
  </div>
</template>

<script>
import ModalManager from '/components/ModalManager.vue';

export default {
  name: "App",
  components: {
    ModalManager
  },
}
</script>

<style lang="scss">
@import "reset-css";

  html {
    height: 100%;
  }
  body {
    min-height: 100%;
    background-image: url('./assets/images/bg1.png');
    background-size: cover;
  }
</style>