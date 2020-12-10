<template>
  <div class="container">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "StyledMarkdown",
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;

.container::v-deep {
  font-weight: 400;
  
  ul,
  ol {
    padding-left: 1.2em;
  }
  strong {
    font-weight: 600;
  }

  ul {
    list-style-type: disc;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 2.1rem;
    padding-bottom: 0.3rem;
    font-weight: 400;
    line-height: 1.25;
  }

  h1 {
    font-size: 1.9rem;
  }

  h2 {
    font-size: 1.65rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid colors.$soapstone;
  }

  h3 {
    font-size: 1.35rem;
  }

  a.header-anchor {
    font-size: 0.85em;
    float: left;
    margin-left: -0.87em;
    padding-right: 0.23em;
    margin-top: 0.125em;
    opacity: 0;

    &:hover {
      text-decoration: none;
    }
  }

  code,
  kbd,
  .line-number {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
      monospace;
  }

  p,
  ul,
  ol {
    margin-block-start: 1em;
    margin-block-end: 1em;
    line-height: 1.7;
  }

  hr {
    border: 0;
    border-top: 1px solid colors.$robin-egg-blue;
  }

  table {
    border-collapse: collapse;
    margin: 1rem 0;
    display: block;
    overflow-x: auto;
  }

  tr {
    border-top: 1px solid #dfe2e5;

    &:nth-child(2n) {
      background-color: #f6f8fa;
    }
  }

  th,
  td {
    border: 1px solid #dfe2e5;
    padding: 0.6em 1em;
  }

  img {
    max-width: 100%;
    max-height: 400px;

    &.centered {
      position: relative;
      transform: translate(-50%, 0px);
      left: 50%;
    }

    &.small {
      max-width: 300px;
      max-height: 300px;
    }

    &.medium {
      max-width: 400px;
      max-height: 400px;
    }

    &.large {
      max-width: 500px;
      max-height: 500px;
    }
  }
}
</style>