/**
 * 响应处理中间件
 */

const logger = require('../utils/logger')

// 响应格式化中间件
const responseHandler = async (ctx, next) => {
  // 添加成功响应方法
  ctx.success = (data = null, message = '操作成功', code = 200) => {
    ctx.status = code
    ctx.body = {
      success: true,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    }
  }

  // 添加错误响应方法
  ctx.error = (message = '操作失败', code = 400, data = null) => {
    ctx.status = code
    ctx.body = {
      success: false,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    }
  }

  // 添加分页响应方法
  ctx.paginate = (data, total, page, pageSize, message = '获取成功') => {
    ctx.success({
      list: data,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    }, message)
  }

  await next()
}

// 错误处理中间件
const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // 记录错误日志
    logger.error('请求处理错误:', {
      error: err.message,
      stack: err.stack,
      url: ctx.request.url,
      method: ctx.request.method,
      ip: ctx.request.ip,
      userAgent: ctx.request.header['user-agent']
    })

    // JWT错误处理
    if (err.status === 401) {
      ctx.error('认证失败，请重新登录', 401)
      return
    }

    // 参数验证错误
    if (err.isJoi) {
      ctx.error(`参数验证失败: ${err.details[0].message}`, 400)
      return
    }

    // Prisma错误处理
    if (err.code) {
      switch (err.code) {
        case 'P2002':
          ctx.error('数据已存在，请检查唯一性约束', 409)
          return
        case 'P2025':
          ctx.error('记录不存在', 404)
          return
        case 'P2003':
          ctx.error('外键约束失败', 400)
          return
        default:
          logger.error('数据库错误:', err)
          ctx.error('数据库操作失败', 500)
          return
      }
    }

    // 文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
      ctx.error('文件大小超出限制', 413)
      return
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      ctx.error('文件数量超出限制', 413)
      return
    }

    // 默认错误处理
    const status = err.status || err.statusCode || 500
    const message = status === 500 ? '服务器内部错误' : err.message

    ctx.error(message, status)
  }
}

module.exports = {
  responseHandler,
  errorHandler
}
