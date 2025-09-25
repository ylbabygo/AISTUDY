<template>
  <div class="sidebar-animations">
    <!-- 粒子背景效果 -->
    <div class="particles-container" ref="particlesContainer">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="particle"
        :style="particle.style"
      ></div>
    </div>

    <!-- 光晕效果 -->
    <div class="glow-effects">
      <div class="glow-orb glow-orb-1"></div>
      <div class="glow-orb glow-orb-2"></div>
      <div class="glow-orb glow-orb-3"></div>
    </div>

    <!-- 网格背景 -->
    <div class="grid-background">
      <svg class="grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.1)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <!-- 波浪效果 -->
    <div class="wave-container">
      <svg class="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path 
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
          opacity=".25" 
          class="wave-path wave-path-1"
        ></path>
        <path 
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
          opacity=".5" 
          class="wave-path wave-path-2"
        ></path>
        <path 
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
          class="wave-path wave-path-3"
        ></path>
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
  const opacity = Math.random() * 0.5 + 0.1

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
      opacity,
      background: `radial-gradient(circle, rgba(59, 130, 246, ${opacity}) 0%, transparent 70%)`
    }
  }
}

const updateParticles = () => {
  particles.value.forEach(particle => {
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界检测
    if (particle.x < 0 || particle.x > 100) particle.vx *= -1
    if (particle.y < 0 || particle.y > 100) particle.vy *= -1

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
}

/* 粒子效果 */
.particles-container {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.3s ease;
}

/* 光晕效果 */
.glow-effects {
  position: absolute;
  inset: 0;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.glow-orb-1 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #3b82f6, transparent);
  top: 20%;
  left: -20px;
  animation-delay: 0s;
}

.glow-orb-2 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #8b5cf6, transparent);
  top: 60%;
  right: -30px;
  animation-delay: 2s;
}

.glow-orb-3 {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #06b6d4, transparent);
  bottom: 20%;
  left: -10px;
  animation-delay: 4s;
}

/* 网格背景 */
.grid-background {
  position: absolute;
  inset: 0;
  opacity: 0.3;
}

.grid-svg {
  width: 100%;
  height: 100%;
}

/* 波浪效果 */
.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  overflow: hidden;
  opacity: 0.1;
}

.wave-svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 120px;
}

.wave-path {
  fill: #3b82f6;
  animation: wave 10s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
}

.wave-path-1 {
  animation-delay: 0s;
}

.wave-path-2 {
  animation-delay: -2s;
}

.wave-path-3 {
  animation-delay: -4s;
}

/* 动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  33% {
    transform: translateY(-20px) scale(1.1);
  }
  66% {
    transform: translateY(10px) scale(0.9);
  }
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .glow-orb {
    display: none;
  }
  
  .particles-container {
    display: none;
  }
}
</style>