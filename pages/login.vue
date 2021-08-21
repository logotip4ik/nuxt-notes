<template>
  <div>
    <button @click="login">login</button>
  </div>
</template>

<script>
export default {
  layout: 'login',
  methods: {
    login() {
      this.$auth.loginWith('auth0')
    },
  },
}
</script>

<style></style>
