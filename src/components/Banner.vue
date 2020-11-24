<template>
  <div class="banner">
    <span class="banner-content">{{ bannerText }}</span>
  </div>
</template>

<script>
export default {
  name: "Banner",
  props: {
    bannerText: String,
  },
  data: function () {
    return {};
  },
};
</script>

<style lang="scss" scoped>
$primary-banner-color: #f4c2c8;
$banner-flag-color: #f1a8b2;

.banner {
  position: absolute;
  display: block;
  width: 250px;
  height: 50px;
  border: 1px solid $primary-banner-color;
  text-align: center;
  color: white;
  background: $primary-banner-color;
  font-size: 17pt;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -113px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    left: -40px;
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
    right: -40px;
    border-left: 20px solid $banner-flag-color;
    border-right: 30px solid transparent;
  }

  .banner-content {
    z-index: 1;
  }
}
</style>
