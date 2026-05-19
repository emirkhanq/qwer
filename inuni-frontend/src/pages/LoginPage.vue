<template>
  <div class="login">
    <h2>Login</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="login">Login</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const email = ref('')
const password = ref('')
function login() {
  console.log('login', email.value)
}
</script>
