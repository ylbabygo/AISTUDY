<template>
  <div 
    :class="[
      'liquid-glass',
      variant,
      {
        'liquid-glass-interactive': interactive,
        'liquid-glass-elevated': elevated
      }
    ]"
    :style="customStyles"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousemove="onMouseMove"
    ref="glassElement"
  >
    <div class="liquid-glass-content">
      <slot />
    </div>
    <div 
      class="liquid-glass-highlight" 
      :style="highlightStyle"
      v-if="interactive"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  variant?: 'default' | 'header' | 'card' | 'sidebar' | 'modal'
  interactive?: boolean
  elevated?: boolean
  blur?: number
  opacity?: number
  borderRadius?: string
  customColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  interactive: false,
  elevated: false,
  blur: 20,
  opacity: 0.15,
  borderRadius: '1rem',
  customColor: 'rgba(255, 255, 255, 0.15)'
})

const glassElement = ref<HTMLElement>()
const mouseX = ref(0)
const mouseY = ref(0)
const isHovered = ref(false)

const customStyles = computed(() => ({
  '--liquid-glass-blur': `${props.blur}px`,
  '--liquid-glass-opacity': props.opacity,
  '--liquid-glass-radius': props.borderRadius,
  '--liquid-glass-color': props.customColor
}))

const highlightStyle = computed(() => {
  if (!isHovered.value || !props.interactive) return { opacity: 0 }
  
  return {
    background: `radial-gradient(circle at ${mouseX.value}px ${mouseY.value}px, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0.1) 40%, 
      transparent 70%)`,
    opacity: 1
  }
})

const onMouseEnter = () => {
  isHovered.value = true
}

const onMouseLeave = () => {
  isHovered.value = false
}

const onMouseMove = (event: MouseEvent) => {
  if (!glassElement.value) return
  
  const rect = glassElement.value.getBoundingClientRect()
  mouseX.value = event.clientX - rect.left
  mouseY.value = event.clientY - rect.top
}
</script>

<style scoped>
.liquid-glass {
  position: relative;
  background: var(--liquid-glass-color);
  backdrop-filter: blur(var(--liquid-glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--liquid-glass-blur)) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--liquid-glass-radius);
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.liquid-glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.liquid-glass-content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
}

.liquid-glass-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* Variants */
.liquid-glass.default {
  padding: 1rem;
}

.liquid-glass.header {
  padding: 0.75rem 1.5rem;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  background: rgba(255, 255, 255, 0.08);
}

.liquid-glass.card {
  padding: 1.5rem;
  border-radius: 1.5rem;
}

.liquid-glass.sidebar {
  padding: 1rem;
  border-radius: 0 1rem 1rem 0;
  border-left: none;
}

.liquid-glass.modal {
  padding: 2rem;
  border-radius: 2rem;
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  background: rgba(255, 255, 255, 0.12);
}

/* Interactive states */
.liquid-glass-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(31, 38, 135, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15);
}

.liquid-glass-elevated {
  box-shadow: 
    0 16px 48px rgba(31, 38, 135, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .liquid-glass {
    background: rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  }

  .liquid-glass.header {
    background: rgba(0, 0, 0, 0.08);
  }

  .liquid-glass.modal {
    background: rgba(0, 0, 0, 0.12);
  }

  .liquid-glass::before {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(255, 255, 255, 0.01) 100%
    );
  }

  .liquid-glass-interactive:hover {
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  }

  .liquid-glass-elevated {
    box-shadow: 
      0 16px 48px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .liquid-glass.header {
    padding: 0.5rem 1rem;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }

  .liquid-glass.card {
    padding: 1rem;
    border-radius: 1rem;
  }

  .liquid-glass.modal {
    padding: 1.5rem;
    border-radius: 1.5rem;
  }
}

/* Performance optimization for older browsers */
@supports not (backdrop-filter: blur(1px)) {
  .liquid-glass {
    background: rgba(255, 255, 255, 0.9);
  }

  @media (prefers-color-scheme: dark) {
    .liquid-glass {
      background: rgba(0, 0, 0, 0.9);
    }
  }
}
</style>