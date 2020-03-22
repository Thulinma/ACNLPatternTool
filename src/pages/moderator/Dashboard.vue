<template>
  <div>
    am logged in
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: "ModeratorDashboard",
  methods: {
    ...mapActions('profile', [
      'logOut'
    ]),
  }
}
</script>


<style lang="scss" scoped>

</style>