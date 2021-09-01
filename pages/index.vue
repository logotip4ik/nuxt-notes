<template>
  <div role="main" class="main"></div>
</template>

<script>
import { constants } from '~/helpers'

export default {
  beforeMount() {
    const gunUser = localStorage.getItem(`${constants.GUN_PREFIX}user`)
    if (!gunUser) return (window.location.pathname = '/login')
  },
}
</script>
