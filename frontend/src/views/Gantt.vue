<template>
  <div class="min-h-screen">
    <!-- 页面标题和工具栏 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-bold text-white mb-2">甘特图视图</h1>
        <p class="text-gray-400">时间轴视图，直观展示任务进度</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- 项目筛选 -->
        <select 
          v-model="selectedProjectId" 
          class="tesla-input w-48"
          @change="onProjectChange"
        >
          <option value="">所有项目</option>
          <option 
            v-for="project in projectStore.projectList" 
            :key="project.id" 
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
        
        <button 
          @click="showCreateTaskModal = true"
          class="tesla-btn tesla-btn-primary flex items-center"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          新建任务
        </button>
        
        <button 
          @click="toggleViewMode"
          class="tesla-btn flex items-center"
        >
          <ViewColumnsIcon class="w-5 h-5 mr-2" />
          切换到看板
        </button>
      </div>
    </div>

    <!-- 甘特图容器 -->
    <div class="glass-card p-6">
      <div v-if="taskStore.loading" class="text-center py-12">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-400">加载中...</p>
      </div>
      
      <div v-else-if="ganttTasks.length === 0" class="text-center py-12">
        <ChartBarIcon class="w-20 h-20 text-gray-500 mx-auto mb-4" />
        <p class="text-gray-400 text-lg mb-4">暂无任务数据</p>
        <p class="text-gray-500 mb-6">创建一些任务来查看甘特图</p>
        <button 
          @click="showCreateTaskModal = true"
          class="tesla-btn tesla-btn-primary"
        >
          创建任务
        </button>
      </div>
      
      <div v-else class="gantt-container">
        <div id="gantt" class="gantt-chart"></div>
      </div>
    </div>

    <!-- 创建任务模态框 -->
    <div 
      v-if="showCreateTaskModal" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showCreateTaskModal = false"
    >
      <div 
        class="glass-card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="glass-card-header flex items-center justify-between">
          <h2 class="text-xl font-semibold text-white">创建新任务</h2>
          <button 
            @click="showCreateTaskModal = false"
            class="text-gray-400 hover:text-white"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="createTask" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">任务标题 *</label>
            <input
              v-model="newTask.title"
              type="text"
              required
              class="tesla-input"
              placeholder="输入任务标题"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">所属项目 *</label>
            <select v-model="newTask.project_id" required class="tesla-input">
              <option value="">选择项目</option>
              <option 
                v-for="project in projectStore.projectList" 
                :key="project.id" 
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">开始时间</label>
              <input
                v-model="newTask.start_time"
                type="datetime-local"
                class="tesla-input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">结束时间</label>
              <input
                v-model="newTask.end_time"
                type="datetime-local"
                class="tesla-input"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">任务描述</label>
            <textarea
              v-model="newTask.description"
              rows="3"
              class="tesla-input resize-none"
              placeholder="输入任务描述（可选）"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">优先级</label>
              <select v-model="newTask.priority" class="tesla-input">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">负责人</label>
              <input
                v-model="newTask.assignee"
                type="text"
                class="tesla-input"
                placeholder="输入负责人"
              />
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showCreateTaskModal = false"
              class="flex-1 tesla-btn"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="taskStore.loading"
              class="flex-1 tesla-btn tesla-btn-primary"
            >
              <span v-if="!taskStore.loading">创建任务</span>
              <span v-else class="flex items-center">
                <div class="loading-spinner mr-2"></div>
                创建中...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUIStore } from '@/stores/ui'
import type { Task } from '@/types'
import Gantt from 'frappe-gantt'
import 'frappe-gantt/dist/frappe-gantt.css'
import {
  PlusIcon,
  ViewColumnsIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()

// 状态
const selectedProjectId = ref('')
const showCreateTaskModal = ref(false)
const ganttInstance = ref<Gantt | null>(null)

// 新任务数据
const newTask = reactive({
  title: '',
  description: '',
  project_id: '',
  priority: 'medium',
  assignee: '',
  start_time: '',
  end_time: ''
})

// 计算属性
const ganttTasks = computed(() => {
  return taskStore.tasks.map(task => ({
    id: task.id.toString(),
    name: task.title,
    start: task.start_time || new Date().toISOString(),
    end: task.end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    progress: task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0,
    dependencies: task.depends_on ? task.depends_on.toString() : '',
    custom_class: getTaskClass(task)
  }))
})

// 生命周期
onMounted(async () => {
  await projectStore.fetchProjects()
  
  // 检查URL参数
  const urlParams = new URLSearchParams(window.location.search)
  const projectId = urlParams.get('project')
  if (projectId) {
    selectedProjectId.value = projectId
  }
  
  await loadTasks()
  await nextTick()
  initGantt()
})

// 方法
const loadTasks = async () => {
  if (selectedProjectId.value) {
    await taskStore.fetchTasks(parseInt(selectedProjectId.value))
  } else {
    await taskStore.fetchTasks()
  }
}

const onProjectChange = async () => {
  await loadTasks()
  updateGantt()
}

const initGantt = () => {
  if (ganttTasks.value.length === 0) return

  const ganttElement = document.getElementById('gantt')
  if (!ganttElement) return

  // 配置选项
  const options = {
    view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
    view_mode: 'Week',
    date_format: 'YYYY-MM-DD',
    custom_popup_html: (task: any) => {
      return `
        <div class="gantt-task-popup glass-card border border-neon-blue/30">
          <h5 class="text-white font-medium mb-2">${task.name}</h5>
          <p class="text-gray-400 text-sm mb-1">进度: ${task.progress}%</p>
          <p class="text-gray-400 text-sm mb-1">开始: ${task.start}</p>
          <p class="text-gray-400 text-sm">结束: ${task.end}</p>
        </div>
      `
    },
    on_click: (task: any) => {
      console.log('Task clicked:', task)
    },
    on_date_change: async (task: any, start: Date, end: Date) => {
      await updateTaskDates(task, start, end)
    },
    on_progress_change: async (task: any, progress: number) => {
      await updateTaskProgress(task, progress)
    },
    on_view_change: (mode: string) => {
      console.log('View mode changed:', mode)
    }
  }

  // 初始化甘特图
  ganttInstance.value = new Gantt('#gantt', ganttTasks.value, options)
}

const updateGantt = () => {
  if (ganttInstance.value) {
    ganttInstance.value.refresh(ganttTasks.value)
  } else {
    initGantt()
  }
}

const getTaskClass = (task: Task) => {
  let baseClass = 'gantt-task-'
  
  switch (task.priority) {
    case 'high':
      baseClass += 'high-priority'
      break
    case 'medium':
      baseClass += 'medium-priority'
      break
    case 'low':
      baseClass += 'low-priority'
      break
  }
  
  if (task.status === 'done') {
    baseClass += ' completed'
  }
  
  return baseClass
}

const updateTaskDates = async (ganttTask: any, start: Date, end: Date) => {
  const taskId = parseInt(ganttTask.id)
  const task = taskStore.tasks.find(t => t.id === taskId)
  
  if (task) {
    await taskStore.updateTask(taskId, {
      start_time: start.toISOString(),
      end_time: end.toISOString()
    })
  }
}

const updateTaskProgress = async (ganttTask: any, progress: number) => {
  const taskId = parseInt(ganttTask.id)
  let status: Task['status'] = 'todo'
  
  if (progress >= 100) {
    status = 'done'
  } else if (progress > 0) {
    status = 'in_progress'
  }
  
  await taskStore.updateTask(taskId, { status })
}

const createTask = async () => {
  if (!newTask.title || !newTask.project_id) {
    uiStore.addNotification('请填写必填项', 'error')
    return
  }

  const taskData: any = {
    project_id: parseInt(newTask.project_id),
    title: newTask.title,
    description: newTask.description,
    priority: newTask.priority as Task['priority'],
    assignee: newTask.assignee || undefined,
    status: 'todo'
  }

  // 添加时间信息
  if (newTask.start_time) {
    taskData.start_time = newTask.start_time
  }
  if (newTask.end_time) {
    taskData.end_time = newTask.end_time
  }

  const task = await taskStore.createTask(taskData)

  if (task) {
    showCreateTaskModal.value = false
    resetForm()
    updateGantt()
  }
}

const toggleViewMode = () => {
  uiStore.setViewMode('kanban')
  router.push('/kanban')
}

const resetForm = () => {
  newTask.title = ''
  newTask.description = ''
  newTask.project_id = ''
  newTask.priority = 'medium'
  newTask.assignee = ''
  newTask.start_time = ''
  newTask.end_time = ''
}
</script>

<style scoped>
.gantt-container {
  background: var(--glass-bg);
  border-radius: 12px;
  padding: 20px;
  border: var(--neon-border);
}

.gantt-chart {
  width: 100%;
  min-height: 400px;
}

/* 自定义甘特图样式 */
.gantt .bar {
  fill: url(#gradient) !important;
  stroke: #00c8ff !important;
  stroke-width: 1px !important;
  rx: 4px !important;
  ry: 4px !important;
}

.gantt .bar-progress {
  fill: #00c8ff !important;
  rx: 4px !important;
  ry: 4px !important;
}

.gantt .bar-wrapper:hover .bar {
  fill: #0099cc !important;
  filter: drop-shadow(0 0 5px rgba(0, 200, 255, 0.5));
}

.gantt .grid-header {
  fill: var(--glass-bg-dark) !important;
  stroke: rgba(0, 200, 255, 0.3) !important;
}

.gantt .grid-row {
  fill: var(--glass-bg) !important;
  stroke: rgba(255, 255, 255, 0.1) !important;
}

.gantt .today-highlight {
  fill: rgba(0, 200, 255, 0.1) !important;
}

.gantt-task-popup {
  background: var(--glass-gradient) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 8px !important;
  padding: 12px !important;
  box-shadow: var(--shadow-glass) !important;
}

/* 优先级样式 */
.gantt-task-high-priority .bar {
  fill: #ef4444 !important;
  stroke: #dc2626 !important;
}

.gantt-task-medium-priority .bar {
  fill: #f59e0b !important;
  stroke: #d97706 !important;
}

.gantt-task-low-priority .bar {
  fill: #10b981 !important;
  stroke: #059669 !important;
}

.gantt-task-completed .bar {
  fill: #6b7280 !important;
  stroke: #4b5563 !important;
}

.gantt-task-completed .bar-progress {
  fill: #6b7280 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gantt-container {
    padding: 10px;
    overflow-x: auto;
  }
  
  .gantt-chart {
    min-width: 600px;
  }
}
</style>

<style>
/* 全局甘特图样式覆盖 */
.gantt .lower-text, .gantt .upper-text {
  fill: #ffffff !important;
  font-size: 12px !important;
}

.gantt .bar-label {
  fill: #ffffff !important;
  font-weight: 500 !important;
}

.gantt .grid-row:nth-child(even) {
  fill: rgba(255, 255, 255, 0.02) !important;
}

.gantt .arrow {
  stroke: rgba(0, 200, 255, 0.6) !important;
  fill: rgba(0, 200, 255, 0.6) !important;
}

.gantt .handle {
  fill: #00c8ff !important;
  opacity: 0.7 !important;
}

.gantt .handle:hover {
  opacity: 1 !important;
  filter: drop-shadow(0 0 3px #00c8ff) !important;
}
</style>