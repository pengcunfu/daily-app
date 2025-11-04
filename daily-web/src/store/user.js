import { defineStore } from 'pinia'
import { login, register } from '@/api/auth'
import { getUserInfo } from '@/api/users'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    permissions: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.username || '',
    userEmail: (state) => state.userInfo?.email || '',
    userAvatar: (state) => state.userInfo?.avatar || ''
  },

  actions: {
    // 登录
    async login(loginForm) {
      try {
        const response = await login(loginForm)
        const { accessToken, user } = response.data
        
        this.token = accessToken
        this.userInfo = user
        
        localStorage.setItem('token', accessToken)
        
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 注册
    async register(registerForm) {
      try {
        const response = await register(registerForm)
        const { accessToken, user } = response.data
        
        this.token = accessToken
        this.userInfo = user
        
        localStorage.setItem('token', accessToken)
        
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await getUserInfo()
        this.userInfo = response.data
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
      localStorage.removeItem('token')
    },

    // 更新用户信息
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo }
    }
  }
})
