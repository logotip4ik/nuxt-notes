<template>
  <div class="card-wrapper">
    <slot></slot>
    <div ref="cardSettings" class="card__settings">
      <div class="card__settings__actions">
        <transition name="fade" mode="out-in">
          <p
            v-if="isShowingUpdatedAt"
            key="1"
            class="card__settings__actions__info"
            @mouseleave="isShowingUpdatedAt = false"
          >
            Created: {{ formatDateTime(data.createdAt) }}
          </p>
          <p
            v-else
            key="2"
            class="card__settings__actions__info"
            @mouseenter="isShowingUpdatedAt = true"
          >
            Updated: {{ formatDateTime(data.updatedAt) }}
          </p>
        </transition>
        <button
          class="
            card__settings__actions__button
            card__settings__actions__button--delete
          "
          @click.stop.prevent="deleteNote"
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { format } from 'timeago.js'
import { gunUser } from '~/helpers'

// settigns height = 40

export default {
  props: { data: { type: Object, required: true, default: () => ({}) } },
  data: () => ({
    isShowingUpdatedAt: false,
  }),
  computed: {
    ...mapState(['serverHost']),
  },
  methods: {
    formatDateTime(date) {
      return format(new Date(date))
    },
    deleteNote() {
      this.$store.commit('update', ['isNextToDelete', true])
      gunUser.get('notes').get(this.data._['#']).put(null)
    },
  },
}
</script>

<style lang="scss">
.card-wrapper {
  .card__settings {
    overflow-y: hidden;
    max-height: 0px;
  }
  &:focus,
  &:hover,
  &:focus-within {
    .card__settings {
      max-height: 41px;
    }
  }
}
.card__settings {
  --fill-or-color: hsl(0, 0%, 70%);

  width: 100%;
  transition: max-height 0.4s, transform 0.4s;

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0.5rem 0rem;

    &__info {
      font-size: 0.9rem;
      font-weight: 300;
      color: var(--fill-or-color);
      cursor: pointer;

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
}
</style>
