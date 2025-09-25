<template>
  <div 
    ref="containerRef"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- 占位符 -->
    <div 
      v-if="!loaded && !error"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
    >
      <div v-if="showSkeleton" class="animate-pulse">
        <div class="w-full h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div v-else class="text-gray-400 dark:text-gray-500">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- 错误状态 -->
    <div 
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
    >
      <div class="text-center">
        <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm">加载失败</p>
      </div>
    </div>

    <!-- 实际图片 -->
    <picture v-if="!error">
      <!-- WebP 格式 -->
      <source 
        v-if="webpSrc"
        :srcset="webpSrcSet"
        :sizes="sizes"
        type="image/webp"
      >
      
      <!-- 原始格式 -->
      <img
        ref="imgRef"
        :src="currentSrc"
        :srcset="srcSet"
        :sizes="sizes"
        :alt="alt"
        :loading="loading"
        :decoding="decoding"
        :class="imageClass"
        :style="imageStyle"
        @load="handleLoad"
        @error="handleError"
        @loadstart="handleLoadStart"
      >
    </picture>

    <!-- 加载进度条 -->
    <div 
      v-if="showProgress && isLoading"
      class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"
    >
      <div 
        class="h-full bg-blue-500 transition-all duration-300"
        :style="{ width: `${loadProgress}%` }"
      ></div>
    </div>

    <!-- 图片信息覆盖层 -->
    <div 
      v-if="showInfo && loaded"
      class="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
    >
      {{ imageInfo }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  sizes?: string
  quality?: number
  format?: 'auto' | 'webp' | 'jpeg' | 'png'
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  placeholder?: 'skeleton' | 'blur' | 'none'
  blurDataUrl?: string
  showProgress?: boolean
  showInfo?: boolean
  responsive?: boolean
  breakpoints?: Record<string, number>
  class?: string
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  quality: 80,
  format: 'auto',
  loading: 'lazy',
  decoding: 'async',
  objectFit: 'cover',
  objectPosition: 'center',
  placeholder: 'skeleton',
  showProgress: false,
  showInfo: false,
  responsive: true,
  breakpoints: () => ({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  })
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  loadStart: [event: Event]
}>()

// 响应式数据
const containerRef = ref<HTMLElement>()
const imgRef = ref<HTMLImageElement>()
const loaded = ref(false)
const error = ref(false)
const isLoading = ref(false)
const loadProgress = ref(0)
const observer = ref<IntersectionObserver>()

// 计算属性
const showSkeleton = computed(() => props.placeholder === 'skeleton')

const containerStyle = computed(() => {
  const style: Record<string, any> = {
    position: 'relative',
    overflow: 'hidden'
  }

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  return style
})

const imageClass = computed(() => {
  const classes = ['w-full h-full transition-opacity duration-300']
  
  if (loaded.value) {
    classes.push('opacity-100')
  } else {
    classes.push('opacity-0')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

const imageStyle = computed(() => ({
  objectFit: props.objectFit,
  objectPosition: props.objectPosition
}))

// 生成优化的图片URL
const generateOptimizedUrl = (src: string, width?: number, format?: string, quality?: number) => {
  if (!src) return ''
  
  // 如果是外部URL，直接返回
  if (src.startsWith('http')) {
    return src
  }

  // 构建优化参数
  const params = new URLSearchParams()
  
  if (width) params.set('w', width.toString())
  if (format && format !== 'auto') params.set('f', format)
  if (quality && quality !== 80) params.set('q', quality.toString())

  const queryString = params.toString()
  return queryString ? `${src}?${queryString}` : src
}

// 生成响应式图片源集
const generateSrcSet = (src: string, format?: string) => {
  if (!props.responsive || !src) return ''

  const srcSet: string[] = []
  
  Object.entries(props.breakpoints).forEach(([, width]) => {
    const optimizedUrl = generateOptimizedUrl(src, width, format, props.quality)
    srcSet.push(`${optimizedUrl} ${width}w`)
  })

  return srcSet.join(', ')
}

const currentSrc = computed(() => 
  generateOptimizedUrl(props.src, undefined, props.format === 'auto' ? undefined : props.format, props.quality)
)

const srcSet = computed(() => 
  generateSrcSet(props.src, props.format === 'auto' ? undefined : props.format)
)

const webpSrc = computed(() => {
  if (props.format !== 'auto' && props.format !== 'webp') return ''
  return generateOptimizedUrl(props.src, undefined, 'webp', props.quality)
})

const webpSrcSet = computed(() => {
  if (props.format !== 'auto' && props.format !== 'webp') return ''
  return generateSrcSet(props.src, 'webp')
})

const imageInfo = computed(() => {
  if (!imgRef.value) return ''
  
  const img = imgRef.value
  const format = currentSrc.value.includes('webp') ? 'WebP' : 'JPEG'
  return `${img.naturalWidth}×${img.naturalHeight} ${format}`
})

// 事件处理
const handleLoad = (event: Event) => {
  loaded.value = true
  isLoading.value = false
  loadProgress.value = 100
  emit('load', event)
}

const handleError = (event: Event) => {
  error.value = true
  isLoading.value = false
  emit('error', event)
}

const handleLoadStart = (event: Event) => {
  isLoading.value = true
  loadProgress.value = 0
  emit('loadStart', event)
}

// 模拟加载进度（实际项目中可以通过 fetch 获取真实进度）
const simulateProgress = () => {
  if (!isLoading.value) return

  const interval = setInterval(() => {
    if (loadProgress.value < 90) {
      loadProgress.value += Math.random() * 20
    } else {
      clearInterval(interval)
    }
  }, 100)
}

// 懒加载观察器
const setupIntersectionObserver = () => {
  if (!containerRef.value || props.loading !== 'lazy') return

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imgRef.value) {
          // 开始加载图片
          imgRef.value.src = currentSrc.value
          observer.value?.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '50px'
    }
  )

  observer.value.observe(containerRef.value)
}

// 预加载关键图片
const preloadImage = () => {
  if (props.loading === 'eager' && currentSrc.value) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = currentSrc.value
    document.head.appendChild(link)
  }
}

// 生命周期
onMounted(() => {
  setupIntersectionObserver()
  preloadImage()
  
  if (props.showProgress) {
    watch(isLoading, (newVal) => {
      if (newVal) {
        simulateProgress()
      }
    })
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})

// 监听 src 变化
watch(() => props.src, () => {
  loaded.value = false
  error.value = false
  isLoading.value = false
  loadProgress.value = 0
})

// 暴露方法
defineExpose({
  reload: () => {
    if (imgRef.value) {
      loaded.value = false
      error.value = false
      imgRef.value.src = currentSrc.value
    }
  },
  getImageElement: () => imgRef.value,
  getImageInfo: () => imageInfo.value
})
</script>

<style scoped>
/* 模糊占位符效果 */
.blur-placeholder {
  filter: blur(10px);
  transform: scale(1.1);
}

/* 骨架屏动画 */
@keyframes skeleton {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton 1.5s infinite;
}

/* 深色模式骨架屏 */
.dark .skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
}
</style>