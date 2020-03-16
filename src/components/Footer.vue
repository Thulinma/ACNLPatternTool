<template>
  <div class="footer">
      <nav>
        <a @click="goToBrowse">
            Browse
        </a>
        <a @click="goToEditor">
            Edit
        </a>
        <a @click="goToFAQ">
            FAQ
        </a>
      </nav>
      <div class="credits">

      </div>
  </div>
</template>

<script>

export default {
  name: "Footer",
  data: function() {
    return {
      changelogRoute: '/changelog',
      discordInviteLink: 'https://discordapp.com/invite/UVgMK2h',
      gitHubLink: 'https://github.com/Thulinma/ACNLPatternTool',
      creators: [
          {
            name: 'Thulinma',
            link: 'https://thulinma.com'
          },
          {
            name: 'DamSenViet',
            link: 'https://github.com/DamSenViet'
          },
          {
            name: 'Myumi',
            link: 'https://github.com/myumi'
          },
      ],
    };
  },
  methods: {
    goToBrowse: function() {
      this.$router.push({ path: `/browse` });
    },
    goToEditor: function() {
      this.$router.push({ path: `/editor` });
    },
    goToFAQ: function() {
      this.$router.push({ path: `/faq` });
    },
  }
}
</script>

<style lang="scss" scoped>
.footer nav {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    font-size: 12px;
    text-transform: lowercase;
}
</style>
