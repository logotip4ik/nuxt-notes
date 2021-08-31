<template>
  <div class="main">
    <transition name="fade" mode="out-in">
      <button v-if="!loggingIn" @click="login">Log in</button>
      <h1 v-else>Wait, Logging you in...</h1>
    </transition>
  </div>
</template>

<script>
export default {
  layout: 'login',
  data: () => ({
    loggingIn: false,
  }),
  methods: {
    login() {
      this.loggingIn = false
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

button {
  appearance: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: 1px solid #ccc;
  background-color: transparent;

  font: inherit;
  font-size: 1.1rem;
  text-transform: uppercase;

  cursor: pointer;
  transition: transform 0.4s ease;

  &:focus,
  &:hover {
    transition: none;
    transform: scale(1.01);
  }
  &:active {
    transition: none;
    transform: scale(0.99);
  }
}
</style>
