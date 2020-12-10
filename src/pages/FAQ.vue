<template>
  <MarkdownPage>
    <FAQMarkdown />
  </MarkdownPage>
</template>


<script>
import MarkdownPage from "~/components/MarkdownPage.vue";
import FAQMarkdown from "./FAQ.md";

export default {
  name: "FAQ",
  components: {
    MarkdownPage,
    FAQMarkdown,
  },
};
</script>
