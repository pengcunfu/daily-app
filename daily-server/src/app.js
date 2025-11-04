/**
 * DailyApp 后端服务器
 * 专注于形象管理功能的API服务
 */

const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const jwt = require('koa-jwt')
const serve = require('koa-static')
const compress = require('koa-compress')
const rateLimit = require('koa-ratelimit')
const path = require('path')
const fs = require('fs')

// 导入配置和工具
const config = require('./config')
const logger = require('./utils/logger')
const database = require('./utils/database')
const { errorHandler, responseHandler } = require('./middleware/response')
const { authMiddleware } = require('./middleware/auth')
const { initDatabase } = require('./scripts/initDatabase')

// 导入路由
const authRoutes = require('./routes/auth')
const appearanceRoutes = require('./routes/appearances')
const uploadRoutes = require('./routes/upload')
const syncRoutes = require('./routes/sync')
const userRoutes = require('./routes/users')

const app = new Koa()
const router = new Router()

// 创建必要的目录
const createDirectories = () => {
  const dirs = [
    config.UPLOAD_PATH,
    path.join(config.UPLOAD_PATH, 'appearances'),
    path.join(config.UPLOAD_PATH, 'avatars'),
    'logs'
  ]
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      logger.info(`创建目录: ${dir}`)
    }
  })
}

// 初始化目录
createDirectories()

// 自动初始化数据库
const autoInitDatabase = async () => {
  try {
    logger.info('检查数据库状态...')
    
    // 首先尝试运行 Prisma 迁移
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    
    try {
      // 尝试推送数据库模式（如果数据库为空，会创建表）
      await execAsync('npx prisma db push', { cwd: __dirname + '/..' })
      logger.info('数据库模式推送成功')
    } catch (error) {
      logger.warn('数据库模式推送失败，尝试其他方式:', error.message)
    }
    
    // 运行数据库初始化
    await initDatabase()
    
  } catch (error) {
    logger.error('自动数据库初始化失败:', error)
    // 不阻止服务器启动，只是记录错误
  }
}

// 全局中间件
app.use(compress())
app.use(cors({
  origin: config.CORS_ORIGIN.split(','),
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}))

// 限流中间件
const limiter = rateLimit({
  driver: 'memory',
  db: new Map(),
  duration: config.RATE_LIMIT_WINDOW_MS,
  errorMessage: '请求过于频繁，请稍后再试',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  max: config.RATE_LIMIT_MAX_REQUESTS
})

app.use(limiter)

// 请求解析
app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
}))

// 静态文件服务
app.use(serve(config.UPLOAD_PATH, {
  maxage: 1000 * 60 * 60 * 24 * 7 // 7天缓存
}))

// 响应处理中间件
app.use(responseHandler)

// 错误处理中间件
app.use(errorHandler)

// 健康检查
router.get('/health', async (ctx) => {
  ctx.success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: require('../package.json').version,
    environment: config.NODE_ENV
  })
})

// API路由
router.use('/api/auth', authRoutes.routes())
router.use('/api/upload', uploadRoutes.routes())

// 需要认证的路由
app.use(jwt({ 
  secret: config.JWT_SECRET,
  passthrough: true 
}))

app.use(authMiddleware)

router.use('/api/appearances', appearanceRoutes.routes())
router.use('/api/sync', syncRoutes.routes())
router.use('/api/users', userRoutes.routes())

// 404处理
router.all('/(.*)', async (ctx) => {
  ctx.error('接口不存在', 404)
})

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

// 全局错误处理
app.on('error', (err, ctx) => {
  logger.error('服务器错误:', {
    error: err.message,
    stack: err.stack,
    url: ctx?.request?.url,
    method: ctx?.request?.method,
    ip: ctx?.request?.ip
  })
})

// 优雅关闭
const gracefulShutdown = (signal) => {
  logger.info(`收到 ${signal} 信号，正在关闭服务器...`)
  
  server.close(() => {
    logger.info('HTTP服务器已关闭')
    
    // 关闭数据库连接
    require('./utils/database').disconnect()
    
    process.exit(0)
  })
  
  // 强制关闭
  setTimeout(() => {
    logger.error('强制关闭服务器')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// 启动服务器函数
const startServer = async () => {
  try {
    // 先初始化数据库
    await autoInitDatabase()
    
    // 启动服务器
    const server = app.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`
╔══════════════════════════════════════════════════════════════╗
║                    DailyApp 后端服务器                        ║
║                                                              ║
║  🚀 服务器已启动                                              ║
║  📡 端口: ${config.PORT}                                    ║
║  🌐 本地访问: http://localhost:${config.PORT}               ║
║  📊 健康检查: http://localhost:${config.PORT}/health        ║
║  📚 API前缀: http://localhost:${config.PORT}/api            ║
║                                                              ║
║  🗄️  数据库: MySQL 8.0                                       ║
║  🔐 认证方式: JWT                                             ║
║  📁 上传目录: ${config.UPLOAD_PATH}                         ║
║                                                              ║
║  ⏰ 启动时间: ${new Date().toLocaleString()}                ║
║  🌍 环境: ${config.NODE_ENV}                               ║
╚══════════════════════════════════════════════════════════════╝
      `)
    })
    
    return server
  } catch (error) {
    logger.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动服务器
const server = startServer()

module.exports = app
