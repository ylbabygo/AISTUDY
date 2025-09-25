<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    <!-- 页面标题和操作 -->
    <div class="flex items-center justify-between mb-8 animate-slide-up">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">项目管理</h1>
        <p class="text-gray-600">创建和管理您的项目，追踪进度和成果</p>
      </div>
      <Button 
        variant="primary"
        size="lg"
        @click="showCreateModal = true"
        class="animate-slide-up"
        style="animation-delay: 0.1s"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        新建项目
      </Button>
    </div>

    <!-- 筛选和搜索 -->
    <Card variant="glass" size="lg" class="mb-8 animate-slide-up" style="animation-delay: 0.2s">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-4 flex-1">
          <div class="relative flex-1 max-w-md">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索项目名称或描述..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <select 
            v-model="statusFilter" 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="all">全部状态</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="on_hold">暂停</option>
          </select>
          <select 
            v-model="sortBy" 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="name">按名称排序</option>
            <option value="created_date">按创建时间</option>
            <option value="end_date">按截止时间</option>
            <option value="progress">按进度排序</option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            @click="viewMode = 'grid'"
            :class="viewMode === 'grid' ? 'bg-primary-50 border-primary-300' : ''"
          >
            <ViewColumnsIcon class="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="viewMode = 'list'"
            :class="viewMode === 'list' ? 'bg-primary-50 border-primary-300' : ''"
          >
            <Bars3Icon class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
    <!-- 项目列表 -->
    <div v-if="projectStore.loading" class="text-center py-16 animate-fade-in">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-4"></div>
      <p class="text-gray-600">加载项目中...</p>
    </div>
    
    <div v-else-if="filteredProjects.length === 0" class="text-center py-16 animate-fade-in">
      <Card variant="glass" size="lg" class="max-w-md mx-auto">
        <div class="text-center">
          <FolderOpenIcon class="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无项目</h3>
          <p class="text-gray-600 mb-6">开始创建您的第一个项目，管理任务和团队协作</p>
          <Button 
            variant="primary"
            size="lg"
            @click="showCreateModal = true"
          >
            <PlusIcon class="w-5 h-5 mr-2" />
            创建项目
          </Button>
        </div>
      </Card>
    </div>
    
    <!-- 网格视图 -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card 
        v-for="(project, index) in sortedProjects" 
        :key="project.id"
        variant="glass"
        size="lg"
        class="h-full group cursor-pointer hover:shadow-lg transition-all duration-300 animate-slide-up"
        :style="`animation-delay: ${0.3 + index * 0.1}s`"
        @click="$router.push(`/project/${project.id}`)"
      >
        <!-- 项目头部 -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors truncate">
              {{ project.name }}
            </h3>
            <p v-if="project.description" class="text-gray-600 text-sm line-clamp-2">{{ project.description }}</p>
          </div>
          <div class="flex items-center space-x-1 ml-3 flex-shrink-0" @click.stop>
            <Button
              variant="ghost"
              size="sm"
              @click="editProject(project)"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PencilIcon class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="deleteProject(project)"
              class="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <!-- 项目状态 -->
        <div class="flex items-center justify-between mb-4">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getProjectStatusClass(getProjectStatus(project))"
          >
            {{ getProjectStatusText(getProjectStatus(project)) }}
          </span>
          <span class="text-xs text-gray-500">
            {{ getProjectDaysLeft(project.end_date) }}
          </span>
        </div>

        <!-- 项目信息 -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <CalendarIcon class="w-4 h-4 mr-2 flex-shrink-0" />
            <span class="truncate">{{ formatDateRange(project.start_date, project.end_date) }}</span>
          </div>

          <div class="flex items-center text-sm text-gray-600">
            <ClipboardDocumentCheckIcon class="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{{ getProjectTaskCount(project.id) }} 个任务</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-gray-600 mb-2">
            <span>完成进度</span>
            <span class="font-medium" :class="getProgressColor(getProjectProgress(project.id))">
              {{ getProjectProgress(project.id) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-500 progress-bar"
              :class="getProgressBarColor(getProjectProgress(project.id))"
              :style="{ width: getProjectProgress(project.id) + '%' }"
            ></div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-2" @click.stop>
          <Button 
            variant="outline"
            size="sm"
            @click="$router.push(`/project/${project.id}`)"
            class="flex-1"
          >
            详情
          </Button>
          <Button 
            variant="outline"
            size="sm"
            @click="$router.push(`/kanban?project=${project.id}`)"
            class="flex-1"
          >
            看板
          </Button>
        </div>
      </Card>
    </div>

    <!-- 列表视图 -->
    <div v-else class="space-y-4">
      <Card 
        v-for="(project, index) in sortedProjects" 
        :key="project.id"
        variant="glass"
        size="lg"
        class="group cursor-pointer hover:shadow-md transition-all duration-300 animate-slide-up"
        :style="`animation-delay: ${0.3 + index * 0.05}s`"
        @click="$router.push(`/project/${project.id}`)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1 min-w-0">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                {{ project.name }}
              </h3>
              <p v-if="project.description" class="text-gray-600 text-sm truncate">{{ project.description }}</p>
            </div>
            
            <div class="flex items-center space-x-6 flex-shrink-0">
              <div class="text-center">
                <div class="text-sm font-medium text-gray-900">{{ getProjectTaskCount(project.id) }}</div>
                <div class="text-xs text-gray-500">任务</div>
              </div>
              
              <div class="text-center">
                <div class="text-sm font-medium" :class="getProgressColor(getProjectProgress(project.id))">
                  {{ getProjectProgress(project.id) }}%
                </div>
                <div class="text-xs text-gray-500">完成</div>
              </div>
              
              <div class="text-center min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ getProjectDaysLeft(project.end_date) }}</div>
                <div class="text-xs text-gray-500">剩余</div>
              </div>
              
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getProjectStatusClass(getProjectStatus(project))"
              >
                {{ getProjectStatusText(getProjectStatus(project)) }}
              </span>
            </div>
          </div>
          
          <div class="flex items-center space-x-2 ml-4" @click.stop>
            <Button
              variant="ghost"
              size="sm"
              @click="$router.push(`/kanban?project=${project.id}`)"
            >
              看板
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="editProject(project)"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PencilIcon class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="deleteProject(project)"
              class="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- 创建项目模态框 -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showCreateModal = false"
    >
      <Card 
        variant="glass"
        size="lg"
        class="w-full max-w-lg animate-slide-up"
        @click.stop
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">创建新项目</h2>
            <Button
              variant="ghost"
              size="sm"
              @click="showCreateModal = false"
            >
              <XMarkIcon class="w-5 h-5" />
            </Button>
          </div>
        </template>
        
        <form @submit.prevent="createProject" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目名称 *</label>
            <input
              v-model="newProject.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="输入项目名称"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目描述</label>
            <textarea
              v-model="newProject.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              placeholder="输入项目描述（可选）"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">开始日期 *</label>
              <input
                v-model="newProject.start_date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">结束日期 *</label>
              <input
                v-model="newProject.end_date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              @click="showCreateModal = false"
              class="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              :disabled="projectStore.loading"
              class="flex-1"
            >
              <span v-if="!projectStore.loading">创建项目</span>
              <span v-else class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                创建中...
              </span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import type { Project } from '@/types'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderOpenIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ViewColumnsIcon,
  Bars3Icon
} from '@heroicons/vue/24/outline'

const projectStore = useProjectStore()
const taskStore = useTaskStore()

// 状态
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')
const viewMode = ref('grid')
const showCreateModal = ref(false)

// 新项目数据
const newProject = reactive({
  name: '',
  description: '',
  start_date: '',
  end_date: ''
})

// 生命周期
onMounted(async () => {
  await projectStore.fetchProjects()
  await taskStore.fetchTasks()
})

// 计算属性
const filteredProjects = computed(() => {
  let projects = projectStore.projects

  // 按状态筛选
  if (statusFilter.value !== 'all') {
    projects = projects.filter(project => project.status === statusFilter.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    projects = projects.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    )
  }

  // 排序
  return projects.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created_date':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      case 'end_date':
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      case 'progress':
        return getProjectProgress(b.id) - getProjectProgress(a.id)
      default:
        return 0
    }
  })
})

// 方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateRange = (startDate: string, endDate: string) => {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  return `${start} - ${end}`
}

const getProjectStatus = (project: Project) => {
  const now = new Date()
  const endDate = new Date(project.end_date)
  const progress = getProjectProgress(project.id)
  
  if (progress === 100) return 'completed'
  if (endDate < now) return 'overdue'
  return 'active'
}

const getProjectStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    overdue: '已逾期',
    on_hold: '暂停'
  }
  return statusMap[status] || '未知'
}

const getProjectStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    on_hold: 'bg-yellow-100 text-yellow-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getProjectDaysLeft = (endDate: string) => {
  const now = new Date()
  const end = new Date(endDate)
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`
  if (diffDays === 0) return '今天截止'
  if (diffDays === 1) return '明天截止'
  return `${diffDays} 天后截止`
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

const createProject = async () => {
  if (!newProject.name || !newProject.start_date || !newProject.end_date) {
    return
  }

  const project = await projectStore.createProject({
    name: newProject.name,
    description: newProject.description,
    start_date: newProject.start_date,
    end_date: newProject.end_date
  })

  if (project) {
    showCreateModal.value = false
    resetForm()
  }
}

const editProject = (project: Project) => {
  // 跳转到项目详情页面进行编辑
  // 这里可以实现编辑功能
}

const deleteProject = async (project: Project) => {
  if (confirm(`确定要删除项目 "${project.name}" 吗？此操作不可恢复。`)) {
    await projectStore.deleteProject(project.id)
  }
}

const resetForm = () => {
  newProject.name = ''
  newProject.description = ''
  newProject.start_date = ''
  newProject.end_date = ''
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 动画效果 */
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
  animation: slide-up 0.6s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}

/* 进度条动画 */
.progress-bar {
  transition: width 0.8s ease-out;
}

/* 悬停效果 */
.project-card {
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 状态标签 */
.status-badge {
  transition: all 0.2s ease;
}

/* 网格视图样式 */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* 列表视图样式 */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid-view {
    grid-template-columns: 1fr;
  }
}
</style>