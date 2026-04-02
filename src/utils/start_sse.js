import { MessageBox } from 'element-ui'
import { EventBus } from './eventBus' // 导入 EventBus

class StartSSE {
  constructor() {
    this.events = []
    this.eventSource = null
  }

  async startSSE() {
    try {
      // 直接初始化 EventSource
      this.initializeEventSource()
      console.log('SSE connection initialized')
    } catch (error) {
      console.error('Error starting SSE:', error)
    }
  }

  initializeEventSource() {
    // 检查是否已经存在 EventSource 且处于活跃状态
    if (this.eventSource) {
      console.log('SSE connection already active. No need to reinitialize.')
      return // 直接返回，不重新初始化
    }

    console.log('Initialize Event Source')
    this.eventSource = new EventSource(`${process.env.API_URL}/stream_demo`)

    this.eventSource.onmessage = (event) => {
      // 解析外层 JSON
      const mainObj = JSON.parse(event.data)
      // 提取 msg_type
      const msg_type = mainObj.msg_type
      if (msg_type === 'open_lid') {
        const jarId = mainObj.jar_id
        const openTime = mainObj.open_time
        const beepTime = parseFloat(mainObj.beepTime)
        const popupAlarm = parseInt(mainObj.popupAlarm)
        if (popupAlarm === 1) {
          MessageBox.alert(
            `大罐ID: ${jarId}<br>开盖时间: ${openTime}`,
            '大罐异常开罐提示',
            {
              confirmButtonText: '确定',
              type: 'warning',
              dangerouslyUseHTMLString: true // 允许使用 HTML
            }

          )
        }

        // 发出声音报警
        this.playAlarmSound(beepTime)

        EventBus.$emit('updateLidOpenListUI')
      } else if (msg_type === 'new_record') {
        // const jarId = mainObj.jar_id
        // const rec_lv = mainObj.rec_lv
        // MessageBox.alert(
        //   `大罐ID: ${jarId}<br>当前液位（mm）: ${rec_lv}`,
        //   '大罐信息采集提示',
        //   {
        //     confirmButtonText: '确定',
        //     type: 'info',
        //     dangerouslyUseHTMLString: true // 允许使用 HTML
        //   }
        // )

        // 发送事件到 EventBus
        EventBus.$emit('updateJarListUI')
      } else if (msg_type === 'leak_wine') {
        const popupAlarm = parseInt(mainObj.popupAlarm)
        if (popupAlarm === 1) {
          MessageBox.alert(
            `大罐ID: ${mainObj.jar_id}<br>渗漏液位（mm）: ${mainObj.leak_height}<br>上次记录时间: ${mainObj.last_time}`,
            '大罐泄露风险提示',
            {
              confirmButtonText: '确定',
              type: 'info',
              dangerouslyUseHTMLString: true // 允许使用 HTML
            }
          )
        }

        const beepTime = parseFloat(mainObj.beepTime)
        // 发出声音报警
        this.playAlarmSound(beepTime)
      } else if (msg_type === 'overflow_wine') {
        const popupAlarm = parseInt(mainObj.popupAlarm)
        if (popupAlarm === 1) {
          MessageBox.alert(
            `ID: ${mainObj.jar_id}<br>当前净空（mm）: ${mainObj.air_height}<br>溢出阈值（mm）: ${mainObj.overflowThreshold}`,
            '溢出风险提示',
            {
              confirmButtonText: '确定',
              type: 'info',
              dangerouslyUseHTMLString: true // 允许使用 HTML
            }
          )
        }

        const beepTime = parseFloat(mainObj.beepTime)
        // 发出声音报警
        this.playAlarmSound(beepTime)
      }
    }

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      this.handleConnectionError()
    }

    this.eventSource.onopen = () => {
      console.log('SSE connection opened')
    }
  }
  // 动态生成并播放报警声音
  playAlarmSound(beepTime) {
    // 创建一个 AudioContext 实例
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // 创建一个振荡器节点（OscillatorNode），用于生成声音
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'square' // 设置波形类型为方波，产生类似“嘟嘟”声的效果
    oscillator.frequency.value = 1000 // 设置频率Hz

    // 创建一个增益节点（GainNode），用于控制音量
    const gainNode = audioContext.createGain()
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime) // 设置音量为0.5

    // 将振荡器连接到增益节点，再连接到音频上下文的输出
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // 开始播放声音
    oscillator.start(audioContext.currentTime)

    // 声音持续一段时间后停止
    oscillator.stop(audioContext.currentTime + beepTime) // 持续30秒
  }
  handleConnectionError() {
    // 实现重连机制
    console.warn('Attempting to reconnect...')
    setTimeout(() => {
      this.initializeEventSource()
    }, 5000) // 5秒后重连
  }
  closeSSE() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null // 释放引用
      console.log('SSE connection closed')
    }
  }
}

export default new StartSSE() // 导出实例

