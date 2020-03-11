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

<style lang="scss" scoped>
#app {
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
}
</style>