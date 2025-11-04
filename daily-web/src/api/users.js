import request from '@/utils/request'

// 获取用户列表
export function getUserList() {
  return request({
    url: '/users',
    method: 'get'
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/users/profile',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
}

