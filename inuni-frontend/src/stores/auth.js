import { defineStore } from 'pinia'
import { 
  register as apiRegister, 
  login as apiLogin, 
  refreshToken as apiRefreshToken,
  logout as apiLogout,
  getCurrentUser,
  getProfile as apiGetProfile,
  updateProfile as apiUpdateProfile,
  uploadProfilePhoto as apiUploadProfilePhoto
} from '../api/index.js'
import { adminLogin as apiAdminLogin } from '../api/admin.js'

// Token storage helpers
const TOKEN_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const USER_KEY = 'user'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

function setRefreshToken(token) {
  localStorage.setItem(REFRESH_KEY, token)
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!getToken() && !!state.user,
    userId: (state) => state.user?.id,
    isAdmin: (state) => !!state.user?.is_admin,
    isProfileComplete: (state) => {
      if (!state.profile) return false
      return state.profile.first_name && 
             state.profile.last_name && 
             state.profile.role &&
             state.profile.interests?.length >= 3
    },
    token: () => getToken(),
    refreshToken: () => getRefreshToken()
  },

  actions: {
    // Инициализация при старте приложения
    async init() {
      if (this.initialized) return
      
      const token = getToken()
      const savedUser = localStorage.getItem(USER_KEY)
      
      if (token && savedUser) {
        try {
          this.user = JSON.parse(savedUser)
          // Проверяем токен через API
          const result = await getCurrentUser()
          if (result.user) {
            this.user = result.user
            // Загружаем профиль пользователя
            try {
              const profile = await apiGetProfile(this.user.id)
              this.profile = profile
            } catch (profileErr) {
              console.error('Failed to load profile:', profileErr)
            }
          }
        } catch (e) {
          console.error('Token validation failed:', e)
          clearTokens()
          this.user = null
        }
      }
      
      this.initialized = true
    },

    // Сохранение авторизации
    setAuth(user, accessToken, refreshToken) {
      console.log('Saving auth tokens:', { userId: user?.id, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })
      this.user = user
      setToken(accessToken)
      setRefreshToken(refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      console.log('Tokens saved to localStorage')
    },

    // Регистрация с JWT
    async register(email, password, userData) {
      this.loading = true
      this.error = null
      
      try {
        const result = await apiRegister(email, password, userData.firstName, userData.lastName)
        
        if (!result.success) {
          throw new Error(result.error || 'Ошибка регистрации')
        }
        
        // Сохраняем токены
        this.setAuth(result.user, result.accessToken, result.refreshToken)
        
        // Загружаем профиль пользователя (может быть пустым для нового пользователя)
        try {
          const profile = await apiGetProfile(result.user.id)
          this.profile = profile
        } catch (profileErr) {
          console.log('No profile yet for new user:', profileErr)
          this.profile = null
        }
        
        return { success: true, user: result.user }
      } catch (err) {
        this.error = this.translateAuthError(err.message)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Admin вход с JWT
    async adminLogin(email, password) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Admin login started...')
        const result = await apiAdminLogin(email, password)
        console.log('Admin login result:', { 
          success: result.success, 
          hasUser: !!result.user, 
          hasAccessToken: !!result.accessToken,
          hasRefreshToken: !!result.refreshToken,
          accessTokenPrefix: result.accessToken ? result.accessToken.substring(0, 20) + '...' : 'none'
        })
        
        if (!result.success) {
          throw new Error(result.error || 'Invalid admin credentials')
        }
        
        if (!result.accessToken) {
          console.error('No accessToken in login result!')
          throw new Error('Login failed: no token received')
        }
        
        // Сохраняем токены
        this.setAuth(result.user, result.accessToken, result.refreshToken)
        console.log('Auth saved, verifying localStorage:', {
          tokenExists: !!localStorage.getItem('accessToken'),
          refreshExists: !!localStorage.getItem('refreshToken')
        })
        
        // Загружаем профиль пользователя
        try {
          const profile = await apiGetProfile(result.user.id)
          this.profile = profile
          console.log('Profile loaded after admin login:', profile)
        } catch (profileErr) {
          console.error('Failed to load profile after admin login:', profileErr)
        }
        
        return { success: true, user: result.user, isAdmin: true }
      } catch (err) {
        this.error = err.message
        console.error('Admin login error:', err)
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    // Вход с JWT
    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const result = await apiLogin(email, password)
        
        if (!result.success) {
          throw new Error(result.error || 'Ошибка входа')
        }
        
        // Сохраняем токены
        this.setAuth(result.user, result.accessToken, result.refreshToken)
        
        // Загружаем профиль пользователя
        try {
          const profile = await apiGetProfile(result.user.id)
          this.profile = profile
        } catch (profileErr) {
          console.error('Failed to load profile after login:', profileErr)
        }
        
        return { success: true }
      } catch (err) {
        this.error = this.translateAuthError(err.message)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Обновление токена
    async refreshAccessToken() {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }
      
      try {
        const result = await apiRefreshToken(refreshToken)
        setToken(result.accessToken)
        return result.accessToken
      } catch (err) {
        this.logout()
        throw err
      }
    },

    // Выход
    async logout() {
      const refreshToken = getRefreshToken()
      
      try {
        if (refreshToken) {
          await apiLogout(refreshToken)
        }
      } catch (err) {
        console.error('Logout error:', err)
      }
      
      this.user = null
      this.profile = null
      clearTokens()
      
      return { success: true }
    },

    // Обновление профиля
    async updateProfile(updates) {
      if (!this.user?.id) {
        return { success: false, error: 'Пользователь не авторизован' }
      }
      
      try {
        const result = await apiUpdateProfile(this.user.id, updates)
        this.profile = result
        return { success: true, profile: result }
      } catch (err) {
        console.error('Update profile error:', err)
        return { success: false, error: err.message }
      }
    },

    // Загрузка фото профиля
    async uploadProfilePhoto(file) {
      if (!this.user?.id) {
        return { success: false, error: 'Пользователь не авторизован' }
      }
      
      try {
        const result = await apiUploadProfilePhoto(this.user.id, file)
        if (result.photoUrl && this.profile) {
          this.profile.profile_photo = result.photoUrl
        }
        return { success: true, photoUrl: result.photoUrl }
      } catch (err) {
        console.error('Upload photo error:', err)
        return { success: false, error: err.message }
      }
    },

    // Очистка ошибок
    clearError() {
      this.error = null
    },

    // Перевод ошибок
    translateAuthError(message) {
      const translations = {
        'Invalid credentials': 'Неверный email или пароль',
        'Invalid login credentials': 'Неверный email или пароль',
        'Email not confirmed': 'Email не подтверждён',
        'User already registered': 'Пользователь уже зарегистрирован',
        'User already exists': 'Пользователь уже зарегистрирован',
        'Password should be at least 6 characters': 'Пароль должен быть минимум 6 символов',
        'Email and password (min 6 chars) required': 'Email и пароль (мин. 6 символов) обязательны',
        'Unable to validate email address: invalid format': 'Неверный формат email',
        'duplicate key value violates unique constraint': 'Пользователь уже зарегистрирован',
        'Access token required': 'Требуется авторизация',
        'Invalid or expired access token': 'Сессия истекла, войдите снова',
        'Refresh token required': 'Требуется обновление сессии',
        'Invalid refresh token': 'Неверный токен обновления',
        'Refresh token not found or expired': 'Сессия истекла, войдите снова'
      }
      return translations[message] || message
    }
  }
})
