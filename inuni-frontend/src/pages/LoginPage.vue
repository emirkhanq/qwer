<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Войти в InUni</h2>
      <p v-if="error" class="error">{{ error }}</p>
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Пароль" />
      <button @click="login" :disabled="loading">
        {{ loading ? 'Входим...' : 'Войти' }}
      </button>
      <router-link to="/register">Нет аккаунта? Зарегистрироваться</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  if (!email.value || !password.value) {
    error.value = 'Заполните все поля'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem('token', data.token)
    router.push('/profile')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.login-card { background: white; padding: 2rem; border-radius: 12px; width: 360px; }
.error { color: red; margin-bottom: 1rem; }
input { display: block; width: 100%; margin-bottom: 1rem; padding: 0.75rem; border-radius: 8px; border: 1px solid #ddd; }
button { width: 100%; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; }
</style>
