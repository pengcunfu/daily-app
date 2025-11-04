import request from '@/utils/request'

// 获取好友列表
export function getFriendList(params) {
  return request({
    url: '/friends',
    method: 'get',
    params
  })
}

// 获取好友详情
export function getFriendDetail(id) {
  return request({
    url: `/friends/${id}`,
    method: 'get'
  })
}

// 创建好友
export function createFriend(data) {
  return request({
    url: '/friends',
    method: 'post',
    data
  })
}

// 更新好友
export function updateFriend(id, data) {
  return request({
    url: `/friends/${id}`,
    method: 'put',
    data
  })
}

// 删除好友
export function deleteFriend(id) {
  return request({
    url: `/friends/${id}`,
    method: 'delete'
  })
}

// 更新最后联系时间
export function updateLastContact(id) {
  return request({
    url: `/friends/${id}/contact`,
    method: 'patch'
  })
}

// 获取即将过生日的好友
export function getUpcomingBirthdays(days = 30) {
  return request({
    url: '/friends/stats/birthdays',
    method: 'get',
    params: { days }
  })
}

// 获取好友统计
export function getFriendStats() {
  return request({
    url: '/friends/stats/summary',
    method: 'get'
  })
}

