// 项目类型定义
export interface Project {
  id: number
  name: string
  description?: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

// 任务类型定义
export interface Task {
  id: number
  project_id: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  assignee?: string
  start_time?: string
  end_time?: string
  depends_on?: number
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

// 文档类型定义
export interface Document {
  id: number
  task_id: number
  filename: string
  file_type: string
  file_size: number
  upload_date: string
}

// 时间日志类型定义
export interface TimeLog {
  id: number
  task_id: number
  start_time: string
  end_time?: string
  duration: number // 分钟
  created_at: string
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 视图模式类型
export type ViewMode = 'kanban' | 'gantt'

// 任务状态类型
export type TaskStatus = 'todo' | 'in_progress' | 'done'

// 任务优先级类型
export type TaskPriority = 'low' | 'medium' | 'high'

// 计时器状态类型
export interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedTime: number
  taskId: number | null
}

// 看板列配置
export interface KanbanColumn {
  id: TaskStatus
  title: string
  color: string
}

// 甘特图任务项
export interface GanttTask {
  id: number
  name: string
  start: Date
  end: Date
  progress: number
  dependencies: string
  custom_class?: string
}

// 文件上传响应
export interface UploadResponse {
  success: boolean
  document?: Document
  message?: string
}

// 错误响应类型
export interface ErrorResponse {
  success: false
  error: string
  details?: any
}