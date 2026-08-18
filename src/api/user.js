import request from '@/utils/request'

export function login(data) {
  console.log('login...')
  return request({
    url: `${process.env.API_URL}/login`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      'user_id': data.username,
      'user_pwd': data.password,
      'captcha_id': data.captcha_id,
      'captcha_code': data.captcha_code
    })
  })
}

export function getPublicKey() {
  return request({
    url: `${process.env.API_URL}/login_public_key`,
    method: 'get'
  })
}

export function getCaptcha() {
  return request({
    url: `${process.env.API_URL}/captcha`,
    method: 'get'
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
