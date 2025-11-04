/**
 * 用户管理路由
 */

const Router = require('@koa/router')
const bcrypt = require('bcryptjs')
const database = require('../utils/database')

const router = new Router()

// 获取用户列表
router.get('/', async (ctx) => {
  const prisma = database.getClient()
  const { page = 1, pageSize = 10, keyword = '' } = ctx.query

  const skip = (parseInt(page) - 1) * parseInt(pageSize)
  const take = parseInt(pageSize)

  // 构建查询条件
  const where = {}
  if (keyword) {
    where.OR = [
      { username: { contains: keyword } },
      { email: { contains: keyword } }
    ]
  }

  // 获取总数和列表
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastSyncAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    })
  ])

  ctx.success({
    list: users,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  }, '获取用户列表成功')
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

// 创建用户
router.post('/', async (ctx) => {
  const { username, email, password } = ctx.request.body
  const prisma = database.getClient()

  // 验证必填字段
  if (!username || !email || !password) {
    ctx.error('用户名、邮箱和密码不能为空', 400)
    return
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    ctx.error('邮箱格式不正确', 400)
    return
  }

  // 检查用户名是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    }
  })

  if (existingUser) {
    if (existingUser.username === username) {
      ctx.error('用户名已存在', 400)
      return
    }
    if (existingUser.email === email) {
      ctx.error('邮箱已被注册', 400)
      return
    }
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10)

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      isActive: true
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      isActive: true,
      createdAt: true
    }
  })

  ctx.success(user, '创建用户成功')
})

// 获取单个用户详情
router.get('/:id', async (ctx) => {
  const { id } = ctx.params
  const prisma = database.getClient()

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastSyncAt: true
    }
  })

  if (!user) {
    ctx.error('用户不存在', 404)
    return
  }

  ctx.success(user, '获取用户详情成功')
})

// 更新用户
router.put('/:id', async (ctx) => {
  const { id } = ctx.params
  const { username, email, password, isActive } = ctx.request.body
  const prisma = database.getClient()

  // 检查用户是否存在
  const existingUser = await prisma.user.findUnique({
    where: { id }
  })

  if (!existingUser) {
    ctx.error('用户不存在', 404)
    return
  }

  // 构建更新数据
  const updateData = {}
  
  if (username !== undefined && username !== existingUser.username) {
    // 检查新用户名是否已被使用
    const userWithSameUsername = await prisma.user.findFirst({
      where: {
        username,
        id: { not: id }
      }
    })
    if (userWithSameUsername) {
      ctx.error('用户名已存在', 400)
      return
    }
    updateData.username = username
  }

  if (email !== undefined && email !== existingUser.email) {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      ctx.error('邮箱格式不正确', 400)
      return
    }
    
    // 检查新邮箱是否已被使用
    const userWithSameEmail = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    })
    if (userWithSameEmail) {
      ctx.error('邮箱已被注册', 400)
      return
    }
    updateData.email = email
  }

  if (password) {
    // 加密新密码
    updateData.password = await bcrypt.hash(password, 10)
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive
  }

  // 更新用户
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      isActive: true,
      updatedAt: true
    }
  })

  ctx.success(user, '更新用户成功')
})

// 删除用户
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params
  const prisma = database.getClient()

  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    ctx.error('用户不存在', 404)
    return
  }

  // 删除用户（级联删除相关数据）
  await prisma.user.delete({
    where: { id }
  })

  ctx.success(null, '删除用户成功')
})

// 切换用户状态
router.patch('/:id/toggle-status', async (ctx) => {
  const { id } = ctx.params
  const prisma = database.getClient()

  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    ctx.error('用户不存在', 404)
    return
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      isActive: !user.isActive
    },
    select: {
      id: true,
      username: true,
      email: true,
      isActive: true
    }
  })

  ctx.success(updatedUser, '切换用户状态成功')
})

module.exports = router
