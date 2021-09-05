<template>
  <div role="main" class="main">
    <transition name="fade" mode="out-in">
      <h1 v-if="isLoading" key="1">Loading ...</h1>
      <ul v-else-if="!isLoading && notes.length !== 0" key="2">
        <li v-for="note in notes" :key="note.id" :data-id="note.id">
          {{ note }}
        </li>
      </ul>
      <h1 v-else-if="!isLoading && notes.length === 0" key="3">
        Your notes is empty!
      </h1>
    </transition>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { gun } from '~/helpers'

export default {
  data: () => ({
    isLoading: true,
  }),
  computed: {
    notes() {
      return this.$store.state.notes
    },
  },
  mounted() {
    if (!this.$store.state.isLoggedIn)
      return (window.location.pathname = '/login')

    gun.get('notes').once((notes, key) => {
      this.$store.commit('update', [key, notes || []])
      this.isLoading = false
    })

    gun
      .get('notes')
      .on((notes, key) => this.$store.commit('update', [key, notes]))

    this.setupListeners()
  },
  methods: {
    setupListeners() {
      window.addEventListener('keydown', (ev) => {
        if (
          ev.key.startsWith('F') ||
          ev.key === 'Enter' ||
          ev.key === 'Control' ||
          ev.key === 'Escape' ||
          ev.key === 'Tab' ||
          ev.key === 'Capslock' ||
          ev.metaKey ||
          ev.altKey ||
          ev.altKey ||
          ev.shiftKey ||
          this.isLoading
        )
          return

        ev.preventDefault()
        this.createNote()
      })
    },
    createNote() {
      const newNote = {
        id: nanoid(),
        title: '',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      gun.get('notes').set({ [newNote.id]: newNote })
    },
  },
}
</script>
