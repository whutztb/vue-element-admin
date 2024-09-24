import request from '@/utils/request'

export function exportCellarList(query) {
  return request({
    url: `${process.env.API_URL}/export_cellar_list`,
    method: 'get',
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    params: query,
    responseType: 'blob', // 设置响应类型为 blob
    timeout: 30000 // 设置超时时间为 30 秒
  })
}

export function fetchList(query) {
  // console.log('fetch jar List request')
  return request({
    url: `${process.env.API_URL}/get_cellar_list`,
    method: 'get',
    params: query
  })
}

export function createCellar(data) {
  return request({
    url: `${process.env.API_URL}/create_cellar`,
    method: 'post',
    data
  })
}

export function updateCellar(data) {
  return request({
    url: `${process.env.API_URL}/update_cellar`,
    method: 'post',
    data
  })
}
export function deleteCellar(data) {
  return request({
    url: `${process.env.API_URL}/delete_cellar`,
    method: 'post',
    data
  })
}

export function getHistory(data) {
  return request({
    url: `${process.env.API_URL}/get_cellar_history`,
    method: 'post',
    data
  })
}

export function getStock() {
  return request({
    url: `${process.env.API_URL}/get_cellar_stock`,
    method: 'get'
  })
}

