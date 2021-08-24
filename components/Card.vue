<template>
  <div
    :class="{ card: true, 'card--skeleton': skeleton }"
    @keypress.ctrl.enter.stop="saveNote"
    @keydown.esc.prevent="cancel"
    @blur.capture="() => toggleEditing(false)"
  >
    <textarea
      ref="title"
      rows="1"
      class="card__title no-input"
      :readonly="skeleton ? 'readonly' : false"
      :placeholder="skeleton ? null : 'Untitled'"
      @input="() => resize('title')"
      @keyup.enter.prevent="() => toggleEditing(true, 'content')"
      @focus="() => toggleEditing(true, 'title')"
    />
    <!-- TODO: fix textarea height in skeleton mode -->
    <!-- TODO: fix textarea in dark mode need some darker color -->
    <textarea
      v-if="isEditing"
      ref="content"
      class="card__content no-input"
      :readonly="skeleton ? 'readonly' : false"
      :value="data.content"
      :placeholder="skeleton ? null : '# Some markdown...'"
      @input="() => resize('content')"
      @focus="() => toggleEditing(true, 'content')"
    ></textarea>
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-else
      class="card__content card__content--html no-input"
      @click="() => toggleEditing(true, 'content')"
      @focus="() => toggleEditing(true, 'content')"
      v-html="markdown"
    ></div>
    <div v-if="!skeleton" class="card__actions">
      <p class="card__actions__created-at">
        Created: {{ formatDateTime(data.createdAt) }}
      </p>
      <transition name="fade">
        <button
          v-if="!isEditing"
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
      </transition>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format } from 'timeago.js'
import DOMPurify from 'dompurify'
import marked from 'marked'

export default {
  // TODO: at editing replace junk button with key bindings to save and cancel creating or editing
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
      const html = marked(this.data.content || '', {
        gfm: true,
        headerIds: false,
      })
      if (process.server === true) return ''
      return DOMPurify.sanitize(html)
    },
    ...mapState(['serverHost', 'serverStage']),
  },
  watch: {
    isEditing(val) {
      if (!val) return

      setTimeout(() => {
        this.resize('content')
      }, 0)
    },
  },
  mounted() {
    if (this.skeleton) return
    this.$refs.title.value = this.data.title
    this.resize('title')
  },
  methods: {
    formatDateTime(date) {
      return format(new Date(date))
    },
    cancel() {
      this.$emit('update-creating', false)
      this.toggleEditing(false)

      document.getElementById('dummy-input').focus()

      if (!this.data.title || !this.data.content) this.deleteNote(false)
      else {
        this.$refs.title.value = this.data.title
        this.$refs.content.value = this.data.content
      }
    },
    toggleEditing(val = false, el) {
      this.$el.style.height = `${this.$el.scrollHeight}px`
      this.$emit('update-editing', val)
      this.isEditing = val

      if (val && el)
        setTimeout(() => {
          this.resize(el)
          this.$refs[el].focus()
          this.$el.style.height = 'auto'
        }, 0)
    },
    resize(refId) {
      const el = this.$refs[refId]
      if (!el) return

      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight + 1}px`
    },
    deleteNote(sendReq = true) {
      const { notes } = this.$store.state

      for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === this.data.id) {
          notes.splice(i, 1)
          break
        }
      }

      if (this.$nuxt.isOffline) return
      if (!sendReq) return
      this.$axios
        .$delete(`${this.serverHost}/${this.serverStage}/note/${this.data.id}`)
        .then(() => this.$toast.show(`deleted note: ${this.data.id}`))
        .catch(() => this.$toast.error('something went, try again later...'))
    },
    updateNote(noteFromServer, noteFromVuex) {
      noteFromVuex.id = noteFromServer.id
      noteFromVuex.ownerId = noteFromServer.ownerId
      noteFromVuex.updatedAt = noteFromServer.updatedAt
      noteFromVuex.createdAt = noteFromServer.createdAt
    },
    saveNote() {
      if (this.$nuxt.isOffline)
        return this.$toast.error('You are offline, try again later')

      let noteFromVuex
      for (let i = 0; i < this.$store.state.notes.length; i++) {
        const note = this.$store.state.notes[i]
        if (note.id === this.data.id) {
          noteFromVuex = this.$store.state.notes[i]
          break
        }
      }

      const noteForReq = {
        title: this.$refs.title.value.trim(),
        content: this.$refs.content.value.trim(),
      }

      noteFromVuex.title = noteForReq.title
      noteFromVuex.content = noteForReq.content
      noteFromVuex.updatedAt = Date.now()

      document.getElementById('dummy-input').focus()
      this.$emit('update-creating', false)
      this.toggleEditing(false)

      if (!this.data.ownerId) {
        this.$axios
          .$post(`${this.serverHost}/${this.serverStage}/note`, noteForReq)
          .then(({ data }) => {
            this.updateNote(data, noteFromVuex)
            this.$toast.success('created new note')
          })
          .catch(() => {
            this.$toast.error('something went wrong, try again later')
            // this.$store.state.notes.splice(noteIdx, 1)
          })
      } else {
        this.$axios
          .$post(
            `${this.serverHost}/${this.serverStage}/note/${this.data.id}`,
            noteForReq
          )
          .then(({ data }) => {
            this.updateNote(data, noteFromVuex)
            this.$toast.success('updated note')
          })
          .catch(() => {
            this.$toast.error('something went wrong, try again later')
            // this.$store.state.notes.splice(noteIdx, 1)
          })
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
  color: currentColor;
  height: auto;

  display: inline-block;
}

.card {
  --font-size-placeholder: 1.5rem;

  width: 100%;

  padding: 1rem 1.25rem 1rem;
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
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1.5rem;
}
.dark-mode .card {
  background-color: var(--primary-color);
}

.card__title {
  width: 100%;
  font-size: 1.75rem;
  font-weight: 500;
  padding-inline: 0.25rem;
  overflow: hidden;
  height: min-content;
}
.card__title:is(:hover, :focus) {
  border-radius: 0.5rem;
  outline: 1px solid rgba(0, 0, 0, 0.05);
}
.card__content {
  width: 100%;
  font-size: 14px;
  overflow: hidden;
  padding: 0.25rem;
}
.card__content--html {
  min-height: 3rem;
  cursor: pointer;
}
.card__content--html:is(:hover, :focus) {
  border-radius: 0.5rem;
  outline: 1px solid rgba(0, 0, 0, 0.05);
}
.card__content--html h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 400;
}
.card__content--html ul,
ol,
dl,
dt,
dd {
  padding-left: 0.75rem;
}

.card__actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  --fill-or-color: hsl(0, 0%, 70%);
}

.card__actions__created-at {
  color: var(--fill-or-color);
  font-size: 0.9rem;
  font-weight: 300;
  padding-block: 0.27rem;
}

.card__actions__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;

  font: inherit;
  font-size: 0.8rem;

  block-size: 1.75rem;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: transparent;
  cursor: pointer;

  color: var(--fill-or-color);
  fill: var(--fill-or-color);

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
