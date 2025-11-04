/**
 * 好友管理路由
 */

const Router = require('@koa/router')
const Joi = require('joi')
const database = require('../utils/database')
const logger = require('../utils/logger')
const config = require('../config')

const router = new Router()

// 联系方式验证规则
const contactSchema = Joi.object({
  type: Joi.string().valid('phone', 'qq', 'wechat', 'email').required(),
  value: Joi.string().min(1).max(100).required(),
  label: Joi.string().max(50).optional(),
  isPrimary: Joi.boolean().optional()
})

// 创建好友验证规则
const createFriendSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  nickname: Joi.string().max(50).optional(),
  sex: Joi.number().integer().valid(1, 2).optional(),
  birthDate: Joi.date().optional(),
  birthType: Joi.number().integer().valid(1, 2).optional(),
  avatar: Joi.string().uri().optional(),
  contacts: Joi.array().items(contactSchema).optional(),
  liveAddress: Joi.string().max(200).optional(),
  homeAddress: Joi.string().max(200).optional(),
  school: Joi.string().max(100).optional(),
  profession: Joi.string().max(100).optional(),
  disposition: Joi.string().max(200).optional(),
  hobbies: Joi.array().items(Joi.string().max(50)).optional(),
  tags: Joi.array().items(Joi.string().max(20)).optional(),
  remark: Joi.string().max(1000).optional(),
  advantages: Joi.array().items(Joi.string().max(200)).optional(),
  disadvantages: Joi.array().items(Joi.string().max(200)).optional(),
  relationship: Joi.string().valid('family', 'friend', 'colleague', 'classmate', 'other').optional(),
  importance: Joi.number().integer().min(1).max(5).optional(),
  lastContactDate: Joi.date().optional()
})

// 更新好友验证规则
const updateFriendSchema = createFriendSchema.fork(
  ['name'], 
  (schema) => schema.optional()
)

// 获取好友列表
router.get('/', async (ctx) => {
  const {
    page = 1,
    pageSize = config.DEFAULT_PAGE_SIZE,
    search,
    relationship,
    importance,
    sex
  } = ctx.query

  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 构建查询条件
    const where = {
      userId,
      deletedAt: null
    }

    // 添加筛选条件
    if (relationship) where.relationship = relationship
    if (importance) where.importance = parseInt(importance)
    if (sex) where.sex = parseInt(sex)

    // 搜索功能
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nickname: { contains: search } },
        { school: { contains: search } },
        { profession: { contains: search } }
      ]
    }

    // 分页参数
    const skip = (parseInt(page) - 1) * parseInt(pageSize)
    const take = Math.min(parseInt(pageSize), config.MAX_PAGE_SIZE)

    // 查询数据
    const [friends, total] = await Promise.all([
      prisma.friend.findMany({
        where,
        orderBy: [
          { importance: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take
      }),
      prisma.friend.count({ where })
    ])

    ctx.paginate(friends, total, page, pageSize, '获取好友列表成功')
  } catch (error) {
    logger.error('获取好友列表失败:', error)
    throw error
  }
})

// 获取好友详情
router.get('/:id', async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const friend = await prisma.friend.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!friend) {
      ctx.error('好友不存在', 404)
      return
    }

    ctx.success(friend, '获取好友详情成功')
  } catch (error) {
    logger.error('获取好友详情失败:', error)
    throw error
  }
})

// 创建好友
router.post('/', async (ctx) => {
  const { error, value } = createFriendSchema.validate(ctx.request.body)
  if (error) {
    ctx.error(`参数验证失败: ${error.details[0].message}`, 400)
    return
  }

  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 准备数据
    const data = { ...value, userId }
    
    // JSON 字段处理
    if (value.contacts) data.contacts = JSON.stringify(value.contacts)
    if (value.hobbies) data.hobbies = JSON.stringify(value.hobbies)
    if (value.tags) data.tags = JSON.stringify(value.tags)
    if (value.advantages) data.advantages = JSON.stringify(value.advantages)
    if (value.disadvantages) data.disadvantages = JSON.stringify(value.disadvantages)

    const friend = await prisma.friend.create({ data })

    logger.info(`用户 ${userId} 创建好友: ${friend.id}`)

    ctx.success(friend, '创建好友成功', 201)
  } catch (error) {
    logger.error('创建好友失败:', error)
    throw error
  }
})

// 更新好友
router.put('/:id', async (ctx) => {
  const { id } = ctx.params
  const { error, value } = updateFriendSchema.validate(ctx.request.body)
  
  if (error) {
    ctx.error(`参数验证失败: ${error.details[0].message}`, 400)
    return
  }

  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 检查好友是否存在且属于当前用户
    const existingFriend = await prisma.friend.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!existingFriend) {
      ctx.error('好友不存在', 404)
      return
    }

    // 准备更新数据
    const updateData = { ...value }
    
    // JSON 字段处理
    if (value.contacts) updateData.contacts = JSON.stringify(value.contacts)
    if (value.hobbies) updateData.hobbies = JSON.stringify(value.hobbies)
    if (value.tags) updateData.tags = JSON.stringify(value.tags)
    if (value.advantages) updateData.advantages = JSON.stringify(value.advantages)
    if (value.disadvantages) updateData.disadvantages = JSON.stringify(value.disadvantages)

    // 更新记录
    const friend = await prisma.friend.update({
      where: { id },
      data: {
        ...updateData,
        version: existingFriend.version + 1,
        lastModified: new Date()
      }
    })

    logger.info(`用户 ${userId} 更新好友: ${id}`)

    ctx.success(friend, '更新好友成功')
  } catch (error) {
    logger.error('更新好友失败:', error)
    throw error
  }
})

// 删除好友
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 检查好友是否存在且属于当前用户
    const existingFriend = await prisma.friend.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!existingFriend) {
      ctx.error('好友不存在', 404)
      return
    }

    // 软删除
    await prisma.friend.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        syncStatus: 'local'
      }
    })

    logger.info(`用户 ${userId} 删除好友: ${id}`)

    ctx.success(null, '删除好友成功')
  } catch (error) {
    logger.error('删除好友失败:', error)
    throw error
  }
})

// 更新最后联系时间
router.patch('/:id/contact', async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const friend = await prisma.friend.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!friend) {
      ctx.error('好友不存在', 404)
      return
    }

    const updatedFriend = await prisma.friend.update({
      where: { id },
      data: {
        lastContactDate: new Date()
      }
    })

    ctx.success(updatedFriend, '更新联系时间成功')
  } catch (error) {
    logger.error('更新联系时间失败:', error)
    throw error
  }
})

// 获取即将过生日的好友
router.get('/stats/birthdays', async (ctx) => {
  const { days = 30 } = ctx.query
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 获取所有有生日的好友
    const friends = await prisma.friend.findMany({
      where: {
        userId,
        deletedAt: null,
        birthDate: { not: null }
      }
    })

    // 计算即将过生日的好友
    const today = new Date()
    const endDate = new Date(today.getTime() + parseInt(days) * 24 * 60 * 60 * 1000)
    
    const upcomingBirthdays = friends.filter(friend => {
      const birthDate = new Date(friend.birthDate)
      const thisYearBirthday = new Date(
        today.getFullYear(), 
        birthDate.getMonth(), 
        birthDate.getDate()
      )
      
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }
      
      return thisYearBirthday >= today && thisYearBirthday <= endDate
    }).map(friend => {
      const birthDate = new Date(friend.birthDate)
      const thisYearBirthday = new Date(
        today.getFullYear(), 
        birthDate.getMonth(), 
        birthDate.getDate()
      )
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }
      
      const daysUntil = Math.ceil((thisYearBirthday - today) / (24 * 60 * 60 * 1000))
      const age = today.getFullYear() - birthDate.getFullYear()
      
      return {
        ...friend,
        upcomingBirthday: thisYearBirthday,
        daysUntil,
        age
      }
    }).sort((a, b) => a.daysUntil - b.daysUntil)

    ctx.success(upcomingBirthdays, '获取生日提醒成功')
  } catch (error) {
    logger.error('获取生日提醒失败:', error)
    throw error
  }
})

// 获取好友统计
router.get('/stats/summary', async (ctx) => {
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const [
      totalCount,
      byRelationship,
      byImportance
    ] = await Promise.all([
      // 总数
      prisma.friend.count({
        where: { userId, deletedAt: null }
      }),
      
      // 按关系类型统计
      prisma.friend.groupBy({
        by: ['relationship'],
        where: { userId, deletedAt: null },
        _count: true
      }),
      
      // 按重要程度统计
      prisma.friend.groupBy({
        by: ['importance'],
        where: { userId, deletedAt: null },
        _count: true
      })
    ])

    const stats = {
      totalCount,
      byRelationship: byRelationship.map(item => ({
        relationship: item.relationship,
        count: item._count
      })),
      byImportance: byImportance.map(item => ({
        importance: item.importance,
        count: item._count
      }))
    }

    ctx.success(stats, '获取统计数据成功')
  } catch (error) {
    logger.error('获取统计数据失败:', error)
    throw error
  }
})

module.exports = router

