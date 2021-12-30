<template>
  <VApp class="app-container">
    <VMain>
      <router-view></router-view>
      <Banner />
      <NavigationButton/>
    </VMain>
  </VApp>
</template>

<script>
import {
  VApp,
  VMain,
} from "vuetify/lib";

import NavigationButton from "./components/positioned/NavigationButton.vue";
import Banner from "./components/positioned/Banner.vue";

export default {
  name: "App",
  components: {
    VApp,
    VMain,
    NavigationButton,
    Banner,
  },
  data: function () {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.app-container { font-family: Nunito; }
</style>