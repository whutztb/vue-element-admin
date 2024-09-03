import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: `${process.env.API_URL}/get_user_list`,
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: `${process.env.API_URL}/create_user`,
    method: 'post',
    data
  })
}

export function changePwd(data) {
  return request({
    url: `${process.env.API_URL}/change_pwd`,
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: `${process.env.API_URL}/create_user`,
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: `${process.env.API_URL}/delete_user`,
    method: 'post',
    data
  })
}
