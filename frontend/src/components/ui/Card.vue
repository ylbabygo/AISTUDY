<template>
  <div
    :class="cardClasses"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    ref="cardRef"
  >
    <!-- 鼠标跟踪高光效果 -->
    <div
      v-if="interactive && showGlow"
      class="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-lg"
      :class="{ 'opacity-100': isHovered }"
      :style="glowStyle"
    ></div>

    <!-- 卡片头部 -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 v-if="title" class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
          <div v-if="$slots.actions" class="flex items-center space-x-2">
            <slot name="actions"></slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- 卡片内容 -->
    <div v-if="$slots.default" class="card-content">
      <slot></slot>
    </div>

    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
    >
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
        <span class="text-sm text-gray-600">加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  title?: string
  showGlow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  interactive: false,
  hoverable: false,
  clickable: false,
  loading: false,
  showGlow: true
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardRef = ref<HTMLElement>()
const isHovered = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseEnter = () => {
  if (props.interactive || props.hoverable) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const handleMouseMove = (event: MouseEvent) => {
  if (!cardRef.value || !props.interactive) return

  const rect = cardRef.value.getBoundingClientRect()
  mouseX.value = event.clientX - rect.left
  mouseY.value = event.clientY - rect.top
}

const glowStyle = computed(() => {
  if (!props.interactive || !isHovered.value) return {}

  return {
    background: `radial-gradient(300px circle at ${mouseX.value}px ${mouseY.value}px, rgba(59, 130, 246, 0.1), transparent 40%)`
  }
})

const baseClasses = computed(() => [
  'relative overflow-hidden',
  'transition-all duration-300 ease-out',
  'transform-gpu will-change-transform',
  'border border-gray-200',
  {
    'cursor-pointer': props.clickable,
    'hover:scale-[1.02] hover:-translate-y-1': props.hoverable && !props.loading,
    'hover:shadow-xl hover:shadow-primary-500/10': props.hoverable && !props.loading,
    'active:scale-[0.98] active:translate-y-0': props.clickable && !props.loading
  }
])

const variantClasses = computed(() => {
  const variants = {
    default: [
      'bg-white shadow-sm',
      'hover:shadow-md'
    ],
    glass: [
      'bg-white/10 backdrop-blur-md',
      'border-white/20 shadow-lg',
      'hover:bg-white/20'
    ],
    elevated: [
      'bg-white shadow-lg',
      'hover:shadow-xl'
    ],
    outlined: [
      'bg-transparent border-2',
      'hover:bg-gray-50'
    ],
    gradient: [
      'bg-gradient-to-br from-primary-50 to-secondary-50',
      'border-primary-200',
      'hover:from-primary-100 hover:to-secondary-100'
    ]
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-xl',
    xl: 'p-10 rounded-2xl'
  }
  return sizes[props.size]
})

const cardClasses = computed(() => [
  ...baseClasses.value,
  ...variantClasses.value,
  sizeClasses.value
])
</script>

<style scoped>
.card-header {
  @apply mb-4 pb-4 border-b border-gray-100;
}

.card-content {
  @apply flex-1;
}

.card-footer {
  @apply mt-4 pt-4 border-t border-gray-100;
}

/* 暗色主题支持 */
[data-theme="dark"] .card-header,
[data-theme="dark"] .card-footer {
  @apply border-gray-700;
}

[data-theme="dark"] .bg-white {
  @apply bg-gray-800;
}

[data-theme="dark"] .text-gray-900 {
  @apply text-gray-100;
}

[data-theme="dark"] .border-gray-200 {
  @apply border-gray-700;
}

[data-theme="dark"] .hover\:bg-gray-50:hover {
  @apply bg-gray-700;
}
</style>