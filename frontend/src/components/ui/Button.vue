<template>
  <component
    :is="tag"
    ref="buttonRef"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    v-bind="$attrs"
  >
    <div class="flex items-center justify-center space-x-2">
      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="animate-spin rounded-full border-2 border-current border-t-transparent"
        :class="sizeClasses.spinner"
      ></div>
      
      <!-- Left icon -->
      <component
        v-if="leftIcon && !loading"
        :is="leftIcon"
        :class="sizeClasses.icon"
      />
      
      <!-- Button text -->
      <span v-if="$slots.default || label" :class="{ 'sr-only': iconOnly }">
        <slot>{{ label }}</slot>
      </span>
      
      <!-- Right icon -->
      <component
        v-if="rightIcon && !loading"
        :is="rightIcon"
        :class="sizeClasses.icon"
      />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  tag?: 'button' | 'a' | 'router-link'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  leftIcon?: any
  rightIcon?: any
  label?: string
  fullWidth?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
  disabled: false,
  loading: false,
  iconOnly: false,
  fullWidth: false,
  rounded: false
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const buttonRef = ref<HTMLElement>()

const createRipple = (event: MouseEvent) => {
  if (!buttonRef.value || props.disabled || props.loading) return

  const button = buttonRef.value
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'

  button.appendChild(ripple)

  setTimeout(() => {
    ripple.remove()
  }, 600)
}

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    createRipple(event)
    emit('click', event)
  }
}

const baseClasses = computed(() => [
  'inline-flex items-center justify-center font-medium',
  'transition-all duration-200 ease-in-out',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'relative overflow-hidden',
  'transform-gpu will-change-transform',
  'hover:shadow-lg hover:-translate-y-0.5',
  'active:translate-y-0 active:shadow-md',
  {
    'w-full': props.fullWidth,
    'rounded-full': props.rounded,
    'rounded-lg': !props.rounded
  }
])

const variantClasses = computed(() => {
  const variants = {
    primary: [
      'bg-gradient-to-r from-primary-500 to-secondary-500',
      'text-white shadow-lg',
      'hover:from-primary-600 hover:to-secondary-600',
      'focus:ring-primary-500',
      'active:scale-95'
    ],
    secondary: [
      'bg-gray-100 text-gray-900',
      'hover:bg-gray-200',
      'focus:ring-gray-500',
      'active:scale-95'
    ],
    outline: [
      'border-2 border-primary-500 text-primary-500',
      'hover:bg-primary-50',
      'focus:ring-primary-500',
      'active:scale-95'
    ],
    ghost: [
      'text-gray-600 hover:text-gray-900',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
      'active:scale-95'
    ],
    danger: [
      'bg-gradient-to-r from-error-500 to-error-600',
      'text-white shadow-lg',
      'hover:from-error-600 hover:to-error-700',
      'focus:ring-error-500',
      'active:scale-95'
    ],
    success: [
      'bg-gradient-to-r from-success-500 to-success-600',
      'text-white shadow-lg',
      'hover:from-success-600 hover:to-success-700',
      'focus:ring-success-500',
      'active:scale-95'
    ]
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: {
      button: 'px-2.5 py-1.5 text-xs',
      icon: 'w-3 h-3',
      spinner: 'w-3 h-3'
    },
    sm: {
      button: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
      spinner: 'w-4 h-4'
    },
    md: {
      button: 'px-4 py-2.5 text-sm',
      icon: 'w-5 h-5',
      spinner: 'w-5 h-5'
    },
    lg: {
      button: 'px-6 py-3 text-base',
      icon: 'w-5 h-5',
      spinner: 'w-5 h-5'
    },
    xl: {
      button: 'px-8 py-4 text-lg',
      icon: 'w-6 h-6',
      spinner: 'w-6 h-6'
    }
  }
  return sizes[props.size]
})

const buttonClasses = computed(() => [
  ...baseClasses.value,
  ...variantClasses.value,
  sizeClasses.value.button
])
</script>

<style scoped>
/* 按钮悬停效果 */
.group:hover .group-hover\:translate-x-1 {
  transform: translateX(0.25rem);
}

/* 涟漪效果 */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple 600ms linear;
  pointer-events: none;
}
</style>