<template>
  <LiquidGlass 
    variant="header" 
    :interactive="false"
    class="liquid-header animate-fade-in-down"
  >
    <div class="header-content">
      <!-- Logo and Brand -->
      <div class="brand-section">
        <div class="logo-container">
          <svg 
            class="logo-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="brand-title">{{ title }}</h1>
          <span class="brand-subtitle" v-if="subtitle">{{ subtitle }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="navigation" v-if="showNavigation">
        <div class="nav-items">
          <router-link 
            v-for="item in navigationItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === item.path }"
          >
            <component :is="item.icon" class="nav-icon" v-if="item.icon" />
            <span class="nav-text">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Search Bar -->
      <div class="search-section" v-if="showSearch">
        <LiquidGlass 
          variant="default" 
          :interactive="true"
          :blur="16"
          :opacity="0.1"
          border-radius="2rem"
          class="search-container"
        >
          <div class="search-input-wrapper">
            <svg 
              class="search-icon" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fill-rule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clip-rule="evenodd" 
              />
            </svg>
            <input 
              type="text" 
              :placeholder="searchPlaceholder"
              v-model="searchQuery"
              @input="onSearchInput"
              class="search-input"
            />
            <button 
              v-if="searchQuery" 
              @click="clearSearch"
              class="search-clear"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path 
                  fill-rule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clip-rule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </LiquidGlass>
      </div>

      <!-- Action Buttons -->
      <div class="actions-section">
        <!-- Theme Toggle -->
        <ThemeToggle simple class="action-button" />

        <!-- Notifications -->
        <LiquidGlass 
          variant="default" 
          :interactive="true"
          :blur="12"
          :opacity="0.08"
          border-radius="0.75rem"
          class="action-button notifications"
          @click="toggleNotifications"
        >
          <div class="notification-wrapper">
            <svg class="notification-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span 
              v-if="notificationCount > 0" 
              class="notification-badge"
            >
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </span>
          </div>
        </LiquidGlass>

        <!-- User Menu -->
        <LiquidGlass 
          variant="default" 
          :interactive="true"
          :blur="12"
          :opacity="0.08"
          border-radius="0.75rem"
          class="action-button user-menu"
          @click="toggleUserMenu"
        >
          <div class="user-avatar">
            <img 
              v-if="userAvatar" 
              :src="userAvatar" 
              :alt="userName"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>

    <!-- Dropdown Menus -->
    <Transition name="dropdown">
      <div v-if="showNotificationDropdown" class="dropdown notifications-dropdown">
        <LiquidGlass variant="modal" :elevated="true">
          <div class="dropdown-header">
            <h3>通知</h3>
            <button @click="markAllAsRead" class="mark-all-read">全部标记为已读</button>
          </div>
          <div class="notifications-list">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread': !notification.read }"
            >
              <div class="notification-content">
                <p class="notification-text">{{ notification.message }}</p>
                <span class="notification-time">{{ formatTime(notification.time) }}</span>
              </div>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </Transition>

    <Transition name="dropdown">
      <div v-if="showUserDropdown" class="dropdown user-dropdown">
        <LiquidGlass variant="modal" :elevated="true">
          <div class="user-info">
            <div class="user-avatar-large">
              <img 
                v-if="userAvatar" 
                :src="userAvatar" 
                :alt="userName"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                {{ userInitials }}
              </div>
            </div>
            <div class="user-details">
              <h3 class="user-name">{{ userName }}</h3>
              <p class="user-email">{{ userEmail }}</p>
            </div>
          </div>
          <div class="user-menu-items">
            <button class="menu-item" @click="goToProfile">
              <svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              个人资料
            </button>
            <button class="menu-item" @click="goToSettings">
              <svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
              设置
            </button>
            <hr class="menu-divider" />
            <button class="menu-item logout" @click="logout">
              <svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              退出登录
            </button>
          </div>
        </LiquidGlass>
      </div>
    </Transition>
  </LiquidGlass>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import LiquidGlass from './LiquidGlass.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

interface NavigationItem {
  label: string
  path: string
  icon?: any
}

interface Notification {
  id: string
  message: string
  time: Date
  read: boolean
}

interface Props {
  title?: string
  subtitle?: string
  showNavigation?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  navigationItems?: NavigationItem[]
  userName?: string
  userEmail?: string
  userAvatar?: string
  notifications?: Notification[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '项目管理系统',
  subtitle: 'Project Management',
  showNavigation: true,
  showSearch: true,
  searchPlaceholder: '搜索项目、任务...',
  navigationItems: () => [
    { label: '仪表板', path: '/dashboard' },
    { label: '项目', path: '/projects' },
    { label: '看板', path: '/kanban' },
    { label: '甘特图', path: '/gantt' }
  ],
  userName: '用户',
  userEmail: 'user@example.com',
  notifications: () => []
})

const emit = defineEmits<{
  search: [query: string]
  logout: []
}>()

const router = useRouter()

// Reactive state
const searchQuery = ref('')
const showNotificationDropdown = ref(false)
const showUserDropdown = ref(false)

// Computed properties
const userInitials = computed(() => {
  return props.userName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const notificationCount = computed(() => {
  return props.notifications.filter(n => !n.read).length
})

// Methods
const onSearchInput = () => {
  emit('search', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

const toggleNotifications = () => {
  showNotificationDropdown.value = !showNotificationDropdown.value
  showUserDropdown.value = false
}

const toggleUserMenu = () => {
  showUserDropdown.value = !showUserDropdown.value
  showNotificationDropdown.value = false
}

const markAllAsRead = () => {
  props.notifications.forEach(n => n.read = true)
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
  return `${Math.floor(minutes / 1440)}天前`
}

const goToProfile = () => {
  router.push('/profile')
  showUserDropdown.value = false
}

const goToSettings = () => {
  router.push('/settings')
  showUserDropdown.value = false
}

const logout = () => {
  emit('logout')
  showUserDropdown.value = false
}

// Click outside to close dropdowns
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown') && !target.closest('.action-button')) {
    showNotificationDropdown.value = false
    showUserDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.liquid-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 4rem;
}

/* Brand Section */
.brand-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.logo-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin: 0;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  opacity: 0.8;
}

/* Navigation */
.navigation {
  flex: 1;
  max-width: 32rem;
}

.nav-items {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  color: var(--text-primary, #1f2937);
  background: rgba(255, 255, 255, 0.1);
}

.nav-item-active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.nav-icon {
  width: 1rem;
  height: 1rem;
}

/* Search Section */
.search-section {
  flex: 1;
  max-width: 24rem;
}

.search-container {
  width: 100%;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary, #6b7280);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary, #1f2937);
  font-size: 0.875rem;
  placeholder-color: var(--text-secondary, #6b7280);
}

.search-input::placeholder {
  color: var(--text-secondary, #6b7280);
}

.search-clear {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary, #6b7280);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.search-clear:hover {
  color: var(--text-primary, #1f2937);
}

/* Actions Section */
.actions-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-button {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-button:hover {
  transform: scale(1.05);
}

.theme-toggle {
  padding: 0.75rem;
}

.theme-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-primary, #1f2937);
}

.notifications {
  padding: 0.75rem;
}

.notification-wrapper {
  position: relative;
}

.notification-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-primary, #1f2937);
}

.notification-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  min-width: 1.25rem;
  text-align: center;
  line-height: 1;
}

.user-menu {
  padding: 0.5rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
}

/* Dropdowns */
.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 20rem;
  max-width: 24rem;
  z-index: 1001;
}

.notifications-dropdown {
  right: 4rem;
}

.user-dropdown {
  right: 0;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.mark-all-read {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.mark-all-read:hover {
  background: rgba(102, 126, 234, 0.1);
}

.notifications-list {
  max-height: 20rem;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
  background: rgba(102, 126, 234, 0.05);
  border-left: 3px solid #667eea;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar-large {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  overflow: hidden;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.user-email {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.user-menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  color: var(--text-primary, #1f2937);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
  width: 100%;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-item.logout {
  color: #ef4444;
}

.menu-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.menu-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.menu-divider {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.95);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .search-section {
    max-width: 16rem;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-item {
    padding: 0.5rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    gap: 0.5rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .navigation {
    display: none;
  }
  
  .search-section {
    max-width: 12rem;
  }
  
  .dropdown {
    min-width: 16rem;
    max-width: 20rem;
  }
}

@media (max-width: 640px) {
  .search-section {
    display: none;
  }
  
  .brand-title {
    font-size: 1.125rem;
  }
  
  .logo-container {
    width: 2rem;
    height: 2rem;
  }
  
  .logo-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .brand-title {
    color: #f9fafb;
  }
  
  .brand-subtitle {
    color: #9ca3af;
  }
  
  .nav-item {
    color: #9ca3af;
  }
  
  .nav-item:hover {
    color: #f9fafb;
  }
  
  .search-input {
    color: #f9fafb;
  }
  
  .search-input::placeholder {
    color: #9ca3af;
  }
  
  .theme-icon,
  .notification-icon {
    color: #f9fafb;
  }
  
  .notification-text,
  .user-name {
    color: #f9fafb;
  }
  
  .notification-time,
  .user-email {
    color: #9ca3af;
  }
  
  .menu-item {
    color: #f9fafb;
  }
  
  .dropdown-header h3 {
    color: #f9fafb;
  }
}
</style>