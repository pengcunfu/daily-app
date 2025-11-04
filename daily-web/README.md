# DailyApp 管理后台

基于 Vue 3 + Element Plus 的形象管理系统管理后台。

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 📚 功能特性

### 🎯 核心功能

- **用户认证** - 登录/注册/退出
- **形象管理** - 创建、编辑、删除形象记录
- **照片上传** - 支持多张照片上传和预览
- **数据统计** - 仪表盘展示各种统计信息
- **用户管理** - 查看和管理用户信息
- **系统设置** - 基础系统配置

### 🎨 界面特性

- **响应式设计** - 适配桌面端和移动端
- **现代化UI** - 基于 Element Plus 组件库
- **暗色主题** - 支持暗色模式切换
- **图表展示** - 使用 ECharts 展示数据
- **图片预览** - 支持图片放大预览

### 🔧 技术特性

- **Vue 3** - 使用 Composition API
- **Vite** - 快速的构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 请求
- **SCSS** - CSS 预处理器

## 📁 项目结构

```
src/
├── api/                # API 接口
├── assets/            # 静态资源
│   └── styles/        # 样式文件
├── components/        # 公共组件
├── router/           # 路由配置
├── store/            # 状态管理
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## 🔗 API 接口

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 退出登录

### 形象管理接口

- `GET /api/appearances` - 获取形象记录列表
- `POST /api/appearances` - 创建形象记录
- `PUT /api/appearances/:id` - 更新形象记录
- `DELETE /api/appearances/:id` - 删除形象记录

### 文件上传接口

- `POST /api/upload/appearance` - 上传形象照片

## 🎨 自定义主题

项目支持自定义主题，可以在 `src/assets/styles/index.scss` 中修改样式变量。

## 📱 响应式支持

- **桌面端**: >= 1200px
- **平板端**: 768px - 1199px  
- **移动端**: < 768px

## 🔧 开发说明

### 环境变量

开发环境会自动代理 API 请求到 `http://localhost:3000`。

### 代码规范

项目使用 ESLint 进行代码检查，请确保代码符合规范。

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📝 许可证

MIT License
