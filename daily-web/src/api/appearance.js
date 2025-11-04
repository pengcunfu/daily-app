import request from '@/utils/request'

// 获取形象记录列表
export function getAppearances(params) {
  return request({
    url: '/appearances',
    method: 'get',
    params
  })
}

// 获取形象记录详情
export function getAppearanceDetail(id) {
  return request({
    url: `/appearances/${id}`,
    method: 'get'
  })
}

// 创建形象记录
export function createAppearance(data) {
  return request({
    url: '/appearances',
    method: 'post',
    data
  })
}

// 更新形象记录
export function updateAppearance(id, data) {
  return request({
    url: `/appearances/${id}`,
    method: 'put',
    data
  })
}

// 删除形象记录
export function deleteAppearance(id) {
  return request({
    url: `/appearances/${id}`,
    method: 'delete'
  })
}

// 获取统计数据
export function getAppearanceStats() {
  return request({
    url: '/appearances/stats/summary',
    method: 'get'
  })
}

// 上传形象照片
export function uploadAppearancePhotos(formData) {
  return request({
    url: '/upload/appearance',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传头像
export function uploadAvatar(formData) {
  return request({
    url: '/upload/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
