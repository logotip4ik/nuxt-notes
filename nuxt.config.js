export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'server',
  ssr: true,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'gun-notes',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
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

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/base.css'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['cookie-universal-nuxt', '@nuxtjs/axios', '@nuxtjs/toast'],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  toast: { position: 'bottom-center', duration: 2000 },
}
