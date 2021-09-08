import { gun, constants } from '~/helpers'

export const state = () => ({
  isLoggedIn: false,
  user: null,
  notes: [],
  notesObject: {},
  isCreatingNote: false,
  isEditingNote: false,
  isNextToDelete: false,
  serverHost:
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8765',
})

export const mutations = {
  update: (state, [key, value]) => (state[key] = value),
}

export const actions = {
  transpileNotes({ state, commit }) {
    const { notesObject } = state
    const notes = []

    for (const note of Object.values(notesObject))
      if (note) notes.push({ ...note, key: note._['#'] })

    commit('update', [
      'notes',
      notes.sort((noteA, noteB) => {
        if (!noteA || !noteB) return true
        const dateA = new Date(noteA.updatedAt)
        const dateB = new Date(noteB.updatedAt)
        return dateB - dateA
      }),
    ])
  },
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
    state.user = user
    const { ok } = await $axios.$post(`${state.serverHost}/authorize`, user)
    if (!ok) return redirect('/login')
    state.isLoggedIn = true
  },
}

export const strict = false
