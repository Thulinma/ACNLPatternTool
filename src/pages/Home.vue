<template>
  <div class="home-nav-wrapper">
    <div class="home-nav">
      <div class="nav-item" v-for="item in navItems" :key="item.name">
        <div class="nav-item-img">
          <img :src="item.image" />
        </div>
        <p class="nav-item-text">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import logoSvg from '/assets/images/ac_easel_opt.svg';
export default {
  name: "Home",
  data: function(){
    return {
      logoSvg,
      navItems: [
        { name: 'Updates', image: '' },
        { name: 'Browse', image: '' },
        { name: 'Editor', image: '' },
        { name: 'FAQ', image: '' },
        { name: 'Discord', image: '' },
      ]
    };
  },
  methods: {
    goToBrowse: function() {
      this.$router.push({ path: `/browse` });
    },
    goToEditor: function() {
      this.$router.push({ path: `/editor` });
    },
    goToFAQ: function() {
      this.$router.push({ path: `/faq` });
    },
    goToChanges: function() {
      this.$router.push({ path: `/changelog` });
    },
  }
}
</script>

<style lang="scss" scoped>
</style>
