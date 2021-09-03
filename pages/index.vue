<template>
  <div class="main" role="main">
    <div class="main__content">
      <button
        v-if="!isCreatingNote"
        class="main__content__banner"
        @click="() => createNote('')"
      >
        Start typing to create a new note...
      </button>
      <transition name="fade" mode="out-in">
        <transition-group
          v-if="fetchedNotes"
          key="1"
          tag="ul"
          name="list"
          class="main__content__notes"
        >
          <CardWrapper
            v-for="note in sortedNotes"
            :key="note.id"
            :data="note"
            class="main__content__notes__note"
          >
            <Card
              :ref="`note-${note.id}`"
              :data="note"
              :data-id="note.id"
              class="main__content__notes__note"
              @update-creating="isCreatingNote = $event"
              @update-editing="isEditingNote = $event"
            ></Card>
          </CardWrapper>
          <div key="-1" aria-hidden="true" style="width: 100%; height: 200px">
            &nbsp;
          </div>
        </transition-group>
        <Card v-else-if="!fetchedNotes" key="2" skeleton></Card>
      </transition>
    </div>
    <input id="dummy-input" aria-hidden="true" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
// TODO: style login page
// TODO(later): rework server, becouse it taking to much time to create, update and fetch all the notes
// TODO(later): rework everthing to work offline
export default {
  computed: {
    ...mapState(['notes', 'q', 'filter', 'fetchedNotes', 'sortBy']),
    sortedNotes() {
      const filters = {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        none: () => {
          const sortBy = `${this.sortBy.toLowerCase()}At`
          return this.notes.sort((a, b) => {
            const aDate = new Date(a[sortBy])
            const bDate = new Date(b[sortBy])
            return bDate - aDate
          })
        },
        query: () =>
          this.notes.filter(
            (note) =>
              note.title.toLowerCase().includes(this.q.toLowerCase()) ||
              note.content.toLowerCase().includes(this.q.toLowerCase())
          ),
      }

      return filters[this.filter]()
    },
    isCreatingNote: {
      get() {
        return this.$store.state.isCreatingNote
      },
      set(val) {
        return this.$store.commit('update', ['isCreatingNote', val])
      },
    },
    isEditingNote: {
      get() {
        return this.$store.state.isEditingNote
      },
      set(val) {
        this.$store.commit('update', ['isEditingNote', val])
      },
    },
    isSearchingNote: {
      get() {
        return this.$store.state.isSearchingNote
      },
      set(val) {
        this.$store.commit('update', ['isSearchingNote', val])
      },
    },
  },
  mounted() {
    if (!this.$store.state.fetchedNotes) this.fetchNotes()
    this.listenForKeyStrokes()
    this.checkSortBy()
  },
  methods: {
    checkSortBy() {
      const sortBy = localStorage.getItem('nn__sortBy')
      if (sortBy) this.$store.commit('update', ['sortBy', JSON.parse(sortBy)])
    },
    createNote(key) {
      const note = {
        id: Math.floor(Math.random() * 1000),
        title: '',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      this.isCreatingNote = true
      this.$store.state.notes.unshift(note)

      // ! need to set timeout, becouse of adding to the DOM
      setTimeout(() => {
        const textarea =
          this.$refs[`note-${note.id}`][0].$el.children[0].children[0]
        textarea.value = key
        textarea.focus()
      })
    },
    listenForKeyStrokes() {
      document.body.addEventListener('keydown', (event) => {
        const { altKey, shiftKey, metaKey, ctrlKey, key } = event

        if (ctrlKey && key === 'f') return this.searchNote(event)
        if (this.isSearchingNote && key === 'Escape')
          return this.searchNote(event)
        if (
          altKey ||
          shiftKey ||
          metaKey ||
          ctrlKey ||
          key === 'Tab' ||
          key === 'Escape' ||
          key === 'CapsLock' ||
          key === 'Backspace' ||
          key.startsWith('F') ||
          this.isEditingNote ||
          this.isSearchingNote ||
          this.isCreatingNote
        )
          return

        this.createNote(key)
      })
    },
    searchNote(event) {
      event.preventDefault()
      this.isSearchingNote = !this.isSearchingNote
      this.$store.commit('update', [
        'filter',
        this.isSearchingNote ? 'query' : 'none',
      ])
    },
    fetchNotes() {
      const { serverHost, serverStage, fetchedNotes } = this.$store.state
      const { email, name, picture } = this.$auth.user

      this.$axios.setHeader('Access-Control-Allow-Origin', '*')
      this.$axios.setHeader('Email', encodeURI(email))
      this.$axios.setHeader('Name', encodeURI(name))
      this.$axios.setHeader('Picture', encodeURI(picture))

      if (fetchedNotes) return
      this.$axios
        .$get(`${serverHost}/${serverStage}/note`)
        .then(({ data }) => this.$store.commit('update', ['notes', data]))
        .catch(() =>
          this.$toast.error(
            'something went with fetching notes, try again later'
          )
        )
        .finally(() => this.$store.commit('update', ['fetchedNotes', true]))
    },
  },
}
</script>

<style>
.main {
  width: 100%;
  min-height: 90vh;

  padding: 2rem 1rem 1rem;

  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.main__content {
  width: 100%;
  max-width: 700px;

  display: grid;
  gap: 2.75rem;
}
.main__content__banner {
  width: 100%;

  padding: 0.75rem 1.75rem;
  background-color: var(--secondary-color);
  border-radius: 0.75rem;
  border: none;

  font-size: 1rem;
  font-weight: 400;
  text-align: left;
  color: var(--primary-color);
  outline-color: #ccc;
  cursor: pointer;

  /* prettier-ignore  */
  box-shadow:
    0 1px 2.2px rgba(0, 0, 0, 0.008),
    0 2.3px 5.3px rgba(0, 0, 0, 0.012),
    0 4.4px 10px rgba(0, 0, 0, 0.015),
    0 7.8px 17.9px rgba(0, 0, 0, 0.018),
    0 14.6px 33.4px rgba(0, 0, 0, 0.022),
    0 35px 80px rgba(0, 0, 0, 0.03)
  ;
}

#dummy-input {
  width: 0;
  height: 0;
  position: fixed;
  left: -200%;
  top: 0;
}

.main__content__notes {
  list-style-type: none;

  display: grid;
  gap: 2rem;
}

.main__content__notes__note {
  transition: all 0.2s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}
</style>
