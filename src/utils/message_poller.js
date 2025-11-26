import { MessageBox } from 'element-ui'
import request from '@/utils/request' // 使用项目自带的request

class MessagePoller {
  constructor(eventBus) {
    this.eventBus = eventBus
    this.isPolling = false
    this.pollInterval = 10000 // 10秒轮询
    this.lastTimestamp = 0
    this.retryCount = 0
    this.maxRetries = 3
    this.intervalId = null
  }

  start() {
    if (this.isPolling) return

    this.isPolling = true
    this.poll()
    console.log('start poll')
    this.intervalId = setInterval(() => {
      this.poll()
    }, this.pollInterval)
  }

  stop() {
    this.isPolling = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  async poll() {
    if (!this.isPolling) return

    try {
      const response = await request({
        url: `${process.env.API_URL}/api/poll_messages`,
        method: 'get',
        params: {
          since: this.lastTimestamp
        },
        timeout: 5000
      })

      // 检查响应结构
      if (response && typeof response === 'object') {
        if (response.has_update) {
          // console.log('收到新消息:', response.data)
          this.handleMessage(response.data)
          this.lastTimestamp = response.timestamp
          localStorage.setItem('lastMessageTimestamp', this.lastTimestamp.toString())
          this.retryCount = 0
        } else {
          // 正常情况：没有新消息
        }
      } else {
        console.warn('响应格式异常:', response)
        throw new Error('响应格式异常')
      }
    } catch (error) {
      console.error('轮询错误:', error)

      // 更详细的错误信息
      if (error.response) {
        // 服务器响应了错误状态码
        console.error('服务器响应错误:', error.response.status, error.response.data)
      } else if (error.request) {
        // 请求发送但没有收到响应
        console.error('网络错误，未收到响应')
      } else {
        // 其他错误
        console.error('其他错误:', error.message)
      }

      this.retryCount++

      if (this.retryCount >= this.maxRetries) {
        console.error('达到最大重试次数，停止轮询')
        this.stop()

        // Message({
        //   message: '实时连接异常，请刷新页面',
        //   type: 'error',
        //   duration: 5000
        // })
      }
    }
  }

  handleMessage(messageData) {
    try {
      // 首先解析 JSON 字符串
      let parsedData
      if (typeof messageData === 'string') {
        parsedData = JSON.parse(messageData)
      } else {
        parsedData = messageData // 如果已经是对象，直接使用
      }

      const msg_type = parsedData.msg_type

      if (msg_type === 'open_lid') {
        const jarId = parsedData.jar_id
        const openTime = parsedData.open_time
        const beepTime = parseFloat(parsedData.beepTime)
        const popupAlarm = parseInt(parsedData.popupAlarm)

        // console.log('开盖报警数据:', { jarId, openTime, beepTime, popupAlarm });

        if (popupAlarm === 1) {
          // console.log('触发弹窗');
          MessageBox.alert(
            `陶坛ID: ${jarId}<br>开盖时间: ${openTime}`,
            '陶坛异常开缸提示',
            {
              confirmButtonText: '确定',
              type: 'warning',
              dangerouslyUseHTMLString: true
            }
          ).then(() => {
            // console.log('弹窗已确认');
          }).catch(() => {
            // console.log('弹窗已取消');
          })
        } else {
          // console.log('popupAlarm 不是 1，不弹窗');
        }

        // 发出声音报警
        this.playAlarmSound(beepTime)

        // 发送事件到 EventBus
        if (window.EventBus) {
          window.EventBus.$emit('updateLidOpenListUI')
        }
      } else if (msg_type === 'new_record') {
        if (window.EventBus) {
          window.EventBus.$emit('updateJarListUI')
        }
      } else if (msg_type === 'leak_wine') {
        const popupAlarm = parseInt(parsedData.popupAlarm)
        if (popupAlarm === 1) {
          MessageBox.alert(
            `陶坛ID: ${parsedData.jar_id}<br>渗漏液位（mm）: ${parsedData.leak_height}<br>上次记录时间: ${parsedData.last_time}`,
            '陶坛泄露风险提示',
            {
              confirmButtonText: '确定',
              type: 'info',
              dangerouslyUseHTMLString: true
            }
          )
        }

        const beepTime = parseFloat(parsedData.beepTime)
        this.playAlarmSound(beepTime)
        // 发送事件到 EventBus
        if (window.EventBus) {
          window.EventBus.$emit('updateLeakListUI')
          // 渗漏时同时更新数据
          window.EventBus.$emit('updateJarListUI')
        }
      } else if (msg_type === 'overflow_wine') {
        // console.log('收到溢出消息');
        const popupAlarm = parseInt(parsedData.popupAlarm)
        if (popupAlarm === 1) {
          MessageBox.alert(
            `ID: ${parsedData.jar_id}<br>当前净空（mm）: ${parsedData.air_height}<br>溢出阈值（mm）: ${parsedData.overflowThreshold}`,
            '溢出风险提示',
            {
              confirmButtonText: '确定',
              type: 'info',
              dangerouslyUseHTMLString: true
            }
          )
        }

        const beepTime = parseFloat(parsedData.beepTime)
        this.playAlarmSound(beepTime)
      } else {
        console.log('未知消息类型:', msg_type)
      }
    } catch (error) {
      console.error('处理消息时出错:', error)
      console.error('原始消息数据:', messageData)
    }
  }

  playAlarmSound(beepTime) {
    // 您原有的声音播放逻辑
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'square'
    oscillator.frequency.value = 1000

    const gainNode = audioContext.createGain()
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + beepTime)
  }
}

// 创建全局实例
const messagePoller = new MessagePoller()
export default messagePoller
