<template>
  <div
    ref="cardRef"
    class="kanban-card group"
    :class="cardClasses"
    :draggable="!isReadonly"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="onClick"
  >
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="flex items-start justify-between">
        <h3 class="card-title" :title="task.title">
          {{ task.title }}
        </h3>
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            v-if="!isReadonly"
            @click.stop="onEdit"
            class="p-1 rounded hover:bg-gray-100 transition-colors"
            :aria-label="`编辑任务 ${task.title}`"
          >
            <PencilIcon class="w-3 h-3 text-gray-400" />
          </button>
          <button
            v-if="!isReadonly"
            @click.stop="onDelete"
            class="p-1 rounded hover:bg-red-50 transition-colors"
            :aria-label="`删除任务 ${task.title}`"
          >
            <TrashIcon class="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>
      
      <!-- 优先级指示器 -->
      <div
        v-if="task.priority"
        class="priority-indicator"
        :class="priorityClasses"
        :title="`优先级: ${priorityText}`"
      >
        {{ priorityText }}
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 描述 -->
      <p
        v-if="task.description && showDescription"
        class="card-description"
        :title="task.description"
      >
        {{ truncatedDescription }}
      </p>

      <!-- 标签 -->
      <div
        v-if="task.tags && task.tags.length > 0"
        class="card-tags"
      >
        <span
          v-for="tag in visibleTags"
          :key="tag"
          class="tag"
          :style="getTagStyle(tag)"
        >
          {{ tag }}
        </span>
        <span
          v-if="hiddenTagsCount > 0"
          class="tag tag-more"
          :title="hiddenTags.join(', ')"
        >
          +{{ hiddenTagsCount }}
        </span>
      </div>

      <!-- 进度条 -->
      <div
        v-if="showProgress && task.progress !== undefined"
        class="progress-container"
      >
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${task.progress}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ task.progress }}%</span>
      </div>
    </div>

    <!-- 卡片底部 -->
    <div class="card-footer">
      <!-- 截止日期 -->
      <div
        v-if="task.due_date"
        class="due-date"
        :class="dueDateClasses"
        :title="`截止日期: ${formatDate(task.due_date)}`"
      >
        <CalendarIcon class="w-3 h-3" />
        <span>{{ formatDueDate(task.due_date) }}</span>
      </div>

      <!-- 分配给 -->
      <div
        v-if="task.assigned_to"
        class="assignee"
        :title="`分配给: ${task.assigned_to}`"
      >
        <UserIcon class="w-3 h-3" />
        <span>{{ task.assigned_to }}</span>
      </div>

      <!-- 附件数量 -->
      <div
        v-if="task.attachments && task.attachments.length > 0"
        class="attachments"
        :title="`${task.attachments.length} 个附件`"
      >
        <PaperClipIcon class="w-3 h-3" />
        <span>{{ task.attachments.length }}</span>
      </div>
    </div>

    <!-- 拖拽指示器 -->
    <div
      v-if="isDragging"
      class="drag-indicator"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon, 
  UserIcon, 
  PaperClipIcon 
} from '@heroicons/vue/24/outline'
import type { Task } from '@/types'

interface Props {
  task: Task
  isReadonly?: boolean
  showDescription?: boolean
  showProgress?: boolean
  maxTags?: number
  maxDescriptionLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  isReadonly: false,
  showDescription: true,
  showProgress: true,
  maxTags: 3,
  maxDescriptionLength: 100
})

const emit = defineEmits<{
  click: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
  dragStart: [task: Task, event: DragEvent]
  dragEnd: [task: Task, event: DragEvent]
}>()

const cardRef = ref<HTMLElement>()
const isDragging = ref(false)
const isVisible = ref(false)

// 计算属性
const cardClasses = computed(() => [
  'bg-white rounded-lg shadow-sm border border-gray-200',
  'hover:shadow-md hover:border-gray-300',
  'transition-all duration-200 cursor-pointer',
  'transform hover:-translate-y-0.5',
  {
    'opacity-50': isDragging.value,
    'ring-2 ring-blue-500': isDragging.value
  }
])

const priorityClasses = computed(() => {
  const priority = props.task.priority?.toLowerCase()
  return {
    'bg-red-100 text-red-700': priority === 'high',
    'bg-yellow-100 text-yellow-700': priority === 'medium',
    'bg-green-100 text-green-700': priority === 'low'
  }
})

const priorityText = computed(() => {
  const priority = props.task.priority?.toLowerCase()
  const map: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority || ''] || priority || ''
})

const truncatedDescription = computed(() => {
  const desc = props.task.description || ''
  if (desc.length <= props.maxDescriptionLength) {
    return desc
  }
  return desc.substring(0, props.maxDescriptionLength) + '...'
})

const visibleTags = computed(() => {
  const tags = props.task.tags || []
  return tags.slice(0, props.maxTags)
})

const hiddenTags = computed(() => {
  const tags = props.task.tags || []
  return tags.slice(props.maxTags)
})

const hiddenTagsCount = computed(() => hiddenTags.value.length)

const dueDateClasses = computed(() => {
  if (!props.task.due_date) return {}
  
  const dueDate = new Date(props.task.due_date)
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    'text-red-600': diffDays < 0, // 已过期
    'text-orange-600': diffDays >= 0 && diffDays <= 1, // 今天或明天
    'text-yellow-600': diffDays > 1 && diffDays <= 3, // 3天内
    'text-gray-600': diffDays > 3 // 超过3天
  }
})

// 方法
const onClick = () => {
  emit('click', props.task)
}

const onEdit = () => {
  emit('edit', props.task)
}

const onDelete = () => {
  emit('delete', props.task)
}

const onDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('dragStart', props.task, event)
}

const onDragEnd = (event: DragEvent) => {
  isDragging.value = false
  emit('dragEnd', props.task, event)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDueDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return `逾期 ${Math.abs(diffDays)} 天`
  } else if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '明天'
  } else if (diffDays <= 7) {
    return `${diffDays} 天后`
  } else {
    return formatDate(dateString)
  }
}

const getTagStyle = (tag: string) => {
  // 根据标签生成颜色
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700'
  ]
  
  const hash = tag.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const colorClass = colors[Math.abs(hash) % colors.length]
  return { class: colorClass }
}

// 交叉观察器用于懒加载
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (!cardRef.value || !('IntersectionObserver' in window)) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      isVisible.value = entry.isIntersecting
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  )

  observer.observe(cardRef.value)
}

// 生命周期
onMounted(() => {
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.kanban-card {
  @apply p-4 space-y-3;
  min-height: 120px;
}

.card-header {
  @apply space-y-2;
}

.card-title {
  @apply font-medium text-gray-900 text-sm leading-tight;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.priority-indicator {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.card-content {
  @apply space-y-2;
}

.card-description {
  @apply text-xs text-gray-600 leading-relaxed;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  @apply flex flex-wrap gap-1;
}

.tag {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.tag-more {
  @apply bg-gray-100 text-gray-600;
}

.progress-container {
  @apply flex items-center space-x-2;
}

.progress-bar {
  @apply flex-1 bg-gray-200 rounded-full h-1.5;
}

.progress-fill {
  @apply bg-blue-500 h-full rounded-full transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-500 font-medium;
}

.card-footer {
  @apply flex items-center justify-between text-xs text-gray-500;
}

.due-date,
.assignee,
.attachments {
  @apply flex items-center space-x-1;
}

.drag-indicator {
  @apply absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none;
}

/* 动画优化 */
.kanban-card {
  will-change: transform;
}

.kanban-card:hover {
  will-change: auto;
}

/* 减少重绘 */
.card-title,
.card-description {
  contain: layout style;
}
</style>