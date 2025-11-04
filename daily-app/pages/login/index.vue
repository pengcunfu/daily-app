<template>
  <view class="container">
    <!-- 顶部装饰 -->
    <view class="header">
      <view class="logo-section">
        <text class="logo">📱</text>
        <text class="app-name">DailyApp</text>
        <text class="app-desc">记录每天的美好形象</text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <view class="form-container">
        <view class="tab-header">
          <text 
            class="tab-item"
            :class="{ active: currentTab === 'login' }"
            @click="currentTab = 'login'"
          >
            登录
          </text>
          <text 
            class="tab-item"
            :class="{ active: currentTab === 'register' }"
            @click="currentTab = 'register'"
          >
            注册
          </text>
        </view>

        <!-- 登录表单 -->
        <view v-if="currentTab === 'login'" class="form">
          <view class="form-item">
            <input 
              v-model="loginForm.email"
              class="form-input"
              type="text"
              placeholder="请输入邮箱"
              :maxlength="50"
            />
          </view>
          
          <view class="form-item">
            <input 
              v-model="loginForm.password"
              class="form-input"
              type="password"
              placeholder="请输入密码"
              :maxlength="20"
            />
          </view>
          
          <button 
            class="submit-btn"
            :class="{ disabled: !canLogin }"
            :disabled="!canLogin || loginLoading"
            @click="handleLogin"
          >
            {{ loginLoading ? '登录中...' : '登录' }}
          </button>
        </view>

        <!-- 注册表单 -->
        <view v-if="currentTab === 'register'" class="form">
          <view class="form-item">
            <input 
              v-model="registerForm.username"
              class="form-input"
              type="text"
              placeholder="请输入用户名"
              :maxlength="20"
            />
          </view>
          
          <view class="form-item">
            <input 
              v-model="registerForm.email"
              class="form-input"
              type="text"
              placeholder="请输入邮箱"
              :maxlength="50"
            />
          </view>
          
          <view class="form-item">
            <input 
              v-model="registerForm.password"
              class="form-input"
              type="password"
              placeholder="请输入密码（6位以上）"
              :maxlength="20"
            />
          </view>
          
          <view class="form-item">
            <input 
              v-model="registerForm.confirmPassword"
              class="form-input"
              type="password"
              placeholder="请确认密码"
              :maxlength="20"
            />
          </view>
          
          <button 
            class="submit-btn"
            :class="{ disabled: !canRegister }"
            :disabled="!canRegister || registerLoading"
            @click="handleRegister"
          >
            {{ registerLoading ? '注册中...' : '注册' }}
          </button>
        </view>

        <!-- 其他登录方式 -->
        <view class="other-login">
          <view class="divider">
            <text class="divider-text">或</text>
          </view>
          
          <button class="guest-btn" @click="continueAsGuest">
            游客模式继续使用
          </button>
          
          <text class="guest-tip">
            游客模式下数据仅保存在本地，登录后可同步到云端
          </text>
        </view>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <text class="footer-text">
        登录即表示同意《用户协议》和《隐私政策》
      </text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'login',
      loginLoading: false,
      registerLoading: false,
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  
  computed: {
    canLogin() {
      return this.loginForm.email.trim() && this.loginForm.password.trim()
    },
    
    canRegister() {
      return this.registerForm.username.trim() && 
             this.registerForm.email.trim() && 
             this.registerForm.password.length >= 6 &&
             this.registerForm.password === this.registerForm.confirmPassword
    }
  },
  
  onLoad() {
    // 检查是否已登录
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      // 已登录，直接返回
      uni.navigateBack()
    }
  },
  
  methods: {
    async handleLogin() {
      if (!this.canLogin || this.loginLoading) return
      
      this.loginLoading = true
      
      try {
        // TODO: 调用登录API
        // 这里先模拟登录成功
        await this.simulateLogin()
        
        const userInfo = {
          username: '用户' + Math.random().toString(36).substr(2, 4),
          email: this.loginForm.email,
          avatar: '',
          loginTime: new Date().toISOString()
        }
        
        // 保存用户信息
        uni.setStorageSync('userInfo', userInfo)
        uni.setStorageSync('token', 'mock-token-' + Date.now())
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: '登录失败',
          icon: 'error'
        })
      } finally {
        this.loginLoading = false
      }
    },
    
    async handleRegister() {
      if (!this.canRegister || this.registerLoading) return
      
      this.registerLoading = true
      
      try {
        // TODO: 调用注册API
        // 这里先模拟注册成功
        await this.simulateRegister()
        
        const userInfo = {
          username: this.registerForm.username,
          email: this.registerForm.email,
          avatar: '',
          registerTime: new Date().toISOString()
        }
        
        // 保存用户信息
        uni.setStorageSync('userInfo', userInfo)
        uni.setStorageSync('token', 'mock-token-' + Date.now())
        
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('注册失败:', error)
        uni.showToast({
          title: '注册失败',
          icon: 'error'
        })
      } finally {
        this.registerLoading = false
      }
    },
    
    continueAsGuest() {
      // 游客模式，直接返回
      uni.showToast({
        title: '继续使用游客模式',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    },
    
    // 模拟登录请求
    simulateLogin() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this.loginForm.email && this.loginForm.password) {
            resolve()
          } else {
            reject(new Error('登录信息不完整'))
          }
        }, 1000)
      })
    },
    
    // 模拟注册请求
    simulateRegister() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this.registerForm.username && this.registerForm.email && this.registerForm.password) {
            resolve()
          } else {
            reject(new Error('注册信息不完整'))
          }
        }, 1000)
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  display: flex;
  flex-direction: column;
}

.header {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx 60rpx;
}

.logo-section {
  text-align: center;
  color: white;
}

.logo {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.app-desc {
  font-size: 28rpx;
  opacity: 0.8;
}

.form-section {
  background: white;
  border-radius: 40rpx 40rpx 0 0;
  padding: 60rpx 40rpx 40rpx;
  min-height: 600rpx;
}

.form-container {
  max-width: 600rpx;
  margin: 0 auto;
}

.tab-header {
  display: flex;
  margin-bottom: 60rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 8rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 30rpx;
  color: #666;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background: white;
  color: #007AFF;
  font-weight: bold;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.form {
  margin-bottom: 60rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-input {
  width: 100%;
  padding: 25rpx 30rpx;
  border: 2rpx solid #eee;
  border-radius: 15rpx;
  font-size: 30rpx;
  background: #fafafa;
}

.form-input:focus {
  border-color: #007AFF;
  background: white;
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
  margin-top: 20rpx;
}

.submit-btn.disabled {
  background: #ccc;
  color: #999;
}

.other-login {
  text-align: center;
}

.divider {
  position: relative;
  margin: 40rpx 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2rpx;
  background: #eee;
}

.divider-text {
  background: white;
  padding: 0 30rpx;
  color: #999;
  font-size: 26rpx;
  position: relative;
}

.guest-btn {
  width: 100%;
  padding: 20rpx;
  background: transparent;
  color: #666;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.guest-tip {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.footer {
  padding: 30rpx 40rpx;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}
</style>
