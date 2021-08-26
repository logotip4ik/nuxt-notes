export default {
  ssr: true,
  // Global page headers: https://go.nuxtjs.dev/config-head
  publicRuntimeConfig: {
    clientId: process.env.CLIENT_ID,
  },
  head: {
    title: 'Notely',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Easy peasy notes' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        id: 'highlight-stylesheets',
        rel: 'stylesheet',
        title: 'Github',
        href: 'https://cdn.jsdelivr.net/gh/highlightjs/highlight.js/src/styles/github.css',
      },
      {
        id: 'highlight-stylesheets-dark',
        rel: 'stylesheet',
        title: 'Github Dark',
        href: 'https://cdn.jsdelivr.net/gh/highlightjs/highlight.js/src/styles/github-dark.css',
        disabled: true,
      },
    ],
  },
  router: {
    middleware: ['auth'],
  },
  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/base.css'],
  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/vue-click-outside.js'],
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,
  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxtjs/color-mode',
  ],
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/auth-next',
    '@nuxtjs/toast',
  ],
  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: { manifest: { lang: 'en' } },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  auth: {
    strategies: {
      auth0: {
        domain: 'bogdankostyuk.eu.auth0.com',
        scope: ['profile', 'email'],
        clientId: process.env.CLIENT_ID,
        audience: 'note-app-api',
      },
    },
  },
  toast: {
    position: 'bottom-center',
    duration: 2000,
  },
}
