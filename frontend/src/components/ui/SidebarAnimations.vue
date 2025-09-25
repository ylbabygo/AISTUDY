<template>
  <div class="sidebar-animations">
    <!-- 浮动粒子 -->
    <div class="floating-particles" ref="particlesContainer">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="particle.style"
      ></div>
    </div>

    <!-- 背景光晕 -->
    <div class="background-glows">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="glow glow-3"></div>
    </div>

    <!-- 动态网格 -->
    <div class="dynamic-grid">
      <svg class="grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <!-- 流动线条 -->
    <div class="flowing-lines">
      <svg class="lines-svg" viewBox="0 0 200 200" preserveAspectRatio="none">
        <path 
          d="M0,50 Q50,10 100,50 T200,50" 
          fill="none" 
          stroke="rgba(99, 102, 241, 0.3)" 
          stroke-width="2"
          class="flowing-line line-1"
        />
        <path 
          d="M0,100 Q50,60 100,100 T200,100" 
          fill="none" 
          stroke="rgba(139, 92, 246, 0.3)" 
          stroke-width="2"
          class="flowing-line line-2"
        />
        <path 
          d="M0,150 Q50,110 100,150 T200,150" 
          fill="none" 
          stroke="rgba(59, 130, 246, 0.3)" 
          stroke-width="2"
          class="flowing-line line-3"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  style: any
}

const particlesContainer = ref<HTMLElement>()
const particles = ref<Particle[]>([])
let animationFrame: number

const createParticle = (id: number): Particle => {
  const x = Math.random() * 100
  const y = Math.random() * 100
  const vx = (Math.random() - 0.5) * 0.2
  const vy = (Math.random() - 0.5) * 0.2
  const size = Math.random() * 3 + 1
  const opacity = Math.random() * 0.6 + 0.2

  return {
    id,
    x,
    y,
    vx,
    vy,
    size,
    opacity,
    style: {
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity
    }
  }
}

const updateParticles = () => {
  particles.value.forEach(particle => {
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界检测
    if (particle.x < 0 || particle.x > 100) {
      particle.vx *= -1
    }
    if (particle.y < 0 || particle.y > 100) {
      particle.vy *= -1
    }

    // 更新样式
    particle.style.left = `${particle.x}%`
    particle.style.top = `${particle.y}%`
  })

  animationFrame = requestAnimationFrame(updateParticles)
}

onMounted(() => {
  // 创建粒子
  for (let i = 0; i < 20; i++) {
    particles.value.push(createParticle(i))
  }

  // 开始动画
  updateParticles()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.sidebar-animations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  background: transparent;
}

/* 浮动粒子 */
.floating-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: float 6s ease-in-out infinite;
}

/* 背景光晕 */
.background-glows {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
  animation: glow-float 8s ease-in-out infinite;
}

.glow-1 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent);
  top: 10%;
  left: -30px;
  animation-delay: 0s;
}

.glow-2 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent);
  top: 50%;
  right: -40px;
  animation-delay: 2s;
}

.glow-3 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent);
  bottom: 20%;
  left: -20px;
  animation-delay: 4s;
}

/* 动态网格 */
.dynamic-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.5;
  animation: grid-pulse 6s ease-in-out infinite;
}

.grid-svg {
  width: 100%;
  height: 100%;
}

/* 流动线条 */
.flowing-lines {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.6;
}

.lines-svg {
  width: 100%;
  height: 100%;
}

.flowing-line {
  stroke-dasharray: 20, 10;
  animation: flow 4s linear infinite;
}

.line-1 {
  animation-delay: 0s;
}

.line-2 {
  animation-delay: 1s;
}

.line-3 {
  animation-delay: 2s;
}

/* 动画关键帧 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

@keyframes glow-float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) translateX(20px);
    opacity: 0.5;
  }
}

@keyframes grid-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

@keyframes flow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 30;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .glow {
    display: none;
  }
  
  .floating-particles {
    opacity: 0.7;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .particle,
  .glow,
  .flowing-line {
    animation: none !important;
  }
  
  .sidebar-animations {
    opacity: 0.5;
  }
}
</style>