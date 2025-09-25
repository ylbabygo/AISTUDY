<template>
  <div
    ref="containerRef"
    class="virtual-list-container"
    :style="containerStyle"
    @scroll="onScroll"
  >
    <!-- 总高度占位符 -->
    <div :style="{ height: totalHeight + 'px' }">
      <!-- 可见区域 -->
      <div
        class="virtual-list-content"
        :style="contentStyle"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          class="virtual-list-item"
          :style="getItemStyle(startIndex + index)"
        >
          <slot
            :item="item"
            :index="startIndex + index"
            :isVisible="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Props<T> {
  items: T[]
  itemHeight: number | ((item: T, index: number) => number)
  containerHeight: number
  overscan?: number
  keyField?: keyof T
  estimatedItemHeight?: number
}

const props = withDefaults(defineProps<Props<T>>(), {
  overscan: 5,
  estimatedItemHeight: 50
})

const emit = defineEmits<{
  scroll: [scrollTop: number]
  visibleRangeChange: [startIndex: number, endIndex: number]
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(props.containerHeight)

// 缓存项目高度
const itemHeights = ref<Map<number, number>>(new Map())
const measuredItems = ref<Set<number>>(new Set())

// 计算属性
const itemCount = computed(() => props.items.length)

const getItemHeight = (index: number): number => {
  if (typeof props.itemHeight === 'number') {
    return props.itemHeight
  }
  
  // 如果已经测量过，返回实际高度
  if (itemHeights.value.has(index)) {
    return itemHeights.value.get(index)!
  }
  
  // 否则返回估算高度
  return props.estimatedItemHeight
}

const totalHeight = computed(() => {
  let height = 0
  for (let i = 0; i < itemCount.value; i++) {
    height += getItemHeight(i)
  }
  return height
})

const startIndex = computed(() => {
  let index = 0
  let accumulatedHeight = 0
  
  while (index < itemCount.value && accumulatedHeight < scrollTop.value) {
    accumulatedHeight += getItemHeight(index)
    index++
  }
  
  return Math.max(0, index - props.overscan)
})

const endIndex = computed(() => {
  let index = startIndex.value
  let accumulatedHeight = getOffsetTop(startIndex.value)
  
  while (
    index < itemCount.value &&
    accumulatedHeight < scrollTop.value + containerHeight.value
  ) {
    accumulatedHeight += getItemHeight(index)
    index++
  }
  
  return Math.min(itemCount.value - 1, index + props.overscan)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1)
})

const containerStyle = computed(() => ({
  height: containerHeight.value + 'px',
  overflow: 'auto'
}))

const contentStyle = computed(() => ({
  transform: `translateY(${getOffsetTop(startIndex.value)}px)`
}))

// 方法
const getOffsetTop = (index: number): number => {
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += getItemHeight(i)
  }
  return offset
}

const getItemKey = (item: T, index: number): string | number => {
  if (props.keyField && item[props.keyField] != null) {
    return item[props.keyField] as string | number
  }
  return index
}

const getItemStyle = (index: number) => {
  const height = getItemHeight(index)
  return {
    height: height + 'px',
    minHeight: height + 'px'
  }
}

const onScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  emit('scroll', scrollTop.value)
  emit('visibleRangeChange', startIndex.value, endIndex.value)
}

const scrollToIndex = (index: number, align: 'start' | 'center' | 'end' = 'start') => {
  if (!containerRef.value) return
  
  const offsetTop = getOffsetTop(index)
  const itemHeight = getItemHeight(index)
  
  let scrollTo = offsetTop
  
  if (align === 'center') {
    scrollTo = offsetTop - (containerHeight.value - itemHeight) / 2
  } else if (align === 'end') {
    scrollTo = offsetTop - containerHeight.value + itemHeight
  }
  
  containerRef.value.scrollTop = Math.max(0, scrollTo)
}

const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}

const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = totalHeight.value
  }
}

// 测量实际项目高度（用于动态高度）
const measureItemHeight = (index: number) => {
  if (typeof props.itemHeight === 'number') return
  
  nextTick(() => {
    if (!containerRef.value) return
    
    const itemElement = containerRef.value.querySelector(
      `[data-index="${index}"]`
    ) as HTMLElement
    
    if (itemElement) {
      const height = itemElement.offsetHeight
      itemHeights.value.set(index, height)
      measuredItems.value.add(index)
    }
  })
}

// 监听器
watch([startIndex, endIndex], ([newStart, newEnd]) => {
  // 测量新可见项目的高度
  for (let i = newStart; i <= newEnd; i++) {
    if (!measuredItems.value.has(i)) {
      measureItemHeight(i)
    }
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  getVisibleRange: () => ({ start: startIndex.value, end: endIndex.value })
})

// 生命周期
onMounted(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
})
</script>

<style scoped>
.virtual-list-container {
  position: relative;
}

.virtual-list-content {
  position: relative;
}

.virtual-list-item {
  position: relative;
}
</style>