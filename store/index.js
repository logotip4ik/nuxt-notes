import { gun, constants } from '~/helpers'

export const state = () => ({
  isLoggedIn: false,
  serverHost:
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8765',
})

export const mutations = {
  update: (state, [key, value]) => (state[key] = value),
}

export const actions = {
  createGunUser({ state }, { username, password }) {
    return new Promise((resolve, reject) => {
      if (!username || !password) return
      // Need to check for username uniqueness
      if (password.length < 8) return
      gun.user().recall({ sessionStorage: true })
      gun.user().create(username, password)
      gun
        .user()
        .auth(username, password, () => resolve((state.isLoggedIn = true)))
    })
  },
  async nuxtServerInit({ state }, { redirect, app, $axios }) {
    const user = app.$cookies.get(`${constants.GUN_PREFIX}user`)

    if (!user) return redirect('/login')
    const { ok } = await $axios.$post(`${state.serverHost}/authorize`, user)
    if (!ok) return redirect('/login')
    state.isLoggedIn = true
  },
}

export const strict = false
