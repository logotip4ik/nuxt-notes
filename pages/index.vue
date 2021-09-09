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
          v-if="!isLoading"
          key="1"
          tag="ul"
          name="list"
          class="main__content__notes"
        >
          <CardWrapper
            v-for="note in notes"
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
        <Card v-else key="2" skeleton></Card>
      </transition>
    </div>
    <input id="dummy-input" aria-hidden="true" />
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { gunUser, gun, constants } from '~/helpers'

export default {
  data: () => ({
    isLoading: true,
  }),
  computed: {
    notes() {
      // need to do this, becouse gun insted of deletion, it just sets null pointer
      return this.$store.state.notes.filter(Boolean)
    },
    isCreatingNote: {
      get() {
        return this.$store.state.isCreatingNote
      },
      set(val) {
        this.$store.commit('update', ['isCreatingNote', val])
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
  },
  mounted() {
    if (!this.$store.state.isLoggedIn)
      return (window.location.pathname = '/login')

    const { username, password } = this.$store.state.user

    gunUser.recall({ sessionStorage: true })
    gunUser.auth(username, password, ({ err }) =>
      err ? this.$router.push({ name: 'login ' }) : () => {}
    )

    this.$store.state.notes = []

    gunUser
      .get('notes')
      .map()
      .on((note, key) => {
        this.isLoading = false
        this.$store.state.notesObject[key] = note
        this.$store.dispatch('transpileNotes')
      })

    this.setupListeners()
  },
  methods: {
    deleteData() {
      const { notes } = this.$store.state

      for (const note of notes) {
        gunUser.get('notes').delete(note)
      }
    },
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
          this.isCreatingNote ||
          this.isEditingNote ||
          this.isLoading
        )
          return

        ev.preventDefault()
        this.createNote(ev.key)
      })
    },
    createNote(key) {
      this.isCreatingNote = true
      const newNote = {
        id: nanoid(32),
        title: '',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const note = gun.get(constants.NOTE_PREFIX + newNote.id).put(newNote)

      gunUser
        .get('notes')
        .set(note)
        .then((val) =>
          setTimeout(() => {
            const noteRef = this.$refs[`note-${newNote.id}`][0]
            noteRef.$el.children[0].children[0].value += key
            noteRef.$el.children[0].children[0].focus()
          }, 0)
        )
    },
  },
}
</script>

<style lang="scss">
.main {
  width: 100%;
  min-height: 90vh;

  padding: 2rem 1rem 1rem;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  &__heading {
    text-align: center;
  }
  &__content {
    width: 100%;
    max-width: 700px;

    display: grid;
    gap: 2.75rem;

    &__banner {
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
    &__notes {
      list-style-type: none;

      display: grid;
      gap: 2rem;

      width: 100%;
      max-width: 700px;

      &__note {
        transition: all 0.2s ease;
      }
    }
  }
}

.spacer {
  width: 100%;
  height: 35vh;
}
#dummy-input {
  width: 0;
  height: 0;
  position: fixed;
  left: -200%;
  top: 0;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}
</style>
