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
  console.log('fetch jar_type list request')
  return request({
    url: `${process.env.API_URL}/get_jar_type_list`,
    method: 'get',
    params: query,
    timeout: 3000
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

export function importLevelVolume(formData) {
  return request({
    url: `${process.env.API_URL}/import_level_volume`,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  })
}

export function exportLevelVolume(jar_type_name) {
  return request({
    url: `${process.env.API_URL}/export_level_volume`,
    method: 'get',
    params: { jar_type_name },
    responseType: 'blob',
    timeout: 30000
  })
}

export function getLevelVolumeCurve(query) {
  return request({
    url: `${process.env.API_URL}/get_level_volume_curve`,
    method: 'get',
    params: query,
    timeout: 5000
  })
}

export function deleteLevelVolume(data) {
  return request({
    url: `${process.env.API_URL}/delete_level_volume`,
    method: 'post',
    data
  })
}

