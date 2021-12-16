<template>
  <VApp class="app-container">
    <VMain>
      <div id="app">
        <router-view></router-view>
        <Banner />
        <NavigationButton/>
      </div>
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
@use "styles/colors";

/* Global app styles */
#app {
  background-color: colors.$ecru-white;
  font-family: Nunito;
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
}
</style>
