export const state = () => ({
  notes: [],
  serverHost:
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001',
  serverStage: process.env.NODE_ENV === 'production' ? '' : 'dev',
})

export const mutations = {
  // prettier-ignore
  update: (state, [key, value]) => { state[key] = value },
}

export const actions = {}
