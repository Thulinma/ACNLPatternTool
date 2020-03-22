<template>
  <div v-if="!isLoggedIn"></div>
  <div v-else>
    <div>
      I am {{ username }}. <button @click="onLogOut">Sign Out</button>
    </div>
    <div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';

export default {
  name: "ModeratorDashboard",
  computed: {
    ...mapState('profile', [
      'username',
      'pending'
    ]),
    ...mapGetters('profile', [
      'isLoggedIn'
    ]),
  },
  methods: {
    ...mapActions('profile', [
      'logOut'
    ]),
    onLogOut: async function() {
      await this.logOut();
    },
  }
}
</script>


<style lang="scss" scoped>

</style>