<template>
  <footer class="footer">
    <Banner :bannerText="'Patterns Uploaded'"/>
    <div>
      <h2>Hello World</h2>
    </div>
  </footer>
</template>

<script>
import Banner from '/components/Banner.vue';

export default {
  name: "Footer",
  data: function() {
    return {};
  },
  components: {
    Banner
  }
}
</script>

<style lang="scss" scoped>
/*
.footer {
  position: absolute;
  bottom: 0;
  height: 300px;
  width: 100%;
  overflow: hidden;

  &::before {
  border-radius: 100%;
  background-color: #f7f4e7;
  width: 148%;
  height: 100vh;
  content: "";
  position: absolute;
  margin-left: -24%;
  }
}*/
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
  }
}

</style>
