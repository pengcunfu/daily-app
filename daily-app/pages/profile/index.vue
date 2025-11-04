<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-section">
      <view class="user-info">
        <image 
          :src="userInfo.avatar || '/static/default-avatar.png'" 
          class="avatar"
          mode="aspectFill"
        ></image>
        <view class="user-details">
          <text class="username">{{ userInfo.username || '未登录用户' }}</text>
          <text class="user-desc">{{ userInfo.email || '点击登录享受更多功能' }}</text>
        </view>
        <view class="login-btn" @click="handleLogin">
          <text class="login-text">{{ isLoggedIn ? '已登录' : '登录' }}</text>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ totalRecords }}</text>
        <text class="stat-label">总记录</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ thisMonthRecords }}</text>
        <text class="stat-label">本月记录</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ avgRating.toFixed(1) }}</text>
        <text class="stat-label">平均评分</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ continuousDays }}</text>
        <text class="stat-label">连续天数</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="goToDataManage">
          <view class="menu-icon">📊</view>
          <text class="menu-text">数据管理</text>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToSync">
          <view class="menu-icon">🔄</view>
          <text class="menu-text">数据同步</text>
          <view class="sync-status">
            <text class="sync-text">{{ syncStatus }}</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToBackup">
          <view class="menu-icon">💾</view>
          <text class="menu-text">数据备份</text>
          <text class="menu-arrow">></text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="goToSettings">
          <view class="menu-icon">⚙️</view>
          <text class="menu-text">设置</text>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToHelp">
          <view class="menu-icon">❓</view>
          <text class="menu-text">帮助与反馈</text>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToAbout">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view v-if="isLoggedIn" class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      appearanceList: [],
      isLoggedIn: false,
      syncStatus: '本地存储'
    }
  },
  
  computed: {
    totalRecords() {
      return this.appearanceList.length
    },
    
    thisMonthRecords() {
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
    },
    
    continuousDays() {
      // 计算连续记录天数
      if (this.appearanceList.length === 0) return 0
      
      const sortedList = this.appearanceList
        .map(item => new Date(item.createdAt).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a))
      
      let continuous = 1
      const today = new Date().toDateString()
      
      if (sortedList[0] !== today) return 0
      
      for (let i = 1; i < sortedList.length; i++) {
        const currentDate = new Date(sortedList[i])
        const prevDate = new Date(sortedList[i - 1])
        const diffDays = (prevDate - currentDate) / (1000 * 60 * 60 * 24)
        
        if (diffDays === 1) {
          continuous++
        } else {
          break
        }
      }
      
      return continuous
    }
  },
  
  onShow() {
    this.loadUserInfo()
    this.loadAppearanceData()
  },
  
  methods: {
    loadUserInfo() {
      // 从本地存储加载用户信息
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
        this.isLoggedIn = true
        this.syncStatus = '已同步'
      } else {
        this.userInfo = {}
        this.isLoggedIn = false
        this.syncStatus = '本地存储'
      }
    },
    
    loadAppearanceData() {
      // 加载形象记录数据
      const appearanceList = uni.getStorageSync('appearanceList') || []
      this.appearanceList = appearanceList
    },
    
    handleLogin() {
      if (this.isLoggedIn) {
        // 已登录，显示用户信息
        uni.showToast({
          title: '已登录',
          icon: 'success'
        })
      } else {
        // 未登录，跳转到登录页
        uni.navigateTo({
          url: '/pages/login/index'
        })
      }
    },
    
    async handleLogout() {
      try {
        const result = await uni.showModal({
          title: '确认退出',
          content: '退出登录后，数据将只保存在本地',
          confirmColor: '#FF6B6B'
        })
        
        if (result.confirm) {
          // 清除用户信息
          uni.removeStorageSync('userInfo')
          uni.removeStorageSync('token')
          
          this.userInfo = {}
          this.isLoggedIn = false
          this.syncStatus = '本地存储'
          
          uni.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
    
    goToDataManage() {
      uni.showActionSheet({
        itemList: ['导出数据', '导入数据', '清空数据'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.exportData()
              break
            case 1:
              this.importData()
              break
            case 2:
              this.clearData()
              break
          }
        }
      })
    },
    
    async exportData() {
      try {
        const data = {
          appearanceList: this.appearanceList,
          userInfo: this.userInfo,
          exportTime: new Date().toISOString()
        }
        
        // TODO: 实现数据导出功能
        uni.showToast({
          title: '导出功能开发中',
          icon: 'none'
        })
      } catch (error) {
        console.error('导出数据失败:', error)
      }
    },
    
    importData() {
      // TODO: 实现数据导入功能
      uni.showToast({
        title: '导入功能开发中',
        icon: 'none'
      })
    },
    
    async clearData() {
      try {
        const result = await uni.showModal({
          title: '确认清空',
          content: '清空后数据无法恢复，确定要清空所有数据吗？',
          confirmColor: '#FF6B6B'
        })
        
        if (result.confirm) {
          uni.removeStorageSync('appearanceList')
          this.appearanceList = []
          
          uni.showToast({
            title: '数据已清空',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('清空数据失败:', error)
      }
    },
    
    goToSync() {
      if (this.isLoggedIn) {
        // TODO: 实现数据同步功能
        uni.showToast({
          title: '同步功能开发中',
          icon: 'none'
        })
      } else {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
      }
    },
    
    goToBackup() {
      // TODO: 实现数据备份功能
      uni.showToast({
        title: '备份功能开发中',
        icon: 'none'
      })
    },
    
    goToSettings() {
      // TODO: 实现设置页面
      uni.showToast({
        title: '设置功能开发中',
        icon: 'none'
      })
    },
    
    goToHelp() {
      // TODO: 实现帮助页面
      uni.showToast({
        title: '帮助功能开发中',
        icon: 'none'
      })
    },
    
    goToAbout() {
      uni.showModal({
        title: 'DailyApp',
        content: '版本 1.0.0\n\n一个简单易用的形象管理应用\n记录每天的美好瞬间',
        showCancel: false
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

.user-section {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  padding: 60rpx 30rpx 40rpx;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-details {
  flex: 1;
}

.username {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.user-desc {
  font-size: 26rpx;
  opacity: 0.8;
}

.login-btn {
  padding: 15rpx 30rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.login-text {
  font-size: 26rpx;
}

.stats-section {
  background: white;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
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

.menu-section {
  margin: 20rpx;
}

.menu-group {
  background: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 30rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.sync-status {
  margin-right: 20rpx;
}

.sync-text {
  font-size: 24rpx;
  color: #999;
}

.menu-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.logout-section {
  margin: 40rpx 20rpx 20rpx;
}

.logout-btn {
  width: 100%;
  padding: 25rpx;
  background: #FF6B6B;
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 30rpx;
  font-weight: 500;
}
</style>
