/**
 * 用户管理路由
 */

const Router = require('@koa/router')
const database = require('../utils/database')

const router = new Router()

// 获取用户列表
router.get('/', async (ctx) => {
  const prisma = database.getClient()

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      lastSyncAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  ctx.success(users, '获取用户列表成功')
})

// 获取用户信息
router.get('/profile', async (ctx) => {
  const userId = ctx.state.userId
  const prisma = database.getClient()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      createdAt: true,
      lastSyncAt: true
    }
  })

  ctx.success(user, '获取用户信息成功')
})

// 更新用户信息
router.put('/profile', async (ctx) => {
  const userId = ctx.state.userId
  const { username, avatar } = ctx.request.body
  const prisma = database.getClient()

  const updateData = {}
  if (username) updateData.username = username
  if (avatar) updateData.avatar = avatar

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      updatedAt: true
    }
  })

  ctx.success(user, '更新用户信息成功')
})

module.exports = router
