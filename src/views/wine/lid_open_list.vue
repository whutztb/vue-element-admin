<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.jar_id" placeholder="陶坛ID" style="width: 180px;" class="filter-item" />
      <el-input v-model="listQuery.jar_pos" placeholder="缸位置" style="width: 180px;" class="filter-item" />
      <el-select v-model="listQuery.status" placeholder="选择状态" style="width: 180px;" class="filter-item">
        <el-option label="全部" value="" />
        <el-option label="已处理" value="已处理" />
        <el-option label="未处理" value="未处理" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" style="margin-right: 10px;" @click="showDialog = true">
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
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-document" @click="clearWarning">
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
      <el-table-column align="center" label="陶坛ID" min-width="135">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" label="陶坛位置" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" align="center" label="异动时间">
        <template slot-scope="scope">
          <span>{{ scope.row.open_time }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center" label="状态">
        <template slot-scope="scope">
          <span>{{ scope.row.deal_status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status!='deleted'&& row.deal_status === '未处理'" size="mini" type="primary" icon="el-icon-document" @click="handleWarning(row,$index)">
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

    <!--<el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="陶坛ID" prop="jar_id" label-width="150px">
          <el-input v-model="temp.jar_id" :readonly="readOnly" />
        </el-form-item>
        <el-form-item label="缸型" prop="jar_type" label-width="150px">
          <el-input v-model="temp.jar_type" />
        </el-form-item>
        <el-form-item label="缸位置" prop="jar_pos" label-width="150px">
          <el-input v-model="temp.jar_pos" />
        </el-form-item>
        <el-form-item label="缸高(mm)" prop="jar_height" label-width="150px">
          <el-input v-model="temp.jar_height" />
        </el-form-item>
        <el-form-item label="液位(mm)" prop="wine_level" label-width="150px">
          <el-input v-model="temp.wine_level" />
        </el-form-item>
        <el-form-item label="品名" prop="wine_name" label-width="150px">
          <el-input v-model="temp.wine_name" />
        </el-form-item>
        <el-form-item label="更新日期" prop="level_update_time" label-width="150px">
          <el-date-picker v-model="temp.level_update_time" type="datetime" placeholder="请选择日期" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>-->

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
import { fetchList, dealWarning, clearAllWarning, exportLidOpenList } from '@/api/wine_lid_open'
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
        status: ''
      },

      showReviewer: false,
      temp: {
        jar_id: undefined,
        jar_pos: '',
        deal_status: ''
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
      rules: {
        jar_id: [
          { required: true, message: '请输入陶坛ID', trigger: 'blur' }
        ],
        jar_type: [
          { required: true, message: '请输入陶坛名称', trigger: 'blur' }
        ],
        jar_pos: [
          { required: true, message: '请输入陶坛位置', trigger: 'blur' }
        ],
        jar_height: [
          { required: true, message: '请输入陶坛高度', trigger: 'blur' }
        ],
        wine_level: [
          { required: true, message: '请输入陶坛液位', trigger: 'blur' }
        ],
        wine_name: [
          { required: true, message: '请输入品名', trigger: 'blur' }
        ],
        level_update_time: [
          { required: true, message: '请输入液位陶坛更新时间', trigger: 'blur' }
        ]
      },
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
    EventBus.$on('updateLidOpenListUI', this.getList)
    this.getList()
  },
  mounted() {

  },
  beforeDestroy() {
    // 清除事件监听
    EventBus.$off('updateLidOpenListUI', this.getList)
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
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
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
        deal_status: ''

      }
    },
    clearWarning() {
      this.$confirm('确定清空告警, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        clearAllWarning().then(response => {
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
          message: '处理异常'
        })
      })
    },
    handleWarning(row, index) {
      this.$confirm('确定处理告警, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
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
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '处理异常'
        })
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
        const tHeader = ['陶坛ID', '陶坛位置', '异动时间', '状态']
        const filterVal = ['jar_id', 'jar_pos', 'open_time', 'deal_status']
        const data = this.formatJson(filterVal)

        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'current-page-lid-open-list'
        })
        this.downloadLoading = false
      })
    },
    exportAllPages() {
      this.downloadLoading = true // 开始下载时显示加载状态

      // 发起请求以获取 Excel 文件，传递查询参数
      exportLidOpenList(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = 'all-page-lid-open-list.xlsx' // 设置下载的文件名
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
