<template>
  <div class="main" role="main">
    {{ loading }}
    <transition name="fade" mode="out-in">
      <ul v-if="notes.length !== 0 && loading === false" class="main__notes">
        <li v-for="note in notes" :key="note.id">{{ note }}</li>
      </ul>
      <CardSkeleton v-else-if="notes.length === 0 && loading === true">
        Skeleton
      </CardSkeleton>
      <div v-else-if="notes.length === 0 && loading === false">
        Your notes are empty
      </div>
    </transition>
    {{ notes }}
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    loading: true,
  }),
  computed: {
    ...mapState(['notes']),
  },
  mounted() {
    this.fetchNotes()
  },
  methods: {
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
