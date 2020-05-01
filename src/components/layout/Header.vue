<template>
  <header class="header">
    <div class="brand">
      <span>ACPatterns</span>
    </div>
    <div class="nav">
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  data: function() {
    return {};
  },
}
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  margin-top: 30px;
  display: flex;
  justify-content: space-between;

  .brand {
    background-color: #f1a8b2;
    font-size: 17pt;
    padding: 15px 30px;
    color: white;
  }
}
</style>
