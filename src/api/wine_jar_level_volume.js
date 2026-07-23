import request from '@/utils/request'

export function fetchJarLevelVolumeList(query) {
  return request({
    url: `${process.env.API_URL}/get_jar_level_volume_list`,
    method: 'get',
    params: query,
    timeout: 3000
  })
}

export function importJarLevelVolume(formData) {
  return request({
    url: `${process.env.API_URL}/import_jar_level_volume`,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  })
}

export function exportJarLevelVolume(jar_id) {
  return request({
    url: `${process.env.API_URL}/export_jar_level_volume`,
    method: 'get',
    params: { jar_id },
    responseType: 'blob',
    timeout: 30000
  })
}

export function getJarLevelVolumeCurve(query) {
  return request({
    url: `${process.env.API_URL}/get_jar_level_volume_curve`,
    method: 'get',
    params: query,
    timeout: 5000
  })
}

export function deleteJarLevelVolume(data) {
  return request({
    url: `${process.env.API_URL}/delete_jar_level_volume`,
    method: 'post',
    data
  })
}
