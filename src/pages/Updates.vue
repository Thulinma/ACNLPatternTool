<template>
  <MarkdownPage>
    <UpdatesMarkdown />
  </MarkdownPage>
</template>


<script>
import MarkdownPage from "~/components/MarkdownPage.vue";
import UpdatesMarkdown from "./Updates.md";

export default {
  name: "Changelog",
  components: {
    MarkdownPage,
    UpdatesMarkdown,
  }
};
</script>