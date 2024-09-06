import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers['X-Token'] = getToken();
      config.headers['Authorization'] = getToken()
    }

    return config
  },
  error => {
    // do something with request error
    console.log('request拦截器错误')
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor 接收
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    if (response.status !== 200) {
      throw new Error('网络响应不是 OK')
    }
    const contentType = response.headers['content-type']
    if (contentType.includes('application/json')) {
      const res = JSON.parse(response.data)
      // if the custom code is not 0, it is judged as an error.
      if (res.code !== 0) {
        Message({
          message: res.message || 'Error',
          type: 'error',
          duration: 3 * 1000
        })

        // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
        if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
          // to re-login
          MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
            confirmButtonText: 'Re-Login',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
          })
        }
        return Promise.reject(new Error(res.message || 'Error'))
      } else {
        return res
      }
    } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      // 处理 Blob 响应
      const blob = response.data // 直接使用 response.data（Blob 对象）L
      return blob // 返回 Blob
    }
  },
  error => {
    console.log('响应err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
