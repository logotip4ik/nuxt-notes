<template>
  <nav class="navbar">
    <img
      :src="$auth.user.picture"
      alt="profile avatar"
      class="navbar__avatar"
    />
  </nav>
</template>
// TODO: Create menu dropdown when cliking the img
<script>
export default {}
</script>

<style>
.navbar {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: var(--secondary-color);
  box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.25);

  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.navbar__avatar {
  --size: 50px;
  aspect-ratio: 1/1;
  width: var(--size);
  height: var(--size);

  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 10px -5px rgba(0, 0, 0, 0.25);
}
</style>
