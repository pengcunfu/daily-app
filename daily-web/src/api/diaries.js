import request from '@/utils/request'

// 获取日记列表
export function getDiaryList(params) {
  return request({
    url: '/diaries',
    method: 'get',
    params
  })
}

// 获取日记详情
export function getDiaryDetail(id) {
  return request({
    url: `/diaries/${id}`,
    method: 'get'
  })
}

// 创建日记
export function createDiary(data) {
  return request({
    url: '/diaries',
    method: 'post',
    data
  })
}

// 更新日记
export function updateDiary(id, data) {
  return request({
    url: `/diaries/${id}`,
    method: 'put',
    data
  })
}

// 删除日记
export function deleteDiary(id) {
  return request({
    url: `/diaries/${id}`,
    method: 'delete'
  })
}

// 获取日记统计
export function getDiaryStats() {
  return request({
    url: '/diaries/stats/summary',
    method: 'get'
  })
}

