<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'App',

  mounted() {
    // 应用启动时检查登录状态并启动轮询查询后端数据库及消息
    this.checkAndStartPolling()

    // 监听路由变化
    this.$router.afterEach((to, from) => {
      // 如果切换到登录页，停止轮询
      if (to.path === '/login') {
        this.$messagePoller.stop()
      }
      // 如果从登录页跳转到其他页面，启动轮询
      if (from.path === '/login' && to.path !== '/login') {
        this.checkAndStartPolling()
      }
    })
  },

  beforeDestroy() {
    // 应用销毁时停止轮询
    this.$messagePoller.stop()
  },

  methods: {
    checkAndStartPolling() {
      const token = getToken()
      if (token) {
        // console.log('检测到用户已登录，启动轮询')
        // 延迟启动，确保页面完全加载
        setTimeout(() => {
          this.$messagePoller.start()
        }, 1000)
      } else {
        // console.log('用户未登录，不启动轮询')
      }
    }
  }
}
</script>
