/**
 * 数据同步路由
 */

const Router = require('@koa/router')
const router = new Router()

// 同步数据
router.post('/sync', async (ctx) => {
  ctx.success({ message: '同步功能开发中' })
})

// 获取同步状态
router.get('/status', async (ctx) => {
  ctx.success({ 
    lastSync: new Date().toISOString(),
    status: 'synced'
  })
})

module.exports = router
