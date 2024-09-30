import { MessageBox } from 'element-ui'

class StartSSE {
  constructor() {
    this.events = []
    this.eventSource = null
  }

  async startSSE() {
    try {
      const response = await fetch(`${process.env.API_URL}/api/start-sse`)
      if (response.ok) {
        this.initializeEventSource()
      } else {
        console.error('Failed to start SSE:', response.statusText)
      }
    } catch (error) {
      console.error('Error starting SSE:', error)
    }
  }

  initializeEventSource() {
    console.log('initializeEventSource')
    this.eventSource = new EventSource(`${process.env.API_URL}/stream`)

    this.eventSource.onmessage = (event) => {
      console.log(event.data) // 处理接收到的事件
      // 解析外层 JSON
      const mainObj = JSON.parse(event.data)

      // 提取 jar_id 和 open_time
      const jarId = mainObj.jar_id
      const openTime = mainObj.open_time

      console.log(`Jar ID: ${jarId}, Open Time: ${openTime}`)

      MessageBox.alert(
        `陶坛ID: ${jarId}<br>开盖时间: ${openTime}`,
        '新消息',
        {
          confirmButtonText: '确定',
          type: 'warning',
          dangerouslyUseHTMLString: true // 允许使用 HTML
        }
      )
    }

    this.eventSource.onerror = (error) => {
      console.error('EventSource failed:', error)
      this.eventSource.close()
    }
  }
}

export default new StartSSE() // 导出实例
