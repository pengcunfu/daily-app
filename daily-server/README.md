# DailyApp 后端服务

基于 Koa2 + Prisma + MySQL 的形象管理 API 服务。

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制配置模板：
```bash
cp config.template .env
```

2. 修改 `.env` 文件中的配置：
```env
DATABASE_URL="mysql://username:password@localhost:3306/dailyapp"
JWT_SECRET="your-super-secret-jwt-key"
```

### 数据库初始化

```bash
# 生成 Prisma 客户端
npm run generate

# 运行数据库迁移
npm run migrate

# 查看数据库（可选）
npm run studio
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 📚 API 文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/logout` - 退出登录

### 形象管理接口

- `GET /api/appearances` - 获取形象记录列表
- `POST /api/appearances` - 创建形象记录
- `GET /api/appearances/:id` - 获取形象记录详情
- `PUT /api/appearances/:id` - 更新形象记录
- `DELETE /api/appearances/:id` - 删除形象记录
- `GET /api/appearances/stats/summary` - 获取统计数据

### 文件上传接口

- `POST /api/upload/appearance` - 上传形象照片
- `POST /api/upload/avatar` - 上传头像

### 用户管理接口

- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

## 🗄️ 数据库结构

主要数据表：
- `users` - 用户表
- `appearances` - 形象记录表
- `user_devices` - 用户设备表
- `sync_logs` - 同步日志表

## 🔧 开发说明

### 项目结构

```
src/
├── app.js              # 应用入口
├── config.js           # 配置文件
├── middleware/         # 中间件
├── routes/            # 路由
├── services/          # 业务服务
├── utils/             # 工具函数
└── scripts/           # 脚本文件
```

### 环境变量

参考 `config.template` 文件中的配置项。

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t daily-server .

# 运行容器
docker run -p 3000:3000 daily-server
```

## 📝 许可证

MIT License
