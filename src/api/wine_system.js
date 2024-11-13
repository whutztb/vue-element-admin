import request from '@/utils/request'

export function setSystemSettings(data) {
  return request({
    url: `${process.env.API_URL}/set_system_settings`,
    method: 'post',
    data
  })
}

export function getSystemSettings() {
  return request({
    url: `${process.env.API_URL}/get_system_settings`,
    method: 'get'
  })
}

