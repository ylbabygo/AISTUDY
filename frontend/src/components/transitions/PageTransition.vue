<template>
  <transition
    :name="transitionName"
    :mode="mode"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  name?: string
  mode?: 'out-in' | 'in-out' | 'default'
  duration?: number
  direction?: 'horizontal' | 'vertical' | 'fade' | 'scale'
  reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'page',
  mode: 'out-in',
  duration: 300,
  direction: 'horizontal',
  reverse: false
})

const emit = defineEmits<{
  beforeEnter: [el: Element]
  enter: [el: Element, done: () => void]
  afterEnter: [el: Element]
  beforeLeave: [el: Element]
  leave: [el: Element, done: () => void]
  afterLeave: [el: Element]
}>()

const route = useRoute()
const isAnimating = ref(false)

const transitionName = computed(() => {
  if (props.name !== 'page') return props.name
  
  // 根据路由深度决定动画方向
  const depth = route.path.split('/').length
  const direction = props.reverse ? 'slide-right' : 'slide-left'
  
  switch (props.direction) {
    case 'horizontal':
      return direction
    case 'vertical':
      return props.reverse ? 'slide-down' : 'slide-up'
    case 'fade':
      return 'fade'
    case 'scale':
      return 'scale'
    default:
      return direction
  }
})

const beforeEnter = (el: Element) => {
  isAnimating.value = true
  emit('beforeEnter', el)
}

const enter = (el: Element, done: () => void) => {
  emit('enter', el, done)
  setTimeout(done, props.duration)
}

const afterEnter = (el: Element) => {
  isAnimating.value = false
  emit('afterEnter', el)
}

const beforeLeave = (el: Element) => {
  emit('beforeLeave', el)
}

const leave = (el: Element, done: () => void) => {
  emit('leave', el, done)
  setTimeout(done, props.duration)
}

const afterLeave = (el: Element) => {
  emit('afterLeave', el)
}

// 监听路由变化，自动调整动画方向
watch(() => route.path, (newPath, oldPath) => {
  if (!oldPath) return
  
  const newDepth = newPath.split('/').length
  const oldDepth = oldPath.split('/').length
  
  // 可以根据路由深度自动调整动画方向
  // 这里暂时保持简单实现
})
</script>

<style scoped>
/* 水平滑动动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 垂直滑动动画 */
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 缩放动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease-in-out;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 性能优化 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active,
.scale-enter-active,
.scale-leave-active,
.page-enter-active,
.page-leave-active {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}
</style>