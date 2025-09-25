<template>
  <div class="min-h-screen space-y-8 animate-fade-in">
    <!-- 页面标题和欢迎区域 -->
    <div class="relative overflow-hidden">
      <Card variant="gradient" size="lg" class="border-0">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gradient mb-2">
              项目仪表盘
            </h1>
            <p class="text-lg text-gray-600">
              欢迎回来！管理您的项目和任务，跟踪进度和时间
            </p>
            <div class="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span>今天是 {{ formatDate(new Date()) }}</span>
              <span>•</span>
              <span>{{ getGreeting() }}</span>
            </div>
          </div>
          <div class="hidden lg:block">
            <div class="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card 
        variant="glass" 
        size="md" 
        interactive 
        hoverable 
        class="animate-slide-up"
        style="animation-delay: 0.1s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">总项目数</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ projectStore.totalProjects }}
            </p>
            <p class="text-xs text-green-600 mt-1">
              <span class="inline-flex items-center">
                <ArrowTrendingUpIcon class="w-3 h-3 mr-1" />
                +12% 本月
              </span>
            </p>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <FolderIcon class="w-7 h-7 text-white" />
          </div>
        </div>
      </Card>

      <Card 
        variant="glass" 
        size="md" 
        interactive 
        hoverable 
        class="animate-slide-up"
        style="animation-delay: 0.2s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">活跃项目</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ projectStore.activeProjects.length }}
            </p>
            <p class="text-xs text-green-600 mt-1">
              <span class="inline-flex items-center">
                <ArrowTrendingUpIcon class="w-3 h-3 mr-1" />
                +8% 本周
              </span>
            </p>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <PlayIcon class="w-7 h-7 text-white" />
          </div>
        </div>
      </Card>

      <Card 
        variant="glass" 
        size="md" 
        interactive 
        hoverable 
        class="animate-slide-up"
        style="animation-delay: 0.3s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">已完成项目</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ projectStore.completedProjects.length }}
            </p>
            <p class="text-xs text-green-600 mt-1">
              <span class="inline-flex items-center">
                <ArrowTrendingUpIcon class="w-3 h-3 mr-1" />
                +15% 本月
              </span>
            </p>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <CheckCircleIcon class="w-7 h-7 text-white" />
          </div>
        </div>
      </Card>

      <Card 
        variant="glass" 
        size="md" 
        interactive 
        hoverable 
        class="animate-slide-up"
        style="animation-delay: 0.4s"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">总任务数</p>
            <p class="text-3xl font-bold text-gray-900">
              {{ taskStore.tasks.length }}
            </p>
            <p class="text-xs text-green-600 mt-1">
              <span class="inline-flex items-center">
                <ArrowTrendingUpIcon class="w-3 h-3 mr-1" />
                +23% 本周
              </span>
            </p>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardDocumentCheckIcon class="w-7 h-7 text-white" />
          </div>
        </div>
      </Card>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 最近项目 -->
      <div class="lg:col-span-2">
        <Card variant="glass" size="lg" class="animate-slide-up" style="animation-delay: 0.5s">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">最近项目</h2>
              <Button 
                variant="outline" 
                size="sm"
                @click="$router.push('/projects')"
              >
                查看全部
              </Button>
            </div>
          </template>

          <div v-if="projectStore.loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p class="text-gray-500">加载中...</p>
          </div>
          
          <div v-else-if="recentProjects.length === 0" class="text-center py-12">
            <FolderOpenIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 mb-4">暂无项目</p>
            <Button 
              variant="primary"
              @click="showCreateProjectModal = true"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              创建第一个项目
            </Button>
          </div>
          
          <div v-else class="space-y-4">
            <Card 
              v-for="(project, index) in recentProjects" 
              :key="project.id"
              variant="outlined"
              size="sm"
              hoverable
              clickable
              class="animate-slide-up cursor-pointer"
              :style="`animation-delay: ${0.6 + index * 0.1}s`"
              @click="$router.push(`/project/${project.id}`)"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    {{ project.name }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ formatDateRange(project.start_date, project.end_date) }}
                  </p>
                </div>
                <div class="text-right ml-4">
                  <div class="text-2xl font-bold text-primary-600">
                    {{ getProjectTaskCount(project.id) }}
                  </div>
                  <div class="text-xs text-gray-500">任务</div>
                </div>
              </div>
              
              <!-- 进度条 -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">进度</span>
                  <span class="font-medium text-gray-900">{{ getProjectProgress(project.id) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    :style="{ width: getProjectProgress(project.id) + '%' }"
                  ></div>
                </div>
              </div>

              <!-- 项目状态标签 -->
              <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getProjectStatusClass(project.status)"
                  >
                    {{ getProjectStatusText(project.status) }}
                  </span>
                </div>
                <div class="flex items-center text-xs text-gray-500">
                  <CalendarIcon class="w-3 h-3 mr-1" />
                  {{ getProjectDaysLeft(project.end_date) }}
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>

      <!-- 任务统计和活动 -->
      <div class="space-y-6">
        <!-- 任务统计 -->
        <Card variant="glass" size="lg" class="animate-slide-up" style="animation-delay: 0.6s">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">任务统计</h2>
              <Button 
                variant="outline" 
                size="sm"
                @click="$router.push('/kanban')"
              >
                看板视图
              </Button>
            </div>
          </template>

          <div v-if="taskStore.loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p class="text-gray-500">加载中...</p>
          </div>
          
          <div v-else class="space-y-6">
            <!-- 任务状态分布 -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">状态分布</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                    <span class="text-gray-700 font-medium">待处理</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-900 font-bold text-lg">
                      {{ taskStore.tasksByStatus.todo.length }}
                    </span>
                    <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {{ getTaskPercentage('todo') }}%
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span class="text-blue-700 font-medium">进行中</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-blue-900 font-bold text-lg">
                      {{ taskStore.tasksByStatus.in_progress.length }}
                    </span>
                    <span class="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                      {{ getTaskPercentage('in_progress') }}%
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span class="text-green-700 font-medium">已完成</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-green-900 font-bold text-lg">
                      {{ taskStore.tasksByStatus.done.length }}
                    </span>
                    <span class="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                      {{ getTaskPercentage('done') }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 最近任务 -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">最近任务</h3>
              <div class="space-y-3">
                <div 
                  v-for="(task, index) in recentTasks" 
                  :key="task.id"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer animate-slide-up"
                  :style="`animation-delay: ${0.7 + index * 0.1}s`"
                >
                  <div class="flex items-center flex-1">
                    <div 
                      class="w-3 h-8 rounded-full mr-3 flex-shrink-0"
                      :class="getPriorityColor(task.priority)"
                    ></div>
                    <div class="flex-1 min-w-0">
                      <div class="text-gray-900 font-medium truncate">{{ task.title }}</div>
                      <div class="text-gray-500 text-sm truncate">{{ task.project_name }}</div>
                    </div>
                  </div>
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 flex-shrink-0"
                    :class="getStatusClass(task.status)"
                  >
                    {{ getStatusText(task.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- 快速操作 -->
        <Card variant="glass" size="lg" class="animate-slide-up" style="animation-delay: 0.7s">
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900">快速操作</h2>
          </template>

          <div class="grid grid-cols-1 gap-3">
            <Button 
              variant="primary"
              size="lg"
              @click="showCreateProjectModal = true"
              class="justify-start"
            >
              <PlusIcon class="w-5 h-5 mr-3" />
              <div class="text-left">
                <div class="font-medium">新建项目</div>
                <div class="text-xs opacity-80">创建新的项目并开始管理</div>
              </div>
            </Button>
            <Button 
              variant="outline"
              size="lg"
              @click="$router.push('/kanban')"
              class="justify-start"
            >
              <ViewColumnsIcon class="w-5 h-5 mr-3" />
              <div class="text-left">
                <div class="font-medium">看板视图</div>
                <div class="text-xs text-gray-500">可视化任务管理</div>
              </div>
            </Button>
            <Button 
              variant="outline"
              size="lg"
              @click="$router.push('/gantt')"
              class="justify-start"
            >
              <ChartBarIcon class="w-5 h-5 mr-3" />
              <div class="text-left">
                <div class="font-medium">甘特图</div>
                <div class="text-xs text-gray-500">项目时间线管理</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUIStore } from '@/stores/ui'
import type { Project, Task } from '@/types'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import CreateProjectModal from '@/components/CreateProjectModal.vue'
import {
  FolderIcon,
  PlayIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  FolderOpenIcon,
  PlusIcon,
  ViewColumnsIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()

// 生命周期
onMounted(async () => {
  await projectStore.fetchProjects()
  await taskStore.fetchTasks()
})

// 计算属性
const recentProjects = computed(() => 
  projectStore.projectList.slice(0, 3)
)

const recentTasks = computed(() => {
  return taskStore.tasks
    .slice()
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
})

// 方法
const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好！'
  if (hour < 18) return '下午好！'
  return '晚上好！'
}

const getProjectTaskCount = (projectId: number) => {
  return taskStore.tasksByProject[projectId]?.length || 0
}

const getProjectProgress = (projectId: number) => {
  const projectTasks = taskStore.tasksByProject[projectId] || []
  if (projectTasks.length === 0) return 0
  
  const completedTasks = projectTasks.filter(task => task.status === 'done').length
  return Math.round((completedTasks / projectTasks.length) * 100)
}

const getProjectStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'completed': return 'bg-blue-100 text-blue-800'
    case 'on_hold': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getProjectStatusText = (status: string) => {
  switch (status) {
    case 'active': return '进行中'
    case 'completed': return '已完成'
    case 'on_hold': return '暂停'
    default: return '未知'
  }
}

const getProjectDaysLeft = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已逾期'
  if (diffDays === 0) return '今天截止'
  if (diffDays === 1) return '明天截止'
  return `${diffDays}天后截止`
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'todo': return 'bg-gray-100 text-gray-800'
    case 'in_progress': return 'bg-blue-100 text-blue-800'
    case 'done': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'todo': return '待处理'
    case 'in_progress': return '进行中'
    case 'done': return '已完成'
    default: return '未知'
  }
}

const getTaskPercentage = (status: string) => {
  const total = taskStore.tasks.length
  if (total === 0) return 0
  const count = taskStore.tasksByStatus[status]?.length || 0
  return Math.round((count / total) * 100)
}

const showCreateProjectModal = ref(false)
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out forwards;
  opacity: 0;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
  opacity: 0;
}

.progress-bar {
  transition: width 0.3s ease-in-out;
}

.glass-morphism {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>