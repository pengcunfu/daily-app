<template>
  <view class="container">
    <!-- 顶部欢迎区域 -->
    <view class="header">
      <view class="welcome">
        <text class="welcome-text">今日形象记录</text>
        <text class="date">{{ currentDate }}</text>
      </view>
      <view class="add-btn" @click="goToAdd">
        <text class="add-icon">+</text>
      </view>
    </view>

    <!-- 形象记录列表 -->
    <view class="content">
      <view v-if="appearanceList.length === 0" class="empty">
        <image class="empty-icon" src="/static/empty.png" mode="aspectFit"></image>
        <text class="empty-text">还没有形象记录</text>
        <text class="empty-desc">点击右上角 + 号添加今日形象</text>
      </view>
      
      <view v-else class="appearance-list">
        <view 
          v-for="item in appearanceList" 
          :key="item.id" 
          class="appearance-item"
          @click="goToDetail(item)"
        >
          <view class="item-images">
            <image 
              v-for="(photo, index) in item.photos.slice(0, 3)" 
              :key="index"
              :src="photo" 
              class="item-image"
              mode="aspectFill"
            ></image>
            <view v-if="item.photos.length > 3" class="more-count">
              +{{ item.photos.length - 3 }}
            </view>
          </view>
          
          <view class="item-content">
            <view class="item-header">
              <text class="item-title">{{ item.title }}</text>
              <text class="item-date">{{ formatDate(item.createdAt) }}</text>
            </view>
            
            <text class="item-desc">{{ item.description }}</text>
            
            <view class="item-tags">
              <text v-if="item.mood" class="tag mood">{{ item.mood }}</text>
              <text v-if="item.weather" class="tag weather">{{ item.weather }}</text>
              <text v-if="item.occasion" class="tag occasion">{{ item.occasion }}</text>
            </view>
            
            <view v-if="item.rating" class="item-rating">
              <text 
                v-for="n in 5" 
                :key="n" 
                class="star"
                :class="{ active: n <= item.rating }"
              >★</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部统计 -->
    <view class="stats">
      <view class="stat-item">
        <text class="stat-number">{{ appearanceList.length }}</text>
        <text class="stat-label">总记录</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ thisMonthCount }}</text>
        <text class="stat-label">本月</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ avgRating.toFixed(1) }}</text>
        <text class="stat-label">平均评分</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appearanceList: [],
      currentDate: '',
      loading: false
    }
  },
  
  computed: {
    thisMonthCount() {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      return this.appearanceList.filter(item => {
        const itemDate = new Date(item.createdAt)
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
      }).length
    },
    
    avgRating() {
      if (this.appearanceList.length === 0) return 0
      const totalRating = this.appearanceList.reduce((sum, item) => sum + (item.rating || 0), 0)
      return totalRating / this.appearanceList.length
    }
  },
  
  onLoad() {
    this.initCurrentDate()
    this.loadAppearanceList()
  },
  
  onShow() {
    // 页面显示时重新加载数据
    this.loadAppearanceList()
  },
  
  onPullDownRefresh() {
    this.loadAppearanceList()
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },
  
  methods: {
    initCurrentDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      this.currentDate = `${year}年${month}月${day}日`
    },
    
    async loadAppearanceList() {
      this.loading = true
      try {
        // 从本地存储加载数据
        const localData = uni.getStorageSync('appearanceList') || []
        this.appearanceList = localData.map(item => ({
          ...item,
          photos: typeof item.photos === 'string' ? JSON.parse(item.photos) : item.photos
        }))
        
        // TODO: 如果已登录，从服务器同步数据
        
      } catch (error) {
        console.error('加载形象记录失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    
    goToAdd() {
      uni.navigateTo({
        url: '/pages/appearance/add'
      })
    },
    
    goToDetail(item) {
      uni.navigateTo({
        url: `/pages/appearance/detail?id=${item.id}`
      })
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
}

.welcome-text {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.date {
  font-size: 24rpx;
  opacity: 0.8;
}

.add-btn {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 40rpx;
  font-weight: bold;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.empty {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
}

.appearance-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.appearance-item {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.item-images {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
}

.more-count {
  position: absolute;
  right: 10rpx;
  bottom: 10rpx;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.item-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.item-date {
  font-size: 24rpx;
  color: #999;
}

.item-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-tags {
  display: flex;
  gap: 10rpx;
  margin-bottom: 15rpx;
}

.tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: white;
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

.item-rating {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 28rpx;
  color: #ddd;
}

.star.active {
  color: #FFD700;
}

.stats {
  display: flex;
  background: white;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}
</style>