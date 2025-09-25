<template>
  <div 
    class="glare-card"
    :class="{ 'glare-card--hover': isHovered }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    :style="cardStyle"
  >
    <div class="glare-card__background"></div>
    <div 
      class="glare-card__glare"
      :style="glareStyle"
    ></div>
    <div class="glare-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  glareColor?: string
  glareOpacity?: number
  glareBlur?: number
  rotationFactor?: number
}

const props = withDefaults(defineProps<Props>(), {
  glareColor: '#ffffff',
  glareOpacity: 0.3,
  glareBlur: 20,
  rotationFactor: 10
})

const isHovered = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const cardRef = ref<HTMLElement>()

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
  mouseX.value = 0
  mouseY.value = 0
}

const handleMouseMove = (event: MouseEvent) => {
  if (!event.currentTarget) return
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  mouseX.value = (x / rect.width) * 100
  mouseY.value = (y / rect.height) * 100
}

const cardStyle = computed(() => {
  if (!isHovered.value) return {}
  
  const rotateX = (mouseY.value - 50) / props.rotationFactor
  const rotateY = (mouseX.value - 50) / props.rotationFactor
  
  return {
    transform: `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
  }
})

const glareStyle = computed(() => {
  if (!isHovered.value) return { opacity: 0 }
  
  return {
    background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, ${props.glareColor} 0%, transparent 70%)`,
    opacity: props.glareOpacity,
    filter: `blur(${props.glareBlur}px)`
  }
})
</script>

<style scoped>
.glare-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease-out;
  transform-style: preserve-3d;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glare-card__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(255, 255, 255, 0.1) 100%
  );
  z-index: 1;
}

.glare-card__glare {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.glare-card__content {
  position: relative;
  z-index: 3;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Dark theme styles */
.dark .glare-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .glare-card__background {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 50%, 
    rgba(255, 255, 255, 0.05) 100%
  );
}

/* Hover effects */
.glare-card--hover {
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.dark .glare-card--hover {
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.5),
    0 10px 10px -5px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Animation variants */
.glare-card--subtle {
  transform: none !important;
}

.glare-card--subtle:hover {
  transform: translateY(-2px) !important;
}

.glare-card--intense .glare-card__glare {
  filter: blur(10px);
}

.glare-card--colorful .glare-card__glare {
  background: radial-gradient(circle, 
    rgba(59, 130, 246, 0.3) 0%, 
    rgba(168, 85, 247, 0.2) 50%, 
    transparent 70%
  );
}
</style>