<template>
  <div id="mural-patterns">
    <!-- <button @click="picksToLocal">Store All in Storage</button>
    <button @click="zipPicksAsACNL">Download ACNL Files as .zip File</button>
    <button @click="zipPicksAsPNG">Download QR Codes as .zip File</button>
    <button @click="zipPicksAsBoth">Download ACNL + QR as .zip File</button>
    <PatternIcon
      v-for="(opt, idx) in mural.patterns"
      :key="idx"
      width=150 height=150 text="true" decoration="true"
      @pattclick="pickPattern"
      :pattern="opt" 
    /> -->
  </div>
</template>

<script>
// import PatternIcon from '~/components/partials/PatternIcon.vue';

export default {
  name: 'MuralPatterns',
  components: {
    // PatternIcon
  },
  props: {

  },
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped>
@import "styles/colors";

#mural-patterns {
  background-color: $ecru-white;
  border-radius: 45px;
  color: $domino;
  min-height: 620px;
  margin: 50px auto;
  padding: 20px 25px;
  width: 850px;

  display: inline-block;
  position: relative;
  top: 0;
  left: 50%;

  transform: translate(-50%, 0%);
  z-index: 999;

  button {
    background-color: $tiffany-blue;
    border: none;
    border-radius: 12px;
    color: $ecru-white;
    cursor: pointer;
    font-weight: 800;
    font-size: 18px;
    padding: 10px 14px;
    margin: 20px 0;
  }
  
  h1 {
    line-height: 32px;
    width: 100%;
    margin: 0 0 8px 0;

    display: flex;
    align-items: center;
    justify-content: center;

    .image-loader--header-icon {
      background-color: $salmon;
      border-radius: 8px;
      padding: 5px;
      margin: 0 12px 0 0;

      fill: $domino;
      width: 30px;
      height: 30px;
    }
  }
}
</style>
