// 性能监控工具
export interface PerformanceMetrics {
  // 页面加载性能
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  
  // 资源性能
  resourceCount: number
  totalResourceSize: number
  
  // 内存使用
  usedJSHeapSize?: number
  totalJSHeapSize?: number
  jsHeapSizeLimit?: number
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  
  constructor() {
    this.initializeMonitoring()
  }
  
  private initializeMonitoring() {
    // 监听页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.collectLoadMetrics()
      })
    } else {
      this.collectLoadMetrics()
    }
    
    // 监听页面完全加载
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectPerformanceMetrics()
      }, 0)
    })
  }
  
  private collectLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    }
  }
  
  private collectPerformanceMetrics() {
    // 收集 Web Vitals
    this.collectWebVitals()
    
    // 收集资源性能
    this.collectResourceMetrics()
    
    // 收集内存使用情况
    this.collectMemoryMetrics()
  }
  
  private collectWebVitals() {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcpEntry) {
      this.metrics.firstContentfulPaint = fcpEntry.startTime
    }
    
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        
        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.metrics.firstInputDelay = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        
        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          this.metrics.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error)
      }
    }
  }
  
  private collectResourceMetrics() {
    const resources = performance.getEntriesByType('resource')
    this.metrics.resourceCount = resources.length
    
    let totalSize = 0
    resources.forEach((resource: any) => {
      if (resource.transferSize) {
        totalSize += resource.transferSize
      }
    })
    this.metrics.totalResourceSize = totalSize
  }
  
  private collectMemoryMetrics() {
    // @ts-ignore - performance.memory 可能不存在
    if (performance.memory) {
      // @ts-ignore
      const memory = performance.memory
      this.metrics.usedJSHeapSize = memory.usedJSHeapSize
      this.metrics.totalJSHeapSize = memory.totalJSHeapSize
      this.metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit
    }
  }
  
  // 获取性能指标
  getMetrics(): PerformanceMetrics {
    return this.metrics as PerformanceMetrics
  }
  
  // 格式化性能报告
  getFormattedReport(): string {
    const metrics = this.getMetrics()
    
    return `
性能监控报告
====================
页面加载时间: ${metrics.loadTime?.toFixed(2) || 'N/A'} ms
DOM内容加载: ${metrics.domContentLoaded?.toFixed(2) || 'N/A'} ms
首次内容绘制: ${metrics.firstContentfulPaint?.toFixed(2) || 'N/A'} ms
最大内容绘制: ${metrics.largestContentfulPaint?.toFixed(2) || 'N/A'} ms
首次输入延迟: ${metrics.firstInputDelay?.toFixed(2) || 'N/A'} ms
累积布局偏移: ${metrics.cumulativeLayoutShift?.toFixed(4) || 'N/A'}

资源统计
====================
资源数量: ${metrics.resourceCount || 0}
总传输大小: ${this.formatBytes(metrics.totalResourceSize || 0)}

内存使用
====================
已用堆内存: ${this.formatBytes(metrics.usedJSHeapSize || 0)}
总堆内存: ${this.formatBytes(metrics.totalJSHeapSize || 0)}
堆内存限制: ${this.formatBytes(metrics.jsHeapSizeLimit || 0)}
    `.trim()
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // 记录性能日志
  logMetrics() {
    console.group('🚀 性能监控报告')
    console.log(this.getFormattedReport())
    console.groupEnd()
  }
  
  // 检查性能是否良好
  isPerformanceGood(): boolean {
    const metrics = this.getMetrics()
    
    // Web Vitals 阈值
    const goodFCP = 1800 // 1.8s
    const goodLCP = 2500 // 2.5s
    const goodFID = 100  // 100ms
    const goodCLS = 0.1  // 0.1
    
    return (
      (metrics.firstContentfulPaint || 0) <= goodFCP &&
      (metrics.largestContentfulPaint || 0) <= goodLCP &&
      (metrics.firstInputDelay || 0) <= goodFID &&
      (metrics.cumulativeLayoutShift || 0) <= goodCLS
    )
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 导出便捷函数
export const logPerformance = () => performanceMonitor.logMetrics()
export const getPerformanceMetrics = () => performanceMonitor.getMetrics()
export const isPerformanceGood = () => performanceMonitor.isPerformanceGood()