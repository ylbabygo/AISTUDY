import { ref, computed, onMounted, onUnmounted } from 'vue'

// 动画配置
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800
}

export const ANIMATION_EASING = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

// 页面进入动画
export function usePageTransition() {
  const isVisible = ref(false)
  
  onMounted(() => {
    // 延迟一帧确保DOM已渲染
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  })
  
  return {
    isVisible,
    pageClass: computed(() => ({
      'animate-fade-in-up': isVisible.value,
      'opacity-0 translate-y-4': !isVisible.value
    }))
  }
}

// 滚动动画
export function useScrollAnimation(threshold = 0.1) {
  const elements = ref<Map<Element, boolean>>(new Map())
  const observer = ref<IntersectionObserver | null>(null)
  
  const observeElement = (el: Element) => {
    if (observer.value && el) {
      elements.value.set(el, false)
      observer.value.observe(el)
    }
  }
  
  const unobserveElement = (el: Element) => {
    if (observer.value && el) {
      elements.value.delete(el)
      observer.value.unobserve(el)
    }
  }
  
  onMounted(() => {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            elements.value.set(entry.target, true)
            entry.target.classList.add('animate-fade-in-up')
            entry.target.classList.remove('opacity-0', 'translate-y-8')
          }
        })
      },
      { threshold }
    )
  })
  
  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })
  
  return {
    observeElement,
    unobserveElement,
    isVisible: (el: Element) => elements.value.get(el) || false
  }
}

// 悬停动画
export function useHoverAnimation() {
  const isHovered = ref(false)
  
  const onMouseEnter = () => {
    isHovered.value = true
  }
  
  const onMouseLeave = () => {
    isHovered.value = false
  }
  
  return {
    isHovered,
    hoverEvents: {
      onMouseEnter,
      onMouseLeave
    },
    hoverClass: computed(() => ({
      'transform scale-105 shadow-lg': isHovered.value,
      'transition-all duration-300 ease-out': true
    }))
  }
}

// 点击波纹效果
export function useRippleEffect() {
  const createRipple = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `
    
    // 确保按钮有相对定位
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative'
    }
    
    button.style.overflow = 'hidden'
    button.appendChild(ripple)
    
    // 动画结束后移除元素
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 600)
  }
  
  return {
    createRipple
  }
}

// 加载动画
export function useLoadingAnimation() {
  const isLoading = ref(false)
  
  const startLoading = () => {
    isLoading.value = true
  }
  
  const stopLoading = () => {
    isLoading.value = false
  }
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    loadingClass: computed(() => ({
      'animate-pulse': isLoading.value,
      'pointer-events-none': isLoading.value
    }))
  }
}

// 弹性动画
export function useSpringAnimation() {
  const isActive = ref(false)
  
  const trigger = () => {
    isActive.value = true
    setTimeout(() => {
      isActive.value = false
    }, 300)
  }
  
  return {
    isActive,
    trigger,
    springClass: computed(() => ({
      'animate-bounce': isActive.value
    }))
  }
}

// 数字计数动画
export function useCountAnimation(target: number, duration = 1000) {
  const current = ref(0)
  const isAnimating = ref(false)
  
  const animate = () => {
    if (isAnimating.value) return
    
    isAnimating.value = true
    const start = current.value
    const startTime = Date.now()
    
    const update = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用缓动函数
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      current.value = Math.round(start + (target - start) * easeOutQuart)
      
      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        isAnimating.value = false
      }
    }
    
    requestAnimationFrame(update)
  }
  
  return {
    current,
    isAnimating,
    animate
  }
}

// 视差滚动效果
export function useParallaxEffect(speed = 0.5) {
  const transform = ref('translateY(0px)')
  
  const updateParallax = () => {
    const scrollY = window.scrollY
    transform.value = `translateY(${scrollY * speed}px)`
  }
  
  onMounted(() => {
    window.addEventListener('scroll', updateParallax, { passive: true })
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', updateParallax)
  })
  
  return {
    transform,
    parallaxStyle: computed(() => ({
      transform: transform.value
    }))
  }
}

// 导出所有动画相关的工具
export {
  usePageTransition,
  useScrollAnimation,
  useHoverAnimation,
  useRippleEffect,
  useLoadingAnimation,
  useSpringAnimation,
  useCountAnimation,
  useParallaxEffect
}