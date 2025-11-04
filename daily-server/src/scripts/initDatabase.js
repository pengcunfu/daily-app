/**
 * 数据库初始化脚本
 * 自动创建数据库表和初始数据
 */

const database = require('../utils/database')
const logger = require('../utils/logger')
const bcrypt = require('bcryptjs')

async function initDatabase() {
  try {
    logger.info('开始初始化数据库...')
    
    const prisma = database.getClient()
    
    // 检查数据库连接
    await database.connect()
    
    // 创建默认管理员用户
    const adminEmail = 'admin@example.com'
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    }).catch(() => null) // 如果表不存在，忽略错误
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('123456', 12)
      
      await prisma.user.create({
        data: {
          username: '管理员',
          email: adminEmail,
          password: hashedPassword
        }
      }).catch((error) => {
        logger.warn('创建管理员用户失败，可能是表不存在:', error.message)
      })
      
      logger.info('默认管理员用户已创建')
      logger.info('邮箱: admin@example.com')
      logger.info('密码: 123456')
    } else {
      logger.info('管理员用户已存在')
    }
    
    // 创建示例数据
    await createSampleData(prisma)
    
    logger.info('数据库初始化完成')
    
  } catch (error) {
    logger.error('数据库初始化失败:', error)
    throw error
  }
}

async function createSampleData(prisma) {
  try {
    // 检查是否已有示例数据
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    }).catch(() => null)
    
    if (!adminUser) {
      logger.info('跳过示例数据创建，管理员用户不存在')
      return
    }
    
    // 检查是否已有形象记录
    const existingAppearances = await prisma.appearance.count({
      where: { userId: adminUser.id }
    }).catch(() => 0)
    
    if (existingAppearances === 0) {
      // 创建示例形象记录
      const sampleAppearances = [
        {
          title: '今日穿搭',
          description: '简约休闲风格，适合日常出行',
          photos: JSON.stringify(['/uploads/sample1.jpg']),
          mood: '开心',
          weather: '晴天',
          occasion: '日常',
          rating: 4,
          tags: JSON.stringify(['休闲', '简约']),
          userId: adminUser.id
        },
        {
          title: '工作装扮',
          description: '正式商务装，参加重要会议',
          photos: JSON.stringify(['/uploads/sample2.jpg']),
          mood: '自信',
          weather: '多云',
          occasion: '工作',
          rating: 5,
          tags: JSON.stringify(['商务', '正式']),
          userId: adminUser.id
        }
      ]
      
      for (const appearance of sampleAppearances) {
        await prisma.appearance.create({
          data: appearance
        }).catch((error) => {
          logger.warn('创建示例形象记录失败:', error.message)
        })
      }
      
      logger.info('示例数据创建完成')
    } else {
      logger.info('示例数据已存在，跳过创建')
    }
    
  } catch (error) {
    logger.warn('创建示例数据失败:', error.message)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('数据库初始化脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('数据库初始化脚本执行失败:', error)
      process.exit(1)
    })
}

module.exports = {
  initDatabase,
  createSampleData
}
