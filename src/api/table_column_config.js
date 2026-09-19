import request from '@/utils/request'

// 获取指定页面的表格列配置
export function getColumnConfig(pageKey) {
  return request({
    url: `${process.env.API_URL}/get_table_column_config`,
    method: 'get',
    params: { page_key: pageKey }
  })
}

// 保存指定页面的表格列配置
export function saveColumnConfig(data) {
  return request({
    url: `${process.env.API_URL}/save_table_column_config`,
    method: 'post',
    data
  })
}
