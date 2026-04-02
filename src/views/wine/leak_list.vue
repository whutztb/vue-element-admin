<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.jar_id" placeholder="大罐ID" style="width: 180px;" class="filter-item" />
      <el-input v-model="listQuery.jar_pos" placeholder="大罐位置" style="width: 180px;" class="filter-item" />
      <el-select v-model="listQuery.deal_status" placeholder="选择状态" style="width: 180px;" class="filter-item">
        <el-option label="全部" value="" />
        <el-option label="已处理" value="已处理" />
        <el-option label="未处理" value="未处理" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" style="margin-right: 10px;" @click="exportAllPages">
        导出
      </el-button>
      <el-dialog
        title="导出选项"
        :visible.sync="showDialog"
        width="30%"
        :before-close="handleClose"
      >
        <div>
          <el-button type="primary" @click="handleDownload('current')">导出当前页</el-button>
          <el-button type="primary" @click="handleDownload('all')">导出全部</el-button>
          <el-button @click="showDialog = false">取消</el-button>
        </div>
      </el-dialog>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-circle-close" @click="clearWarning">
        清空告警
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column align="center" label="大罐ID" min-width="135">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" label="大罐位置" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="70px" label="编号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_no }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="125px" align="center" label="渗漏时间">
        <template slot-scope="scope">
          <span>{{ scope.row.leak_time }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60px" align="center">
        <template slot="header">
          <span>渗漏量<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.leak_height }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="70px" align="center" label="状态">
        <template slot-scope="scope">
          <span>{{ scope.row.deal_status }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="125px" align="center" label="处理时间">
        <template slot-scope="scope">
          <span>{{ scope.row.deal_time }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="处理用户">
        <template slot-scope="scope">
          <span>{{ scope.row.deal_person }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center" label="处理说明">
        <template slot-scope="scope">
          <span>{{ scope.row.deal_desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="80" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.deal_status!='deleted'&& row.deal_status === '未处理'" size="mini" type="primary" icon="el-icon-document" @click="handleWarning(row,$index)">
            处理告警
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="showChart" :title="chartTitle" width="650px" :styles="{ height: '300px' }" class="custom-dialog">
      <div ref="chartContainer" class="chart-container" :style="{ height: '300px', width: '100%' }" />
    </el-dialog>
    <!--<history_chart v-if="historyData.length" :historyData="historyData" />-->

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, dealWarning, clearAllWarning, exportLeakList, queryWarning } from '@/api/wine_leak'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { EventBus } from '@/utils/eventBus'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        jar_id: '',
        jar_pos: '',
        deal_desc: '',
        deal_status: ''
      },

      showReviewer: false,
      temp: {
        jar_id: undefined,
        jar_pos: '',
        jar_no: '',
        leak_time: '',
        leak_height: '',
        deal_status: '',
        deal_time: '',
        deal_desc: '',
        deal_person: ''
      },
      readOnly: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogPvVisible: false,
      pvData: [],
      downloadLoading: false,
      showDialog: false,
      showChart: false,
      chartTitle: '',
      className: 'chart',
      historyData: [], // 初始化为空数组
      lidOpenData: [], // 初始化为空数组
      volHistoryData: []
      // socket: null  // 定义 socket 实例
    }
  },
  watch: {

  },
  created() {
    // 监听 EventBus 事件
    if (window.EventBus) {
      window.EventBus.$on('updateLeakListUI', this.getList)
    } else {
      console.error('全局 EventBus 未找到，使用局部 EventBus')
      EventBus.$on('updateLeakListUI', this.getList)
    }
    this.getList()
  },
  mounted() {

  },
  beforeDestroy() {
    // 清除事件监听
    if (window.EventBus) {
      window.EventBus.$on('updateLeakListUI', this.getList)
    } else {
      console.error('全局 EventBus 未找到，使用局部 EventBus')
      EventBus.$on('updateLeakListUI', this.getList)
    }
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    getList() {
      // console.log("jar listQuery",this.listQuery)
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.items
        this.total = response.total_count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, deal_status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.deal_status = deal_status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        jar_id: undefined,
        jar_pos: '',
        jar_no: '',
        leak_time: '',
        leak_height: '',
        deal_status: '',
        deal_time: '',
        deal_desc: '',
        deal_person: ''
      }
    },
    async clearWarning() {
      const response = await queryWarning(this.listQuery) // 等待 Promise 解析完成
      const warningCount = parseInt(response.warning_num, 10) // 提取 warning_num 属性的值，并转换为整数

      // 如果告警数量为 0，提示用户无需清空
      if (warningCount === 0) {
        this.$message({
          message: '当前查询条件没有告警，无需清空',
          type: 'info'
        })
        return // 直接返回，不执行后面的代码
      }

      this.$prompt('请输入处理说明', '处理告警', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入处理描述',
        inputPattern: /.+/, // 确保用户必须输入内容
        inputErrorMessage: '处理描述不能为空'
      }).then(({ value }) => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从 0 开始，需要加 1
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')

        const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        clearAllWarning({ deal_time: formattedTime, deal_desc: value, jar_pos: this.listQuery.jar_pos, jar_id: this.listQuery.jar_id }).then(response => {
          this.$notify({
            title: '操作成功',
            message: '处理成功',
            type: 'success',
            duration: 2000
          })
          this.getList() // 调用 getList 方法以刷新数据
        }).catch(error => {
          console.error('处理失败:', error)
          this.$notify({
            title: '错误',
            message: '处理失败',
            type: 'error',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消处理/处理异常'
        })
      })
    },
    handleWarning(row, index) {
      this.$prompt('请输入处理说明', '处理告警', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入处理描述',
        inputPattern: /.+/, // 确保用户必须输入内容
        inputErrorMessage: '处理描述不能为空'
      }).then(({ value }) => {
        row.deal_desc = value
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从 0 开始，需要加 1
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')

        const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        row.deal_time = formattedTime
        dealWarning(row).then(response => {
          this.$notify({
            title: '操作成功',
            message: '处理成功',
            type: 'success',
            duration: 2000
          })
          this.getList() // 调用 getList 方法以刷新数据
          this.list.splice(index, 1)
        }).catch(error => {
          console.error('处理失败:', error)
          this.$notify({
            title: '错误',
            message: '处理失败',
            type: 'error',
            duration: 2000
          })
        })
      }).catch((err) => {
        if (err === 'cancel') {
          this.$message({
            type: 'info',
            message: '取消处理'
          })
        } else {
          this.$message({
            type: 'info',
            message: '处理异常'
          })
        }
      })
    },
    handleDownload(type) {
      this.showDialog = false // 关闭弹窗
      this.downloadLoading = true // 开始下载
      if (type === 'current') {
        // 用户选择导出当前页
        this.exportCurrentPage()
      } else if (type === 'all') {
        // 用户选择导出所有页
        this.exportAllPages()
      }
    },
    handleClose(done) {
      // 可以在这里添加关闭弹窗时的逻辑
      done()
    },
    exportCurrentPage() {
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['大罐ID', '大罐位置', '渗漏时间', '状态']
        const filterVal = ['jar_id', 'jar_pos', 'leak_time', 'deal_status']
        const data = this.formatJson(filterVal)

        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'current-page-leak-list'
        })
        this.downloadLoading = false
      })
    },
    exportAllPages() {
      this.downloadLoading = true // 开始下载时显示加载状态

      // 发起请求以获取 Excel 文件，传递查询参数
      exportLeakList(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = '渗漏列表.xlsx' // 设置下载的文件名
          document.body.appendChild(a) // 将链接添加到文档
          a.click() // 模拟点击
          a.remove() // 下载后移除链接
          window.URL.revokeObjectURL(url) // 释放 Blob URL
        })
        .catch(error => {
          console.error('导出数据时出错:', error)
        })
        .finally(() => {
          this.downloadLoading = false // 确保下载完成后隐藏加载状态
        })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
