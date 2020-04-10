<template>
  <div>
    <input class="iiif-input" placeholder="IIIF Url Goes Here" />
  </div>
</template>

<script>
export default {
  name: "UrlInput",
  props: {},
  data: function() {
    return {};
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.iiif-input {
  width: 80%;
  margin: 1em;
}
</style>
