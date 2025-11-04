/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken')
const config = require('../config')
const database = require('../utils/database')
const logger = require('../utils/logger')

// JWT认证中间件
const authMiddleware = async (ctx, next) => {
  // 跳过不需要认证的路由
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/health'
  ]

  const isPublicPath = publicPaths.some(path => ctx.path.startsWith(path))
  
  if (isPublicPath) {
    await next()
    return
  }

  try {
    // 检查Authorization头
    const token = ctx.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      ctx.error('缺少认证令牌', 401)
      return
    }

    // 验证JWT
    const decoded = jwt.verify(token, config.JWT_SECRET)
    
    // 查询用户信息
    const prisma = database.getClient()
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isActive: true,
        lastSyncAt: true
      }
    })

    if (!user) {
      ctx.error('用户不存在', 401)
      return
    }

    if (!user.isActive) {
      ctx.error('账户已被禁用', 401)
      return
    }

    // 将用户信息添加到上下文
    ctx.state.user = user
    ctx.state.userId = user.id

    await next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      ctx.error('无效的认证令牌', 401)
    } else if (error.name === 'TokenExpiredError') {
      ctx.error('认证令牌已过期', 401)
    } else {
      logger.error('认证中间件错误:', error)
      ctx.error('认证失败', 401)
    }
  }
}

// 可选认证中间件（允许游客访问）
const optionalAuthMiddleware = async (ctx, next) => {
  try {
    const token = ctx.headers.authorization?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET)
      const prisma = database.getClient()
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          isActive: true
        }
      })

      if (user && user.isActive) {
        ctx.state.user = user
        ctx.state.userId = user.id
      }
    }
  } catch (error) {
    // 可选认证失败时不阻止请求
    logger.debug('可选认证失败:', error.message)
  }

  await next()
}

// 生成JWT令牌
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  )

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.JWT_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  )

  return { accessToken, refreshToken }
}

// 验证刷新令牌
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET)
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type')
    }
    return decoded
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  generateTokens,
  verifyRefreshToken
}
