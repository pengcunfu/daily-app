# DailyApp 移动端应用

基于 uni-app 开发的跨平台形象管理应用。

## 🚀 快速开始

### 环境要求

- Node.js 16+
- HBuilderX 或 uni-app CLI
- 微信开发者工具（小程序开发）
- Android Studio（Android开发）
- Xcode（iOS开发）

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# H5开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# App开发
npm run dev:app

# 其他平台
npm run dev:mp-alipay    # 支付宝小程序
npm run dev:mp-baidu     # 百度小程序
npm run dev:mp-toutiao   # 字节跳动小程序
```

### 构建项目

```bash
# H5构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# App构建
npm run build:app
```

## 📱 功能特性

### 🎯 核心功能

- **形象记录** - 每日自拍照片上传和管理
- **本地存储** - 未登录时数据保存在本地
- **用户认证** - 支持登录注册和游客模式
- **数据同步** - 登录后可同步数据到云端
- **标签管理** - 支持心情、天气、场合等标签
- **评分系统** - 对每日形象进行满意度评分

### 🎨 界面特性

- **现代化设计** - 简洁美观的用户界面
- **响应式布局** - 适配不同屏幕尺寸
- **流畅动画** - 丰富的交互动效
- **主题色彩** - 统一的视觉风格

### 📊 数据管理

- **本地优先** - 数据首先保存在本地
- **云端同步** - 登录后自动同步到服务器
- **离线使用** - 无网络时也能正常使用
- **数据备份** - 支持数据导出和导入

## 📁 项目结构

```
daily-app/
├── pages/                  # 页面文件
│   ├── index/             # 首页
│   ├── appearance/        # 形象管理
│   │   ├── add.vue       # 添加记录
│   │   └── detail.vue    # 记录详情
│   ├── profile/          # 个人中心
│   └── login/            # 登录页面
├── static/               # 静态资源
│   └── tabbar/          # 底部导航图标
├── App.vue              # 应用入口
├── main.js              # 主入口文件
├── manifest.json        # 应用配置
├── pages.json           # 页面配置
└── uni.scss            # 全局样式
```

## 🔧 开发说明

### 数据存储

应用采用本地优先的数据存储策略：

1. **本地存储**: 使用 `uni.setStorageSync()` 存储数据
2. **数据结构**: 
   ```javascript
   {
     id: String,           // 唯一标识
     title: String,        // 标题
     description: String,  // 描述
     photos: Array,        // 照片数组
     mood: String,         // 心情
     weather: String,      // 天气
     occasion: String,     // 场合
     rating: Number,       // 评分
     tags: Array,          // 标签
     isPrivate: Boolean,   // 是否私密
     createdAt: String,    // 创建时间
     updatedAt: String     // 更新时间
   }
   ```

### 页面路由

- `/pages/index/index` - 首页（形象记录列表）
- `/pages/appearance/add` - 添加形象记录
- `/pages/appearance/detail` - 形象记录详情
- `/pages/profile/index` - 个人中心
- `/pages/login/index` - 登录注册

### 组件使用

应用主要使用 uni-app 内置组件：
- `view` - 视图容器
- `text` - 文本组件
- `image` - 图片组件
- `input` - 输入框
- `button` - 按钮
- `swiper` - 轮播组件
- `switch` - 开关选择器

## 🌐 平台兼容

- ✅ H5
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ 字节跳动小程序
- ✅ QQ小程序
- ✅ Android App
- ✅ iOS App

## 📱 功能截图

### 主要页面
- 首页：显示形象记录列表和统计信息
- 添加页面：拍照上传和信息填写
- 详情页面：查看记录详情和操作
- 个人中心：用户信息和设置

### 核心流程
1. 打开应用 → 查看历史记录
2. 点击添加 → 拍照上传 → 填写信息 → 保存
3. 点击记录 → 查看详情 → 编辑/删除
4. 个人中心 → 登录 → 数据同步

## 🔄 数据同步

### 本地模式
- 数据存储在设备本地
- 无需网络连接
- 数据不会丢失

### 云端同步
- 登录后自动同步
- 多设备数据一致
- 支持数据备份

## 📝 开发计划

### 已完成功能
- ✅ 基础页面结构
- ✅ 形象记录CRUD
- ✅ 本地数据存储
- ✅ 用户认证界面
- ✅ 统计数据展示

### 待开发功能
- ⏳ 服务器API集成
- ⏳ 数据同步功能
- ⏳ 图片压缩优化
- ⏳ 离线数据队列
- ⏳ 推送通知
- ⏳ 数据导出导入

## 📄 许可证

MIT License
