// В production используем пустой base URL (nginx проксирует /api/)
// В dev — localhost:8080
const API_BASE_URL = ''

export function getApiBaseUrl() {
  return API_BASE_URL
}

const TOKEN_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

// Очистка токенов (для logout)
export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

let isRefreshing = false
let refreshPromise = null

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null ? data.error || data.message : data
    throw new Error(message || `HTTP ${response.status}`)
  }

  return data
}

// Функция для обновления access token
async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    throw new Error('No refresh token')
  }
  
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
  
  if (!response.ok) {
    // Если refresh не удался, очищаем токены
    clearAuthTokens()
    throw new Error('Session expired')
  }
  
  const data = await response.json()
  setAuthToken(data.accessToken)
  return data.accessToken
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken()
  console.log('API Request:', path, 'Token exists:', !!token)
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
    console.log('Authorization header set')
  } else {
    console.warn('No token found for request:', path)
  }

  // Добавляем таймаут 10 секунд
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    let response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    
    // Если получили 401, пробуем обновить токен
    if (response.status === 401 && token) {
      // Предотвращаем множественные refresh запросы
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
      }
      
      // Ждем завершения refresh
      await refreshPromise
      
      // Повторяем запрос с новым токеном
      const newToken = getAuthToken()
      headers.Authorization = `Bearer ${newToken}`
      
      // Создаем новый controller для повторного запроса
      const newController = new AbortController()
      const newTimeoutId = setTimeout(() => newController.abort(), 10000)
      
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        signal: newController.signal,
      })
      
      clearTimeout(newTimeoutId)
    }
    
    clearTimeout(timeoutId)
    return parseResponse(response)
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Запрос занял слишком много времени')
    }
    throw err
  }
}

export function postJson(path, body, options = {}) {
  return apiRequest(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  })
}
