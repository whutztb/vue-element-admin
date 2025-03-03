import request from '@/utils/request'

export function exportDeviceList(query) {
  return request({
    url: `${process.env.API_URL}/export_device_list`,
    method: 'get',
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    params: query,
    responseType: 'blob' // 设置响应类型为 blob
  })
}

export function fetchList(query) {
  console.log('fetch device List request')
  return request({
    url: `${process.env.API_URL}/get_device_list`,
    method: 'get',
    params: query,
    timeout: 3000
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
    url: `${process.env.API_URL}/update_device`,
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
