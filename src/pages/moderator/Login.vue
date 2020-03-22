<template>
  <div>
    not logged in
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: "ModeratorLogin",
  methods: {
    ...mapActions('profile', [
      'logIn',
    ]),
  }
}
</script>


<style lang="scss" scoped>

</style>