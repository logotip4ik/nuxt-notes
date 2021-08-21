<template>
  <div class="main" role="main">
    {{ loading }}
    <ul v-if="notes.length > 0" class="main__notes">
      <li v-for="note in notes" :key="note.id">{{ note }}</li>
    </ul>
    <div v-else>Your notes are empty</div>
  </div>
</template>

<script>
export default {
  data: () => ({
    loading: true,
    notes: [],
  }),
  mounted() {
    this.$axios
      .$get('http://localhost:3001/dev/note')
      .then((notes) => (this.notes = notes))
      .finally(() => (this.loading = false))
  },
}
</script>
