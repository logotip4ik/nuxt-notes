<template>
  <div class="login">
    <div class="login__container">
      <h1 class="login__container__header">Login or Sign up</h1>
      <form
        class="login__container__form"
        autocomplete="off"
        @submit.prevent="submitForm"
        @reset.prevent="resetForm"
      >
        <div class="login__container__form__item">
          <label for="username" class="login__container__form__item__label">
            Username
          </label>
          <div class="login__container__form__item__wrapper">
            <input
              v-model="username"
              name="username"
              class="login__container__form__item__input"
            />
          </div>
        </div>
        <div class="login__container__form__item">
          <label for="password" class="login__container__form__item__label">
            Password
          </label>
          <div class="login__container__form__item__wrapper">
            <input
              v-model="password"
              name="password"
              :type="isShowingPassword ? 'text' : 'password'"
              class="login__container__form__item__input"
              @keydown.enter.prevent="submitForm"
            />
            <button
              class="login__container__form__item__button"
              @click="isShowingPassword = !isShowingPassword"
            >
              <transition name="fade" mode="out-in">
                <svg
                  v-if="!isShowingPassword"
                  key="1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z"
                  />
                </svg>
                <svg
                  v-else
                  key="1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z"
                  />
                </svg>
              </transition>
            </button>
          </div>
        </div>
        <div class="login__container__form__actions">
          <button class="login__container__form__actions__button" type="submit">
            Login
          </button>
          <button
            class="
              login__container__form__actions__button
              login__container__form__actions__button--outlined
            "
            type="reset"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
// TODO: init gun.js
import { mapActions } from 'vuex'
import { constants } from '~/helpers'

export default {
  data: () => ({
    username: '',
    password: '',
    isShowingPassword: false,
  }),
  methods: {
    ...mapActions(['createGunUser']),
    submitForm() {
      const user = { username: this.username, password: this.password }
      this.createGunUser(user).then(() => {
        const oneWeekFromNow = Date.now() + 1000 * 60 * 60 * 24 * 7
        this.$cookies.set(`${constants.GUN_PREFIX}user`, user, {
          expires: new Date(oneWeekFromNow),
          secure: true,
        })
        this.$router.push({ name: 'index' })
      })
    },
    resetForm() {
      this.username = ''
      this.password = ''
      this.isShowingPassword = false
    },
  },
}
</script>

<style lang="scss">
.login {
  display: grid;
  place-items: center;

  min-height: 100vh;

  &__container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    gap: 2rem;

    max-width: 600px;
    width: 92.5vw;
    border-radius: 0.5rem;
    padding: 0.75rem 0;

    // prettier-ignore
    box-shadow:
      0 0.8px 2.2px rgba(0, 0, 0, 0.02),
      0 2px 5.3px rgba(0, 0, 0, 0.028),
      0 3.8px 10px rgba(0, 0, 0, 0.035),
      0 6.7px 17.9px rgba(0, 0, 0, 0.042),
      0 12.5px 33.4px rgba(0, 0, 0, 0.05),
      0 30px 80px rgba(0, 0, 0, 0.07)
    ;

    &__header {
      font-size: 2.25rem;
      font-weight: 200;
      color: var(--primary-color);
    }
    &__form {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: column;
      gap: 1.5rem;

      max-width: 500px;
      width: 90%;

      &__item {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: column;
        gap: 0.5rem;

        width: 100%;

        &__label {
          display: block;

          // font-weight: 200;
          font-size: 1.125rem;
          color: #333;

          width: 100%;

          transition: color 0.4s ease;
        }

        &__wrapper {
          width: 100%;

          position: relative;

          &::after {
            position: absolute;
            content: '';
            bottom: 0;
            left: 50%;
            width: 100%;
            height: 2px;
            border-radius: 0.5rem;
            background-color: #333;

            transform: translate(-50%, 50%) scaleX(0);
            transition: transform 0.4s ease;
          }

          &:focus-within {
            &::after {
              transform: translate(-50%, 25%) scaleX(1);
            }
          }
        }
        &__input {
          width: 100%;
          appearance: none;
          outline: none;
          padding: 0.25rem 0.125rem;
          border-radius: 0;
          border: none;
          border-bottom: 1px solid #ccc;
          background-color: transparent;

          font: inherit;
          font-size: 1.125rem;

          display: block;
        }

        &__button {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translate(0%, -50%);

          // yep, i know, safari does not support it currently
          aspect-ratio: 1/1;
          height: 90%;
          border: none;
          outline: none;
          border-radius: 50%;
          background-color: transparent;

          display: inline-flex;
          justify-content: center;
          align-items: center;

          cursor: pointer;
          transition: background-color 0.4s ease;

          svg {
            height: 50%;
            width: auto;
          }

          &:hover,
          &:focus {
            background-color: hsla(0, 0%, 50%, 0.6);
          }
        }
        &:hover,
        &:focus-within {
          label {
            color: black;
          }
        }
      }

      &__actions {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;

        padding-bottom: 0.5rem;

        &__button {
          --custom-border-radius: 0.5rem;

          position: relative;
          z-index: 1;
          appearance: none;
          border: none;
          border-radius: var(--custom-border-radius);
          padding: 0.4rem 1rem;

          font: inherit;
          font-size: 1.125rem;
          background-color: var(--primary-color);
          border: 2px solid transparent;
          color: white;
          box-shadow: 2px 3px 10px -5px rgba(0, 0, 0, 0.25);

          cursor: pointer;

          &--outlined {
            color: #333;
            background-color: transparent;

            border-color: var(--primary-color);
          }

          &::after {
            content: '';
            position: absolute;
            z-index: -1;

            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: var(--custom-border-radius);
            background-color: hsla(0, 0%, 50%, 0);

            transition: background-color 0.4s ease;
          }

          &:hover,
          &:focus {
            &::after {
              transition: none;
              background-color: hsla(0, 0%, 25%, 0.125);
            }
          }
        }
      }
    }
  }
}
</style>
