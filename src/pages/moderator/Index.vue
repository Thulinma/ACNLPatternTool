<template>
  <router-view></router-view>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "ModeratorIndex",
  computed: {
    ...mapGetters('profile', [
      'isLoggedIn',
    ])
  },
  methods: {
    // corrects link upon landing
    redirect: function() {
      let target;
      if (!this.isLoggedIn) target = "login";
      else target = "dashboard";
      let targetPath = `/moderator/${target}`
      if (this.$route.path === targetPath ) return;
      this.$router.push(`/moderator/${target}`);
    }
  },
  watch: {
    isLoggedIn: function (newVal, oldVal) {
      this.redirect();
    }
  },
  mounted: function() { this.redirect(); }
}
</script>


<style lang="scss" scoped>

</style>