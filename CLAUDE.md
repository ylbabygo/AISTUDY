# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
这是一个现代化的项目管理系统，采用前后端分离架构，支持看板/甘特图双模式切换，UI采用特斯拉风格深色科技风设计。

## 技术架构

### 前端 (Vue.js + TypeScript + Vite)
- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **UI框架**: Tailwind CSS（特斯拉风格定制主题）
- **特色功能**: Vue.Draggable（拖拽）、Frappe Gantt（甘特图）
- **路径别名**: `@` 指向 `src` 目录

### 后端 (Flask + SQLite)
- **框架**: Flask + Flask-CORS + SQLAlchemy
- **数据库**: SQLite + Flask-Migrate
- **数据序列化**: Marshmallow
- **文件处理**: Pillow（图片处理）

## 开发命令

### 前端开发
```bash
cd frontend
npm install          # 安装依赖
npm run dev         # 启动开发服务器（端口3000）
npm run build       # 构建生产版本
npm run lint        # ESLint代码检查
npm run format      # Prettier代码格式化
```

### 后端开发
```bash
cd backend
pip install -r requirements.txt  # 安装依赖
python app.py                    # 启动开发服务器（端口5000）
flask init-db                    # 初始化数据库
flask init-db --drop            # 删除并重新初始化数据库
flask forge                     # 生成测试数据
```

## 核心数据模型

```python
# 主要数据表结构
Project(id, name, description, start_date, end_date)
Task(id, project_id, title, status, assignee, priority, start_time, end_time, depends_on)
Document(id, task_id, filename, file_data, upload_time)
TimeLog(id, task_id, start_time, duration, description)
```

## API端点设计

### 项目管理
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `PUT /api/projects/<id>` - 更新项目
- `DELETE /api/projects/<id>` - 删除项目

### 任务管理
- `GET /api/projects/<id>/tasks` - 获取项目任务
- `POST /api/projects/<id>/tasks` - 创建任务
- `PUT /api/tasks/<id>` - 更新任务
- `DELETE /api/tasks/<id>` - 删除任务

### 文档和时间跟踪
- `POST /api/tasks/<id>/documents` - 上传文档（支持PDF和图片，最大16MB）
- `POST /api/tasks/<id>/timer` - 计时器控制（start/stop）

## 前端路由结构

- `/` - 仪表盘
- `/projects` - 项目管理
- `/kanban` - 看板视图
- `/gantt` - 甘特图视图
- `/project/:id` - 项目详情

## 开发注意事项

### 前端开发要点
1. 开发服务器已配置API代理到 `localhost:5000`
2. TypeScript严格模式已启用，注意类型定义
3. 使用Pinia进行状态管理，避免组件间直接传值
4. Tailwind CSS使用自定义特斯拉风格配色方案

### 后端开发要点
1. 使用Flask工厂模式创建应用实例
2. 数据库操作通过SQLAlchemy ORM完成
3. 使用Marshmallow进行数据验证和序列化
4. 文件上传存储在 `backend/uploads` 目录

### 环境配置
1. 前端端口3000，后端端口5000
2. CORS已配置支持跨域请求
3. 数据库文件自动生成：`project_management.db`
4. 环境变量通过 `.env` 文件配置