import { MessageBox } from 'element-ui'
import { EventBus } from './eventBus' // 导入 EventBus

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

      // 提取 msg_type
      const msg_type = mainObj.msg_type
      if (msg_type === 'open_lid') {
        const jarId = mainObj.jar_id
        const openTime = mainObj.open_time
        MessageBox.alert(
          `陶坛ID: ${jarId}<br>开盖时间: ${openTime}`,
          '陶坛异常开缸提示',
          {
            confirmButtonText: '确定',
            type: 'warning',
            dangerouslyUseHTMLString: true // 允许使用 HTML
          }

        )
        EventBus.$emit('updateLidOpenListUI')
      } else if (msg_type === 'new_record') {
        /*
        const jarId = mainObj.jar_id
        const rec_lv = mainObj.rec_lv
        MessageBox.alert(
          `陶坛ID: ${jarId}<br>当前液位（mm）: ${rec_lv}`,
          '陶坛信息采集提示',
          {
            confirmButtonText: '确定',
            type: 'info',
            dangerouslyUseHTMLString: true // 允许使用 HTML
          }
        )*/
        // 发送事件到 EventBus
        EventBus.$emit('updateJarListUI')
      } else if (msg_type === 'wine_leak') {
        MessageBox.alert(
          `陶坛ID: ${mainObj.jar_id}<br>当前液位（mm）: ${mainObj.this_lv}<br>上次液位（mm）: ${mainObj.last_lv}<br>上次记录时间: ${mainObj.last_time}`,
          '陶坛泄露风险提示',
          {
            confirmButtonText: '确定',
            type: 'info',
            dangerouslyUseHTMLString: true // 允许使用 HTML
          }
        )
      }
    }

    this.eventSource.onerror = (error) => {
      console.error('EventSource failed:', error)
      this.eventSource.close()
    }
  }
}

export default new StartSSE() // 导出实例
