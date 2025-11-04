<template>
  <view class="container">
    <form @submit="handleSubmit">
      <!-- 照片上传区域 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">今日照片</text>
          <text class="required">*</text>
        </view>
        
        <view class="photo-upload">
          <view class="photo-list">
            <view 
              v-for="(photo, index) in photoList" 
              :key="index" 
              class="photo-item"
            >
              <image :src="photo" class="photo-image" mode="aspectFill"></image>
              <view class="photo-delete" @click="removePhoto(index)">
                <text class="delete-icon">×</text>
              </view>
            </view>
            
            <view 
              v-if="photoList.length < 9" 
              class="photo-add" 
              @click="chooseImage"
            >
              <text class="add-icon">+</text>
              <text class="add-text">添加照片</text>
            </view>
          </view>
          <text class="photo-tip">最多可上传9张照片</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">基本信息</text>
        </view>
        
        <view class="form-item">
          <text class="label">标题</text>
          <input 
            v-model="form.title" 
            class="input" 
            placeholder="给今天的形象起个标题吧"
            maxlength="50"
          />
        </view>
        
        <view class="form-item">
          <text class="label">描述</text>
          <textarea 
            v-model="form.description" 
            class="textarea" 
            placeholder="描述一下今天的穿搭心得..."
            maxlength="200"
          ></textarea>
        </view>
      </view>

      <!-- 心情和环境 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">心情与环境</text>
        </view>
        
        <view class="form-item">
          <text class="label">今日心情</text>
          <view class="tag-selector">
            <text 
              v-for="mood in moodOptions" 
              :key="mood"
              class="tag-option"
              :class="{ active: form.mood === mood }"
              @click="form.mood = form.mood === mood ? '' : mood"
            >
              {{ mood }}
            </text>
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">天气情况</text>
          <view class="tag-selector">
            <text 
              v-for="weather in weatherOptions" 
              :key="weather"
              class="tag-option"
              :class="{ active: form.weather === weather }"
              @click="form.weather = form.weather === weather ? '' : weather"
            >
              {{ weather }}
            </text>
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">场合</text>
          <input 
            v-model="form.occasion" 
            class="input" 
            placeholder="如：上班、约会、聚餐等"
            maxlength="20"
          />
        </view>
      </view>

      <!-- 评分 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">满意度评分</text>
        </view>
        
        <view class="rating-selector">
          <text 
            v-for="n in 5" 
            :key="n"
            class="rating-star"
            :class="{ active: n <= form.rating }"
            @click="form.rating = n"
          >
            ★
          </text>
          <text class="rating-text">{{ getRatingText(form.rating) }}</text>
        </view>
      </view>

      <!-- 标签 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">标签</text>
        </view>
        
        <view class="tag-input">
          <view class="selected-tags">
            <text 
              v-for="(tag, index) in form.tags" 
              :key="index"
              class="selected-tag"
              @click="removeTag(index)"
            >
              {{ tag }} ×
            </text>
          </view>
          
          <view class="tag-suggestions">
            <text 
              v-for="tag in tagSuggestions" 
              :key="tag"
              class="tag-suggestion"
              @click="addTag(tag)"
            >
              {{ tag }}
            </text>
          </view>
          
          <view class="custom-tag-input">
            <input 
              v-model="customTag" 
              class="tag-input-field" 
              placeholder="自定义标签"
              @confirm="addCustomTag"
            />
            <button 
              type="button" 
              class="tag-add-btn" 
              @click="addCustomTag"
            >
              添加
            </button>
          </view>
        </view>
      </view>

      <!-- 隐私设置 -->
      <view class="section">
        <view class="form-item">
          <text class="label">隐私设置</text>
          <switch 
            :checked="form.isPrivate" 
            @change="handlePrivacyChange"
            color="#007AFF"
          />
          <text class="privacy-desc">开启后仅自己可见</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button 
          class="submit-btn" 
          :class="{ disabled: !canSubmit }"
          :disabled="!canSubmit || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '保存中...' : '保存记录' }}
        </button>
      </view>
    </form>
  </view>
</template>

<script>
export default {
  data() {
    return {
      photoList: [],
      customTag: '',
      submitting: false,
      form: {
        title: '',
        description: '',
        mood: '',
        weather: '',
        occasion: '',
        rating: 0,
        tags: [],
        isPrivate: false
      },
      moodOptions: ['开心', '平静', '兴奋', '疲惫', '焦虑', '满足', '期待'],
      weatherOptions: ['晴天', '多云', '阴天', '雨天', '雪天'],
      tagSuggestions: ['休闲', '正式', '运动', '约会', '工作', '聚会', '旅行', '居家']
    }
  },
  
  computed: {
    canSubmit() {
      return this.photoList.length > 0 && this.form.title.trim()
    }
  },
  
  onLoad() {
    // 自动生成标题
    this.generateDefaultTitle()
  },
  
  methods: {
    generateDefaultTitle() {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()
      this.form.title = `${month}月${day}日的形象记录`
    },
    
    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 9 - this.photoList.length,
          sizeType: ['compressed'],
          sourceType: ['camera', 'album']
        })
        
        this.photoList.push(...res.tempFilePaths)
      } catch (error) {
        console.error('选择图片失败:', error)
      }
    },
    
    removePhoto(index) {
      this.photoList.splice(index, 1)
    },
    
    addTag(tag) {
      if (!this.form.tags.includes(tag) && this.form.tags.length < 10) {
        this.form.tags.push(tag)
      }
    },
    
    removeTag(index) {
      this.form.tags.splice(index, 1)
    },
    
    addCustomTag() {
      const tag = this.customTag.trim()
      if (tag && !this.form.tags.includes(tag) && this.form.tags.length < 10) {
        this.form.tags.push(tag)
        this.customTag = ''
      }
    },
    
    handlePrivacyChange(e) {
      this.form.isPrivate = e.detail.value
    },
    
    getRatingText(rating) {
      const texts = ['', '一般', '还行', '不错', '很好', '完美']
      return texts[rating] || ''
    },
    
    async handleSubmit() {
      if (!this.canSubmit || this.submitting) return
      
      this.submitting = true
      
      try {
        // 生成唯一ID
        const id = Date.now().toString()
        
        // 构建数据
        const appearanceData = {
          id,
          ...this.form,
          photos: this.photoList,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'local' // 标记为本地数据
        }
        
        // 保存到本地存储
        const existingData = uni.getStorageSync('appearanceList') || []
        existingData.unshift(appearanceData)
        uni.setStorageSync('appearanceList', existingData)
        
        // TODO: 如果已登录，同步到服务器
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.section {
  background: white;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.required {
  color: #FF6B6B;
  margin-left: 8rpx;
  font-size: 32rpx;
}

.photo-upload {
  text-align: center;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.photo-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.photo-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.photo-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #FF6B6B;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

.photo-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.add-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.add-text {
  font-size: 24rpx;
}

.photo-tip {
  font-size: 24rpx;
  color: #999;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.input, .textarea {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fafafa;
}

.textarea {
  height: 120rpx;
  resize: none;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.tag-option {
  padding: 15rpx 25rpx;
  border: 2rpx solid #eee;
  border-radius: 25rpx;
  font-size: 26rpx;
  color: #666;
  background: #fafafa;
}

.tag-option.active {
  background: #007AFF;
  color: white;
  border-color: #007AFF;
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.rating-star {
  font-size: 60rpx;
  color: #ddd;
}

.rating-star.active {
  color: #FFD700;
}

.rating-text {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.tag-input {
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
  background: #fafafa;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.selected-tag {
  padding: 10rpx 15rpx;
  background: #007AFF;
  color: white;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.tag-suggestion {
  padding: 10rpx 15rpx;
  background: #f0f0f0;
  color: #666;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.custom-tag-input {
  display: flex;
  gap: 15rpx;
  align-items: center;
}

.tag-input-field {
  flex: 1;
  padding: 15rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.tag-add-btn {
  padding: 15rpx 25rpx;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.privacy-desc {
  margin-left: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: white;
  border-top: 2rpx solid #eee;
}

.submit-btn {
  width: 100%;
  padding: 25rpx;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn.disabled {
  background: #ccc;
  color: #999;
}
</style>
