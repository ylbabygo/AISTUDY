import { apiCache, longTermCache } from './cache'
import { performanceMonitor } from './performance'

// API 请求配置
export interface ApiConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: boolean
  cacheTTL?: number
  longTermCache?: boolean
}

// 请求选项
export interface RequestOptions extends ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  signal?: AbortSignal
}

// 响应类型
export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
  fromCache?: boolean
}

// 错误类型
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 请求拦截器类型
export type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>

class ApiClient {
  private config: Required<ApiConfig>
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []
  private pendingRequests = new Map<string, Promise<any>>()

  constructor(config: ApiConfig = {}) {
    this.config = {
      baseURL: '/api',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5分钟
      longTermCache: false,
      ...config
    }
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  // 添加错误拦截器
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  // 通用请求方法
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const startTime = performance.now()
    
    try {
      // 合并配置
      const config = { ...this.config, ...options }
      const fullUrl = this.buildUrl(url, config.baseURL!)
      
      // 应用请求拦截器
      let requestConfig = { ...config, url: fullUrl }
      for (const interceptor of this.requestInterceptors) {
        requestConfig = await interceptor(requestConfig)
      }

      // 生成缓存键
      const cacheKey = this.generateCacheKey(fullUrl, requestConfig)
      
      // 检查缓存（仅对GET请求）
      if (requestConfig.method === 'GET' && requestConfig.cache) {
        const cache = requestConfig.longTermCache ? longTermCache : apiCache
        const cached = cache.get<ApiResponse<T>>(cacheKey)
        if (cached) {
          performanceMonitor.recordApiCall(fullUrl, performance.now() - startTime, true)
          return { ...cached, fromCache: true }
        }
      }

      // 检查是否有相同的请求正在进行（防止重复请求）
      if (this.pendingRequests.has(cacheKey)) {
        const result = await this.pendingRequests.get(cacheKey)
        return result
      }

      // 创建请求Promise
      const requestPromise = this.executeRequest<T>(fullUrl, requestConfig, startTime)
      
      // 缓存正在进行的请求
      if (requestConfig.method === 'GET') {
        this.pendingRequests.set(cacheKey, requestPromise)
      }

      try {
        const response = await requestPromise
        
        // 缓存响应（仅对GET请求）
        if (requestConfig.method === 'GET' && requestConfig.cache && response.status === 200) {
          const cache = requestConfig.longTermCache ? longTermCache : apiCache
          cache.set(cacheKey, response, requestConfig.cacheTTL)
        }

        return response
      } finally {
        // 清理正在进行的请求
        this.pendingRequests.delete(cacheKey)
      }

    } catch (error) {
      performanceMonitor.recordApiCall(url, performance.now() - startTime, false)
      
      // 应用错误拦截器
      let apiError = error instanceof ApiError ? error : new ApiError(error.message)
      for (const interceptor of this.errorInterceptors) {
        apiError = await interceptor(apiError)
      }
      
      throw apiError
    }
  }

  // 执行实际请求
  private async executeRequest<T>(
    url: string, 
    config: RequestOptions & { url: string }, 
    startTime: number
  ): Promise<ApiResponse<T>> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= config.retries!; attempt++) {
      try {
        // 创建AbortController用于超时控制
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), config.timeout)
        
        // 合并signal
        const signal = config.signal 
          ? this.combineSignals(config.signal, controller.signal)
          : controller.signal

        // 准备请求选项
        const fetchOptions: RequestInit = {
          method: config.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers
          },
          signal
        }

        // 添加请求体
        if (config.body && config.method !== 'GET') {
          fetchOptions.body = typeof config.body === 'string' 
            ? config.body 
            : JSON.stringify(config.body)
        }

        // 发送请求
        const response = await fetch(url, fetchOptions)
        clearTimeout(timeoutId)

        // 检查响应状态
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response
          )
        }

        // 解析响应
        let data: T
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else if (contentType?.includes('text/')) {
          data = await response.text() as any
        } else {
          data = await response.blob() as any
        }

        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          fromCache: false
        }

        // 应用响应拦截器
        let finalResponse = apiResponse
        for (const interceptor of this.responseInterceptors) {
          finalResponse = await interceptor(finalResponse)
        }

        performanceMonitor.recordApiCall(url, performance.now() - startTime, true)
        return finalResponse

      } catch (error) {
        lastError = error
        
        // 如果是最后一次尝试或者是不可重试的错误，直接抛出
        if (attempt === config.retries || this.isNonRetryableError(error)) {
          throw error
        }

        // 等待后重试
        await this.delay(config.retryDelay! * Math.pow(2, attempt)) // 指数退避
      }
    }

    throw lastError!
  }

  // 便捷方法
  async get<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body: data })
  }

  async put<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body: data })
  }

  async patch<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body: data })
  }

  async delete<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  // 批量请求
  async batch<T = any>(requests: Array<{ url: string; options?: RequestOptions }>): Promise<ApiResponse<T>[]> {
    const promises = requests.map(({ url, options }) => this.request<T>(url, options))
    return Promise.all(promises)
  }

  // 并发控制的批量请求
  async batchWithLimit<T = any>(
    requests: Array<{ url: string; options?: RequestOptions }>,
    limit: number = 5
  ): Promise<ApiResponse<T>[]> {
    const results: ApiResponse<T>[] = []
    
    for (let i = 0; i < requests.length; i += limit) {
      const batch = requests.slice(i, i + limit)
      const batchResults = await this.batch<T>(batch)
      results.push(...batchResults)
    }
    
    return results
  }

  // 工具方法
  private buildUrl(url: string, baseURL: string): string {
    if (url.startsWith('http')) {
      return url
    }
    return `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }

  private generateCacheKey(url: string, config: RequestOptions): string {
    const key = `${config.method || 'GET'}:${url}`
    if (config.body) {
      const bodyHash = this.simpleHash(JSON.stringify(config.body))
      return `${key}:${bodyHash}`
    }
    return key
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(36)
  }

  private combineSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
    const controller = new AbortController()
    
    const abort = () => controller.abort()
    
    if (signal1.aborted || signal2.aborted) {
      abort()
    } else {
      signal1.addEventListener('abort', abort)
      signal2.addEventListener('abort', abort)
    }
    
    return controller.signal
  }

  private isNonRetryableError(error: any): boolean {
    if (error instanceof ApiError) {
      // 4xx错误通常不应该重试
      return error.status !== undefined && error.status >= 400 && error.status < 500
    }
    
    // AbortError 不应该重试
    return error.name === 'AbortError'
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 清理方法
  clearCache(): void {
    apiCache.clear()
    longTermCache.clear()
  }

  // 获取缓存统计
  getCacheStats() {
    return {
      shortTerm: apiCache.getStats(),
      longTerm: longTermCache.getStats()
    }
  }
}

// 创建默认API客户端实例
export const api = new ApiClient()

// 添加默认拦截器
api.addRequestInterceptor(async (config) => {
  // 添加认证token
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  return config
})

api.addResponseInterceptor(async (response) => {
  // 可以在这里处理通用的响应逻辑
  return response
})

api.addErrorInterceptor(async (error) => {
  // 处理401错误（未授权）
  if (error.status === 401) {
    // 清除token并重定向到登录页
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
  }
  
  return error
})

// 导出便捷函数
export const { get, post, put, patch, delete: del } = api
export type { ApiResponse, RequestOptions }