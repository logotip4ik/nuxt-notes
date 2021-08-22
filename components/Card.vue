<template>
  <div
    :class="{ card: true, 'card--skeleton': skeleton }"
    @keypress.ctrl.enter.prevent="saveNote"
  >
    <input
      ref="input"
      class="card__title no-input"
      :readonly="skeleton ? 'readonly' : false"
      :placeholder="skeleton ? null : 'Untitled'"
      @keypress.enter.prevent="() => $refs.textarea.focus()"
      @focus="() => toggleEditing(true)"
      @blur="() => toggleEditing()"
    />
    <!-- TODO: fix textarea height in skeleton mode -->
    <textarea
      ref="textarea"
      class="card__content no-input"
      :readonly="skeleton ? 'readonly' : false"
      :rows="skeleton ? 1 : 3"
      :placeholder="skeleton ? null : '# Some markdown...'"
      @focus="() => toggleEditing(true)"
      @blur="() => toggleEditing()"
    ></textarea>
    <div class="card__actions">
      <button
        class="card__actions__button card__actions__button--delete"
        @click="deleteNote"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"
          />
        </svg>
        Junk
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  // TODO: add like blinking animation to placeholder text in skeleton mode(try to use only css)...
  props: {
    data: { type: Object, required: false, default: () => ({}) },
    skeleton: { type: Boolean, required: false, default: false },
  },
  data: () => ({
    isEditing: false,
  }),
  computed: {
    markdown() {
      return this.data.content
    },
    ...mapState(['serverHost', 'serverStage']),
  },
  mounted() {
    if (this.skeleton) return
    this.$refs.input.value = this.data.title
    this.$refs.textarea.value = this.data.content
  },
  methods: {
    /**
     * @param {Boolean} val
     * @default val = false
     */
    toggleEditing(val = false) {
      this.$emit('update-editing', val)
      this.isEditing = val
    },
    deleteNote() {
      const newNotes = this.$store.state.notes.filter(
        (note) => note.id !== this.data.id
      )
      this.$store.commit('update', ['notes', newNotes])

      if (this.$nuxt.isOffline) return
      this.$axios
        .$delete(`${this.serverHost}/${this.serverStage}/note/${this.data.id}`)
        .then(() => this.$toast.show(`deleted note: ${this.data.id}`))
        .catch(() => this.$toast.error('something went, try again later...'))
    },
    updateVuexNote(noteFromServer) {
      const newNotes = this.$store.state.notes.reduce(
        (acc, note) => [
          ...acc,
          note.id === noteFromServer.id ? noteFromServer : note,
        ],
        []
      )
      this.$store.commit('update', ['notes', newNotes])
    },
    saveNote() {
      this.toggleEditing()
      if (this.$nuxt.isOffline) return
      const note = {
        title: this.$refs.input.value,
        content: this.$refs.textarea.value,
      }

      if (!this.data.ownerId) {
        this.$axios
          .$post(`${this.serverHost}/${this.serverStage}/note`, note)
          .then(({ data }) => {
            this.updateVuexNote(data)
            this.$toast.success('created new note')
          })
          .catch(() =>
            this.$toast.error('something went wrong, try again later')
          )
      } else {
        this.$axios
          .$post(
            `${this.serverHost}/${this.serverStage}/note/${this.data.id}`,
            note
          )
          .then(({ data }) => {
            this.updateVuexNote(data)
            this.$toast.success('updated note')
          })
          .catch(() =>
            this.$toast.error('something went wrong, try again later')
          )
      }
    },
  },
}
</script>

<style>
.no-input {
  font: inherit;

  appearance: none;
  border: none;
  resize: none;
  background: transparent;
  outline: none;

  display: inline-block;
}

.card {
  --font-size-placeholder: 1.5rem;

  width: 100%;

  padding: 1rem 1.5rem 1rem;
  border-radius: 0.5rem;
  /* shadows from: https://shadows.brumm.af/ */
  /* prettier-ignore */
  box-shadow:
    0 1.4px 2.2px rgba(0, 0, 0, 0.014),
    0 3.3px 5.3px rgba(0, 0, 0, 0.02),
    0 6.3px 10px rgba(0, 0, 0, 0.025),
    0 11.2px 17.9px rgba(0, 0, 0, 0.03),
    0 20.9px 33.4px rgba(0, 0, 0, 0.036),
    0 50px 80px rgba(0, 0, 0, 0.05)
  ;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
}

.card__title {
  width: 100%;
  font-size: 1.75rem;
}
.card__content {
  width: 100%;
  font-size: 14px;
}

.card__actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.card__actions__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;

  font: inherit;
  font-size: 0.9rem;

  block-size: 1.75rem;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: transparent;
  cursor: pointer;

  --fill-color: hsl(0, 0%, 70%);
  color: var(--fill-color);
  fill: var(--fill-color);

  transition: color 0.3s, background-color 0.3s, fill 0.3s;
}

.card__actions__button--delete {
  --focus-hover-color-fill: hsla(0, 80%, 50%, 0.7);
  --surface-color: hsla(0, 60%, 50%, 0.3);
}

.card__actions__button:is(:focus, :hover) {
  transition: none;
  background-color: var(--surface-color);

  color: var(--focus-hover-color-fill);
  fill: var(--focus-hover-color-fill);
}

.card__actions__button svg {
  height: 75%;
  width: auto;
}

.card--skeleton .card__title {
  width: 65%;

  font-size: calc(var(--font-size-placeholder) - 2px);

  border-radius: 0.25rem;
  background-color: #ccc;
}
.card--skeleton .card__content {
  width: 70%;

  font-size: var(--font-size-placeholder);

  position: relative;
  border-radius: 0.25rem;
  background-color: #ccc;
}
/* .card--skeleton .card__content::after {
  content: '';
  position: absolute;
  top: calc(100% + 1ch);
  left: 0;

  width: 98%;
  height: 1ch;

  font-size: var(--font-size-placeholder);

  border-radius: 0.25rem;
  background-color: #ccc;
}
.card--skeleton .card__content::before {
  content: '';
  position: absolute;
  top: calc(100% + 3ch);
  left: 0;

  width: 102%;
  height: 1ch;

  font-size: var(--font-size-placeholder);

  border-radius: 0.25rem;
  background-color: #ccc;
} */
</style>
