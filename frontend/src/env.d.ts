/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'frappe-gantt' {
  export default class Gantt {
    constructor(selector: string, tasks: any[], options?: any)
    refresh(tasks: any[]): void
    change_view_mode(mode: string): void
  }
}