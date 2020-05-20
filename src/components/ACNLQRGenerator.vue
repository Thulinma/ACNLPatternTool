<template>
  <img :src="image" @click="pattClick" />
</template>

<script>
import generateACNLQR from "/libs/ACNLQRGenerator";

export default {
  name: "ACNLQRGenerator",
  props: {
    pattern: {
      type: String,
      required: true
    }
  },
  data: function(){return {image:""};},
  watch: {
    //Whenever pattern changes, draw it!
    pattern (newData, oldData) {
      generateACNLQR(newData).then((d)=>{this.image=d;});
    }
  },
  mounted: function(){
    generateACNLQR(this.pattern).then((d)=>{this.image=d;});
  },
  methods: {
    pattClick(){
      this.$emit('pattclick', this.pattern);
    }
  }
}
</script>

<style lang="scss" scoped>
img {
  padding: 15px;
}
</style>

