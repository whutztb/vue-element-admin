import request from '@/utils/request'

export function login(data) {
  return request({
    url: `${process.env.API_URL}/login`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      'user_id': data.username,
      'user_pwd': data.password
    })
  })
}

export function getInfo(token) {
  return request({
    url: `${process.env.API_URL}/getinfo`,
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: `${process.env.API_URL}/logout`,
    method: 'get'
  })
}
