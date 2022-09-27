<template>
  <VApp class="app-container">
    <VMain>
      <v-slide-x-transition mode="out-in">
        <router-view></router-view>
      </v-slide-x-transition>
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
@use "styles/colors" as colors;

.app-container {
  font-family: Nunito;
  background-color: colors.$ecru-white;
}
</style>

<style lang="scss">
@use "styles/colors" as colors;

// to cover overscroll
html {
  background-color: colors.$ecru-white;
}
</style>