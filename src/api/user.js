import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'https://7xp4019ui152.vicp.fun/login',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      'user_name': data.username,
      'user_pwd': data.password
    })
  })
}

export function getInfo(token) {
  console.log('getInfo request')
  return request({
    url: 'https://7xp4019ui152.vicp.fun/getinfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: 'https://7xp4019ui152.vicp.fun/logout',
    method: 'get'
  })
}
