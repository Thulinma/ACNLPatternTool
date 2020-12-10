<template>
  <MarkdownStyled class="container">
    <slot></slot>
  </MarkdownStyled>
</template>

<script>
import MarkdownStyled from "~/components/MarkdownStyled.vue";

export default {
  components: { MarkdownStyled },
  name: "MarkdownPage",
};
</script>

<style lang="sass" scoped>
@use "styles/screens"

.container::v-deep
  margin: auto
  max-width: 800px
  padding: 2rem
  @include screens.tablet-portrait
    h1:first-child
      margin-top: 4rem
</style>