<template>
  <Fragment>
    <Navbar></Navbar>
    {{ loading }}
  </Fragment>
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
