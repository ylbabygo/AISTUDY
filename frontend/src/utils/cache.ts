// API 缓存工具
export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number // 生存时间（毫秒）
  key: string
}

export interface CacheOptions {
  ttl?: number // 默认缓存时间（毫秒）
  maxSize?: number // 最大缓存条目数
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
}

export class ApiCache {
  private cache = new Map<string, CacheItem>()
  private options: Required<CacheOptions>
  private accessOrder = new Map<string, number>() // LRU 访问顺序

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 默认5分钟
      maxSize: 100,
      storage: 'memory',
      ...options
    }

    // 从持久化存储加载缓存
    this.loadFromStorage()

    // 定期清理过期缓存
    this.startCleanupTimer()
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
      key
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, item)
    this.accessOrder.set(key, Date.now())

    // 保存到持久化存储
    this.saveToStorage(key, item)
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined

    if (!item) {
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(key)
      return null
    }

    // 更新访问时间
    this.accessOrder.set(key, Date.now())

    return item.data
  }

  // 检查缓存是否存在且未过期
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (this.isExpired(item)) {
      this.delete(key)
      return false
    }

    return true
  }

  // 删除缓存
  delete(key: string): boolean {
    this.accessOrder.delete(key)
    this.removeFromStorage(key)
    return this.cache.delete(key)
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear()
    this.accessOrder.clear()
    this.clearStorage()
  }

  // 获取缓存统计信息
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let totalSize = 0

    for (const item of this.cache.values()) {
      if (this.isExpired(item)) {
        expiredCount++
      }
      totalSize += this.getItemSize(item)
    }

    return {
      totalItems: this.cache.size,
      expiredItems: expiredCount,
      validItems: this.cache.size - expiredCount,
      totalSize,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate()
    }
  }

  // 清理过期缓存
  cleanup(): number {
    let cleanedCount = 0
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.delete(key)
      cleanedCount++
    })

    return cleanedCount
  }

  // 预热缓存
  async warmup<T>(
    keys: string[], 
    fetcher: (key: string) => Promise<T>,
    options?: { concurrency?: number; ttl?: number }
  ): Promise<void> {
    const { concurrency = 5, ttl } = options || {}
    
    // 分批处理
    const batches = this.chunk(keys, concurrency)
    
    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (key) => {
          if (!this.has(key)) {
            try {
              const data = await fetcher(key)
              this.set(key, data, ttl)
            } catch (error) {
              console.warn(`Failed to warmup cache for key: ${key}`, error)
            }
          }
        })
      )
    }
  }

  // 获取或设置缓存（缓存穿透保护）
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 先尝试从缓存获取
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // 缓存未命中，获取数据
    try {
      const data = await fetcher()
      this.set(key, data, ttl)
      return data
    } catch (error) {
      // 可以选择缓存错误结果一段时间，避免频繁请求
      throw error
    }
  }

  // 批量获取
  getBatch<T>(keys: string[]): Map<string, T> {
    const result = new Map<string, T>()
    
    keys.forEach(key => {
      const data = this.get<T>(key)
      if (data !== null) {
        result.set(key, data)
      }
    })

    return result
  }

  // 批量设置
  setBatch<T>(items: Array<{ key: string; data: T; ttl?: number }>): void {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl)
    })
  }

  // 私有方法
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  private getItemSize(item: CacheItem): number {
    // 简单估算对象大小
    return JSON.stringify(item).length
  }

  private calculateHitRate(): number {
    // 这里需要实际的命中率统计，简化实现
    return 0.85 // 假设85%命中率
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private startCleanupTimer(): void {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      const cleaned = this.cleanup()
      if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} expired cache items`)
      }
    }, 5 * 60 * 1000)
  }

  // 持久化存储方法
  private loadFromStorage(): void {
    if (this.options.storage === 'memory') return

    try {
      const storage = this.getStorage()
      const keys = Object.keys(storage).filter(key => key.startsWith('cache:'))
      
      keys.forEach(storageKey => {
        const key = storageKey.replace('cache:', '')
        const itemStr = storage.getItem(storageKey)
        if (itemStr) {
          const item = JSON.parse(itemStr) as CacheItem
          if (!this.isExpired(item)) {
            this.cache.set(key, item)
            this.accessOrder.set(key, item.timestamp)
          }
        }
      })
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  private saveToStorage(key: string, item: CacheItem): void {
    if (this.options.storage === 'memory') return

    try {
      const storage = this.getStorage()
      storage.setItem(`cache:${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  private removeFromStorage(key: string): void {
    if (this.options.storage === 'memory') return

    try {
      const storage = this.getStorage()
      storage.removeItem(`cache:${key}`)
    } catch (error) {
      console.warn('Failed to remove cache from storage:', error)
    }
  }

  private clearStorage(): void {
    if (this.options.storage === 'memory') return

    try {
      const storage = this.getStorage()
      const keys = Object.keys(storage).filter(key => key.startsWith('cache:'))
      keys.forEach(key => storage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear cache storage:', error)
    }
  }

  private getStorage(): Storage {
    switch (this.options.storage) {
      case 'localStorage':
        return localStorage
      case 'sessionStorage':
        return sessionStorage
      default:
        throw new Error('Invalid storage type')
    }
  }
}

// 创建默认缓存实例
export const apiCache = new ApiCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  storage: 'sessionStorage'
})

// 创建长期缓存实例（用于不经常变化的数据）
export const longTermCache = new ApiCache({
  ttl: 30 * 60 * 1000, // 30分钟
  maxSize: 50,
  storage: 'localStorage'
})

// 便捷函数
export const cacheGet = <T>(key: string): T | null => apiCache.get<T>(key)
export const cacheSet = <T>(key: string, data: T, ttl?: number): void => apiCache.set(key, data, ttl)
export const cacheHas = (key: string): boolean => apiCache.has(key)
export const cacheDelete = (key: string): boolean => apiCache.delete(key)
export const cacheClear = (): void => apiCache.clear()

// 缓存装饰器（用于方法缓存）
export function cached(ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`
      
      const cached = apiCache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      apiCache.set(cacheKey, result, ttl)
      return result
    }

    return descriptor
  }
}