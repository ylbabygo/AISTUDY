<template>
  <div id="app" :class="currentTheme">
    <!-- 背景效果 -->
    <BeamsBackground />
    
    <!-- 全局加载指示器 -->
    <LoadingSpinner 
      v-if="uiStore.loading"
      type="overlay"
      size="large"
      color="primary"
      text="加载中..."
      overlay
    />
    
    <!-- 开发模式下的应急清除loading按钮 -->
    <button 
      v-if="isDev && uiStore.loading"
      @click="uiStore.clearLoading()"
      class="fixed top-4 right-4 z-[9999] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
      title="应急清除loading状态（仅开发模式）"
    >
      清除Loading
    </button>

    <!-- 主要布局 -->
    <div class="app-layout">
      <!-- Aceternity 侧边栏 -->
      <AceternitySidebar 
        v-model:collapsed="sidebarCollapsed"
        :user-name="currentUser.name"
        :user-role="currentUser.role"
        :user-avatar="currentUser.avatar"
        @nav-click="handleNavClick"
      />
      
      <!-- 主内容区域 -->
      <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <PageTransition>
          <router-view />
        </PageTransition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useTheme } from '@/composables/useTheme'
import BeamsBackground from '@/components/ui/BeamsBackground.vue'
import AceternitySidebar from '@/components/ui/AceternitySidebar.vue'
import PageTransition from '@/components/transitions/PageTransition.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const uiStore = useUIStore()
const router = useRouter()
const { currentTheme } = useTheme()

// 开发模式检测
const isDev = import.meta.env.DEV

// 侧边栏状态
const sidebarCollapsed = ref(false)

// 当前用户信息
const currentUser = ref({
  name: '项目经理',
  role: '管理员',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format'
})

// Event handlers
const handleNavClick = (item: any) => {
  console.log('导航点击:', item)
  router.push(item.path)
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all 0.3s ease;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
}

/* Dark mode support */
#app.dark {
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.8) 0%,
    rgba(241, 245, 249, 0.8) 100%
  );
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow-x: hidden;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* 深色模式适配 */
.dark .main-content {
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.8) 0%,
    rgba(30, 41, 59, 0.8) 100%
  );
}

.dark .main-content::before {
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
}

.tesla-bg {
  background: radial-gradient(circle, #0f1b29 0%, #050a10 100%);
  min-height: 100vh;
}

/* Loading indicator styling */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 确保页面内容在加载时不会闪烁 */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-delay-200 {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>