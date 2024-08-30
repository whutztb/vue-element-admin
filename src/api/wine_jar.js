import request from '@/utils/request'

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
    url: `${process.env.API_URL}/create_jar`,
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
