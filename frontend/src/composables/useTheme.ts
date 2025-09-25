import { ref, computed, watch, readonly } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

const THEME_KEY = 'app-theme'

// 全局主题状态
const theme = ref<Theme>((localStorage.getItem(THEME_KEY) as Theme) || 'auto')

// 系统主题检测
const prefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  prefersDark.value = e.matches
})

// 计算当前实际主题
const currentTheme = computed(() => {
  if (theme.value === 'auto') {
    return prefersDark.value ? 'dark' : 'light'
  }
  return theme.value
})

// 主题切换函数
const setTheme = (newTheme: Theme) => {
  theme.value = newTheme
  localStorage.setItem(THEME_KEY, newTheme)
}

// 切换主题
const toggleTheme = () => {
  const themes: Theme[] = ['light', 'dark', 'auto']
  const currentIndex = themes.indexOf(theme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  setTheme(themes[nextIndex])
}

// 应用主题到DOM
const applyTheme = () => {
  const root = document.documentElement
  
  if (currentTheme.value === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
  
  // 设置CSS变量
  if (currentTheme.value === 'dark') {
    root.style.setProperty('--bg-primary', '#0f172a')
    root.style.setProperty('--bg-secondary', '#1e293b')
    root.style.setProperty('--bg-tertiary', '#334155')
    root.style.setProperty('--text-primary', '#f8fafc')
    root.style.setProperty('--text-secondary', '#cbd5e1')
    root.style.setProperty('--text-tertiary', '#94a3b8')
    root.style.setProperty('--border-color', '#475569')
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)')
  } else {
    root.style.setProperty('--bg-primary', '#ffffff')
    root.style.setProperty('--bg-secondary', '#f8fafc')
    root.style.setProperty('--bg-tertiary', '#f1f5f9')
    root.style.setProperty('--text-primary', '#0f172a')
    root.style.setProperty('--text-secondary', '#475569')
    root.style.setProperty('--text-tertiary', '#64748b')
    root.style.setProperty('--border-color', '#e2e8f0')
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)')
  }
}

// 监听主题变化并应用
watch(currentTheme, applyTheme, { immediate: true })

// 主题图标映射
const themeIcons = {
  light: 'SunIcon',
  dark: 'MoonIcon',
  auto: 'ComputerDesktopIcon'
}

// 主题名称映射
const themeNames = {
  light: '浅色主题',
  dark: '深色主题',
  auto: '跟随系统'
}

export function useTheme() {
  return {
    theme: readonly(theme),
    currentTheme: readonly(currentTheme),
    prefersDark: readonly(prefersDark),
    setTheme,
    toggleTheme,
    themeIcons,
    themeNames,
    isDark: computed(() => currentTheme.value === 'dark'),
    isLight: computed(() => currentTheme.value === 'light'),
    isAuto: computed(() => theme.value === 'auto')
  }
}

// 导出只读的主题状态供其他地方使用
export { currentTheme as theme, prefersDark }