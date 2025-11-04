/**
 * 数据库连接工具
 */

const { PrismaClient } = require('@prisma/client')
const logger = require('./logger')

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    })

    // 监听数据库事件
    this.prisma.$on('error', (e) => {
      logger.error('数据库错误:', e)
    })

    this.prisma.$on('warn', (e) => {
      logger.warn('数据库警告:', e)
    })

    this.prisma.$on('info', (e) => {
      logger.info('数据库信息:', e)
    })

    // 开发环境记录查询日志
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        logger.debug('数据库查询:', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`
        })
      })
    }
  }

  // 连接数据库
  async connect() {
    try {
      await this.prisma.$connect()
      logger.info('数据库连接成功')
      return true
    } catch (error) {
      logger.error('数据库连接失败:', error)
      throw error
    }
  }

  // 断开数据库连接
  async disconnect() {
    try {
      await this.prisma.$disconnect()
      logger.info('数据库连接已断开')
    } catch (error) {
      logger.error('断开数据库连接失败:', error)
    }
  }

  // 检查数据库连接
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', timestamp: new Date().toISOString() }
    } catch (error) {
      logger.error('数据库健康检查失败:', error)
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
    }
  }

  // 获取Prisma客户端实例
  getClient() {
    return this.prisma
  }
}

// 创建单例实例
const database = new Database()

module.exports = database
