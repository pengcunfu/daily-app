/**
 * 文件上传路由
 */

const Router = require('@koa/router')
const multer = require('@koa/multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const config = require('../config')
const logger = require('../utils/logger')

const router = new Router()

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(config.UPLOAD_PATH, 'appearances')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  }
})

// 上传形象照片
router.post('/appearance', upload.array('photos', 10), async (ctx) => {
  try {
    if (!ctx.req.files || ctx.req.files.length === 0) {
      ctx.error('请选择要上传的图片', 400)
      return
    }

    const processedFiles = []

    for (const file of ctx.req.files) {
      try {
        // 生成文件路径
        const originalPath = file.path
        const filename = path.parse(file.filename).name
        const processedFilename = `${filename}_processed.webp`
        const thumbnailFilename = `${filename}_thumb.webp`
        
        const processedPath = path.join(path.dirname(originalPath), processedFilename)
        const thumbnailPath = path.join(path.dirname(originalPath), thumbnailFilename)

        // 处理原图
        await sharp(originalPath)
          .resize(config.IMAGE_MAX_WIDTH, config.IMAGE_MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: config.IMAGE_QUALITY })
          .toFile(processedPath)

        // 生成缩略图
        await sharp(originalPath)
          .resize(config.THUMBNAIL_SIZE, config.THUMBNAIL_SIZE, {
            fit: 'cover'
          })
          .webp({ quality: 80 })
          .toFile(thumbnailPath)

        // 删除原文件
        fs.unlinkSync(originalPath)

        const fileInfo = {
          original: file.originalname,
          filename: processedFilename,
          thumbnail: thumbnailFilename,
          url: `/appearances/${processedFilename}`,
          thumbnailUrl: `/appearances/${thumbnailFilename}`,
          size: fs.statSync(processedPath).size,
          mimetype: 'image/webp'
        }

        processedFiles.push(fileInfo)
        
        logger.info(`图片处理成功: ${file.originalname} -> ${processedFilename}`)
      } catch (error) {
        logger.error(`图片处理失败: ${file.originalname}`, error)
        // 清理失败的文件
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      }
    }

    if (processedFiles.length === 0) {
      ctx.error('图片处理失败', 500)
      return
    }

    ctx.success(processedFiles, '图片上传成功', 201)
  } catch (error) {
    logger.error('文件上传失败:', error)
    ctx.error('文件上传失败', 500)
  }
})

// 上传头像
router.post('/avatar', upload.single('avatar'), async (ctx) => {
  try {
    if (!ctx.req.file) {
      ctx.error('请选择头像文件', 400)
      return
    }

    const file = ctx.req.file
    const filename = path.parse(file.filename).name
    const processedFilename = `${filename}_avatar.webp`
    const processedPath = path.join(path.dirname(file.path), processedFilename)

    // 处理头像（正方形裁剪）
    await sharp(file.path)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(processedPath)

    // 删除原文件
    fs.unlinkSync(file.path)

    const avatarInfo = {
      filename: processedFilename,
      url: `/avatars/${processedFilename}`,
      size: fs.statSync(processedPath).size
    }

    logger.info(`头像上传成功: ${file.originalname} -> ${processedFilename}`)

    ctx.success(avatarInfo, '头像上传成功', 201)
  } catch (error) {
    logger.error('头像上传失败:', error)
    ctx.error('头像上传失败', 500)
  }
})

module.exports = router
