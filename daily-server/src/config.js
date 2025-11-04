/**
 * 应用配置
 */

require('dotenv').config()

const config = {
  // 服务器配置
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/dailyapp',
  
  // JWT配置
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // 文件上传配置
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/heic'
  ],
  
  // Redis配置
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // 日志配置
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log',
  
  // CORS配置
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001,http://localhost:5173',
  
  // 限流配置
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // 图片处理配置
  IMAGE_QUALITY: 85,
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1920,
  THUMBNAIL_SIZE: 300,
  
  // 同步配置
  SYNC_BATCH_SIZE: 50,
  SYNC_TIMEOUT: 30000, // 30秒
  
  // 分页配置
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
}

// 验证必要的环境变量
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']

if (config.NODE_ENV === 'production') {
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.error(`❌ 缺少必要的环境变量: ${envVar}`)
      process.exit(1)
    }
  })
}

module.exports = config
