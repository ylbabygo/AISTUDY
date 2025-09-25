<template>
  <div :class="containerClasses">
    <!-- 旋转圆圈 -->
    <div v-if="type === 'spinner'" :class="spinnerClasses">
      <div class="animate-spin rounded-full border-2 border-current border-t-transparent" :class="sizeClasses"></div>
    </div>

    <!-- 脉冲点 -->
    <div v-else-if="type === 'dots'" class="flex space-x-1">
      <div
        v-for="i in 3"
        :key="i"
        :class="[dotClasses, `animate-pulse animate-delay-${(i - 1) * 150}`]"
      ></div>
    </div>

    <!-- 波浪 -->
    <div v-else-if="type === 'wave'" class="flex items-end space-x-1">
      <div
        v-for="i in 5"
        :key="i"
        :class="[waveClasses, `animate-bounce animate-delay-${(i - 1) * 100}`]"
      ></div>
    </div>

    <!-- 骨架屏 -->
    <div v-else-if="type === 'skeleton'" class="space-y-3">
      <div class="loading-skeleton h-4 rounded w-3/4"></div>
      <div class="loading-skeleton h-4 rounded w-1/2"></div>
      <div class="loading-skeleton h-4 rounded w-5/6"></div>
    </div>

    <!-- 进度条 -->
    <div v-else-if="type === 'progress'" class="w-full">
      <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          class="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div v-if="showPercentage" class="text-center mt-2 text-sm text-gray-600">
        {{ progress }}%
      </div>
    </div>

    <!-- 液体加载 -->
    <div v-else-if="type === 'liquid'" class="relative">
      <div :class="[liquidContainerClasses, sizeClasses]">
        <div class="liquid-wave animate-float"></div>
        <div class="liquid-wave animate-float animate-delay-500" style="animation-direction: reverse;"></div>
      </div>
    </div>

    <!-- 文字 -->
    <div v-if="text" :class="textClasses">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'spinner' | 'dots' | 'wave' | 'skeleton' | 'progress' | 'liquid'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray'
  text?: string
  progress?: number
  showPercentage?: boolean
  centered?: boolean
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'md',
  color: 'primary',
  progress: 0,
  showPercentage: false,
  centered: false,
  overlay: false
})

const containerClasses = computed(() => [
  'flex flex-col items-center justify-center',
  {
    'fixed inset-0 bg-black/50 backdrop-blur-sm z-50': props.overlay,
    'h-full w-full': props.centered && !props.overlay
  }
])

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    gray: 'text-gray-500'
  }
  return colors[props.color]
})

const spinnerClasses = computed(() => [
  'flex items-center justify-center',
  colorClasses.value
])

const dotClasses = computed(() => [
  'rounded-full bg-current',
  colorClasses.value,
  {
    'w-1 h-1': props.size === 'xs',
    'w-1.5 h-1.5': props.size === 'sm',
    'w-2 h-2': props.size === 'md',
    'w-3 h-3': props.size === 'lg',
    'w-4 h-4': props.size === 'xl'
  }
])

const waveClasses = computed(() => [
  'bg-current rounded-sm',
  colorClasses.value,
  {
    'w-0.5 h-2': props.size === 'xs',
    'w-1 h-3': props.size === 'sm',
    'w-1 h-4': props.size === 'md',
    'w-1.5 h-6': props.size === 'lg',
    'w-2 h-8': props.size === 'xl'
  }
])

const liquidContainerClasses = computed(() => [
  'relative overflow-hidden rounded-full border-2 border-current',
  colorClasses.value,
  'bg-gray-100'
])

const textClasses = computed(() => [
  'mt-3 text-sm font-medium',
  colorClasses.value
])
</script>

<style scoped>
/* 液体波浪动画 */
.liquid-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, currentColor 30%, transparent 30%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
}

/* 自定义动画延迟 */
.animate-delay-100 {
  animation-delay: 100ms;
}

.animate-delay-150 {
  animation-delay: 150ms;
}

.animate-delay-200 {
  animation-delay: 200ms;
}

.animate-delay-300 {
  animation-delay: 300ms;
}

.animate-delay-500 {
  animation-delay: 500ms;
}

/* 骨架屏动画 */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 暗色主题支持 */
.dark .loading-skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

.dark .bg-gray-100 {
  @apply bg-gray-800;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

.animate-float {
  animation: float 2s ease-in-out infinite;
}
</style>