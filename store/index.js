import { gun, constants } from '~/helpers'

export const state = () => ({
  isLoggedIn: false,
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
  nuxtServerInit(_, { redirect, app }) {
    const user = app.$cookies.get(`${constants.GUN_PREFIX}user`)

    if (!user) return redirect('/login')
  },
}

export const strict = false
