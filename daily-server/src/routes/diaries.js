/**
 * 日记管理路由
 */

const Router = require('@koa/router')
const Joi = require('joi')
const database = require('../utils/database')
const logger = require('../utils/logger')
const config = require('../config')

const router = new Router()

// 创建日记验证规则
const createDiarySchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(10000).required(),
  date: Joi.date().optional(),
  mood: Joi.string().valid('very_happy', 'happy', 'normal', 'sad', 'very_sad').optional(),
  weather: Joi.string().max(50).optional(),
  location: Joi.string().max(200).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  isPrivate: Joi.boolean().optional()
})

// 更新日记验证规则
const updateDiarySchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  content: Joi.string().min(1).max(10000).optional(),
  date: Joi.date().optional(),
  mood: Joi.string().valid('very_happy', 'happy', 'normal', 'sad', 'very_sad').optional(),
  weather: Joi.string().max(50).optional(),
  location: Joi.string().max(200).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  isPrivate: Joi.boolean().optional()
})

// 获取日记列表
router.get('/', async (ctx) => {
  const {
    page = 1,
    pageSize = config.DEFAULT_PAGE_SIZE,
    search,
    mood,
    startDate,
    endDate,
    tag
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

    // 日期范围筛选
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate)
      }
    }

    // 搜索功能
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { location: { contains: search } }
      ]
    }

    // 分页参数
    const skip = (parseInt(page) - 1) * parseInt(pageSize)
    const take = Math.min(parseInt(pageSize), config.MAX_PAGE_SIZE)

    // 查询数据
    const [diaries, total] = await Promise.all([
      prisma.diary.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take
      }),
      prisma.diary.count({ where })
    ])

    ctx.paginate(diaries, total, page, pageSize, '获取日记列表成功')
  } catch (error) {
    logger.error('获取日记列表失败:', error)
    throw error
  }
})

// 获取日记详情
router.get('/:id', async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const diary = await prisma.diary.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!diary) {
      ctx.error('日记不存在', 404)
      return
    }

    ctx.success(diary, '获取日记详情成功')
  } catch (error) {
    logger.error('获取日记详情失败:', error)
    throw error
  }
})

// 创建日记
router.post('/', async (ctx) => {
  const { error, value } = createDiarySchema.validate(ctx.request.body)
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
    if (value.images) data.images = JSON.stringify(value.images)
    if (value.tags) data.tags = JSON.stringify(value.tags)
    
    // 如果没有指定日期,使用当前日期
    if (!value.date) {
      data.date = new Date()
    }

    const diary = await prisma.diary.create({ data })

    logger.info(`用户 ${userId} 创建日记: ${diary.id}`)

    ctx.success(diary, '创建日记成功', 201)
  } catch (error) {
    logger.error('创建日记失败:', error)
    throw error
  }
})

// 更新日记
router.put('/:id', async (ctx) => {
  const { id } = ctx.params
  const { error, value } = updateDiarySchema.validate(ctx.request.body)
  
  if (error) {
    ctx.error(`参数验证失败: ${error.details[0].message}`, 400)
    return
  }

  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 检查日记是否存在且属于当前用户
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!existingDiary) {
      ctx.error('日记不存在', 404)
      return
    }

    // 准备更新数据
    const updateData = { ...value }
    
    // JSON 字段处理
    if (value.images) updateData.images = JSON.stringify(value.images)
    if (value.tags) updateData.tags = JSON.stringify(value.tags)

    // 更新记录
    const diary = await prisma.diary.update({
      where: { id },
      data: {
        ...updateData,
        version: existingDiary.version + 1,
        lastModified: new Date()
      }
    })

    logger.info(`用户 ${userId} 更新日记: ${id}`)

    ctx.success(diary, '更新日记成功')
  } catch (error) {
    logger.error('更新日记失败:', error)
    throw error
  }
})

// 删除日记
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    // 检查日记是否存在且属于当前用户
    const existingDiary = await prisma.diary.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    })

    if (!existingDiary) {
      ctx.error('日记不存在', 404)
      return
    }

    // 软删除
    await prisma.diary.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        syncStatus: 'local'
      }
    })

    logger.info(`用户 ${userId} 删除日记: ${id}`)

    ctx.success(null, '删除日记成功')
  } catch (error) {
    logger.error('删除日记失败:', error)
    throw error
  }
})

// 获取日记统计
router.get('/stats/summary', async (ctx) => {
  const userId = ctx.state.userId
  const prisma = database.getClient()

  try {
    const [
      totalCount,
      thisMonthCount,
      thisYearCount,
      moodStats,
      recentDiaries
    ] = await Promise.all([
      // 总数
      prisma.diary.count({
        where: { userId, deletedAt: null }
      }),
      
      // 本月数量
      prisma.diary.count({
        where: {
          userId,
          deletedAt: null,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // 今年数量
      prisma.diary.count({
        where: {
          userId,
          deletedAt: null,
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1)
          }
        }
      }),
      
      // 心情统计
      prisma.diary.groupBy({
        by: ['mood'],
        where: { userId, deletedAt: null, mood: { not: null } },
        _count: true
      }),
      
      // 最近7天的日记
      prisma.diary.findMany({
        where: {
          userId,
          deletedAt: null,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          date: true,
          mood: true
        }
      })
    ])

    const stats = {
      totalCount,
      thisMonthCount,
      thisYearCount,
      moodStats: moodStats.map(item => ({
        mood: item.mood,
        count: item._count
      })),
      recentDiaries
    }

    ctx.success(stats, '获取统计数据成功')
  } catch (error) {
    logger.error('获取统计数据失败:', error)
    throw error
  }
})

module.exports = router

