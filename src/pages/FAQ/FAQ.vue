<template>
  <MarkdownPage>
    <FAQMarkdown />
  </MarkdownPage>
</template>


<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import MarkdownPage from "@/components/MarkdownPage.vue";
import FAQMarkdown from "./FAQ.md";

@Component({
  components: {
    MarkdownPage,
    FAQMarkdown,
  },
})
export default class FAQ extends Vue {
};
</script>
