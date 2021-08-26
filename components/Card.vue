<template>
  <div
    :class="{
      card: true,
      'card--skeleton': skeleton,
      'card--expanded': !isCollapsed,
    }"
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
      <transition name="fade" mode="out-in">
        <button
          v-if="!isEditing && isCollapsable"
          class="card__actions__button card__actions__button--info"
          @click="isCollapsed = true"
        >
          Show Less
        </button>
        <span
          v-else-if="isEditing"
          class="card__actions__button card__actions__button--keys"
        >
          Hit <kbd>Ctrl + Enter</kbd> to save
        </span>
      </transition>
    </div>
    <transition name="fade">
      <div
        v-if="isCollapsed && !skeleton && isCollapsable"
        class="card__overflow"
        @click.stop.prevent="showContents"
      ></div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import DOMPurify from 'dompurify'
import marked from 'marked'

export default {
  // TODO: add like blinking animation to placeholder text in skeleton mode(try to use only css)...
  props: {
    data: { type: Object, required: false, default: () => ({}) },
    skeleton: { type: Boolean, required: false, default: false },
  },
  data: () => ({
    isEditing: false,
    isCollapsed: true,
    isCollapsable: true,
    MAX_SIZE: 300,
  }),
  computed: {
    markdown() {
      const html = marked(this.data.content || '', {
        gfm: true,
        headerIds: false,
      })
      if (process.server === true) return ''
      DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName !== 'A') return
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferer')
      })
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

    const elSize = this.$el.scrollHeight

    if (elSize < this.MAX_SIZE) this.isCollapsable = false
  },
  methods: {
    showContents() {
      this.isCollapsed = !this.isCollapsed
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
        }, 0)
      this.$el.style.height = 'auto'
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
      const fieldsToSet = ['id', 'ownerId', 'updatedAt', 'createdAt']

      fieldsToSet.forEach((key) => (noteFromVuex[key] = noteFromServer[key]))
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

<style lang="scss">
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
  max-height: 300px;

  position: relative;
  padding: 1rem 1.25rem 1rem;
  border-radius: 0.5rem;
  overflow-wrap: break-word;
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

  &__title {
    font-size: 1.75rem;
    font-weight: 500;

    width: 100%;
    min-height: 2.25rem;
    overflow: hidden;
    // height: min-content;
    padding-inline: 0.25rem;

    &:hover,
    &:focus {
      border-radius: 0.5rem;
      outline: 1px solid rgba(0, 0, 0, 0.05);
    }
  }
  &__content {
    font-size: 14px;

    width: 100%;
    overflow: hidden;
    padding: 0.25rem;

    &--html {
      min-height: 3rem;
      cursor: pointer;

      &:focus,
      &:hover {
        border-radius: 0.5rem;
        outline: 1px solid rgba(0, 0, 0, 0.05);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 400;
      }
      ul,
      ol,
      dl,
      dt,
      dd {
        padding-left: 0.75rem;
      }

      code {
        padding: 0.15rem 0.4rem;
        border-radius: 0.2rem;
        background-color: hsla(0, 0%, 50%, 0.5);
        line-height: 1.5;

        font-family: Consolas, 'Courier New', Courier, monospace;
      }

      a {
        --link-color: hsla(0, 0%, 50%, 0.9);
        color: var(--link-color);
        text-decoration-thickness: 0.25px;
        transition: color 0.3s;

        &::before {
          content: '↗';
          font-size: 2rem;
        }

        &:hover {
          color: hsla(0, 0%, 60%, 1);
        }
      }
    }
  }
  &__actions {
    --fill-or-color: hsl(0, 0%, 70%);

    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;

    &__created-at {
      font-size: 0.9rem;
      font-weight: 300;
      color: var(--fill-or-color);

      padding-block: 0.27rem;
    }
    &__button {
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

      &--info {
        --focus-hover-color-fill: hsla(200, 80%, 50%, 0.7);
        --surface-color: hsla(200, 60%, 50%, 0.2);
      }

      &--keys {
        --focus-hover-color-fill: hsla(0, 0%, 50%, 1);
        --surface-color: hsla(0, 0%, 50%, 0.1);

        background-color: var(--surface-color);
        color: var(--focus-hover-color-fill);
        fill: var(--focus-hover-color-fill);
      }

      &--delete {
        --focus-hover-color-fill: hsla(0, 80%, 50%, 0.7);
        --surface-color: hsla(0, 60%, 50%, 0.3);
      }

      &:focus,
      &:hover {
        transition: none;
        background-color: var(--surface-color);

        color: var(--focus-hover-color-fill);
        fill: var(--focus-hover-color-fill);
      }

      svg {
        height: 75%;
        width: auto;
      }
    }
  }

  &__overflow {
    --main-color: 240;
    --bg-color: var(--main-color), var(--main-color), var(--main-color);
    position: absolute;
    left: 0;
    bottom: 0;

    display: inline-block;

    width: 100%;
    height: 100%;
    pointer-events: all;
    border-radius: 0.5rem;
    cursor: pointer;
    background-image: linear-gradient(
      to top,
      rgba(var(--bg-color), 1) 15%,
      rgba(var(--bg-color), 0.5),
      rgba(var(--bg-color), 0)
    );
  }

  &--skeleton {
    .card__title,
    .card__content {
      font-size: calc(var(--font-size-placeholder) - 2px);

      border-radius: 0.25rem;
      background-color: #ccc;
    }
    .card__title {
      width: 65%;
    }
    .card__content {
      width: 70%;
    }
  }

  &--expanded {
    // should be exact value not none or auto, becouse animation wont apply
    max-height: 100vh;
  }
}
.dark-mode {
  .card {
    background-color: var(--primary-color);
  }
  .card__overflow {
    --main-color: 80;
  }
  .card--skeleton .card__content,
  .card--skeleton .card__title {
    background-color: #333;
  }
}
</style>
