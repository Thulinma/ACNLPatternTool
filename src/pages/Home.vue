<template>
  <div class="dummy-nav">
    <div class="dummy" @click="goToBrowse">
      <div class="text">Browse</div>
    </div>
    <div class="dummy" @click="goToEditor">
      <div class="text">Editor</div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToBrowse: function() {
      this.$router.push({ path: `/browse` });
    },
    goToEditor: function() {
      this.$router.push({ path: `/editor` });
    },
  }
}
</script>

<style lang="scss" scoped>
.dummy-nav {
  height: 100%;
  font-family: Nunito;
  color: white;
}

.dummy {
  position: relative;
  cursor: pointer;
  width: 50%;
  height: 100%;
  box-sizing: border-box;
}

.dummy:nth-child(1) {
  float: left;
  background-color: #f16060;
}

.dummy:nth-child(2) {
  float: right;
  background-color: #1083cd;
}

.text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}
</style>