import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: `${process.env.API_URL}/get_device_list`,
    method: 'get',
    params: query
  })
}

export function createDevice(data) {
  return request({
    url: `${process.env.API_URL}/create_device`,
    method: 'post',
    data
  })
}

export function updateDevice(data) {
  return request({
    url: `${process.env.API_URL}/create_device`,
    method: 'post',
    data
  })
}

export function deleteDevice(data) {
  return request({
    url: `${process.env.API_URL}/delete_device`,
    method: 'post',
    data
  })
}
