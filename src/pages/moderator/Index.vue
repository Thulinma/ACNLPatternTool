<template>
  <router-view @redirect="redirect"></router-view>
</template>

<script lang="ts">
import { namespace } from "vuex-class";
import { Vue, Component, Watch } from "vue-property-decorator";
import { mapGetters, mapActions } from "vuex";

const modModule = namespace('profile');

@Component({
  name: "ModeratorIndex",
})
export default class ModeratorIndex extends Vue {
  /**
   * Whether the current moderator is logged in.
   */
  @modModule.Getter('isLoggedIn') readonly isLoggedIn!: boolean;

  /**
   * Attempts to skip the login process using our username and password from
   * the last time if did not log out.
   */
  @modModule.Action('continue') continue!: () => void;

  /**
   * Corrects the page where we should be upon landing..
   */
  redirect(): void {
    let target;
    if (!this.isLoggedIn) target = "login";
    else target = "dashboard";
    let targetPath = `/moderator/${target}`;
    if (this.$route.path === targetPath) return;
    this.$router.push(`/moderator/${target}`);
  }
  
  @Watch('isLoggedIn')
  onIsLoggedInChanged() {
    this.redirect();
  }
  
  async mounted() {
    await this.continue();
    this.redirect();
  }
};
</script>


<style lang="scss" scoped>
</style>