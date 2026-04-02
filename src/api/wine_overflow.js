import request from '@/utils/request'

export function fetchList(query) {
  console.log('fetch overflow List request')
  return request({
    url: `${process.env.API_URL}/get_overflow_list`,
    method: 'get',
    params: query,
    timeout: 3000
  })
}

export function dealWarning(data) {
  return request({
    url: `${process.env.API_URL}/deal_overflow_warning`,
    method: 'post',
    data
  })
}

export function queryWarning(query) {
  return request({
    url: `${process.env.API_URL}/query_overflow_warning`,
    method: 'get',
    params: query
  })
}

export function clearAllWarning(data) {
  return request({
    url: `${process.env.API_URL}/clear_all_overflow_warning`,
    method: 'post',
    data
  })
}

export function exportOverflowList(query) {
  return request({
    url: `${process.env.API_URL}/export_overflow_list`,
    method: 'get',
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    params: query,
    responseType: 'blob', // 设置响应类型为 blob
    timeout: 30000 // 设置超时时间为 30 秒
  })
}
