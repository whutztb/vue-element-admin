import request from '@/utils/request'

export function exportInOutBoundList(query) {
  return request({
    url: `${process.env.API_URL}/export_in_out_bound_list`,
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
  return request({
    url: `${process.env.API_URL}/get_in_out_bound_list`,
    method: 'get',
    params: query
  })
}

export function getHistory(data) {
  return request({
    url: `${process.env.API_URL}/get_jar_history`,
    method: 'post',
    data
  })
}

export function getTotalInOutBound(query) {
  return request({
    url: `${process.env.API_URL}/get_total_in_out_bound`,
    method: 'get',
    params: query
  })
}
