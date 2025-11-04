/**
 * 形象管理路由
 */

const Router = require('@koa/router')
const Joi = require('joi')
const database = require('../utils/database')
const logger = require('../utils/logger')
const config = require('../config')

const router = new Router()

// 创建形象记录验证规则
const createAppearanceSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  photos: Joi.array().items(Joi.string().uri()).min(1).required(),
  mood: Joi.string().max(50).optional(),
  weather: Joi.string().max(50).optional(),
  occasion: Joi.string().max(100).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  tags: Joi.array().items(Joi.string().max(20)).optional(),
  isPrivate: Joi.boolean().optional()
})

// 更新形象记录验证规则
const updateAppearanceSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  photos: Joi.array().items(Joi.string().uri()).optional(),
  mood: Joi.string().max(50).optional(),
  weather: Joi.string().max(50).optional(),
  occasion: Joi.string().max(100).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  tags: Joi.array().items(Joi.string().max(20)).optional(),
  isPrivate: Joi.boolean().optional()
})

// 获取形象记录列表
router.get('/', async (ctx) => {
  const {
    page = 1,
    pageSize = config.DEFAULT_PAGE_SIZE,
    mood,
    weather,
    occasion,
    rating,
    startDate,
    endDate,
    search
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
    if (mood) where.mood = mood
    if (weather) where.weather = weather
    if (occasion) where.occasion = occasion
    if (rating) where.rating = parseInt(rating)

    // 日期范围筛选
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // 搜索功能
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // 分页参数
    const skip = (parseInt(page) - 1) * parseInt(pageSize)
    const take = Math.min(parseInt(pageSize), config.MAX_PAGE_SIZE)

    // 查询数据
    const [appearances, total] = await Promise.all([
      prisma.appearance.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          photos: true,
          mood: true,
          weather: true,
          occasion: true,
          rating: true,
          tags: true,
          isPrivate: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.appearance.count({ where })
    ])

    ctx.paginate(appearances, total, page, pageSize, '获取形象记录成功')
  } catch (error) {
    logger.error('获取形象记录失败:', error)
    throw error
  }
})

// 获取形象记录详情
router.get('/:id', async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const appearance = await prisma.appearance.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!appearance) {
      ctx.error('形象记录不存在', 404)
      return
    }

    ctx.success(appearance, '获取形象记录详情成功')
  } catch (error) {
    logger.error('获取形象记录详情失败:', error)
    throw error
  }
})

// 创建形象记录
router.post('/', async (ctx) => {
  const { error, value } = createAppearanceSchema.validate(ctx.request.body)
  if (error) {
    ctx.error(`参数验证失败: ${error.details[0].message}`, 400)
    return
  }

  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const appearance = await prisma.appearance.create({
      data: {
        ...value,
        userId,
        photos: JSON.stringify(value.photos),
        tags: value.tags ? JSON.stringify(value.tags) : null
      }
    })

    logger.info(`用户 ${userId} 创建形象记录: ${appearance.id}`)

    ctx.success(appearance, '创建形象记录成功', 201)
  } catch (error) {
    logger.error('创建形象记录失败:', error)
    throw error
  }
})

// 更新形象记录
router.put('/:id', async (ctx) => {
  const { id } = ctx.params
  const { error, value } = updateAppearanceSchema.validate(ctx.request.body)
  
  if (error) {
    ctx.error(`参数验证失败: ${error.details[0].message}`, 400)
    return
  }

  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 检查记录是否存在且属于当前用户
    const existingAppearance = await prisma.appearance.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!existingAppearance) {
      ctx.error('形象记录不存在', 404)
      return
    }

    // 准备更新数据
    const updateData = { ...value }
    if (value.photos) {
      updateData.photos = JSON.stringify(value.photos)
    }
    if (value.tags) {
      updateData.tags = JSON.stringify(value.tags)
    }

    // 更新记录
    const appearance = await prisma.appearance.update({
      where: { id },
      data: {
        ...updateData,
        version: existingAppearance.version + 1,
        lastModified: new Date()
      }
    })

    logger.info(`用户 ${userId} 更新形象记录: ${id}`)

    ctx.success(appearance, '更新形象记录成功')
  } catch (error) {
    logger.error('更新形象记录失败:', error)
    throw error
  }
})

// 删除形象记录
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 检查记录是否存在且属于当前用户
    const existingAppearance = await prisma.appearance.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!existingAppearance) {
      ctx.error('形象记录不存在', 404)
      return
    }

    // 软删除
    await prisma.appearance.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        syncStatus: 'local'
      }
    })

    logger.info(`用户 ${userId} 删除形象记录: ${id}`)

    ctx.success(null, '删除形象记录成功')
  } catch (error) {
    logger.error('删除形象记录失败:', error)
    throw error
  }
})

// 获取统计数据
router.get('/stats/summary', async (ctx) => {
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const [
      totalCount,
      thisMonthCount,
      avgRating,
      moodStats,
      weatherStats
    ] = await Promise.all([
      // 总数
      prisma.appearance.count({
        where: { userId, deletedAt: null }
      }),
      
      // 本月数量
      prisma.appearance.count({
        where: {
          userId,
          deletedAt: null,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // 平均评分
      prisma.appearance.aggregate({
        where: { userId, deletedAt: null, rating: { not: null } },
        _avg: { rating: true }
      }),
      
      // 心情统计
      prisma.appearance.groupBy({
        by: ['mood'],
        where: { userId, deletedAt: null, mood: { not: null } },
        _count: true
      }),
      
      // 天气统计
      prisma.appearance.groupBy({
        by: ['weather'],
        where: { userId, deletedAt: null, weather: { not: null } },
        _count: true
      })
    ])

    const stats = {
      totalCount,
      thisMonthCount,
      avgRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : null,
      moodStats: moodStats.map(item => ({
        mood: item.mood,
        count: item._count
      })),
      weatherStats: weatherStats.map(item => ({
        weather: item.weather,
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
