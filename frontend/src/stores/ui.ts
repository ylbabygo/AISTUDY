import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ViewMode } from '@/types'

export const useUIStore = defineStore('ui', () => {
  // 状态
  const loading = ref(false)
  const loadingCount = ref(0) // 引用计数
  const loadingTimeout = ref<NodeJS.Timeout | null>(null)
  const sidebarOpen = ref(true)
  const viewMode = ref<ViewMode>('kanban')
  const theme = ref<'dark' | 'light'>('dark')
  const notifications = ref<Array<{
    id: number
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>>([])

  // 计算属性
  const isDark = computed(() => theme.value === 'dark')
  const currentViewMode = computed(() => viewMode.value)

  // 方法
  const setLoading = (value: boolean) => {
    if (value) {
      loadingCount.value++
      loading.value = true
      
      // 设置超时保护，10秒后自动清除loading状态
      if (loadingTimeout.value) {
        clearTimeout(loadingTimeout.value)
      }
      loadingTimeout.value = setTimeout(() => {
        console.warn('Loading timeout reached, forcing loading state to false')
        loadingCount.value = 0
        loading.value = false
        loadingTimeout.value = null
      }, 10000)
    } else {
      loadingCount.value = Math.max(0, loadingCount.value - 1)
      if (loadingCount.value === 0) {
        loading.value = false
        if (loadingTimeout.value) {
          clearTimeout(loadingTimeout.value)
          loadingTimeout.value = null
        }
      }
    }
  }

  // 强制清除loading状态的方法
  const clearLoading = () => {
    loadingCount.value = 0
    loading.value = false
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value)
      loadingTimeout.value = null
    }
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode
  }

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'kanban' ? 'gantt' : 'kanban'
  }

  const setTheme = (newTheme: 'dark' | 'light') => {
    theme.value = newTheme
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const addNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ) => {
    const id = Date.now()
    notifications.value.push({ id, type, message, duration })
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  const removeNotification = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  return {
    // 状态
    loading,
    sidebarOpen,
    viewMode,
    theme,
    notifications,
    
    // 计算属性
    isDark,
    currentViewMode,
    
    // 方法
    setLoading,
    clearLoading,
    toggleSidebar,
    setViewMode,
    toggleViewMode,
    setTheme,
    toggleTheme,
    addNotification,
    removeNotification,
    clearNotifications
  }
})