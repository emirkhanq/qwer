<template>
  <div class="teams">
    <h2>Команды</h2>
    <div v-for="team in teams" :key="team.id" class="team-card">
      <h3>{{ team.name }}</h3>
      <p>{{ team.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const teams = ref([])

onMounted(async () => {
  const res = await fetch('/api/teams')
  teams.value = await res.json()
})
</script>
