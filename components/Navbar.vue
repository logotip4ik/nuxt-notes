<template>
  <nav class="navbar">
    <h1 class="navbar__header">Hi, {{ $auth.user.name.split(' ')[0] }}</h1>
    <img
      :src="`${$auth.user.picture}iasdfl;asdkljf;laskdf`"
      alt="profile avatar"
      class="navbar__avatar"
      data-click-outside-interact="false"
      @click="hideDropdown"
    />
    <transition
      :css="false"
      @enter="enterDropdownAnimation"
      @leave="leaveDropdownAnimation"
    >
      <ul
        v-if="isShowingDropdown"
        v-click-outside="hideDropdown"
        class="dropdown"
      >
        <li class="dropdown__item" @click="toggleColorMode">
          {{ currentModeName }} Mode
        </li>
        <li class="dropdown__item" @click="hideDropdown">Settings</li>
        <li class="dropdown__item" @click="logout">Logout</li>
      </ul>
    </transition>
  </nav>
</template>

<script>
import { gsap } from 'gsap'

export default {
  data: () => ({
    currentMode: 0,
    colorModes: ['system', 'light', 'dark'],
    isShowingDropdown: false,
  }),
  computed: {
    currentModeName() {
      return this.colorModes[this.currentMode]
        .split('')
        .reduce(
          (string, char, i) => string + (i === 0 ? char.toUpperCase() : char),
          ''
        )
    },
  },
  watch: {
    '$colorMode.value': {
      handler(mode) {
        this.toggleHighlightStyles(mode)
      },
      immediate: true,
    },
  },
  mounted() {
    setTimeout(() => {
      const { value } = this.$colorMode

      for (let i = 0; i < this.colorModes.length; i++)
        if (value === this.colorModes[i]) return (this.currentMode = i)
    }, 0)
  },
  methods: {
    toggleHighlightStyles(mode) {
      if (process.server) return
      const lightStylesheet = document.getElementById('highlight-stylesheets')
      const darkStylesheet = document.getElementById(
        'highlight-stylesheets-dark'
      )

      lightStylesheet.toggleAttribute('disabled', mode === 'dark')
      darkStylesheet.toggleAttribute('disabled', mode === 'light')
    },
    toggleColorMode() {
      this.currentMode = (this.currentMode + 1) % this.colorModes.length
      this.$colorMode.preference = this.colorModes[this.currentMode]
    },
    hideDropdown() {
      this.isShowingDropdown = !this.isShowingDropdown
    },
    enterDropdownAnimation(el, onComplete) {
      const TL = gsap.timeline().pause()
      gsap.set(el, { transformOrigin: 'right top' })

      TL.fromTo(
        el,
        { opacity: 0, scale: 0.75 },
        { opacity: 1, scale: 1, ease: 'back.out', duration: 0.3 }
      )
      TL.fromTo(
        el.children,
        { opacity: 0 },
        { opacity: 1, stagger: 0.075, onComplete },
        '-=.2'
      )

      TL.play()
    },
    leaveDropdownAnimation(el, onComplete) {
      gsap.to(el, {
        opacity: 0,
        scale: 0.75,
        ease: 'power3.out',
        duration: 0.2,
        onComplete,
      })
    },
    async logout() {
      await this.$auth.logout()
    },
  },
}
</script>

<style>
.navbar {
  width: 100%;
  position: relative;
  padding: 0.5rem 0.75rem;
  background-color: var(--secondary-color);
  box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.25);

  display: flex;
  justify-content: space-between;
  align-items: center;
}
.navbar__header {
  font-size: 1.75rem;
  font-weight: 300;
  text-overflow: ellipsis;
  white-space: nowrap;

  overflow: hidden;
  width: 100%;
}
.navbar__avatar {
  --size: 50px;
  aspect-ratio: 1/1;
  width: var(--size);
  height: var(--size);

  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 0 10px -5px rgba(0, 0, 0, 0.25);
  background-image: linear-gradient(to bottom, #444, #555);

  transition: transform 0.2s ease-out;
  cursor: pointer;
}

.navbar__avatar:hover {
  transform: scale(1.005);
}
.navbar__avatar:active {
  transform: scale(0.95);
}

.dropdown {
  width: 100%;
  max-width: 175px;

  position: absolute;
  top: 125%;
  right: 1rem;

  padding: 0.5rem 0;
  border-radius: 0.5rem;
  background-color: var(--secondary-color);
  list-style-type: none;
  z-index: 10;
  /* shodows from: https://shadows.brumm.af/  */
  /* prettier-ignore */
  box-shadow:
    0 0.8px 0.4px rgba(0, 0, 0, 0.025),
    0 2px 1.5px rgba(0, 0, 0, 0.036),
    0 3.8px 3.9px rgba(0, 0, 0, 0.045),
    0 6.7px 8.6px rgba(0, 0, 0, 0.054),
    0 12.5px 20.2px rgba(0, 0, 0, 0.065),
    0 30px 80px rgba(0, 0, 0, 0.09)
  ;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
}
.dropdown__item {
  width: 100%;
  padding: 0 0.5rem 0.25rem;
  cursor: pointer;

  transition: background-color 0.3s ease-out;
}

.dropdown__item:hover {
  transition: none;
  background-color: var(--primary-color);
}

/* Little triangle at the top of dropdown */
.dropdown:after {
  --size: 10px;
  content: '';

  position: absolute;
  bottom: 100%;
  right: calc(1rem - calc(var(--size) / 1.9));

  border-top: var(--size) solid transparent;
  border-left: var(--size) solid transparent;
  border-right: var(--size) solid transparent;
  border-bottom: var(--size) solid var(--secondary-color);
}
</style>
