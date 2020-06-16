<template>
  <footer class="footer">
    <Banner :bannerText="'Patterns Uploaded'"/>
    <div>
      <h2>Patterns Uploaded</h2>
    </div>
  </footer>
</template>

<script>
import Banner from '/components/Banner.vue';

export default {
  name: "Footer",
  data: function() {
    return {
      numberOfPatternsUploaded: 1000000
    };
  },
  components: {
    Banner
  }
}
</script>

<style lang="scss" scoped>
footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  background: #f7f4e7;
  height: 25vh;
  z-index: 0;
  display: flex;
  justify-content: center;

  @include media("<large") {
    height: 15vh;
  }

  &::before {
    content: '';
    background: #f7f4e7;
    width: 200%;
    position: absolute;
    left: 50%;
    top: -36%;
    transform: translateX(-50%);
    height: 490%;
    border-radius: 50%;
    z-index: -1;

    @include media("<large") {
      border-radius: 0;
    }
  }

  .banner {
    @include media("<large") {
      margin-top: -85px;
    }
  }

}

</style>
