<template>
  <div 
    class="glass-card p-4 hover:border-neon-blue/50 transition-all cursor-move group"
    :class="getPriorityClass(task.priority)"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <!-- 任务头部 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h4 
          class="text-white font-medium mb-1 group-hover:text-neon-blue transition-colors"
          @click="showTaskDetail"
        >
          {{ task.title }}
        </h4>
        <p 
          v-if="task.description" 
          class="text-gray-400 text-sm line-clamp-2"
          @click="showTaskDetail"
        >
          {{ task.description }}
        </p>
      </div>
      <div class="flex items-center space-x-1 ml-3">
        <button 
          @click="toggleTimer"
          class="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
          :class="{ 'text-green-400': task.is_timer_running }"
        >
          <ClockIcon v-if="!task.is_timer_running" class="w-4 h-4" />
          <StopIcon v-else class="w-4 h-4" />
        </button>
        
        <button 
          @click="editTask"
          class="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
        >
          <PencilIcon class="w-4 h-4" />
        </button>
        
        <button 
          @click="deleteTask"
          class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 任务信息 -->
    <div class="space-y-2 mb-3">
      <div v-if="task.assignee" class="flex items-center text-sm text-gray-400">
        <UserIcon class="w-4 h-4 mr-2" />
        {{ task.assignee }}
      </div>
      
      <div v-if="task.project_name" class="flex items-center text-sm text-gray-400">
        <FolderIcon class="w-4 h-4 mr-2" />
        {{ task.project_name }}
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span 
            class="status-badge text-xs"
            :class="getStatusClass(task.status)"
          >
            {{ getStatusText(task.status) }}
          </span>
          
          <span 
            class="status-badge text-xs"
            :class="getPriorityClass(task.priority)"
          >
            {{ getPriorityText(task.priority) }}
          </span>
        </div>
        
        <div v-if="task.time_logs_count > 0" class="text-xs text-gray-400">
          <ClockIcon class="w-3 h-3 inline mr-1" />
          {{ formatTimeSpent(task) }}
        </div>
      </div>
    </div>

    <!-- 时间信息 -->
    <div v-if="task.start_time || task.end_time" class="border-t border-white/10 pt-3">
      <div class="flex items-center justify-between text-xs text-gray-400">
        <div v-if="task.start_time" class="flex items-center">
          <CalendarIcon class="w-3 h-3 mr-1" />
          开始: {{ formatDate(task.start_time) }}
        </div>
        
        <div v-if="task.end_time" class="flex items-center">
          <CalendarIcon class="w-3 h-3 mr-1" />
          结束: {{ formatDate(task.end_time) }}
        </div>
      </div>
    </div>

    <!-- 文档附件 -->
    <div v-if="task.documents_count > 0" class="border-t border-white/10 pt-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-400">
          <PaperClipIcon class="w-4 h-4 mr-2" />
          {{ task.documents_count }} 个附件
        </div>
        <div class="flex -space-x-2">
          <div 
            v-for="i in Math.min(task.documents_count, 3)" 
            :key="i"
            class="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center"
          >
            <PaperClipIcon class="w-3 h-3 text-gray-400" />
          </div>
          <div v-if="task.documents_count > 3" 
            class="w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center"
          >
            <span class="text-xs text-gray-400">+{{ task.documents_count - 3 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useUIStore } from '@/stores/ui'
import type { Task } from '@/types'
import {
  ClockIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  FolderIcon,
  CalendarIcon,
  PaperClipIcon
} from '@heroicons/vue/24/outline'

interface Props {
  task: Task
}

interface Emits {
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'timer', task: Task): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskStore = useTaskStore()
const uiStore = useUIStore()

// 方法
const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.task.id.toString())
  }
}

const showTaskDetail = () => {
  uiStore.addNotification('任务详情功能开发中...', 'info')
}

const editTask = () => {
  emit('edit', props.task)
}

const deleteTask = () => {
  emit('delete', props.task)
}

const toggleTimer = () => {
  emit('timer', props.task)
}

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high': return 'priority-high border-l-4 border-red-500'
    case 'medium': return 'priority-medium border-l-4 border-yellow-500'
    case 'low': return 'priority-low border-l-4 border-green-500'
    default: return ''
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'todo': return 'status-todo'
    case 'in_progress': return 'status-progress'
    case 'done': return 'status-done'
    default: return 'status-todo'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'todo': return '待处理'
    case 'in_progress': return '进行中'
    case 'done': return '已完成'
    default: return '待处理'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '中'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatTimeSpent = (task: Task) => {
  // 这里应该计算实际的时间消耗
  // 暂时返回任务的时间日志数量
  return `${task.time_logs_count} 记录`
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>