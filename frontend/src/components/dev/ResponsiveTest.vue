<template>
  <div class="responsive-test p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        响应式设计测试
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        当前屏幕尺寸: {{ screenSize }} ({{ windowWidth }}x{{ windowHeight }})
      </p>
    </div>

    <!-- 网格布局测试 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        网格布局测试
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card
          v-for="i in 8"
          :key="i"
          variant="default"
          :hoverable="true"
          class="animate-fade-in-up"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <div class="text-center p-4">
            <div class="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span class="text-white font-bold">{{ i }}</span>
            </div>
            <h3 class="font-medium text-gray-900 dark:text-white">卡片 {{ i }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              这是一个测试卡片
            </p>
          </div>
        </Card>
      </div>
    </section>

    <!-- 按钮测试 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        按钮响应式测试
      </h2>
      <div class="flex flex-col sm:flex-row gap-4 flex-wrap">
        <Button variant="primary" size="xs">超小按钮</Button>
        <Button variant="secondary" size="sm">小按钮</Button>
        <Button variant="outline" size="md">中等按钮</Button>
        <Button variant="ghost" size="lg">大按钮</Button>
        <Button variant="danger" size="xl">超大按钮</Button>
      </div>
      <div class="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" :full-width="isMobile">
          {{ isMobile ? '全宽按钮 (移动端)' : '普通按钮 (桌面端)' }}
        </Button>
        <Button variant="success" :full-width="isMobile">
          {{ isMobile ? '全宽按钮 (移动端)' : '普通按钮 (桌面端)' }}
        </Button>
      </div>
    </section>

    <!-- 表单测试 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        表单响应式测试
      </h2>
      <Card variant="outlined" class="p-6">
        <form class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                姓名
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                placeholder="请输入邮箱"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              消息
            </label>
            <textarea
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all resize-none"
              placeholder="请输入消息内容"
            ></textarea>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="ghost" :full-width="isMobile">取消</Button>
            <Button variant="primary" :full-width="isMobile">提交</Button>
          </div>
        </form>
      </Card>
    </section>

    <!-- 导航测试 */
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        导航响应式测试
      </h2>
      <Card variant="glass" class="p-4">
        <nav class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-500 rounded-lg"></div>
            <span class="font-bold text-gray-900 dark:text-white">Logo</span>
          </div>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">首页</a>
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">产品</a>
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">服务</a>
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">联系</a>
          </div>
        </nav>
      </Card>
    </section>

    <!-- 加载状态测试 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        加载状态测试
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" class="p-4">
          <LoadingSpinner type="spinner" size="md" color="primary" text="旋转加载" />
        </Card>
        <Card variant="default" class="p-4">
          <LoadingSpinner type="dots" size="md" color="secondary" text="点状加载" />
        </Card>
        <Card variant="default" class="p-4">
          <LoadingSpinner type="wave" size="md" color="success" text="波浪加载" />
        </Card>
        <Card variant="default" class="p-4">
          <LoadingSpinner type="liquid" size="md" color="warning" text="液体加载" />
        </Card>
      </div>
    </section>

    <!-- 主题切换测试 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        主题切换测试
      </h2>
      <Card variant="gradient" class="p-6 text-center">
        <ThemeToggle class="mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-300">
          点击上方按钮测试主题切换功能
        </p>
      </Card>
    </section>

    <!-- 屏幕信息 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        屏幕信息
      </h2>
      <Card variant="outlined" class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ windowWidth }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">宽度 (px)</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ windowHeight }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">高度 (px)</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ screenSize }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">屏幕尺寸</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ aspectRatio }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">宽高比</div>
          </div>
        </div>
      </Card>
    </section>

    <!-- 浏览器兼容性信息 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        浏览器兼容性
      </h2>
      <Card variant="outlined" class="p-6">
        <!-- 浏览器信息 -->
        <div v-if="browserInfo" class="mb-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">浏览器信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center">
              <div class="text-lg font-bold" :class="browserInfo.supported ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ browserInfo.name }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">浏览器</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ browserInfo.version }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">版本</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-purple-600 dark:text-purple-400">{{ browserInfo.engine }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">引擎</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ browserInfo.platform }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">平台</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold" :class="browserInfo.mobile ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'">
                {{ browserInfo.mobile ? '移动端' : '桌面端' }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">设备类型</div>
            </div>
          </div>
        </div>

        <!-- 功能支持 -->
        <div v-if="featureSupport" class="mb-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">功能支持</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div v-for="(supported, feature) in featureSupport" :key="feature" class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" :class="supported ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-sm" :class="supported ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                {{ formatFeatureName(feature) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 兼容性警告和错误 -->
        <div v-if="compatibilityErrors.length > 0 || compatibilityWarnings.length > 0">
          <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">兼容性问题</h3>
          
          <!-- 错误 -->
          <div v-if="compatibilityErrors.length > 0" class="mb-3">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <h4 class="font-semibold text-red-800 dark:text-red-200 mb-2">错误</h4>
              <ul class="space-y-1">
                <li v-for="error in compatibilityErrors" :key="error" class="text-sm text-red-700 dark:text-red-300">
                  • {{ error }}
                </li>
              </ul>
            </div>
          </div>

          <!-- 警告 -->
          <div v-if="compatibilityWarnings.length > 0">
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">警告</h4>
              <ul class="space-y-1">
                <li v-for="warning in compatibilityWarnings" :key="warning" class="text-sm text-yellow-700 dark:text-yellow-300">
                  • {{ warning }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </section>

    <!-- 性能信息 -->
    <section v-if="performanceInfo" class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        性能信息
      </h2>
      <Card variant="outlined" class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ Math.round(performanceInfo.domContentLoaded) }}ms</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">DOM 加载</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ Math.round(performanceInfo.loadComplete) }}ms</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">完全加载</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ Math.round(performanceInfo.firstPaint) }}ms</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">首次绘制</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ Math.round(performanceInfo.firstContentfulPaint) }}ms</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">首次内容绘制</div>
          </div>
        </div>
      </Card>
    </section>

    <!-- 断点信息 -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        断点信息
      </h2>
      <Card variant="outlined" class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div class="text-center p-3 rounded-lg" :class="screenSize === 'xs' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-800'">
            <div class="font-medium">XS</div>
            <div class="text-gray-600 dark:text-gray-400">&lt; 640px</div>
            <div class="text-xs mt-1" :class="screenSize === 'xs' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'">
              {{ screenSize === 'xs' ? '当前' : '非活动' }}
            </div>
          </div>
          <div class="text-center p-3 rounded-lg" :class="screenSize === 'sm' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-800'">
            <div class="font-medium">SM</div>
            <div class="text-gray-600 dark:text-gray-400">640px+</div>
            <div class="text-xs mt-1" :class="screenSize === 'sm' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'">
              {{ screenSize === 'sm' ? '当前' : '非活动' }}
            </div>
          </div>
          <div class="text-center p-3 rounded-lg" :class="screenSize === 'md' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-800'">
            <div class="font-medium">MD</div>
            <div class="text-gray-600 dark:text-gray-400">768px+</div>
            <div class="text-xs mt-1" :class="screenSize === 'md' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'">
              {{ screenSize === 'md' ? '当前' : '非活动' }}
            </div>
          </div>
          <div class="text-center p-3 rounded-lg" :class="screenSize === 'lg' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-800'">
            <div class="font-medium">LG</div>
            <div class="text-gray-600 dark:text-gray-400">1024px+</div>
            <div class="text-xs mt-1" :class="screenSize === 'lg' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'">
              {{ screenSize === 'lg' ? '当前' : '非活动' }}
            </div>
          </div>
        </div>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { 
  runCompatibilityTest, 
  testResponsiveBreakpoints, 
  getPerformanceInfo,
  type BrowserInfo,
  type FeatureSupport
} from '@/utils/browserTest'

const windowWidth = ref(0)
const windowHeight = ref(0)
const browserInfo = ref<BrowserInfo | null>(null)
const featureSupport = ref<FeatureSupport | null>(null)
const compatibilityWarnings = ref<string[]>([])
const compatibilityErrors = ref<string[]>([])
const performanceInfo = ref<any>(null)
const responsiveInfo = ref<any>(null)

const updateWindowSize = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
  
  // 更新响应式信息
  if (responsiveInfo.value) {
    responsiveInfo.value = testResponsiveBreakpoints()
  }
}

const screenSize = computed(() => {
  if (windowWidth.value >= 1280) return 'XL'
  if (windowWidth.value >= 1024) return 'LG'
  if (windowWidth.value >= 768) return 'MD'
  if (windowWidth.value >= 640) return 'SM'
  return 'XS'
})

const aspectRatio = computed(() => {
  if (windowWidth.value === 0 || windowHeight.value === 0) return '0:0'
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(windowWidth.value, windowHeight.value)
  const w = windowWidth.value / divisor
  const h = windowHeight.value / divisor
  return `${w}:${h}`
})

const formatFeatureName = (feature: string) => {
  const names: Record<string, string> = {
    cssGrid: 'CSS Grid',
    cssVariables: 'CSS 变量',
    flexbox: 'Flexbox',
    intersectionObserver: 'Intersection Observer',
    webAnimations: 'Web Animations',
    es6: 'ES6',
    localStorage: 'Local Storage',
    sessionStorage: 'Session Storage',
    fetch: 'Fetch API',
    promises: 'Promises'
  }
  return names[feature] || feature
}

const isMobile = computed(() => {
  return screenSize.value === 'XS' || screenSize.value === 'SM'
})



onMounted(() => {
  updateWindowSize()
  window.addEventListener('resize', updateWindowSize)
  
  // 运行兼容性测试
  const testResult = runCompatibilityTest()
  browserInfo.value = testResult.browser
  featureSupport.value = testResult.features
  compatibilityWarnings.value = testResult.warnings
  compatibilityErrors.value = testResult.errors
  
  // 获取性能信息
  performanceInfo.value = getPerformanceInfo()
  
  // 获取响应式信息
  responsiveInfo.value = testResponsiveBreakpoints()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)
})
</script>

<style scoped>
.responsive-test {
  max-width: 1200px;
  margin: 0 auto;
}

/* 确保在小屏幕上有适当的间距 */
@media (max-width: 640px) {
  .responsive-test {
    padding: 1rem;
  }
}
</style>