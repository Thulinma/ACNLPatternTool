<template>
  <div id="app">
    <Header
      :primary-nav="HeaderData.primaryItems"
      :secondary-nav="HeaderData.secondaryItems"
      :museum-info="HeaderData.museumInfo"
      :has-search="HeaderData.hasSearch"
      :force-on-dark="HeaderData.forceOnDark"
      :baseUrl="'https://www.getty.edu'"
    />
    <Hero name="Content" :data="heroData" />
    <section>
      <div class="container">
        <router-view></router-view>
      </div>
    </section>
    <Footer
      :baseUrl="'https://www.getty.edu'"
      :primary-nav="FooterData.primaryNavigation"
      :museum-info="FooterData.museumInfo"
      :nav-grid="FooterData.navGrid"
      :social="FooterData.social"
      :social-all-link="FooterData.socialAllLink"
    />
  </div>
</template>

<script>
import "@thegetty/getty-ui/dist/getty-ui.css";
import HeaderData from "@thegetty/getty-ui/src/components/globals/header/data.json";
import FooterData from "@thegetty/getty-ui/src/components/globals/footer/data.json";
import { Header, Footer, Hero, RichText } from "@thegetty/getty-ui";
export default {
  name: "App",
  components: {
    Header,
    Hero,
    Footer
  },
  data: function() {
    return {
      HeaderData: HeaderData,
      FooterData: FooterData,
      heroData: {
        title: "Animal Crossing: Getty Images",
        backgroundColor: "garden"
      }
    };
  }
};
</script>

<style lang="scss">
.o-hero--content .o-hero__inner {
  padding-top: inherit !important;
  height: inherit !important;
}
</style>
