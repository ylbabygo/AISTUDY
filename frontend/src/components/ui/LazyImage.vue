<template>
  <div 
    ref="containerRef"
    class="lazy-image-container"
    :class="containerClass"
  >
    <img
      v-if="shouldLoad"
      :src="imageSrc"
      :alt="alt"
      :class="imageClass"
      @load="onLoad"
      @error="onError"
      :loading="loading"
    />
    <div
      v-else-if="showPlaceholder"
      class="lazy-image-placeholder"
      :class="placeholderClass"
    >
      <slot name="placeholder">
        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-400">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
        </div>
      </slot>
    </div>
    <div
      v-if="isLoading"
      class="lazy-image-loading"
      :class="loadingClass"
    >
      <slot name="loading">
        <div class="flex items-center justify-center h-full">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </slot>
    </div>
    <div
      v-if="hasError"
      class="lazy-image-error"
      :class="errorClass"
    >
      <slot name="error">
        <div class="flex items-center justify-center h-full bg-red-50 text-red-400">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt?: string
  loading?: 'lazy' | 'eager'
  threshold?: number
  rootMargin?: string
  containerClass?: string
  imageClass?: string
  placeholderClass?: string
  loadingClass?: string
  errorClass?: string
  showPlaceholder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  loading: 'lazy',
  threshold: 0.1,
  rootMargin: '50px',
  containerClass: '',
  imageClass: '',
  placeholderClass: '',
  loadingClass: '',
  errorClass: '',
  showPlaceholder: true
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  intersect: [isIntersecting: boolean]
}>()

const containerRef = ref<HTMLElement>()
const isIntersecting = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
const imageLoaded = ref(false)

let observer: IntersectionObserver | null = null

// 计算属性
const shouldLoad = computed(() => {
  return props.loading === 'eager' || isIntersecting.value
})

const imageSrc = computed(() => {
  if (shouldLoad.value) {
    return props.src
  }
  return ''
})

// 方法
const onLoad = (event: Event) => {
  isLoading.value = false
  imageLoaded.value = true
  hasError.value = false
  emit('load', event)
}

const onError = (event: Event) => {
  isLoading.value = false
  hasError.value = true
  emit('error', event)
}

const setupIntersectionObserver = () => {
  if (!containerRef.value || !('IntersectionObserver' in window)) {
    // 如果不支持 IntersectionObserver，直接加载图片
    isIntersecting.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        isIntersecting.value = true
        isLoading.value = true
        emit('intersect', true)
        
        // 一旦开始加载，就停止观察
        if (observer) {
          observer.disconnect()
        }
      }
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin
    }
  )

  observer.observe(containerRef.value)
}

// 生命周期
onMounted(() => {
  if (props.loading === 'lazy') {
    setupIntersectionObserver()
  } else {
    isIntersecting.value = true
    isLoading.value = true
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.lazy-image-placeholder,
.lazy-image-loading,
.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.lazy-image-loading {
  background-color: rgba(255, 255, 255, 0.8);
}

img {
  transition: opacity 0.3s ease-in-out;
}

img[loading="lazy"] {
  opacity: 0;
}

img[loading="lazy"].loaded {
  opacity: 1;
}
</style>