<template>
  <div class="beams-background">
    <div class="beams-container">
      <div 
        v-for="(beam, index) in beams" 
        :key="index"
        class="beam"
        :style="getBeamStyle(beam, index)"
      ></div>
    </div>
    <div class="content-overlay">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Beam {
  x: number
  y: number
  angle: number
  length: number
  opacity: number
  speed: number
}

const beams = ref<Beam[]>([])
let animationId: number | null = null

const generateBeam = (): Beam => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  angle: Math.random() * 360,
  length: Math.random() * 200 + 100,
  opacity: Math.random() * 0.3 + 0.1,
  speed: Math.random() * 0.5 + 0.2
})

const initBeams = () => {
  beams.value = Array.from({ length: 8 }, generateBeam)
}

const animateBeams = () => {
  beams.value.forEach((beam, index) => {
    beam.x += Math.cos(beam.angle * Math.PI / 180) * beam.speed
    beam.y += Math.sin(beam.angle * Math.PI / 180) * beam.speed
    
    // Reset beam if it goes off screen
    if (beam.x > 110 || beam.x < -10 || beam.y > 110 || beam.y < -10) {
      beams.value[index] = generateBeam()
    }
  })
  
  animationId = requestAnimationFrame(animateBeams)
}

const getBeamStyle = (beam: Beam, index: number) => ({
  left: `${beam.x}%`,
  top: `${beam.y}%`,
  transform: `rotate(${beam.angle}deg)`,
  width: `${beam.length}px`,
  opacity: beam.opacity,
  animationDelay: `${index * 0.2}s`
})

onMounted(() => {
  initBeams()
  animateBeams()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.beams-background {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.beams-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.beam {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.8) 20%, 
    rgba(255, 255, 255, 1) 50%, 
    rgba(255, 255, 255, 0.8) 80%, 
    transparent 100%
  );
  border-radius: 1px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  animation: beam-glow 2s ease-in-out infinite alternate;
}

@keyframes beam-glow {
  0% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
}

.content-overlay {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
}

/* Dark theme variant */
.dark .beams-background {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.dark .beam {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.6) 20%, 
    rgba(59, 130, 246, 0.9) 50%, 
    rgba(59, 130, 246, 0.6) 80%, 
    transparent 100%
  );
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.dark .beam:nth-child(even) {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(168, 85, 247, 0.6) 20%, 
    rgba(168, 85, 247, 0.9) 50%, 
    rgba(168, 85, 247, 0.6) 80%, 
    transparent 100%
  );
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
}

@keyframes beam-glow {
  0% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
  }
}
</style>