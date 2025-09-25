import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/tesla.css'
import './assets/animations.css'
import 'tailwindcss/tailwind.css'
import { initCompatibilityCheck } from './utils/browserTest'
import { performanceMonitor } from './utils/performance'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化兼容性检测
initCompatibilityCheck()

// 在开发环境下启用性能监控
if (import.meta.env.DEV) {
  // 页面加载完成后记录性能指标
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logMetrics()
      
      // 检查性能是否良好
      if (!performanceMonitor.isPerformanceGood()) {
        console.warn('⚠️ 性能指标未达到最佳标准，建议优化')
      } else {
        console.log('✅ 性能指标良好')
      }
    }, 2000) // 等待2秒确保所有指标都被收集
  })
}

app.mount('#app')