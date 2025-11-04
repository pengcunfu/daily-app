/**
 * 认证路由
 */

const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const Joi = require('joi')
const { generateTokens, verifyRefreshToken } = require('../middleware/auth')
const database = require('../utils/database')
const logger = require('../utils/logger')

const router = new Router()

// 注册验证规则
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

// 登录验证规则
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// 用户注册
router.post('/register', async (ctx) => {
  const { error, value } = registerSchema.validate(ctx.request.body)
  if (error) {
    ctx.error(`参数验证失败: ${error.details[0].message}`, 400)
    return
  }

  const { username, email, password } = value
  const prisma = database.getClient()

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      ctx.error('用户名或邮箱已存在', 409)
      return
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    })

    // 生成令牌
    const tokens = generateTokens(user.id)

    logger.info(`用户注册成功: ${email}`)

    ctx.success({
      user,
      ...tokens
    }, '注册成功', 201)
  } catch (error) {
    logger.error('用户注册失败:', error)
    throw error
  }
})

// 用户登录
router.post('/login', async (ctx) => {
  const { error, value } = loginSchema.validate(ctx.request.body)
  if (error) {
    ctx.error(`参数验证失败: ${error.details[0].message}`, 400)
    return
  }

  const { email, password } = value
  const prisma = database.getClient()

  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      ctx.error('邮箱或密码错误', 401)
      return
    }

    if (!user.isActive) {
      ctx.error('账户已被禁用', 401)
      return
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      ctx.error('邮箱或密码错误', 401)
      return
    }

    // 生成令牌
    const tokens = generateTokens(user.id)

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSyncAt: new Date() }
    })

    logger.info(`用户登录成功: ${email}`)

    ctx.success({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      ...tokens
    }, '登录成功')
  } catch (error) {
    logger.error('用户登录失败:', error)
    throw error
  }
})

// 刷新令牌
router.post('/refresh', async (ctx) => {
  const { refreshToken } = ctx.request.body

  if (!refreshToken) {
    ctx.error('缺少刷新令牌', 400)
    return
  }

  try {
    const decoded = verifyRefreshToken(refreshToken)
    const tokens = generateTokens(decoded.userId)

    ctx.success(tokens, '令牌刷新成功')
  } catch (error) {
    ctx.error('刷新令牌无效', 401)
  }
})

// 退出登录
router.post('/logout', async (ctx) => {
  // 简单的退出登录响应（实际项目中可以维护令牌黑名单）
  ctx.success(null, '退出登录成功')
})

module.exports = router
