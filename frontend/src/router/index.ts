import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '仪表盘 - 项目管理系统'
    }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/Projects.vue'),
    meta: {
      title: '项目管理 - 项目管理系统'
    }
  },
  {
    path: '/kanban',
    name: 'Kanban',
    component: () => import('@/views/Kanban.vue'),
    meta: {
      title: '看板 - 项目管理系统'
    }
  },
  {
    path: '/gantt',
    name: 'Gantt',
    component: () => import('@/views/Gantt.vue'),
    meta: {
      title: '甘特图 - 项目管理系统'
    }
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/ProjectDetail.vue'),
    meta: {
      title: '项目详情 - 项目管理系统'
    }
  },
  {
    path: '/responsive-test',
    name: 'ResponsiveTest',
    component: () => import('@/components/dev/ResponsiveTest.vue'),
    meta: {
      title: '响应式测试 - 项目管理系统'
    }
  },
  {
    path: '/performance-test',
    name: 'PerformanceTest',
    component: () => import('@/views/PerformanceTest.vue'),
    meta: {
      title: '性能测试 - 项目管理系统'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫：更新页面标题
router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router