<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <!-- 页面标题和工具栏 -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-8 animate-slide-up">
      <div class="mb-4 lg:mb-0">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          看板视图
        </h1>
        <p class="text-slate-600 flex items-center">
          <CursorArrowRaysIcon class="w-4 h-4 mr-2" />
          拖拽任务卡片来更新状态
        </p>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <!-- 项目筛选 -->
        <div class="relative">
          <select 
            v-model="selectedProjectId" 
            class="appearance-none bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
            @change="onProjectChange"
          >
            <option value="">所有项目</option>
            <option 
              v-for="project in projectStore.projects" 
              :key="project.id" 
              :value="project.id"
            >
              {{ project.name }}
            </option>
          </select>
          <ChevronDownIcon class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        
        <Button 
          @click="showCreateTaskModal = true"
          variant="primary"
          size="md"
          class="animate-fade-in"
          style="animation-delay: 0.1s"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          新建任务
        </Button>
        
        <Button 
          @click="toggleViewMode"
          variant="outlined"
          size="md"
          class="animate-fade-in"
          style="animation-delay: 0.2s"
        >
          <ChartBarIcon class="w-4 h-4 mr-2" />
          甘特图
        </Button>
      </div>
    </div>

    <!-- 看板列 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style="animation-delay: 0.3s">
      <!-- 待处理列 -->
      <Card 
        variant="glass" 
        size="lg" 
        class="kanban-column min-h-[600px] animate-slide-up"
        style="animation-delay: 0.4s"
      >
        <template #header>
          <div class="flex items-center justify-between p-4 border-b border-slate-200/50">
            <h3 class="text-lg font-semibold text-slate-700 flex items-center">
              <ClockIcon class="w-5 h-5 mr-2 text-amber-500" />
              待处理
            </h3>
            <span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ todoTasks.length }}
            </span>
          </div>
        </template>
        
        <div 
          class="p-4 space-y-3 min-h-[500px] kanban-drop-zone"
          :class="{ 'kanban-drop-active': isDragOverTodo }"
          @drop="onDrop($event, 'todo')"
          @dragover.prevent="isDragOverTodo = true"
          @dragenter.prevent="isDragOverTodo = true"
          @dragleave="isDragOverTodo = false"
        >
          <draggable
            v-model="todoTasks"
            group="tasks"
            item-key="id"
            :animation="300"
            :forceFallback="true"
            ghost-class="kanban-ghost"
            chosen-class="kanban-chosen"
            drag-class="kanban-drag"
            @change="handleTaskMove"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div 
                class="kanban-task-wrapper animate-slide-up"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <TaskCard 
                  :task="element" 
                  @edit="editTask"
                  @delete="deleteTask"
                  @timer="toggleTimer"
                />
              </div>
            </template>
          </draggable>
          
          <!-- 空状态 -->
          <div v-if="todoTasks.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
            <ClockIcon class="w-12 h-12 mb-3 opacity-50" />
            <p class="text-sm">暂无待处理任务</p>
          </div>
        </div>
      </Card>

      <!-- 进行中列 -->
      <Card 
        variant="glass" 
        size="lg" 
        class="kanban-column min-h-[600px] animate-slide-up"
        style="animation-delay: 0.5s"
      >
        <template #header>
          <div class="flex items-center justify-between p-4 border-b border-slate-200/50">
            <h3 class="text-lg font-semibold text-slate-700 flex items-center">
              <PlayIcon class="w-5 h-5 mr-2 text-blue-500" />
              进行中
            </h3>
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ inProgressTasks.length }}
            </span>
          </div>
        </template>
        
        <div 
          class="p-4 space-y-3 min-h-[500px] kanban-drop-zone"
          :class="{ 'kanban-drop-active': isDragOverInProgress }"
          @drop="onDrop($event, 'in_progress')"
          @dragover.prevent="isDragOverInProgress = true"
          @dragenter.prevent="isDragOverInProgress = true"
          @dragleave="isDragOverInProgress = false"
        >
          <draggable
            v-model="inProgressTasks"
            group="tasks"
            item-key="id"
            :animation="300"
            :forceFallback="true"
            ghost-class="kanban-ghost"
            chosen-class="kanban-chosen"
            drag-class="kanban-drag"
            @change="handleTaskMove"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div 
                class="kanban-task-wrapper animate-slide-up"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <TaskCard 
                  :task="element" 
                  @edit="editTask"
                  @delete="deleteTask"
                  @timer="toggleTimer"
                />
              </div>
            </template>
          </draggable>
          
          <!-- 空状态 -->
          <div v-if="inProgressTasks.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
            <PlayIcon class="w-12 h-12 mb-3 opacity-50" />
            <p class="text-sm">暂无进行中任务</p>
          </div>
        </div>
      </Card>

      <!-- 已完成列 -->
      <Card 
        variant="glass" 
        size="lg" 
        class="kanban-column min-h-[600px] animate-slide-up"
        style="animation-delay: 0.6s"
      >
        <template #header>
          <div class="flex items-center justify-between p-4 border-b border-slate-200/50">
            <h3 class="text-lg font-semibold text-slate-700 flex items-center">
              <CheckCircleIcon class="w-5 h-5 mr-2 text-green-500" />
              已完成
            </h3>
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ doneTasks.length }}
            </span>
          </div>
        </template>
        
        <div 
          class="p-4 space-y-3 min-h-[500px] kanban-drop-zone"
          :class="{ 'kanban-drop-active': isDragOverDone }"
          @drop="onDrop($event, 'done')"
          @dragover.prevent="isDragOverDone = true"
          @dragenter.prevent="isDragOverDone = true"
          @dragleave="isDragOverDone = false"
        >
          <draggable
            v-model="doneTasks"
            group="tasks"
            item-key="id"
            :animation="300"
            :forceFallback="true"
            ghost-class="kanban-ghost"
            chosen-class="kanban-chosen"
            drag-class="kanban-drag"
            @change="handleTaskMove"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div 
                class="kanban-task-wrapper animate-slide-up"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <TaskCard 
                  :task="element" 
                  @edit="editTask"
                  @delete="deleteTask"
                  @timer="toggleTimer"
                />
              </div>
            </template>
          </draggable>
          
          <!-- 空状态 -->
          <div v-if="doneTasks.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
            <CheckCircleIcon class="w-12 h-12 mb-3 opacity-50" />
            <p class="text-sm">暂无已完成任务</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- 创建任务模态框 -->
    <div 
      v-if="showCreateTaskModal" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      @click.self="showCreateTaskModal = false"
    >
      <Card 
        variant="glass" 
        size="lg" 
        class="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        @click.stop
      >
        <template #header>
          <div class="flex items-center justify-between p-6 border-b border-slate-200/50">
            <h2 class="text-xl font-semibold text-slate-800 flex items-center">
              <PlusIcon class="w-5 h-5 mr-2 text-blue-500" />
              创建新任务
            </h2>
            <Button
              @click="showCreateTaskModal = false"
              variant="ghost"
              size="sm"
              class="text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon class="w-5 h-5" />
            </Button>
          </div>
        </template>
        
        <form @submit.prevent="createTask" class="p-6 space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700">任务标题 *</label>
            <input
              v-model="newTask.title"
              type="text"
              required
              class="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="输入任务标题"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700">所属项目 *</label>
            <div class="relative">
              <select 
                v-model="newTask.project_id" 
                required 
                class="w-full appearance-none px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">选择项目</option>
                <option 
                  v-for="project in projectStore.projects" 
                  :key="project.id" 
                  :value="project.id"
                >
                  {{ project.name }}
                </option>
              </select>
              <ChevronDownIcon class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700">任务描述</label>
            <textarea
              v-model="newTask.description"
              rows="3"
              class="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="输入任务描述（可选）"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700">优先级</label>
              <div class="relative">
                <select 
                  v-model="newTask.priority" 
                  class="w-full appearance-none px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
                <ChevronDownIcon class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700">负责人</label>
              <input
                v-model="newTask.assignee"
                type="text"
                class="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="输入负责人"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <Button
              type="button"
              @click="showCreateTaskModal = false"
              variant="outlined"
              size="md"
              class="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              :disabled="taskStore.loading"
              variant="primary"
              size="md"
              class="flex-1"
            >
              <span v-if="!taskStore.loading" class="flex items-center">
                <PlusIcon class="w-4 h-4 mr-2" />
                创建任务
              </span>
              <span v-else class="flex items-center">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
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
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useUIStore } from '@/stores/ui'
import draggable from 'vuedraggable'
import TaskCard from '@/components/TaskCard.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { Task } from '@/types'
import {
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  XMarkIcon,
  CursorArrowRaysIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()

// 状态
const selectedProjectId = ref('')
const showCreateTaskModal = ref(false)
const isDragOverTodo = ref(false)
const isDragOverInProgress = ref(false)
const isDragOverDone = ref(false)
const isDragging = ref(false)

// 新任务数据
const newTask = reactive({
  title: '',
  description: '',
  project_id: '',
  priority: 'medium',
  assignee: ''
})

// 计算属性
const todoTasks = computed({
  get: () => taskStore.tasksByStatus.todo,
  set: (value) => {
    // 这里需要更新store中的任务状态
    updateTaskStatuses(value, 'todo')
  }
})

const inProgressTasks = computed({
  get: () => taskStore.tasksByStatus.in_progress,
  set: (value) => {
    updateTaskStatuses(value, 'in_progress')
  }
})

const doneTasks = computed({
  get: () => taskStore.tasksByStatus.done,
  set: (value) => {
    updateTaskStatuses(value, 'done')
  }
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
})

// 方法
const loadTasks = async () => {
  if (selectedProjectId.value) {
    await taskStore.fetchTasks(parseInt(selectedProjectId.value))
  } else {
    await taskStore.fetchTasks()
  }
}

const onProjectChange = () => {
  loadTasks()
}

const onDrop = (event: DragEvent, newStatus: string) => {
  event.preventDefault()
  isDragOverTodo.value = false
  isDragOverInProgress.value = false
  isDragOverDone.value = false
  // 拖拽逻辑由vuedraggable处理
}

const onDragStart = () => {
  isDragging.value = true
}

const onDragEnd = () => {
  isDragging.value = false
  isDragOverTodo.value = false
  isDragOverInProgress.value = false
  isDragOverDone.value = false
}

const handleTaskMove = async (event: any) => {
  if (event.added) {
    const task = event.added.element
    const newStatus = getStatusFromContainer(event.added.element)
    
    if (task.status !== newStatus) {
      await taskStore.updateTaskStatus(task.id, newStatus as Task['status'])
    }
  }
}

const getStatusFromContainer = (task: Task) => {
  if (todoTasks.value.includes(task)) return 'todo'
  if (inProgressTasks.value.includes(task)) return 'in_progress'
  if (doneTasks.value.includes(task)) return 'done'
  return 'todo'
}

const updateTaskStatuses = (tasks: Task[], status: string) => {
  // 更新store中的任务状态
  tasks.forEach(task => {
    if (task.status !== status) {
      taskStore.updateTaskStatus(task.id, status as Task['status'])
    }
  })
}

const createTask = async () => {
  if (!newTask.title || !newTask.project_id) {
    uiStore.addNotification('请填写必填项', 'error')
    return
  }

  const task = await taskStore.createTask({
    project_id: parseInt(newTask.project_id),
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
  // 实现编辑任务功能
  uiStore.addNotification('编辑功能开发中...', 'info')
}

const deleteTask = async (task: Task) => {
  if (confirm(`确定要删除任务 "${task.title}" 吗？`)) {
    await taskStore.deleteTask(task.id)
  }
}

const toggleTimer = async (task: Task) => {
  if (task.is_timer_running) {
    await taskStore.stopTimer(task.id)
  } else {
    await taskStore.startTimer(task.id)
  }
}

const toggleViewMode = () => {
  uiStore.setViewMode('gantt')
  router.push('/gantt')
}

const resetForm = () => {
  newTask.title = ''
  newTask.description = ''
  newTask.project_id = ''
  newTask.priority = 'medium'
  newTask.assignee = ''
}
</script>

<style scoped>
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

/* 看板列样式 */
.kanban-column {
  transition: all 0.3s ease;
}

.kanban-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 拖拽区域样式 */
.kanban-drop-zone {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.kanban-drop-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border: 2px dashed rgba(59, 130, 246, 0.3);
  transform: scale(1.02);
}

/* 任务卡片包装器 */
.kanban-task-wrapper {
  transition: all 0.3s ease;
}

.kanban-task-wrapper:hover {
  transform: translateY(-1px);
}

/* 拖拽状态样式 */
.kanban-ghost {
  opacity: 0.5;
  transform: rotate(5deg);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border: 2px dashed rgba(59, 130, 246, 0.5);
}

.kanban-chosen {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.kanban-drag {
  transform: rotate(5deg);
  opacity: 0.8;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .kanban-column {
    min-height: 500px;
  }
}

@media (max-width: 768px) {
  .kanban-column {
    min-height: 400px;
  }
  
  .kanban-drop-zone {
    padding: 1rem;
  }
}

/* 滚动条样式 */
.kanban-drop-zone::-webkit-scrollbar {
  width: 6px;
}

.kanban-drop-zone::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.kanban-drop-zone::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.kanban-drop-zone::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>