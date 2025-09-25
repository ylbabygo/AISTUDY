<template>
  <div v-if="project" class="min-h-screen">
    <!-- 项目头部 -->
    <div class="glass-card mb-8">
      <div class="glass-card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="$router.back()"
              class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            
            <div>
              <h1 class="text-3xl font-bold text-white">{{ project.name }}</h1>
              <p class="text-gray-400 mt-1">{{ formatDateRange(project.start_date, project.end_date) }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <button 
              @click="editProject"
              class="tesla-btn flex items-center"
            >
              <PencilIcon class="w-4 h-4 mr-2" />
              编辑
            </button>
            
            <button 
              @click="deleteProject"
              class="tesla-btn tesla-btn-danger flex items-center"
            >
              <TrashIcon class="w-4 h-4 mr-2" />
              删除
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-6">
        <div v-if="project.description" class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-2">项目描述</h3>
          <p class="text-gray-300 leading-relaxed">{{ project.description }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-card p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">总任务数</p>
                <p class="text-2xl font-bold text-white">{{ projectTasks.length }}</p>
              </div>
              <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ClipboardDocumentCheckIcon class="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div class="glass-card p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">完成进度</p>
                <p class="text-2xl font-bold text-white">{{ projectProgress }}%</p>
              </div>
              <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon class="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
          
          <div class="glass-card p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-400 text-sm">总耗时</p>
                <p class="text-2xl font-bold text-white">{{ formatTotalTime(totalTimeSpent) }}</p>
              </div>
              <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon class="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务管理 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 任务列表 -->
      <div class="lg:col-span-2">
        <div class="glass-card">
          <div class="glass-card-header flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">任务列表</h2>
            <button 
              @click="showCreateTaskModal = true"
              class="tesla-btn tesla-btn-primary flex items-center text-sm"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              新建任务
            </button>
          </div>
          
          <div class="p-6">
            <div v-if="taskStore.loading" class="text-center py-8">
              <div class="loading-spinner mx-auto mb-4"></div>
              <p class="text-gray-400">加载中...</p>
            </div>
            
            <div v-else-if="projectTasks.length === 0" class="text-center py-8">
              <ClipboardDocumentIcon class="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p class="text-gray-400 mb-4">暂无任务</p>
              <button 
                @click="showCreateTaskModal = true"
                class="tesla-btn tesla-btn-primary"
              >
                创建第一个任务
              </button>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="task in projectTasks" 
                :key="task.id"
                class="glass-card p-4 hover:border-neon-blue/50 transition-all"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-white mb-2">{{ task.title }}</h3>
                    <p v-if="task.description" class="text-gray-400 text-sm mb-3">{{ task.description }}</p>
                    
                    <div class="flex items-center space-x-4 text-sm text-gray-400">
                      <div class="flex items-center">
                        <UserIcon class="w-4 h-4 mr-1" />
                        {{ task.assignee || '未分配' }}
                      </div>
                      
                      <div v-if="task.start_time" class="flex items-center">
                        <CalendarIcon class="w-4 h-4 mr-1" />
                        {{ formatDate(task.start_time) }}
                      </div>
                      
                      <div v-if="task.time_logs_count > 0" class="flex items-center">
                        <ClockIcon class="w-4 h-4 mr-1" />
                        {{ formatTimeSpent(task) }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2 ml-4">
                    <span 
                      class="status-badge"
                      :class="getStatusClass(task.status)"
                    >
                      {{ getStatusText(task.status) }}
                    </span>
                    
                    <span 
                      class="status-badge"
                      :class="getPriorityClass(task.priority)"
                    >
                      {{ getPriorityText(task.priority) }}
                    </span>
                    
                    <button 
                      @click="editTask(task)"
                      class="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    
                    <button 
                      @click="deleteTask(task)"
                      class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-6">
        <!-- 任务统计 -->
        <div class="glass-card">
          <div class="glass-card-header">
            <h3 class="text-lg font-semibold text-white">任务统计</h3>
          </div>
          
          <div class="p-4 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span class="text-gray-300">待处理</span>
              </div>
              <span class="text-white font-medium">{{ tasksByStatus.todo.length }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span class="text-gray-300">进行中</span>
              </div>
              <span class="text-white font-medium">{{ tasksByStatus.in_progress.length }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span class="text-gray-300">已完成</span>
              </div>
              <span class="text-white font-medium">{{ tasksByStatus.done.length }}</span>
            </div>
            
            <div class="border-t border-white/10 pt-4">
              <div class="flex justify-between text-sm text-gray-400 mb-2">
                <span>项目进度</span>
                <span :class="getProgressColor(projectProgress)">{{ projectProgress }}%</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getProgressBarColor(projectProgress)"
                  :style="{ width: projectProgress + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="glass-card">
          <div class="glass-card-header">
            <h3 class="text-lg font-semibold text-white">快速操作</h3>
          </div>
          
          <div class="p-4 space-y-3">
            <button 
              @click="$router.push('/kanban')"
              class="w-full tesla-btn flex items-center justify-center"
            >
              <ViewColumnsIcon class="w-4 h-4 mr-2" />
              看板视图
            </button>
            
            <button 
              @click="$router.push('/gantt')"
              class="w-full tesla-btn flex items-center justify-center"
            >
              <ChartBarIcon class="w-4 h-4 mr-2" />
              甘特图视图
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建任务模态框 -->
    <div v-if="showCreateTaskModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      @click.self="showCreateTaskModal = false"
    >
      <div class="glass-card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
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
  
  <!-- 加载状态 -->
  <div v-else-if="projectStore.loading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <p class="text-gray-400">加载中...</p>
    </div>
  </div>
  
  <!-- 错误状态 -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <ExclamationTriangleIcon class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 class="text-xl text-white mb-2">项目未找到</h2>
      <p class="text-gray-400 mb-6">您访问的项目不存在或已被删除</p>
      <button 
        @click="$router.push('/projects')"
        class="tesla-btn tesla-btn-primary"
      >
        返回项目列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUIStore } from '@/stores/ui'
import type { Project, Task } from '@/types'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  PlusIcon,
  ViewColumnsIcon,
  ChartBarIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()

// 状态
const showCreateTaskModal = ref(false)

// 新任务数据
const newTask = reactive({
  title: '',
  description: '',
  priority: 'medium',
  assignee: ''
})

// 计算属性
const projectId = computed(() => parseInt(route.params.id as string))

const project = computed(() => projectStore.currentProject)

const projectTasks = computed(() => taskStore.tasks.filter(task => task.project_id === projectId.value)
)

const tasksByStatus = computed(() => ({
  todo: projectTasks.value.filter(task => task.status === 'todo'),
  in_progress: projectTasks.value.filter(task => task.status === 'in_progress'),
  done: projectTasks.value.filter(task => task.status === 'done')
}))

const projectProgress = computed(() => {
  if (projectTasks.value.length === 0) return 0
  const completedTasks = projectTasks.value.filter(task => task.status === 'done').length
  return Math.round((completedTasks / projectTasks.value.length) * 100)
})

const totalTimeSpent = computed(() => {
  return projectTasks.value.reduce((total, task) => {
    return total + (task.time_logs_count || 0)
  }, 0)
})

// 生命周期
onMounted(async () => {
  await projectStore.getProject(projectId.value)
  await taskStore.fetchTasks(projectId.value)
})

// 方法
const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString('zh-CN')} - ${end.toLocaleDateString('zh-CN')}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatTimeSpent = (task: Task) => {
  // 这里应该计算实际的时间消耗
  return `${task.time_logs_count || 0} 记录`
}

const formatTotalTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
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

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/20 text-red-400 border border-red-500/50'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
    case 'low': return 'bg-green-500/20 text-green-400 border border-green-500/50'
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
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

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'text-green-400'
  if (progress >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

const getProgressBarColor = (progress: number) => {
  if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-green-600'
  if (progress >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  return 'bg-gradient-to-r from-red-500 to-red-600'
}

const editProject = () => {
  uiStore.addNotification('编辑项目功能开发中...', 'info')
}

const deleteProject = async () => {
  if (!project.value) return
  
  if (confirm(`确定要删除项目 "${project.value.name}" 吗？此操作不可恢复。`)) {
    const success = await projectStore.deleteProject(projectId.value)
    if (success) {
      router.push('/projects')
    }
  }
}

const createTask = async () => {
  if (!newTask.title) {
    uiStore.addNotification('请填写任务标题', 'error')
    return
  }

  const task = await taskStore.createTask({
    project_id: projectId.value,
    title: newTask.title,
    description: newTask.description,
    priority: newTask.priority as Task['priority'],
    assignee: newTask.assignee || undefined,
    status: 'todo'
  })

  if (task) {
    showCreateTaskModal.value = false
    resetForm()
  }
}

const editTask = (task: Task) => {
  uiStore.addNotification('编辑任务功能开发中...', 'info')
}

const deleteTask = async (task: Task) => {
  if (confirm(`确定要删除任务 "${task.title}" 吗？`)) {
    await taskStore.deleteTask(task.id)
  }
}

const resetForm = () => {
  newTask.title = ''
  newTask.description = ''
  newTask.priority = 'medium'
  newTask.assignee = ''
}
</script>

<style scoped>
.status-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.status-todo {
  @apply bg-gray-500/20 text-gray-400 border border-gray-500/50;
}

.status-progress {
  @apply bg-blue-500/20 text-blue-400 border border-blue-500/50;
}

.status-done {
  @apply bg-green-500/20 text-green-400 border border-green-500/50;
}
</style>