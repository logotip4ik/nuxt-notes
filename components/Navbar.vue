<template>
  <nav class="navbar">
    <h1 class="navbar__header">
      Hi, <span>{{ username }}</span>
    </h1>
    <ul class="navbar__actions">
      <li class="navbar__actions__item"><button>Logout</button></li>
    </ul>
  </nav>
</template>

<script>
import { constants } from '~/helpers'

export default {
  computed: {
    username() {
      const user = this.$cookies.get(`${constants.GUN_PREFIX}user`)
      if (!user) return ''
      return user.username
    },
  },
}
</script>

<style lang="scss">
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  padding: 0.75rem 1.5rem;

  background-color: var(--secondary-color);

  &__header {
    font-weight: 300;
    font-size: 2rem;

    span {
      color: var(--primary-color);
    }
  }
  &__actions {
    display: flex;
    justify-content: center;
    justify-content: space-evenly;
    align-items: center;
    gap: 0.75rem;

    list-style-type: none;

    button {
      position: relative;
      isolation: isolate;

      font: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-color);
      text-transform: uppercase;

      border: 1px solid var(--primary-color);
      border-radius: 0.25rem;

      padding: 0.5rem 1rem;
      background-color: var(--surface-color);

      cursor: pointer;

      &::after {
        content: '';
        position: absolute;
        z-index: -1;
        inset: 0;

        border-radius: inherit;
        background-color: hsla(0, 0%, 75%, 0.25);

        opacity: 0;

        transition: 0.4s ease;
      }

      &:hover,
      &:focus {
        &::after {
          opacity: 1;
          transition: none;
        }
      }
    }
  }
}
</style>
