<template>
  <div>
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !collapsed"
      class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
      @click="collapsed = true"
    ></div>
    
    <div class="sidebar" :class="{ 'sidebar-collapsed': collapsed }" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <!-- 侧边栏背景 -->
    <div class="sidebar-background">
      <SidebarAnimations />
      <!-- 渐变背景 -->
      <div class="sidebar-gradient"></div>
      <!-- 网格背景 -->
      <div class="sidebar-grid"></div>
      <!-- 光晕效果 -->
      <div class="sidebar-glow"></div>
      <!-- 噪点纹理 -->
      <div class="sidebar-noise"></div>
    </div>

    <!-- 侧边栏内容 -->
    <div class="sidebar-content">
      <!-- Logo 区域 -->
      <div class="sidebar-header">
        <div class="logo-container" @click="toggleSidebar">
          <div class="logo-icon">
            <!-- Logo -->
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 2L2 7v10c0 5.55 3.84 7.74 9 9 5.16-1.26 9-3.45 9-9V7l-10-5z" 
                stroke="currentColor" 
                stroke-width="1.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                fill="url(#logoGradient)"
              />
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <Transition name="fade-slide">
            <div v-if="!collapsed" class="logo-text">
              <h1 class="logo-title">项目管理</h1>
              <span class="logo-subtitle">管理系统</span>
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
          <div v-if="!collapsed" class="nav-section-title">
            <span class="section-text">主要功能</span>
            <div class="section-line"></div>
          </div>
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
              <div class="nav-item-background"></div>
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
              <div class="nav-item-glow"></div>
            </router-link>
          </div>
        </div>

        <div class="nav-section">
          <div v-if="!collapsed" class="nav-section-title">
            <span class="section-text">工具</span>
            <div class="section-line"></div>
          </div>
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
              <div class="nav-item-background"></div>
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
              <div class="nav-item-glow"></div>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Tesla Footer -->
      <div class="tesla-footer p-4 border-t border-white/10 space-y-4">
        <!-- Tesla Theme Toggle -->
        <button 
          @click="$emit('toggle-theme')"
          class="tesla-theme-toggle w-full flex items-center justify-center px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group"
        >
          <Icon name="heroicons:sun" class="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
          <span v-if="isOpen" class="ml-3 text-sm font-medium text-white">能源模式</span>
        </button>

        <!-- Tesla User Section -->
        <div class="tesla-user-section relative">
          <button 
            @click="showUserMenu = !showUserMenu"
            class="tesla-user-btn w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-300 group"
          >
            <div class="tesla-avatar w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Icon name="heroicons:user" class="w-4 h-4 text-white" />
            </div>
            <div v-if="isOpen" class="tesla-user-info ml-3 flex-1 text-left">
              <p class="tesla-user-name text-sm font-medium text-white">Tesla User</p>
              <p class="tesla-user-role text-xs text-white/70">System Admin</p>
            </div>
            <Icon v-if="isOpen" name="heroicons:chevron-up" 
                  :class="['w-4 h-4 text-white/70 transition-transform duration-300', showUserMenu ? 'rotate-180' : '']" />
          </button>

          <!-- Tesla User Menu -->
          <Transition name="slide-up">
            <div v-if="showUserMenu && isOpen" class="tesla-user-menu absolute bottom-full left-0 right-0 mb-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-2 shadow-2xl">
              <a href="#" class="tesla-menu-item flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-white">
                <Icon name="heroicons:user-circle" class="w-4 h-4 mr-3" />
                个人资料
              </a>
              <a href="#" class="tesla-menu-item flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-white">
                <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 mr-3" />
                系统设置
              </a>
              <hr class="my-2 border-white/10">
              <a href="#" class="tesla-menu-item flex items-center px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm text-red-400">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-3" />
                退出登录
              </a>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 用户菜单弹出层 -->
    <Transition name="slide-up">
      <div v-if="showUserMenu && !collapsed" class="user-menu tesla-menu">
        <div class="user-menu-item" @click="handleProfile">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          个人档案
        </div>
        <div class="user-menu-item" @click="handleSettings">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          系统设置
        </div>
        <div class="user-menu-divider"></div>
        <div class="user-menu-item danger" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          安全退出
        </div>
      </div>
    </Transition>

    <!-- 悬浮提示 -->
    <Transition name="fade">
      <div 
        v-if="collapsed && hoveredItem" 
        class="sidebar-tooltip tesla-tooltip"
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
.sidebar {
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
  padding: 2rem 1.5rem;
  z-index: 10;
}

/* Tesla Header 设计 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  position: relative;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, transparent);
  animation: header-glow 3s ease-in-out infinite;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

.logo-container:hover {
  transform: translateX(4px);
}

.logo-container:hover .logo-icon {
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.4),
    0 0 40px rgba(0, 212, 255, 0.2),
    inset 0 0 20px rgba(0, 212, 255, 0.1);
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: 
    linear-gradient(135deg, #00d4ff 0%, #0099cc 50%, #006699 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 32px rgba(0, 212, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.logo-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.logo-container:hover .logo-icon::before {
  transform: translateX(100%);
}

.logo-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
  filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.5));
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #00d4ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.logo-subtitle {
  font-size: 0.75rem;
  color: rgba(0, 212, 255, 0.7);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.collapse-button {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(0, 212, 255, 0.2);
  background: rgba(0, 212, 255, 0.05);
  color: rgba(0, 212, 255, 0.8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.collapse-button:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.4);
  color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.collapse-button.collapsed {
  transform: rotate(180deg);
}

.collapse-button svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

/* Tesla Navigation 设计 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 212, 255, 0.3) transparent;
  padding-right: 4px;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.5);
}

.nav-section {
  margin-bottom: 2.5rem;
}

.nav-section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
}

.section-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(0, 212, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.3), transparent);
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  border: 1px solid transparent;
}

.nav-item-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(0, 153, 204, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover .nav-item-background {
  opacity: 1;
}

.nav-item:hover {
  color: #ffffff;
  transform: translateX(6px);
  border-color: rgba(0, 212, 255, 0.2);
  box-shadow: 
    0 4px 20px rgba(0, 212, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.nav-item-active {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 153, 204, 0.1));
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 212, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-item-active .nav-item-background {
  opacity: 1;
}

.nav-item-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.nav-item:hover .nav-item-icon {
  color: #00d4ff;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
}

.nav-item-active .nav-item-icon {
  color: #00d4ff;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
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
  font-weight: 500;
  letter-spacing: 0.01em;
}

.nav-item-badge {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: #000000;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  min-width: 1.5rem;
  text-align: center;
  box-shadow: 
    0 2px 8px rgba(0, 212, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: badge-pulse 2s ease-in-out infinite;
}

.nav-item-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border-radius: 0 2px 2px 0;
  transition: height 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.nav-item-active .nav-item-indicator {
  height: 70%;
}

.nav-item-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover .nav-item-glow {
  opacity: 1;
}

/* Tesla Footer 设计 */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 212, 255, 0.1);
  position: relative;
}

.sidebar-footer::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, transparent);
  animation: footer-glow 3s ease-in-out infinite reverse;
}

.tesla-button {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
}

.tesla-button:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.footer-item:hover {
  color: #ffffff;
  transform: translateX(4px);
}

.footer-item-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: all 0.3s ease;
}

.footer-item:hover .footer-item-icon {
  color: #00d4ff;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
}

/* Tesla User Section */
.tesla-user {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 153, 204, 0.05));
  border: 1px solid rgba(0, 212, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.tesla-user::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.05) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.tesla-user:hover::before {
  transform: translateX(100%);
}

.tesla-user:hover {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 153, 204, 0.08));
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.15);
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  border: 2px solid rgba(0, 212, 255, 0.3);
}

.avatar-ring {
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  z-index: -1;
  animation: avatar-pulse 3s ease-in-out infinite;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.tesla-user:hover .user-avatar img {
  transform: scale(1.05);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(0, 212, 255, 0.7);
  line-height: 1.2;
  font-weight: 500;
}

.user-menu-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(0, 212, 255, 0.6);
  transition: all 0.3s ease;
}

.tesla-user:hover .user-menu-icon {
  transform: rotate(180deg);
  color: #00d4ff;
}

/* Tesla Menu */
.tesla-menu {
  position: absolute;
  bottom: 6rem;
  left: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 15, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  padding: 0.75rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 212, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-menu-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-menu-item:hover::before {
  opacity: 1;
}

.user-menu-item:hover {
  color: #ffffff;
  transform: translateX(4px);
}

.user-menu-item.danger:hover {
  color: #ff4444;
}

.user-menu-item.danger:hover::before {
  background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
}

.user-menu-item svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.3s ease;
}

.user-menu-item:hover svg {
  filter: drop-shadow(0 0 8px currentColor);
}

.user-menu-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  margin: 0.5rem 0;
}

/* Tesla Tooltip */
.tesla-tooltip {
  position: fixed;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 15, 0.9));
  backdrop-filter: blur(20px);
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 212, 255, 0.1);
  z-index: 1001;
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

/* Tesla Animations */
@keyframes tesla-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes grid-flow {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, 20px); }
}

@keyframes glow-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes header-glow {
  0%, 100% { opacity: 0.5; width: 60px; }
  50% { opacity: 1; width: 120px; }
}

@keyframes footer-glow {
  0%, 100% { opacity: 0.5; width: 60px; }
  50% { opacity: 1; width: 120px; }
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes avatar-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Enhanced Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 - Tesla风格 */
@media (max-width: 768px) {
  .tesla-sidebar {
    width: 100%;
    max-width: 320px;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
    transform: translateX(-100%);
  }
  
  .tesla-sidebar:not(.sidebar-collapsed) {
    transform: translateX(0);
  }
  
  .sidebar-collapsed {
    transform: translateX(-100%);
  }
  
  .nav-item {
    padding: 1.25rem;
  }
  
  .nav-item-icon {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .nav-item-label {
    font-size: 1rem;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .tesla-sidebar {
    width: 280px;
  }
  
  .sidebar-collapsed {
    width: 70px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item:hover {
    background: rgba(0, 212, 255, 0.1);
  }
  
  .nav-item:active {
    background: rgba(0, 212, 255, 0.2);
    transform: scale(0.98);
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .sidebar-background {
    background: #000000;
    border-right: 2px solid #00d4ff;
  }
  
  .nav-item {
    border: 1px solid rgba(0, 212, 255, 0.3);
  }
  
  .nav-item-active {
    background: rgba(0, 212, 255, 0.3);
    border-color: #00d4ff;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 深色模式增强 */
@media (prefers-color-scheme: dark) {
  .sidebar-background {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 1) 0%,
      rgba(5, 5, 10, 0.98) 30%,
      rgba(10, 10, 20, 0.95) 70%,
      rgba(0, 0, 0, 1) 100%
    );
  }
  
  .tesla-gradient {
    background: 
      radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 153, 204, 0.08) 0%, transparent 50%);
  }
}
</style>