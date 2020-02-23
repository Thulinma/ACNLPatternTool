<template>
  <div id="app">
    <img alt="Vue logo" v-bind:src="logo">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from '/components/HelloWorld.vue'
import logo from '/assets/logo.png';

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data: () => {
    return {
      logo: logo
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
