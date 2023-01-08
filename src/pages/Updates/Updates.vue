<template>
  <MarkdownPage>
    <UpdatesMarkdown />
  </MarkdownPage>
</template>


<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import MarkdownPage from "@/components/MarkdownPage.vue";
import UpdatesMarkdown from "./Updates.md";

@Component({
  name: "Changelog",
  components: {
    MarkdownPage,
    UpdatesMarkdown,
  },
})
export default class Updates extends Vue {};
</script>