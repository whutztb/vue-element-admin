import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'https://7xp4019ui152.vicp.fun/get_user_list',
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: 'https://7xp4019ui152.vicp.fun/create_user',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: 'https://7xp4019ui152.vicp.fun/create_user',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: 'https://7xp4019ui152.vicp.fun/delete_user',
    method: 'post',
    data
  })
}
