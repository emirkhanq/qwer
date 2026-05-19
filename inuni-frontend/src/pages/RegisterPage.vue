<template>
  <div class="register">
    <h2>Register</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="register">Register</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const email = ref('')
const password = ref('')
function register() {
  console.log('register', email.value)
}
</script>
