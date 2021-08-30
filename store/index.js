export const state = () => ({
  q: '',
  notes: [],
  fetchedNotes: false,
  filter: 'none',
  isCreatingNote: false,
  isEditingNote: false,
  isSearchingNote: false,
  serverHost:
    process.env.NODE_ENV === 'production'
      ? 'https://3oepaltxs1.execute-api.us-east-1.amazonaws.com'
      : 'http://localhost:3001',
  serverStage: process.env.NODE_ENV === 'production' ? 'dev' : 'dev',
})

export const mutations = {
  // prettier-ignore
  update: (state, [key, value]) => { state[key] = value },
}

export const actions = {}
export const strict = false
