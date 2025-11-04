<template>
  <view class="container">
    <view v-if="appearance" class="content">
      <!-- 照片展示 -->
      <view class="photo-section">
        <swiper 
          class="photo-swiper" 
          :indicator-dots="appearance.photos.length > 1"
          :autoplay="false"
          :circular="true"
        >
          <swiper-item 
            v-for="(photo, index) in appearance.photos" 
            :key="index"
          >
            <image 
              :src="photo" 
              class="photo-image" 
              mode="aspectFill"
              @click="previewImage(index)"
            ></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- 基本信息 -->
      <view class="info-section">
        <view class="header">
          <text class="title">{{ appearance.title }}</text>
          <text class="date">{{ formatDate(appearance.createdAt) }}</text>
        </view>
        
        <text v-if="appearance.description" class="description">
          {{ appearance.description }}
        </text>
        
        <!-- 评分 -->
        <view v-if="appearance.rating" class="rating">
          <text class="rating-label">满意度：</text>
          <text 
            v-for="n in 5" 
            :key="n"
            class="star"
            :class="{ active: n <= appearance.rating }"
          >★</text>
          <text class="rating-text">{{ getRatingText(appearance.rating) }}</text>
        </view>
      </view>

      <!-- 标签和环境信息 -->
      <view class="tags-section">
        <view v-if="appearance.mood" class="tag-group">
          <text class="tag-label">心情：</text>
          <text class="tag mood">{{ appearance.mood }}</text>
        </view>
        
        <view v-if="appearance.weather" class="tag-group">
          <text class="tag-label">天气：</text>
          <text class="tag weather">{{ appearance.weather }}</text>
        </view>
        
        <view v-if="appearance.occasion" class="tag-group">
          <text class="tag-label">场合：</text>
          <text class="tag occasion">{{ appearance.occasion }}</text>
        </view>
        
        <view v-if="appearance.tags && appearance.tags.length > 0" class="tag-group">
          <text class="tag-label">标签：</text>
          <view class="custom-tags">
            <text 
              v-for="tag in appearance.tags" 
              :key="tag"
              class="tag custom"
            >
              {{ tag }}
            </text>
          </view>
        </view>
      </view>

      <!-- 隐私状态 -->
      <view v-if="appearance.isPrivate" class="privacy-notice">
        <text class="privacy-icon">🔒</text>
        <text class="privacy-text">仅自己可见</text>
      </view>

      <!-- 操作按钮 -->
      <view class="actions">
        <button class="action-btn edit-btn" @click="editAppearance">
          编辑
        </button>
        <button class="action-btn delete-btn" @click="deleteAppearance">
          删除
        </button>
        <button class="action-btn share-btn" @click="shareAppearance">
          分享
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-else class="loading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appearance: null,
      appearanceId: ''
    }
  },
  
  onLoad(options) {
    this.appearanceId = options.id
    this.loadAppearance()
  },
  
  methods: {
    async loadAppearance() {
      try {
        const appearanceList = uni.getStorageSync('appearanceList') || []
        const appearance = appearanceList.find(item => item.id === this.appearanceId)
        
        if (appearance) {
          this.appearance = {
            ...appearance,
            photos: typeof appearance.photos === 'string' 
              ? JSON.parse(appearance.photos) 
              : appearance.photos,
            tags: typeof appearance.tags === 'string' 
              ? JSON.parse(appearance.tags) 
              : appearance.tags
          }
        } else {
          uni.showToast({
            title: '记录不存在',
            icon: 'error'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('加载形象记录失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      }
    },
    
    previewImage(index) {
      uni.previewImage({
        urls: this.appearance.photos,
        current: index
      })
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}年${month}月${day}日 ${hours}:${minutes}`
    },
    
    getRatingText(rating) {
      const texts = ['', '一般', '还行', '不错', '很好', '完美']
      return texts[rating] || ''
    },
    
    editAppearance() {
      // TODO: 实现编辑功能
      uni.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      })
    },
    
    async deleteAppearance() {
      try {
        const result = await uni.showModal({
          title: '确认删除',
          content: '删除后无法恢复，确定要删除这条记录吗？',
          confirmColor: '#FF6B6B'
        })
        
        if (result.confirm) {
          // 从本地存储中删除
          const appearanceList = uni.getStorageSync('appearanceList') || []
          const newList = appearanceList.filter(item => item.id !== this.appearanceId)
          uni.setStorageSync('appearanceList', newList)
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('删除失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    },
    
    shareAppearance() {
      // TODO: 实现分享功能
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.content {
  padding-bottom: 120rpx;
}

.photo-section {
  background: white;
  margin-bottom: 20rpx;
}

.photo-swiper {
  height: 600rpx;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.info-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.date {
  font-size: 24rpx;
  color: #999;
  white-space: nowrap;
}

.description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 25rpx;
}

.rating {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.rating-label {
  font-size: 28rpx;
  color: #333;
}

.star {
  font-size: 32rpx;
  color: #ddd;
}

.star.active {
  color: #FFD700;
}

.rating-text {
  font-size: 26rpx;
  color: #666;
  margin-left: 10rpx;
}

.tags-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.tag-group {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.tag-group:last-child {
  margin-bottom: 0;
}

.tag-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 15rpx;
  min-width: 80rpx;
}

.tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: white;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.tag.mood {
  background: #FF6B6B;
}

.tag.weather {
  background: #4ECDC4;
}

.tag.occasion {
  background: #45B7D1;
}

.tag.custom {
  background: #9B59B6;
}

.custom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.privacy-notice {
  background: #FFF3CD;
  border: 2rpx solid #FFEAA7;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx;
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.privacy-icon {
  font-size: 28rpx;
}

.privacy-text {
  font-size: 26rpx;
  color: #856404;
}

.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 2rpx solid #eee;
  padding: 20rpx;
  display: flex;
  gap: 15rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.edit-btn {
  background: #007AFF;
  color: white;
}

.delete-btn {
  background: #FF6B6B;
  color: white;
}

.share-btn {
  background: #28A745;
  color: white;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}
</style>
