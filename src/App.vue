<template>
  <VApp class="app-container">
    <VMain>
      <div id="app" :class="{ 'scroll-froze': scrollFroze }">
        <router-view
          @scroll-freeze="scrollFreeze"
          @scroll-unfreeze="scrollUnfreeze"
        ></router-view>
        <Banner />
        <NavigationButton
          @scroll-freeze="scrollFreeze"
          @scroll-unfreeze="scrollUnfreeze"
        />
        <ModalManager />
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
import ModalManager from "./components/positioned/ModalManager.vue";
import Banner from "./components/positioned/Banner.vue";

export default {
  name: "App",
  components: {
    VApp,
    VMain,
    ModalManager,
    NavigationButton,
    Banner,
  },
  data: function () {
    return { scrollFroze: false };
  },
  methods: {
    scrollFreeze() {
      this.scrollFroze = true;
    },
    scrollUnfreeze() {
      this.scrollFroze = false;
    },
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

  &.scroll-froze {
    overflow-y: hidden;
  }
}
</style>
