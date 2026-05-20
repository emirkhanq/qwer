<template>
  <div class="app-page">
    <aside class="sidebar">
      <RouterLink to="/" class="sidebar-logo">
        <InUniLogo :height="36" variant="inuni-logo--compact" />
      </RouterLink>

      <nav class="sidebar-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item">
          <AppIcon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <div class="user-chip">
          <div class="user-avatar" :class="{ 'user-avatar--photo': !!profile.profilePhoto }">
            <img v-if="profile.profilePhoto" :src="profile.profilePhoto" alt="" class="user-avatar-img" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ profile.fullName }}</span>
            <span class="user-role">{{ profile.role }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'
import InUniLogo from './InUniLogo.vue'
import { createInitials } from '../lib/appState'
import { useAuthStore } from '../stores/auth.js'

export default {
  name: 'AppShell',
  components: {
    AppIcon,
    InUniLogo,
  },
  setup() {
    return { authStore: useAuthStore() }
  },
  computed: {
    profile() {
      // Используем authStore.profile, или пустой объект если нет
      const authProfile = this.authStore.profile || {}
      return {
        firstName: authProfile.first_name || '',
        lastName: authProfile.last_name || '',
        fullName: authProfile.full_name || `${authProfile.first_name || ''} ${authProfile.last_name || ''}`.trim() || 'Пользователь',
        role: authProfile.role || '',
        profilePhoto: authProfile.profile_photo || '',
      }
    },
    initials() {
      return createInitials(this.profile.firstName, this.profile.lastName)
    },
    isAdmin() {
      return !!this.authStore.user?.is_admin
    },
    navItems() {
      if (this.isAdmin) {
        return [
          { to: '/admin', label: 'Dashboard', icon: 'chart' },
          { to: '/admin/hackathons', label: 'Хакатоны', icon: 'trophy' },
        ]
      }
      return [
        { to: '/profile', label: 'Профиль', icon: 'user' },
        { to: '/teams', label: 'Команды', icon: 'trophy' },
        { to: '/swipe', label: 'Знакомства', icon: 'sparkles' },
        { to: '/chat', label: 'Чат', icon: 'chat' },
      ]
    },
  },
}
</script>

<style scoped>
.app-page {
  --c-bg: #080c1a;
  --c-surface: #0f1629;
  --c-card: #131a30;
  --c-border: rgba(255, 255, 255, 0.07);
  --c-red: #e63946;
  --c-red-dim: rgba(230, 57, 70, 0.12);
  --c-text: #e8eaf2;
  --c-muted: #8891b2;
  --c-white: #ffffff;
  font-family: 'Onest', sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 236px;
  flex-shrink: 0;
  background: rgba(15, 22, 41, 0.92);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  backdrop-filter: blur(12px);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  margin-bottom: 34px;
  padding: 0 4px;
  text-decoration: none;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-muted);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--c-text);
}

.nav-item.router-link-active {
  background: var(--c-red-dim);
  color: #f28b93;
  border: 1px solid rgba(230, 57, 70, 0.18);
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e63946, #1d4ed8);
  display: grid;
  place-items: center;
  font-family: 'Unbounded', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar--photo {
  background: transparent;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.user-info {
  min-width: 0;
}

.user-name,
.user-role {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-white);
}

.user-role {
  font-size: 11px;
  color: var(--c-muted);
}

.main-content {
  margin-left: 236px;
  flex: 1;
  min-height: 100vh;
  position: relative;
  min-width: 0;
}

@media (max-width: 1180px) {
  .sidebar {
    width: 92px;
    padding: 20px 12px;
  }

  .sidebar-logo {
    justify-content: center;
    padding: 0;
  }

  .user-info,
  .nav-item span {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 12px;
  }

  .user-chip {
    justify-content: center;
    padding: 8px;
  }

  .main-content {
    margin-left: 92px;
  }
}

@media (max-width: 760px) {
  .sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
