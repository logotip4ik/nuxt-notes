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
          v-if="!loading"
          key="1"
          tag="ul"
          name="list"
          class="main__content__notes"
        >
          <Card
            v-for="note in notes"
            :key="note.id"
            :ref="`note-${note.id}`"
            :data="note"
            :data-id="note.id"
            class="main__content__notes__note"
            @update-editing="isEditingNote = $event"
          ></Card>
        </transition-group>
        <Card v-else-if="loading" key="2" skeleton> </Card>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// TODO: need to fix animtion when card is leaving the list
// TODO(later): rework server, becouse it taking to much time to create, update and fetch all the notes
export default {
  data: () => ({
    loading: true,
    isCreatingNote: false,
    isEditingNote: false,
  }),
  computed: {
    ...mapState(['notes']),
  },
  mounted() {
    this.fetchNotes()
    this.listenForKeyStrokes()
  },
  methods: {
    createNote(key) {
      const note = {
        id: Math.floor(Math.random() * 1000),
        title: '',
        content: '',
      }
      this.$store.commit('update', ['notes', [note, ...this.notes]])
      this.isCreatingNote = true

      // ! need to set timeout, becouse
      setTimeout(() => {
        const input = this.$refs[`note-${note.id}`][0].$el.children[0]
        input.value = key
        input.focus()
      }, 0)
    },
    checkNoteCancel() {
      const inputOrTextarea = document.activeElement
      const noteEl = inputOrTextarea.parentElement
      const { id } = noteEl.dataset

      const newNotes = this.$store.state.notes.filter(
        (note) => note.id !== parseInt(id)
      )
      this.$store.commit('update', ['notes', newNotes])
      this.isCreatingNote = false
    },
    listenForKeyStrokes() {
      document.body.addEventListener(
        'keydown',
        ({ altKey, shiftKey, metaKey, key }) => {
          if (key === 'Escape') return this.checkNoteCancel()
          if (
            altKey ||
            shiftKey ||
            metaKey ||
            key === 'Tab' ||
            key === 'Control' ||
            key === 'CapsLock' ||
            key === 'Backspace' ||
            key.startsWith('F') ||
            this.isEditingNote ||
            this.isCreatingNote
          )
            return
          this.createNote(key)
        }
      )
    },
    fetchNotes() {
      const { serverHost, serverStage } = this.$store.state

      this.$axios
        .$get(`${serverHost}/${serverStage}/note`)
        .then(({ data }) => this.$store.commit('update', ['notes', data]))
        .finally(() => (this.loading = false))
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
  gap: 2rem;
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

.main__content__notes {
  list-style-type: none;

  display: grid;
  gap: 1.5rem;
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

.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
}

.list-complete-leave-active {
  position: absolute;
}
</style>
