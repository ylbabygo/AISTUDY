<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">性能测试页面</h1>
        
        <!-- 性能指标显示 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-900 mb-2">页面加载时间</h3>
            <p class="text-2xl font-bold text-blue-600">{{ metrics.loadTime }}ms</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-green-900 mb-2">首次内容绘制</h3>
            <p class="text-2xl font-bold text-green-600">{{ metrics.fcp }}ms</p>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-yellow-900 mb-2">最大内容绘制</h3>
            <p class="text-2xl font-bold text-yellow-600">{{ metrics.lcp }}ms</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-purple-900 mb-2">内存使用</h3>
            <p class="text-2xl font-bold text-purple-600">{{ metrics.memory }}MB</p>
          </div>
        </div>

        <!-- 懒加载图片测试 -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">懒加载图片测试</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <LazyImage
              v-for="i in 8"
              :key="i"
              :src="`https://picsum.photos/300/200?random=${i}`"
              :alt="`测试图片 ${i}`"
              class="rounded-lg"
            />
          </div>
        </div>

        <!-- 虚拟滚动测试 -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">虚拟滚动测试</h2>
          <div class="border rounded-lg">
            <VirtualList
              :items="virtualListItems"
              :item-height="60"
              :container-height="300"
              class="border rounded-lg"
            >
              <template #default="{ item, index }">
                <div class="flex items-center p-4 border-b hover:bg-gray-50">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <h4 class="font-semibold">{{ item.title }}</h4>
                    <p class="text-gray-600 text-sm">{{ item.description }}</p>
                  </div>
                </div>
              </template>
            </VirtualList>
          </div>
        </div>

        <!-- 缓存测试 -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">API缓存测试</h2>
          <div class="space-y-4">
            <div class="flex space-x-4">
              <button
                @click="testApiCache"
                :disabled="loading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? '测试中...' : '测试API缓存' }}
              </button>
              <button
                @click="clearCache"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                清除缓存
              </button>
            </div>
            <div v-if="cacheResults.length > 0" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold mb-2">缓存测试结果：</h4>
              <div class="space-y-2">
                <div v-for="(result, index) in cacheResults" :key="index" class="text-sm">
                  <span class="font-medium">请求 {{ index + 1 }}:</span>
                  <span class="ml-2">{{ result.time }}ms</span>
                  <span class="ml-2" :class="result.cached ? 'text-green-600' : 'text-blue-600'">
                    {{ result.cached ? '(缓存命中)' : '(网络请求)' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 性能建议 -->
        <div class="bg-blue-50 p-6 rounded-lg">
          <h2 class="text-2xl font-bold text-blue-900 mb-4">性能优化建议</h2>
          <div class="space-y-2 text-blue-800">
            <p v-if="metrics.loadTime > 3000" class="flex items-center">
              <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              页面加载时间较长，建议优化资源加载
            </p>
            <p v-if="metrics.fcp > 1800" class="flex items-center">
              <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              首次内容绘制时间可以进一步优化
            </p>
            <p v-if="metrics.lcp > 2500" class="flex items-center">
              <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              最大内容绘制时间需要优化
            </p>
            <p v-if="metrics.memory > 50" class="flex items-center">
              <span class="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              内存使用较高，建议检查内存泄漏
            </p>
            <p v-if="isPerformanceGood" class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              性能表现良好！
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { performanceMonitor } from '@/utils/performance'
import { apiCache } from '@/utils/cache'
import { get } from '@/utils/api'
import LazyImage from '@/components/ui/LazyImage.vue'
import VirtualList from '@/components/ui/VirtualList.vue'

// 性能指标
const metrics = ref({
  loadTime: 0,
  fcp: 0,
  lcp: 0,
  memory: 0
})

// 缓存测试
const loading = ref(false)
const cacheResults = ref<Array<{ time: number; cached: boolean }>>([])

// 虚拟滚动数据
const virtualListItems = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    title: `项目 ${i + 1}`,
    description: `这是第 ${i + 1} 个项目的描述信息，用于测试虚拟滚动性能。`
  }))
)

// 性能是否良好
const isPerformanceGood = computed(() => {
  return metrics.value.loadTime < 3000 &&
         metrics.value.fcp < 1800 &&
         metrics.value.lcp < 2500 &&
         metrics.value.memory < 50
})

// 获取性能指标
const updateMetrics = () => {
  const currentMetrics = performanceMonitor.getMetrics()
  metrics.value = {
    loadTime: Math.round(currentMetrics.loadTime || 0),
    fcp: Math.round(currentMetrics.fcp || 0),
    lcp: Math.round(currentMetrics.lcp || 0),
    memory: Math.round(currentMetrics.memoryUsage || 0)
  }
}

// 测试API缓存
const testApiCache = async () => {
  loading.value = true
  cacheResults.value = []
  
  try {
    // 连续发送3次相同请求，测试缓存效果
    for (let i = 0; i < 3; i++) {
      const startTime = performance.now()
      
      await get('/api/projects', {
        cache: { ttl: 5 * 60 * 1000 } // 5分钟缓存
      })
      
      const endTime = performance.now()
      const requestTime = Math.round(endTime - startTime)
      
      cacheResults.value.push({
        time: requestTime,
        cached: i > 0 && requestTime < 50 // 如果响应时间很短，可能是缓存命中
      })
      
      // 第一次请求后稍等一下
      if (i === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  } catch (error) {
    console.error('API缓存测试失败:', error)
  } finally {
    loading.value = false
  }
}

// 清除缓存
const clearCache = () => {
  apiCache.clear()
  cacheResults.value = []
  alert('缓存已清除')
}

onMounted(() => {
  // 初始获取性能指标
  updateMetrics()
  
  // 定期更新性能指标
  const interval = setInterval(updateMetrics, 2000)
  
  // 组件卸载时清除定时器
  return () => {
    clearInterval(interval)
  }
})
</script>