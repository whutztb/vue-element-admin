import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: `${process.env.API_URL}/get_plan_list`,
    method: 'get',
    params: query
  })
}

export function createPlan(data) {
  return request({
    url: `${process.env.API_URL}/create_plan`,
    method: 'post',
    data
  })
}

export function updatePlan(data) {
  console.log(data)
  return request({
    url: `${process.env.API_URL}/create_plan`,
    method: 'post',
    data
  })
}

export function deletePlan(data) {
  return request({
    url: `${process.env.API_URL}/delete_plan`,
    method: 'post',
    data
  })
}
