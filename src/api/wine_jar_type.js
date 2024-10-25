import request from '@/utils/request'

export function exportJarTypeList(query) {
  return request({
    url: `${process.env.API_URL}/export_jar_type_list`,
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
    url: `${process.env.API_URL}/get_jar_type_list`,
    method: 'get',
    params: query
  })
}

export function createJarType(data) {
  return request({
    url: `${process.env.API_URL}/create_jar_type`,
    method: 'post',
    data
  })
}

export function updateJarType(data) {
  return request({
    url: `${process.env.API_URL}/update_jar_type`,
    method: 'post',
    data
  })
}
export function deleteJarType(data) {
  return request({
    url: `${process.env.API_URL}/delete_jar_type`,
    method: 'post',
    data
  })
}

