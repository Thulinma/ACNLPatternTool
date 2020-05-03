<template>
  <div class="banner">
    <span class="banner-content">{{ bannerText }}</span>
  </div>
</template>

<script>
export default {
  name: "Banner",
  props: {
    bannerText: String
  },
  data: function() {
    return {
      bannerText: ''
    };
  },
}
</script>

<style lang="scss" scoped>
$primary-banner-color: #f4c2c8;
$banner-flag-color: #f1a8b2;

.banner {
  position: absolute;
  left: 50%;
  display: block;
  margin: 100px -200px;
  width: 400px;
  height: 50px;
  border: 1px solid $primary-banner-color;
  text-align: center;
  color: white;
  background: $primary-banner-color;

  &::before, &::after {
    content: '';
    position: absolute;
    z-index: -1;
    left: -65px;
    top: 7px;
    display: block;
    width: 40px;
    height: 0px;
    border: 26px solid $banner-flag-color;
    border-right: 20px solid $banner-flag-color;
    border-bottom-color: $banner-flag-color;
    border-left-color: transparent;
  }

  &::after {
    left: auto;
    right: -70px;
    border-left: 20px solid $banner-flag-color;
    border-right: 30px solid transparent;
  }

  .banner-content {
    z-index: 1;
  }
}
</style>
