import request from '@/utils/request'

export function exportPlanList(query) {
  return request({
    url: `${process.env.API_URL}/export_plan_list`,
    method: 'get',
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    params: query,
    responseType: 'blob' // 设置响应类型为 blob
  })
}

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
    url: `${process.env.API_URL}/update_plan`,
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
