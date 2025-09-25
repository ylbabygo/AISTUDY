<template>
  <div class="theme-toggle">
    <!-- 简单切换按钮 -->
    <Button
      v-if="simple"
      variant="ghost"
      size="sm"
      @click="toggleTheme"
      class="theme-toggle-button"
      :title="`当前: ${themeNames[theme]}`"
    >
      <SunIcon v-if="currentTheme === 'light'" class="w-5 h-5" />
      <MoonIcon v-else-if="currentTheme === 'dark'" class="w-5 h-5" />
      <ComputerDesktopIcon v-else class="w-5 h-5" />
    </Button>

    <!-- 下拉菜单 -->
    <div v-else class="relative">
      <Button
        variant="ghost"
        size="sm"
        @click="showDropdown = !showDropdown"
        class="theme-toggle-button"
        :class="{ 'bg-gray-100 dark:bg-gray-800': showDropdown }"
      >
        <SunIcon v-if="currentTheme === 'light'" class="w-5 h-5" />
        <MoonIcon v-else-if="currentTheme === 'dark'" class="w-5 h-5" />
        <ComputerDesktopIcon v-else class="w-5 h-5" />
        <ChevronDownIcon class="w-4 h-4 ml-1 transition-transform" :class="{ 'rotate-180': showDropdown }" />
      </Button>

      <!-- 下拉菜单内容 -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
          @click.stop
        >
          <button
            v-for="themeOption in themeOptions"
            :key="themeOption.value"
            @click="selectTheme(themeOption.value)"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': theme === themeOption.value }"
          >
            <component :is="themeOption.icon" class="w-4 h-4" />
            <span>{{ themeOption.name }}</span>
            <CheckIcon v-if="theme === themeOption.value" class="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- 点击外部关闭下拉菜单 -->
    <div
      v-if="showDropdown && !simple"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme, type Theme } from '@/composables/useTheme'
import Button from '@/components/ui/Button.vue'
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

interface Props {
  simple?: boolean // 是否使用简单模式（只有切换按钮）
}

const props = withDefaults(defineProps<Props>(), {
  simple: false
})

const { theme, currentTheme, setTheme, toggleTheme, themeNames } = useTheme()
const showDropdown = ref(false)

// 主题选项
const themeOptions = computed(() => [
  {
    value: 'light' as Theme,
    name: '浅色主题',
    icon: SunIcon
  },
  {
    value: 'dark' as Theme,
    name: '深色主题',
    icon: MoonIcon
  },
  {
    value: 'auto' as Theme,
    name: '跟随系统',
    icon: ComputerDesktopIcon
  }
])

// 选择主题
const selectTheme = (newTheme: Theme) => {
  setTheme(newTheme)
  showDropdown.value = false
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.theme-toggle-button {
  @apply transition-all duration-200 hover:scale-105;
}

.theme-toggle-button:hover {
  @apply shadow-md;
}

/* 暗色主题下的特殊样式 */
:global(.dark) .theme-toggle {
  @apply text-gray-300;
}

:global(.dark) .theme-toggle-button {
  @apply hover:bg-gray-700;
}
</style>