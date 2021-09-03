<template>
  <div class="settings">
    <h2 class="settings__heading">Settings</h2>

    <ul class="settings__list">
      <li class="settings__list__item">
        <label for="sort">Sort by</label>
        <client-only>
          <v-select
            v-model="sortBy"
            :options="options"
            @input="checkIfValid"
          ></v-select>
        </client-only>
      </li>
    </ul>
  </div>
</template>

<script>
// TODO: add some settings to let user change theirs name or picture, but
// firstly need to add `fetchUser` method to index, cuz current website is taking
// user info from auth0
export default {
  data: () => ({
    options: ['Created', 'Updated'],
  }),
  computed: {
    sortBy: {
      get() {
        return this.$store.state.sortBy
      },
      set(val) {
        this.$store.commit('update', ['sortBy', val])
        localStorage.setItem('nn__sortBy', JSON.stringify(val))
      },
    },
  },
  methods: {
    checkIfValid(sortName) {
      if (!sortName) this.sortBy = 'Created'
    },
  },
}
</script>

<style lang="scss">
.settings {
  padding: 2rem 1rem;
  margin: 0 auto;
  max-width: 1000px;
  width: 100%;

  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  gap: 2rem;

  &__heading {
    font-size: 2rem;
    font-weight: 200;
    line-height: 1.125;

    width: 100%;

    // border-bottom: 1px solid #ccc;
  }

  &__list {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;

    width: 100%;
    list-style-type: none;

    & > *:nth-child(even) {
      background-color: hsla(0, 0%, 50%, 0.1);
    }

    &__item {
      width: 100%;
      padding: 0.75rem 0.5rem;

      display: inline-flex;
      justify-content: space-between;
      align-items: center;

      label {
        font-size: 1.125rem;
        font-weight: 200;
      }
      .v-select {
        flex-grow: 1;
        max-width: 175px;
      }
    }
  }
}

img {
  $size: 50px;

  max-width: $size;
  max-height: $size;
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  display: inline-block;

  border-radius: 50%;
}
</style>
