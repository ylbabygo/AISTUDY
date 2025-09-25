# AISTUDY - 项目管理系统

一个现代化的项目管理Web应用，支持看板/甘特图双模式切换，采用特斯拉风格深色科技风UI设计。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.x-green.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)

## 🚀 功能特性

- **项目管理**: 创建、编辑、删除项目
- **任务管理**: 看板视图拖拽任务，甘特图时间轴展示
- **文档管理**: 支持PDF和图片文件上传
- **时间跟踪**: 任务计时器和耗时统计
- **双模式切换**: 看板模式 ↔ 甘特图模式
- **特斯拉风格UI**: 深色玻璃态界面设计

## 🛠 技术栈

### 前端
- Vue 3 + TypeScript + Vite
- Tailwind CSS
- Pinia 状态管理
- Vue.Draggable 拖拽
- Frappe Gantt 甘特图

### 后端
- Python Flask
- SQLite 数据库
- Flask-CORS

## 📦 项目结构

```
project-management-system/
├── frontend/          # Vue.js前端项目
├── backend/           # Flask后端项目
├── docs/              # 项目文档
└── README.md
```

## 🚦 快速开始

### 环境要求
- Node.js 16+ 
- Python 3.8+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/ylbabygo/AISTUDY.git
cd AISTUDY
```

2. **前端开发**
```bash
cd frontend
npm install
npm run dev
```

3. **后端开发**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 生产部署

#### 前端构建
```bash
cd frontend
npm run build
```

#### 后端部署
```bash
cd backend
python start.py
```

## 📋 开发规划

详见 `docs/开发规划.md`

## 🎯 开发目标

- ✅ 单用户项目管理
- ✅ 看板视图拖拽功能
- ✅ 甘特图时间轴展示
- ✅ 文档上传管理
- ✅ 时间跟踪统计
- ✅ 特斯拉风格深色UI
- ✅ 响应式设计

## 📝 许可证

MIT License
