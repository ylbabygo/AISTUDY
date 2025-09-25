import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, ApiResponse } from '@/types'
import { projectAPI } from '@/services/api'
import { useUIStore } from './ui'

export const useProjectStore = defineStore('project', () => {
  const uiStore = useUIStore()
  
  // 状态
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const projectList = computed(() => projects.value)
  const totalProjects = computed(() => projects.value.length)
  const activeProjects = computed(() => 
    projects.value.filter(p => new Date(p.end_date) >= new Date())
  )
  const completedProjects = computed(() => 
    projects.value.filter(p => new Date(p.end_date) < new Date())
  )

  // 方法
  const fetchProjects = async () => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await projectAPI.getProjects()
      if (response.success) {
        projects.value = response.data || []
        error.value = null
      } else {
        error.value = response.message || '获取项目列表失败'
        uiStore.addNotification(error.value, 'error')
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('获取项目列表失败:', err)
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  const getProject = async (id: number) => {
    try {
      loading.value = true
      const response = await projectAPI.getProject(id)
      
      if (response.success) {
        currentProject.value = response.data || null
        error.value = null
        return response.data
      } else {
        error.value = response.message || '获取项目详情失败'
        uiStore.addNotification(error.value, 'error')
        return null
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('获取项目详情失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await projectAPI.createProject(projectData)
      
      if (response.success) {
        if (response.data) {
          projects.value.push(response.data)
        }
        error.value = null
        uiStore.addNotification('项目创建成功', 'success')
        return response.data
      } else {
        error.value = response.message || '创建项目失败'
        uiStore.addNotification(error.value, 'error')
        return null
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('创建项目失败:', err)
      return null
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  const updateProject = async (id: number, projectData: Partial<Project>) => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await projectAPI.updateProject(id, projectData)
      
      if (response.success) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1 && response.data) {
          projects.value[index] = response.data
        }
        
        if (currentProject.value?.id === id && response.data) {
          currentProject.value = response.data
        }
        
        error.value = null
        uiStore.addNotification('项目更新成功', 'success')
        return response.data
      } else {
        error.value = response.message || '更新项目失败'
        uiStore.addNotification(error.value, 'error')
        return null
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('更新项目失败:', err)
      return null
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  const deleteProject = async (id: number) => {
    try {
      loading.value = true
      uiStore.setLoading(true)
      
      const response = await projectAPI.deleteProject(id)
      
      if (response.success) {
        projects.value = projects.value.filter(p => p.id !== id)
        
        if (currentProject.value?.id === id) {
          currentProject.value = null
        }
        
        error.value = null
        uiStore.addNotification('项目删除成功', 'success')
        return true
      } else {
        error.value = response.message || '删除项目失败'
        uiStore.addNotification(error.value, 'error')
        return false
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      uiStore.addNotification(error.value, 'error')
      console.error('删除项目失败:', err)
      return false
    } finally {
      loading.value = false
      uiStore.setLoading(false)
    }
  }

  const setCurrentProject = (project: Project | null) => {
    currentProject.value = project
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    projects,
    currentProject,
    loading,
    error,
    
    // 计算属性
    projectList,
    totalProjects,
    activeProjects,
    completedProjects,
    
    // 方法
    fetchProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    clearError
  }
})