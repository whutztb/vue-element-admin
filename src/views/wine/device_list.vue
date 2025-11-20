<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.device_id" placeholder="设备ID" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.device_name" placeholder="设备名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <!--<el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="exportAllPages">
        导出
      </el-button>-->
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
      <el-table-column align="center" label="设备ID" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.device_id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="70px" align="center" label="设备名称">
        <template slot-scope="scope">
          <span>{{ scope.row.device_name }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column min-width="140px" label="物联卡号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.card_num }}</span>
        </template>
      </el-table-column>-->
      <el-table-column min-width="90px" label="信号质量" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.signal_quality }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center">
        <template slot="header">
          <span>起始距离<br>(mm))</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.distance_start }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center">
        <template slot="header">
          <span>终止距离<br>(mm))</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.distance_end }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" label="测量模式" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.peak_sorting === 0 ? '距离优先' : scope.row.peak_sorting === 1 ? '强度优先' : scope.row.peak_sorting }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column min-width="150px" align="center" label="到期时间">
        <template slot-scope="scope">
          <span>{{ scope.row.expiration_time }}</span>
        </template>
      </el-table-column>-->
      <el-table-column label="" align="center" min-width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="设备ID" prop="device_id" label-width="150px">
          <el-input v-model="temp.device_id" :readonly="readOnly" />
        </el-form-item>
        <el-form-item label="设备名称" prop="device_name" label-width="150px">
          <el-input v-model="temp.device_name" />
        </el-form-item>
        <el-form-item label="卡号" prop="card_num" label-width="150px">
          <el-input v-model="temp.card_num" />
        </el-form-item>
        <el-form-item label="信号质量" prop="signal_quality" label-width="150px">
          <el-input
            v-model.number="temp.signal_quality"
            type="number"
            :min="-10"
            :max="35"
            oninput="if(value<-10)value=-10;if(value>35)value=35;if(value.indexOf('.')>=0)value=value.slice(0,value.indexOf('.'))"
          />
        </el-form-item>
        <el-form-item label="起始距离（mm）" prop="distance_start" label-width="150px">
          <el-input
            v-model.number="temp.distance_start"
            type="number"
            :min="50"
            :max="22500"
            placeholder="请输入50-22500的整数"
            @blur="handleDistanceEndBlur"
          />
        </el-form-item>
        <el-form-item label="终止距离（mm）" prop="distance_end" label-width="150px">
          <el-input
            v-model.number="temp.distance_end"
            type="number"
            :min="50"
            :max="22500"
            placeholder="请输入50-22500的整数"
            @blur="handleDistanceEndBlur"
          />
        </el-form-item>
        <el-form-item label="测量模式" prop="peak_sorting" label-width="150px">
          <el-select v-model.number="temp.peak_sorting" placeholder="请选择测量模式">
            <el-option label="距离优先" :value="0" />
            <el-option label="强度优先" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间" prop="expiration_time" label-width="150px">
          <el-date-picker v-model="temp.expiration_time" type="datetime" placeholder="请选择日期" />
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
    </el-dialog>

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
import { fetchList, deleteDevice, createDevice, updateDevice, exportDeviceList } from '@/api/wine_device'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

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
        device_name: '',
        device_id: ''
      },

      showReviewer: false,
      temp: {
        device_id: undefined,
        device_name: '',
        card_num: '',
        signal_quality: '',
        distance_start: '',
        distance_end: '',
        peak_sorting: '',
        expiration_time: ''
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
        device_id: [
          { required: true, message: '请输入设备ID', trigger: 'blur' }
        ],
        device_name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        card_num: [
          { required: true, message: '请输卡号', trigger: 'blur' }
        ],
        signal_quality: [
          { required: true, message: '请输入信号质量', trigger: 'blur' },
          { type: 'number', message: '信号质量必须为数字值' },
          { type: 'number', min: -10, max: 35, message: '信号质量范围-10-35' }
        ],
        distance_start: [
          { required: true, message: '请输入起始距离', trigger: 'blur' },
          { type: 'number', message: '起始距离必须为数字值' },
          { type: 'number', min: 50, max: 22500, message: '起始距离范围50-22500' }
        ],
        distance_end: [
          { required: true, message: '请输入终止距离', trigger: 'blur' },
          { type: 'number', message: '终止距离必须为数字值' },
          { type: 'number', min: 50, max: 22500, message: '终止距离范围50-22500' }
        ],
        expiration_time: [
          { required: true, message: '请输入到期时间', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      showDialog: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleDistanceEndBlur(event) {
      let value = event.target.value

      if (value === '' || value === null || value === undefined) {
        // 允许为空，或者设置为默认值
        this.temp.distance_end = 50 // 或者保持为空 this.temp.distance_end = null
        return
      }

      // 转换为数字
      value = Number(value)

      // 处理小数
      if (String(value).indexOf('.') >= 0) {
        value = Math.floor(value)
      }

      // 范围限制
      if (value < 50) value = 50
      if (value > 22500) value = 22500

      this.temp.distance_end = value
    },

    getList() {
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
        device_id: undefined,
        device_name: '',
        card_num: '',
        signal_quality: '',
        distance_start: '',
        distance_end: '',
        peak_sorting: '',
        expiration_time: ''
      }
    },
    handleCreate() {
      this.readOnly = false
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const date = new Date(this.temp.expiration_time)
          const formattedDateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
          this.temp.expiration_time = formattedDateTime
          createDevice(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.getList() // 调用 getList 方法以刷新数据
            this.$notify({
              title: '操作成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.readOnly = true
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 格式化日期（将Wed May 01 2024 16:15:23 GMT+0800 (中国标准时间)格式化为2024-05-01 16:15:23）
          const date = new Date(this.temp.expiration_time)
          const formattedDateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
          this.temp.expiration_time = formattedDateTime
          const tempData = Object.assign({}, this.temp)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateDevice(tempData).then(() => {
            const index = this.list.findIndex(v => v.device_id === this.temp.device_id)
            this.list.splice(index, 1, this.temp)

            this.dialogFormVisible = false

            this.$notify({
              title: '操作成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定删除该陶坛, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDevice(row).then(response => {
          this.$notify({
            title: '操作成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const currentPage = this.listQuery.page
          if (currentPage > 1) {
            this.total -= 1
            if (this.total > (currentPage - 1) * this.listQuery.limit) {
              this.listQuery.page = currentPage
              this.getList()
            } else {
              this.listQuery.page = currentPage - 1
              this.getList()
            }
          } else {
            this.getList()
          }
        }).catch(error => {
          console.error('删除失败:', error)
          this.$notify({
            title: '错误',
            message: '删除失败',
            type: 'error',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '删除异常'
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
        const tHeader = ['设备ID', '设备名称', '物联卡号', '到期时间']
        const filterVal = ['device_id', 'device_name', 'card_num', 'expiration_time']
        const data = this.formatJson(filterVal)

        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'current-page-device-list'
        })
        this.downloadLoading = false
      })
    },
    exportAllPages() {
      this.downloadLoading = true // 开始下载时显示加载状态

      // 发起请求以获取 Excel 文件，传递查询参数
      exportDeviceList(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = '设备列表.xlsx' // 设置下载的文件名
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
