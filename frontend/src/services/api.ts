import { api, ApiError, type ApiResponse as OptimizedApiResponse } from '@/utils/api'
import type { 
  Project, 
  Task, 
  Document, 
  TimeLog, 
  ApiResponse, 
  UploadResponse 
} from '@/types'

// 配置API客户端
api.addRequestInterceptor(async (config) => {
  // 添加认证token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  return config
})

api.addErrorInterceptor(async (error) => {
  if (error.status === 401) {
    // 处理未授权访问
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  return error
})

// 辅助函数：转换响应格式
function transformResponse<T>(response: OptimizedApiResponse<ApiResponse<T>>): ApiResponse<T> {
  return response.data
}

// 辅助函数：处理错误
function handleError(error: any): ApiResponse<any> {
  const message = error instanceof ApiError 
    ? error.message 
    : error.message || '网络错误'
  
  return {
    success: false,
    error: message
  }
}

/******************************************
 * 项目相关API
 ******************************************/
export const projectAPI = {
  // 获取项目列表（启用长期缓存）
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await api.get('/projects', {
        cache: true,
        longTermCache: true,
        cacheTTL: 10 * 60 * 1000 // 10分钟缓存
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 获取单个项目（启用缓存）
  getProject: async (id: number): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.get(`/projects/${id}`, {
        cache: true,
        cacheTTL: 5 * 60 * 1000 // 5分钟缓存
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 创建项目（清除相关缓存）
  createProject: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.post('/projects', projectData, {
        cache: false
      })
      
      // 清除项目列表缓存
      api.clearCache()
      
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 更新项目（清除相关缓存）
  updateProject: async (id: number, projectData: Partial<Project>): Promise<ApiResponse<Project>> => {
    try {
      const response = await api.put(`/projects/${id}`, projectData, {
        cache: false
      })
      
      // 清除相关缓存
      api.clearCache()
      
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 删除项目（清除相关缓存）
  deleteProject: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/projects/${id}`, {
        cache: false
      })
      
      // 清除相关缓存
      api.clearCache()
      
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  }
}

/******************************************
 * 任务相关API
 ******************************************/
export const taskAPI = {
  // 获取任务列表（启用缓存）
  getTasks: async (projectId?: number): Promise<ApiResponse<Task[]>> => {
    try {
      const url = projectId ? `/tasks?project_id=${projectId}` : '/tasks'
      const response = await api.get(url, {
        cache: true,
        cacheTTL: 3 * 60 * 1000 // 3分钟缓存（任务变化较频繁）
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 获取单个任务（启用缓存）
  getTask: async (id: number): Promise<ApiResponse<Task>> => {
    try {
      const response = await api.get(`/tasks/${id}`, {
        cache: true,
        cacheTTL: 2 * 60 * 1000 // 2分钟缓存
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 创建任务（清除相关缓存）
  createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Task>> => {
    try {
      const response = await api.post('/tasks', taskData, {
        cache: false
      })
      
      // 清除任务列表缓存
      api.clearCache()
      
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 更新任务（清除相关缓存）
  updateTask: async (id: number, taskData: Partial<Task>): Promise<ApiResponse<Task>> => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData, {
        cache: false
      })
      
      // 清除相关缓存
      api.clearCache()
      
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 删除任务（清除相关缓存）
  deleteTask: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/tasks/${id}`, {
        cache: false
      })
      
      // 清除相关缓存
      api.clearCache()
      
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 开始计时（不缓存）
  startTimer: async (taskId: number): Promise<ApiResponse<TimeLog>> => {
    try {
      const response = await api.post(`/tasks/${taskId}/timer`, { action: 'start' }, {
        cache: false
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 停止计时（不缓存）
  stopTimer: async (taskId: number): Promise<ApiResponse<TimeLog>> => {
    try {
      const response = await api.post(`/tasks/${taskId}/timer`, { action: 'stop' }, {
        cache: false
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 获取时间日志（启用缓存）
  getTimeLogs: async (taskId: number): Promise<ApiResponse<TimeLog[]>> => {
    try {
      const response = await api.get(`/tasks/${taskId}/time-logs`, {
        cache: true,
        cacheTTL: 1 * 60 * 1000 // 1分钟缓存
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  }
}

/******************************************
 * 文档相关API
 ******************************************/
export const documentAPI = {
  // 上传文档（不缓存）
  uploadDocument: async (taskId: number, file: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // 使用原生fetch进行文件上传，因为我们的API工具主要针对JSON
      const response = await fetch(`/api/tasks/${taskId}/documents`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // 清除相关缓存
      api.clearCache()
      
      return data
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '上传文档失败'
      }
    }
  },

  // 获取任务文档列表（启用缓存）
  getTaskDocuments: async (taskId: number): Promise<ApiResponse<Document[]>> => {
    try {
      const response = await api.get(`/tasks/${taskId}/documents`, {
        cache: true,
        cacheTTL: 5 * 60 * 1000 // 5分钟缓存
      })
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  },

  // 删除文档（清除相关缓存）
  deleteDocument: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/documents/${id}`, {
        cache: false
      })
      
      // 清除相关缓存
      api.clearCache()
      
      return transformResponse(response)
    } catch (error) {
      return handleError(error)
    }
  }
}

// 导出API实例和缓存统计
export { api }
export const getCacheStats = () => api.getCacheStats()
export const clearApiCache = () => api.clearCache()