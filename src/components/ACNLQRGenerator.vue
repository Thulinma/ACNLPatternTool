<template>
  <img :src="image" @click="pattClick" />
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import generateACNLQR from "@/libs/ACNLQRGenerator";

@Component
export default class ACNLQRGenerator extends Vue {
  @Prop({
    type: String,
    required: true,
  }) pattern!: string;
  
  image: string = "";
  
  pattClick() {
    this.$emit("pattclick", this.pattern);
  }
  
  //Whenever pattern changes, draw it!
  @Watch('pattern')
  onPatternChange(newData: string) {
    generateACNLQR(newData).then((d) => {
      this.image = d;
    });
  }
  
  mounted() {
    generateACNLQR(this.pattern).then((d) => {
      this.image = d;
    });
  }
};
</script>

<style lang="scss" scoped>
</style>

