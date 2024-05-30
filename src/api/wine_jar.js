import request from '@/utils/request'

export function fetchList(query) {
  console.log('fetch jar List request')
  console.log('query', query)
  return request({
    url: 'https://7xp4019ui152.vicp.fun/get_jar_list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createJar(data) {
  return request({
    url: 'https://7xp4019ui152.vicp.fun/create_jar',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}
