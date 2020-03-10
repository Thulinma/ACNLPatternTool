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
</style>