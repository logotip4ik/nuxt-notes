<template>
  <div class="main">
    <button @click="login">Log in</button>
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
  color: currentColor;

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
