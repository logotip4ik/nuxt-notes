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
              @update-status="currentState = $event"
              @update-creating="isCreatingNote = $event"
              @update-editing="isEditingNote = $event"
            ></Card>
          </CardWrapper>
          <div key="-1" aria-hidden="true" style="width: 100%; height: 200px">
            &nbsp;
          </div>
        </transition-group>
        <Card v-else-if="loading" key="2" skeleton></Card>
      </transition>
    </div>
    <input id="dummy-input" aria-hidden="true" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import cardStatus from '~/helpers/card-state'
// TODO: style login page
// TODO(later): rework server, becouse it taking to much time to create, update and fetch all the notes
// TODO(later): rework everthing to work offline
export default {
  data: () => ({
    loading: true,
    currentState: cardStatus.IDLE,
    isCreatingNote: false,
    isEditingNote: false,
    sortBy: 'updatedAt',
    cardStatus
  }),
  computed: {
    ...mapState(['notes']),
    sortedNotes() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return this.notes.sort((a, b) => {
        const aDate = new Date(a[this.sortBy])
        const bDate = new Date(b[this.sortBy])
        return bDate - aDate
      })
    },
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      this.isCreatingNote = true
      this.currentState = cardStatus.CREATING
      this.$store.state.notes.unshift(note)

      // ! need to set timeout, becouse of adding to the DOM
      setTimeout(() => {
        const input =
          this.$refs[`note-${note.id}`][0].$el.children[0].children[0]
        input.value = key
        input.focus()
      })
    },
    listenForKeyStrokes() {
      document.body.addEventListener(
        'keydown',
        ({ altKey, shiftKey, metaKey, key }) => {
          if (
            this.loading ||
            altKey ||
            shiftKey ||
            metaKey ||
            key === 'Tab' ||
            key === 'Escape' ||
            key === 'Control' ||
            key === 'CapsLock' ||
            key === 'Backspace' ||
            key.startsWith('F') ||
            this.isEditingNote ||
            this.isCreatingNote ||
            this.currentState === cardStatus.CREATING ||
            this.currentState === cardStatus.EDITING ||
            this.currentState === cardStatus.SEARCHING
          )
            return

          this.createNote(key)
        }
      )
    },
    fetchNotes() {
      const { serverHost, serverStage } = this.$store.state
      const { email, name, picture } = this.$auth.user

      this.$axios.setHeader('Email', email)
      this.$axios.setHeader('Name', name)
      this.$axios.setHeader('Picture', picture)

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
