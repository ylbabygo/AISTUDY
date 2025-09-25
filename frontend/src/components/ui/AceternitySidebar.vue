<template>
  <div>
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !collapsed"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="collapsed = true"
    ></div>
    
    <div class="aceternity-sidebar" :class="{ 'sidebar-collapsed': collapsed }" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <!-- 侧边栏背景 -->
    <div class="sidebar-background">
      <SidebarAnimations />
      <div class="sidebar-gradient"></div>
      <div class="sidebar-noise"></div>
    </div>

    <!-- 侧边栏内容 -->
    <div class="sidebar-content">
      <!-- Logo 区域 -->
      <div class="sidebar-header">
        <div class="logo-container" @click="toggleSidebar">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <Transition name="fade-slide">
            <div v-if="!collapsed" class="logo-text">
              <h1 class="logo-title">TaskFlow</h1>
              <span class="logo-subtitle">Project Management</span>
            </div>
          </Transition>
        </div>
        
        <!-- 折叠按钮 -->
        <button 
          @click="toggleSidebar" 
          class="collapse-button"
          :class="{ 'collapsed': collapsed }"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M15 18l-6-6 6-6" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div v-if="!collapsed" class="nav-section-title">主要功能</div>
          <div class="nav-items">
            <router-link 
              v-for="item in mainNavItems" 
              :key="item.path"
              :to="item.path"
              class="nav-item"
              :class="{ 'nav-item-active': isActiveRoute(item.path) }"
              @click="handleNavClick(item)"
              @mouseenter="(e) => handleMouseEnter(item, e)"
              @mouseleave="handleMouseLeave"
            >
              <div class="nav-item-icon">
                <component :is="item.icon" />
              </div>
              <Transition name="fade-slide">
                <div v-if="!collapsed" class="nav-item-content">
                  <span class="nav-item-label">{{ item.label }}</span>
                  <span v-if="item.badge" class="nav-item-badge">{{ item.badge }}</span>
                </div>
              </Transition>
              <div class="nav-item-indicator"></div>
            </router-link>
          </div>
        </div>

        <div class="nav-section">
          <div v-if="!collapsed" class="nav-section-title">工具</div>
          <div class="nav-items">
            <router-link 
              v-for="item in toolNavItems" 
              :key="item.path"
              :to="item.path"
              class="nav-item"
              :class="{ 'nav-item-active': isActiveRoute(item.path) }"
              @click="handleNavClick(item)"
              @mouseenter="(e) => handleMouseEnter(item, e)"
              @mouseleave="handleMouseLeave"
            >
              <div class="nav-item-icon">
                <component :is="item.icon" />
              </div>
              <Transition name="fade-slide">
                <div v-if="!collapsed" class="nav-item-content">
                  <span class="nav-item-label">{{ item.label }}</span>
                  <span v-if="item.badge" class="nav-item-badge">{{ item.badge }}</span>
                </div>
              </Transition>
              <div class="nav-item-indicator"></div>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- 底部区域 -->
      <div class="sidebar-footer">
        <!-- 主题切换 -->
        <div class="footer-item" @click="toggleTheme">
          <div class="footer-item-icon">
            <svg v-if="isDark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <Transition name="fade-slide">
            <span v-if="!collapsed" class="footer-item-label">
              {{ isDark ? '浅色模式' : '深色模式' }}
            </span>
          </Transition>
        </div>

        <!-- 用户信息 -->
        <div class="user-section" @click="showUserMenu = !showUserMenu">
          <div class="user-avatar">
            <img :src="userAvatar" :alt="userName" />
          </div>
          <Transition name="fade-slide">
            <div v-if="!collapsed" class="user-info">
              <div class="user-name">{{ userName }}</div>
              <div class="user-role">{{ userRole }}</div>
            </div>
          </Transition>
          <Transition name="fade-slide">
            <div v-if="!collapsed" class="user-menu-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 用户菜单弹出层 -->
    <Transition name="slide-up">
      <div v-if="showUserMenu && !collapsed" class="user-menu">
        <div class="user-menu-item" @click="handleProfile">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          个人资料
        </div>
        <div class="user-menu-item" @click="handleSettings">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          设置
        </div>
        <div class="user-menu-divider"></div>
        <div class="user-menu-item danger" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          退出登录
        </div>
      </div>
    </Transition>

    <!-- 悬浮提示 -->
    <Transition name="fade">
      <div 
        v-if="collapsed && hoveredItem" 
        class="sidebar-tooltip"
        :style="tooltipStyle"
      >
        {{ hoveredItem.label }}
      </div>
    </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import SidebarAnimations from './SidebarAnimations.vue'
import { 
  HomeIcon, 
  FolderIcon, 
  ViewColumnsIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  BellIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

interface NavItem {
  label: string
  path: string
  icon: any
  badge?: string | number
}

interface Props {
  collapsed?: boolean
  userName?: string
  userRole?: string
  userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  userName: '用户',
  userRole: '项目经理',
  userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'nav-click': [item: NavItem]
}>()

const route = useRoute()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()

const collapsed = ref(props.collapsed)
const showUserMenu = ref(false)
const hoveredItem = ref<NavItem | null>(null)
const tooltipStyle = ref({})
const isMobile = ref(false)

// 检测移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    collapsed.value = true
    emit('update:collapsed', collapsed.value)
  }
}

// 主要导航项
const mainNavItems: NavItem[] = [
  { label: '仪表板', path: '/', icon: HomeIcon },
  { label: '项目', path: '/projects', icon: FolderIcon, badge: '5' },
  { label: '看板', path: '/kanban', icon: ViewColumnsIcon },
  { label: '甘特图', path: '/gantt', icon: ChartBarIcon }
]

// 工具导航项
const toolNavItems: NavItem[] = [
  { label: '文档', path: '/documents', icon: DocumentTextIcon },
  { label: '通知', path: '/notifications', icon: BellIcon, badge: '3' },
  { label: '设置', path: '/settings', icon: Cog6ToothIcon }
]

// 方法
const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  emit('update:collapsed', collapsed.value)
}

const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleNavClick = (item: NavItem) => {
  emit('nav-click', item)
  if (window.innerWidth < 768) {
    collapsed.value = true
    emit('update:collapsed', collapsed.value)
  }
}

const handleProfile = () => {
  router.push('/profile')
  showUserMenu.value = false
}

const handleSettings = () => {
  router.push('/settings')
  showUserMenu.value = false
}

const handleLogout = () => {
  console.log('退出登录')
  showUserMenu.value = false
}

const handleMouseEnter = (item: NavItem, event: MouseEvent) => {
  if (collapsed.value) {
    hoveredItem.value = item
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    tooltipStyle.value = {
      top: `${rect.top + rect.height / 2}px`,
      left: `${rect.right + 12}px`
    }
  }
}

const handleMouseLeave = () => {
  hoveredItem.value = null
}

// 响应式处理
const handleResize = () => {
  if (window.innerWidth < 768) {
    collapsed.value = true
    emit('update:collapsed', collapsed.value)
  }
}

// 触摸手势处理
let touchStartX = 0
let touchStartY = 0

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchMove = (e) => {
  if (!isMobile.value) return
  
  const touchX = e.touches[0].clientX
  const touchY = e.touches[0].clientY
  const deltaX = touchX - touchStartX
  const deltaY = touchY - touchStartY
  
  // 防止垂直滚动时触发侧边栏
  if (Math.abs(deltaY) > Math.abs(deltaX)) return
  
  e.preventDefault()
}

const handleTouchEnd = (e) => {
  if (!isMobile.value) return
  
  const touchEndX = e.changedTouches[0].clientX
  const deltaX = touchEndX - touchStartX
  
  // 向右滑动超过50px时展开侧边栏
  if (deltaX > 50 && collapsed.value) {
    collapsed.value = false
    emit('update:collapsed', collapsed.value)
  }
  // 向左滑动超过50px时收起侧边栏
  else if (deltaX < -50 && !collapsed.value) {
    collapsed.value = true
    emit('update:collapsed', collapsed.value)
  }
}

onMounted(() => {
  // 初始化动画
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.aceternity-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.95) 50%,
    rgba(15, 23, 42, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(148, 163, 184, 0.1);
}

.sidebar-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.05) 0%,
    transparent 50%,
    rgba(147, 51, 234, 0.05) 100%
  );
}

.sidebar-noise {
  position: absolute;
  inset: 0;
  opacity: 0.02;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

.sidebar-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logo-container:hover {
  transform: translateX(2px);
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.logo-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.8);
  font-weight: 500;
}

.collapse-button {
  width: 2rem;
  height: 2rem;
  border: none;
  background: rgba(148, 163, 184, 0.1);
  color: rgba(148, 163, 184, 0.8);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-button:hover {
  background: rgba(148, 163, 184, 0.2);
  color: white;
}

.collapse-button.collapsed {
  transform: rotate(180deg);
}

.collapse-button svg {
  width: 1rem;
  height: 1rem;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(148, 163, 184, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding: 0 0.75rem;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: rgba(148, 163, 184, 0.8);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-item:hover {
  color: white;
  transform: translateX(4px);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item-active {
  color: white;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.nav-item-active::before {
  opacity: 1;
}

.nav-item-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.nav-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  position: relative;
  z-index: 1;
}

.nav-item-label {
  flex: 1;
}

.nav-item-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  min-width: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.nav-item-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.nav-item-active .nav-item-indicator {
  height: 60%;
}

/* Footer */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  color: rgba(148, 163, 184, 0.8);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.footer-item:hover {
  color: white;
  background: rgba(148, 163, 184, 0.1);
}

.footer-item-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(148, 163, 184, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.user-section:hover {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.8);
  line-height: 1.2;
}

.user-menu-icon {
  width: 1rem;
  height: 1rem;
  color: rgba(148, 163, 184, 0.6);
  transition: transform 0.2s ease;
}

.user-section:hover .user-menu-icon {
  transform: rotate(180deg);
}

/* User Menu */
.user-menu {
  position: absolute;
  bottom: 5rem;
  left: 1rem;
  right: 1rem;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.75rem;
  padding: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: rgba(148, 163, 184, 0.8);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.user-menu-item:hover {
  color: white;
  background: rgba(148, 163, 184, 0.1);
}

.user-menu-item.danger:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.user-menu-item svg {
  width: 1rem;
  height: 1rem;
}

.user-menu-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.1);
  margin: 0.5rem 0;
}

/* Tooltip */
.sidebar-tooltip {
  position: fixed;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  pointer-events: none;
  white-space: nowrap;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .aceternity-sidebar {
    width: 100%;
    max-width: 280px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
  }
  
  .aceternity-sidebar:not(.sidebar-collapsed) {
    transform: translateX(0);
  }
  
  .sidebar-collapsed {
    transform: translateX(-100%);
  }
  
  .nav-item {
    padding: 1rem;
  }
  
  .nav-item-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .nav-item-text {
    font-size: 1rem;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .aceternity-sidebar {
    width: 240px;
  }
  
  .sidebar-collapsed {
    width: 60px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  .nav-item:active {
    background: rgba(59, 130, 246, 0.2);
    transform: scale(0.98);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .sidebar-background {
    background: linear-gradient(
      135deg,
      rgba(3, 7, 18, 0.95) 0%,
      rgba(15, 23, 42, 0.95) 50%,
      rgba(3, 7, 18, 0.95) 100%
    );
  }
}
</style>