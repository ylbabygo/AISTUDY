import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, ApiResponse, TimeLog } from '@/types'
import { taskAPI } from '@/services/api'
import { useUIStore } from './ui'

export const useTaskStore = defineStore('task', () => {
  const uiStore = useUIStore()
  
  // 状态
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const timeLogs = ref<TimeLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性 - 按状态分组任务
  const tasksByStatus = computed(() => ({
    todo: tasks.value.filter(task => task.status === 'todo'),
    in_progress: tasks.value.filter(task => task.status === 'in_progress'),
    done: tasks.value.filter(task => task.status === 'done')
  }))

  // 计算属性 - 按项目分组任务
  const tasksByProject = computed(() => {
    const grouped: Record<number, Task[]> = {}
    tasks.value.forEach(task => {
      if (!grouped[task.project_id]) {
        grouped[task.project_id] = []
      }
      grouped[task.project_id].push(task)
    })
    return grouped
  })

  // 计算属性 - 当前任务的计时状态
  const currentTaskTimer = computed(() => {
    if (!currentTask.value) return null
    return timeLogs.value.find(log => log.task_id === currentTask.value!.id && !log.end_time) || null
  })

  // 方法 - 获取任务列表
  const fetchTasks = async (projectId?: number) => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await taskAPI.getTasks(projectId)
      if (response.success) {
        tasks.value = response.data || []
        error.value = null
      } else {
        error.value = response.message || '获取任务列表失败'
        uiStore.addNotification(error.value, 'error')
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('获取任务列表失败:', err)
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  // 方法 - 获取单个任务
  const getTask = async (id: number) => {
    try {
      loading.value = true
      const response = await taskAPI.getTask(id)
      
      if (response.success) {
        currentTask.value = response.data || null
        error.value = null
        return response.data
      } else {
        error.value = response.message || '获取任务详情失败'
        uiStore.addNotification(error.value, 'error')
        return null
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('获取任务详情失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 方法 - 创建任务
  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await taskAPI.createTask(taskData)
      
      if (response.success) {
        if (response.data) {
          tasks.value.push(response.data)
        }
        error.value = null
        uiStore.addNotification('任务创建成功', 'success')
        return response.data
      } else {
        error.value = response.message || '创建任务失败'
        uiStore.addNotification(error.value, 'error')
        return null
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('创建任务失败:', err)
      return null
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  // 方法 - 更新任务
  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await taskAPI.updateTask(id, taskData)
      
      if (response.success) {
        const index = tasks.value.findIndex(t => t.id === id)
        if (index !== -1 && response.data) {
          tasks.value[index] = response.data
        }
        
        if (currentTask.value?.id === id && response.data) {
          currentTask.value = response.data
        }
        
        error.value = null
        uiStore.addNotification('任务更新成功', 'success')
        return response.data
      } else {
        error.value = response.message || '更新任务失败'
        uiStore.addNotification(error.value, 'error')
        return null
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('更新任务失败:', err)
      return null
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  // 方法 - 删除任务
  const deleteTask = async (id: number) => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await taskAPI.deleteTask(id)
      
      if (response.success) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        
        if (currentTask.value?.id === id) {
          currentTask.value = null
        }
        
        error.value = null
        uiStore.addNotification('任务删除成功', 'success')
        return true
      } else {
        error.value = response.message || '删除任务失败'
        uiStore.addNotification(error.value, 'error')
        return false
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('删除任务失败:', err)
      return false
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  // 方法 - 更新任务状态（拖拽用）
  const updateTaskStatus = async (taskId: number, newStatus: Task['status']) => {
    return await updateTask(taskId, { status: newStatus })
  }

  // 方法 - 开始计时
  const startTimer = async (taskId: number) => {
    try {
      const response = await taskAPI.startTimer(taskId)
      if (response.success) {
        if (response.data) {
          timeLogs.value.push(response.data)
        }
        uiStore.addNotification('计时器已启动', 'success')
        return true
      } else {
        uiStore.addNotification(response.message || '启动计时器失败', 'error')
        return false
      }
    } catch (err) {
      uiStore.addNotification('网络错误，请稍后重试', 'error')
      console.error('启动计时器失败:', err)
      return false
    }
  }

  // 方法 - 停止计时
  const stopTimer = async (taskId: number) => {
    try {
      const response = await taskAPI.stopTimer(taskId)
      if (response.success) {
        // 更新对应的时间日志
        const logIndex = timeLogs.value.findIndex(log => 
          log.task_id === taskId && !log.end_time
        )
        if (logIndex !== -1 && response.data) {
          timeLogs.value[logIndex] = response.data
        }
        uiStore.addNotification('计时器已停止', 'success')
        return true
      } else {
        uiStore.addNotification(response.message || '停止计时器失败', 'error')
        return false
      }
    } catch (err) {
      uiStore.addNotification('网络错误，请稍后重试', 'error')
      console.error('停止计时器失败:', err)
      return false
    }
  }

  // 方法 - 获取任务的时间日志
  const fetchTimeLogs = async (taskId: number) => {
    try {
      const response = await taskAPI.getTimeLogs(taskId)
      if (response.success) {
        timeLogs.value = response.data || []
      }
    } catch (err) {
      console.error('获取时间日志失败:', err)
    }
  }

  const setCurrentTask = (task: Task | null) => {
    currentTask.value = task
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    tasks,
    currentTask,
    timeLogs,
    loading,
    error,
    
    // 计算属性
    tasksByStatus,
    tasksByProject,
    currentTaskTimer,
    
    // 方法
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    startTimer,
    stopTimer,
    fetchTimeLogs,
    setCurrentTask,
    clearError
  }
})