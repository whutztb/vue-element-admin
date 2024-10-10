import request from '@/utils/request'

export function exportJarList(query) {
  return request({
    url: `${process.env.API_URL}/export_jar_list`,
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
    url: `${process.env.API_URL}/get_jar_list`,
    method: 'get',
    params: query
  })
}

export function createJar(data) {
  return request({
    url: `${process.env.API_URL}/create_jar`,
    method: 'post',
    data
  })
}

export function updateJar(data) {
  // console.log("updateJar***",data)
  return request({
    url: `${process.env.API_URL}/update_jar`,
    method: 'post',
    data
  })
}
export function deleteJar(data) {
  return request({
    url: `${process.env.API_URL}/delete_jar`,
    method: 'post',
    data
  })
}

export function getHistory(data) {
  return request({
    url: `${process.env.API_URL}/get_jar_history`,
    method: 'post',
    data
  })
}

export function getTotalVolume(query) {
  return request({
    url: `${process.env.API_URL}/get_total_volume`,
    method: 'get',
    params: query
  })
}
