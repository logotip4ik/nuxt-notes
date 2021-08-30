<template>
  <div class="main">
    <h1>Wait logging you in...</h1>
    <!-- <button class="main__button" @click="login">login</button> -->
  </div>
</template>

<script>
export default {
  layout: 'login',
  mounted() {
    return this.login()
  },
  methods: {
    login() {
      this.$auth.loginWith('auth0')
    },
  },
}
</script>

<style lang="scss">
.main {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
</style>
