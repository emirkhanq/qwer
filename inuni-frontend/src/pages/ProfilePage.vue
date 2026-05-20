<template>
  <div class="profile">
    <h2>Профиль</h2>
    <div v-if="profile">
      <p>{{ profile.first_name }} {{ profile.last_name }}</p>
      <p>{{ profile.role }}</p>
      <p>{{ profile.about }}</p>
    </div>
    <button @click="logout">Выйти</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const profile = ref(null)

onMounted(async () => {
  const userId = localStorage.getItem('userId')
  const res = await fetch(`/api/profiles/${userId}`)
  profile.value = await res.json()
})

function logout() {
  localStorage.clear()
  router.push('/login')
}
</script>
