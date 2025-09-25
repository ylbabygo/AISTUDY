/**
 * 浏览器兼容性检测工具
 */

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  platform: string
  mobile: boolean
  supported: boolean
}

export interface FeatureSupport {
  cssGrid: boolean
  cssVariables: boolean
  flexbox: boolean
  intersectionObserver: boolean
  webAnimations: boolean
  es6: boolean
  localStorage: boolean
  sessionStorage: boolean
  fetch: boolean
  promises: boolean
}

/**
 * 检测浏览器信息
 */
export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent
  const platform = navigator.platform
  const mobile = /Mobile|Android|iPhone|iPad/.test(ua)

  let name = 'Unknown'
  let version = 'Unknown'
  let engine = 'Unknown'
  let supported = true

  // Chrome
  if (ua.includes('Chrome') && !ua.includes('Edge')) {
    name = 'Chrome'
    const match = ua.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Blink'
    supported = parseInt(version) >= 90
  }
  // Firefox
  else if (ua.includes('Firefox')) {
    name = 'Firefox'
    const match = ua.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Gecko'
    supported = parseInt(version) >= 88
  }
  // Safari
  else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    name = 'Safari'
    const match = ua.match(/Version\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'WebKit'
    supported = parseInt(version) >= 14
  }
  // Edge
  else if (ua.includes('Edge') || ua.includes('Edg/')) {
    name = 'Edge'
    const match = ua.match(/Edg?\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Blink'
    supported = parseInt(version) >= 90
  }
  // Internet Explorer
  else if (ua.includes('MSIE') || ua.includes('Trident')) {
    name = 'Internet Explorer'
    const match = ua.match(/(?:MSIE |rv:)(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Trident'
    supported = false // IE 不支持
  }

  return {
    name,
    version,
    engine,
    platform,
    mobile,
    supported
  }
}

/**
 * 检测功能支持
 */
export function detectFeatureSupport(): FeatureSupport {
  // 安全检查 CSS.supports
  const supportsCSS = (property: string, value: string) => {
    try {
      return 'CSS' in window && 'supports' in CSS && CSS.supports(property, value)
    } catch {
      return false
    }
  }

  return {
    // CSS Grid 支持
    cssGrid: supportsCSS('display', 'grid'),
    
    // CSS 变量支持
    cssVariables: supportsCSS('--test', 'value'),
    
    // Flexbox 支持
    flexbox: supportsCSS('display', 'flex'),
    
    // Intersection Observer API
    intersectionObserver: 'IntersectionObserver' in window,
    
    // Web Animations API
    webAnimations: 'animate' in document.createElement('div'),
    
    // ES6 支持 (箭头函数)
    es6: (() => {
      try {
        eval('() => {}')
        return true
      } catch {
        return false
      }
    })(),
    
    // Local Storage
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
        return true
      } catch {
        return false
      }
    })(),
    
    // Session Storage
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('test', 'test')
        sessionStorage.removeItem('test')
        return true
      } catch {
        return false
      }
    })(),
    
    // Fetch API
    fetch: 'fetch' in window,
    
    // Promises
    promises: 'Promise' in window
  }
}

/**
 * 运行兼容性测试
 */
export function runCompatibilityTest(): {
  browser: BrowserInfo
  features: FeatureSupport
  warnings: string[]
  errors: string[]
} {
  const browser = detectBrowser()
  const features = detectFeatureSupport()
  const warnings: string[] = []
  const errors: string[] = []

  // 检查浏览器支持
  if (!browser.supported) {
    errors.push(`不支持的浏览器: ${browser.name} ${browser.version}`)
    errors.push('建议升级到现代浏览器以获得最佳体验')
  }

  // 检查关键功能
  if (!features.cssGrid) {
    errors.push('不支持 CSS Grid，布局可能异常')
  }

  if (!features.cssVariables) {
    warnings.push('不支持 CSS 变量，主题切换可能不工作')
  }

  if (!features.flexbox) {
    errors.push('不支持 Flexbox，布局将严重异常')
  }

  if (!features.intersectionObserver) {
    warnings.push('不支持 Intersection Observer，滚动动画可能不工作')
  }

  if (!features.webAnimations) {
    warnings.push('不支持 Web Animations API，某些动画可能不流畅')
  }

  if (!features.es6) {
    errors.push('不支持 ES6 语法，应用无法正常运行')
  }

  if (!features.localStorage) {
    warnings.push('不支持 Local Storage，设置无法保存')
  }

  if (!features.fetch) {
    warnings.push('不支持 Fetch API，网络请求可能失败')
  }

  if (!features.promises) {
    errors.push('不支持 Promises，异步操作将失败')
  }

  return {
    browser,
    features,
    warnings,
    errors
  }
}

/**
 * 显示兼容性警告
 */
export function showCompatibilityWarning(result: ReturnType<typeof runCompatibilityTest>) {
  if (result.errors.length > 0) {
    console.error('浏览器兼容性错误:', result.errors)
    
    // 创建错误提示
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc2626;
      color: white;
      padding: 16px;
      text-align: center;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    `
    errorDiv.innerHTML = `
      <strong>浏览器兼容性问题</strong><br>
      ${result.errors.join('<br>')}
    `
    document.body.appendChild(errorDiv)
  }

  if (result.warnings.length > 0) {
    console.warn('浏览器兼容性警告:', result.warnings)
  }

  // 记录浏览器信息
  console.info('浏览器信息:', result.browser)
  console.info('功能支持:', result.features)
}

/**
 * 初始化兼容性检测
 */
export function initCompatibilityCheck() {
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const result = runCompatibilityTest()
      showCompatibilityWarning(result)
    })
  } else {
    const result = runCompatibilityTest()
    showCompatibilityWarning(result)
  }
}

/**
 * 获取性能信息
 */
export function getPerformanceInfo() {
  if ('performance' in window && 'timing' in performance) {
    const timing = performance.timing
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
    }
  }
  return null
}

/**
 * 测试响应式断点
 */
export function testResponsiveBreakpoints() {
  const breakpoints = {
    mobile: 640,
    tablet: 1024,
    desktop: 1280
  }

  const width = window.innerWidth
  let currentBreakpoint = 'mobile'

  if (width >= breakpoints.desktop) {
    currentBreakpoint = 'desktop'
  } else if (width >= breakpoints.tablet) {
    currentBreakpoint = 'tablet'
  }

  return {
    width,
    height: window.innerHeight,
    currentBreakpoint,
    breakpoints,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  }
}