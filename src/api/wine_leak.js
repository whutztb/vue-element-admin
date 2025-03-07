import request from '@/utils/request'

export function fetchList(query) {
  console.log('fetch leak List request')
  return request({
    url: `${process.env.API_URL}/get_leak_list`,
    method: 'get',
    params: query,
    timeout: 3000
  })
}

export function dealWarning(data) {
  return request({
    url: `${process.env.API_URL}/deal_leak_warning`,
    method: 'post',
    data
  })
}

export function queryWarning() {
  return request({
    url: `${process.env.API_URL}/query_leak_warning`,
    method: 'get'
  })
}

export function clearAllWarning(data) {
  return request({
    url: `${process.env.API_URL}/clear_all_leak_warning`,
    method: 'post',
    data
  })
}

export function exportLeakList(query) {
  return request({
    url: `${process.env.API_URL}/export_leak_list`,
    method: 'get',
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    params: query,
    responseType: 'blob', // 设置响应类型为 blob
    timeout: 30000 // 设置超时时间为 30 秒
  })
}
