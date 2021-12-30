<template>
  <div class="page">
    <MarkdownStyled class="container">
      <slot></slot>
    </MarkdownStyled>
  </div>
</template>

<script>
import MarkdownStyled from "@/components/MarkdownStyled.vue";

export default {
  components: { MarkdownStyled },
  name: "MarkdownPage",
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/screens" as screens;

.page {
  background-color: colors.$ecru-white;
  color: colors.$jambalaya;
}

.container::v-deep {
  max-width: 800px;
  padding: 2rem;
  @include screens.tablet-portrait {
    h1:first-child { margin-top: 4rem; }
  }
}
</style>