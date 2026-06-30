<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.jar_type_name" placeholder="陶坛类型名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-circle-plus" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="exportAllPages">
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
      <el-table-column align="center" label="类型ID" min-width="95">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_type_id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="100px" align="center" label="类型名称">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_type_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center">
        <template slot="header">
          <span>标准高度<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.jar_std_height }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>标准容量<br>(L)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.jar_std_volume }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>液位<br>数据量</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.lv_count || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>最大液位<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.lv_max_level != null ? scope.row.lv_max_level : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>最大容积<br>(m³)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.lv_max_volume != null ? scope.row.lv_max_volume.toFixed(3) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="280" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button size="mini" type="success" icon="el-icon-upload2" @click="handleImport(row)">
            导入
          </el-button>
          <el-button v-if="row.lv_count" size="mini" type="warning" icon="el-icon-download" @click="handleExportLv(row)">
            导出
          </el-button>
          <el-button v-if="row.lv_count" size="mini" type="info" icon="el-icon-data-line" @click="handleShowCurve(row)">
            曲线
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="showChart" :title="chartTitle" width="850px" :styles="{ height: '300px' }" class="custom-dialog">
      <div ref="chartContainer" class="chart-container" :style="{ height: '300px', width: '100%' }" />
    </el-dialog>
    <!--<history_chart v-if="historyData.length" :historyData="historyData" />-->

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="陶坛类型ID" prop="jar_type_id" label-width="120px">
          <el-input v-model="temp.jar_type_id" :readonly="readOnly" />
        </el-form-item>
        <el-form-item label="陶坛类型名称" prop="jar_type_name" label-width="120px">
          <el-input v-model="temp.jar_type_name" />
        </el-form-item>
        <el-form-item label="标准高度(mm)" prop="jar_std_height" label-width="120px">
          <el-input v-model="temp.jar_std_height" />
        </el-form-item>
        <el-form-item label="标准容量(L)" prop="jar_std_volume" label-width="120px">
          <el-input v-model="temp.jar_std_volume" />
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

    <!-- 导入液位容积对话框 -->
    <el-dialog :visible.sync="importDialogVisible" :title="'导入液位容积 - ' + importJarTypeName" width="650px" @opened="onImportDialogOpened">
      <el-alert v-if="importExistingCount > 0" title="该缸型已有液位容积数据，导入将覆盖旧数据" type="warning" :closable="false" show-icon style="margin-bottom:12px" />
      <el-alert v-if="importDuplicateCount > 0" :title="'CSV中存在 ' + importDuplicateCount + ' 个重复液位值，将保留最后出现的值'" type="warning" :closable="false" show-icon style="margin-bottom:12px" />
      <div v-if="!importData.length">
        <input ref="csvInput" type="file" accept=".csv,.xlsx,.xls" style="display:none" @change="handleFileSelect">
        <el-button type="primary" icon="el-icon-folder-opened" @click="triggerFileSelect">
          选择文件
        </el-button>
        <span style="margin-left:10px;color:#999">支持 CSV / Excel，前两列为液位(mm)、容积(m³)</span>
      </div>
      <div v-else>
        <div v-if="isExcelFile" style="color:#409EFF;margin-bottom:10px">
          <i class="el-icon-document" /> Excel 文件：{{ importFile.name }}，确认后将上传到服务器解析
        </div>
        <div v-else>
          <div style="margin-bottom:10px">
            <span>数据行数：<b>{{ importData.length }}</b></span>
            <span style="margin-left:20px">液位范围：<b>{{ importLevelMin }} ~ {{ importLevelMax }} mm</b></span>
            <span style="margin-left:20px">容积范围：<b>{{ importVolumeMin.toFixed(3) }} ~ {{ importVolumeMax.toFixed(3) }} m³</b></span>
          </div>
          <el-table :data="importPreviewData" border size="small" max-height="300">
            <el-table-column prop="level" label="液位(mm)" width="120" />
            <el-table-column prop="volume" label="容积(m³)" width="150" />
          </el-table>
          <div v-if="importData.length > 10" style="margin-top:5px;color:#999;text-align:center">
            ... 仅显示前10条，共 {{ importData.length }} 条
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false; importData = []; importFile = null; importExistingCount = 0; importDuplicateCount = 0">取消</el-button>
        <el-button v-if="importData.length" type="primary" :loading="importLoading" @click="confirmImport">确认导入</el-button>
      </span>
    </el-dialog>

    <!-- 液位容积曲线对话框 -->
    <el-dialog :visible.sync="curveDialogVisible" :title="'液位-容积曲线 - ' + curveJarTypeName" width="800px" @opened="renderCurveChart">
      <div ref="curveChart" style="width:100%;height:400px" />
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, deleteJarType, createJarType, updateJarType, exportJarTypeList, importLevelVolume, exportLevelVolume, getLevelVolumeCurve } from '@/api/wine_jar_type'
import echarts from 'echarts'
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
        jar_type_name: ''
      },

      showReviewer: false,
      temp: {
        jar_type_id: undefined,
        jar_type_name: '',
        jar_std_height: 0,
        jar_std_volume: 0
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
        jar_type_id: [
          { required: true, message: '请输入陶坛类型ID', trigger: 'blur' }
        ],
        jar_type_name: [
          { required: true, message: '请输入陶坛类型名称', trigger: 'blur' }
        ],
        jar_std_height: [
          { required: true, message: '请输入标准高度', trigger: 'blur' }
        ],
        jar_std_volume: [
          { required: true, message: '请输入标准容量', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      showDialog: false,
      showChart: false,
      chartTitle: '',
      className: 'chart',
      stockData: null, // 初始化为空数组,库存数据
      importDialogVisible: false,
      importJarTypeName: '',
      importData: [],
      importFile: null,
      importLoading: false,
      importExistingCount: 0,
      importDuplicateCount: 0,
      curveDialogVisible: false,
      curveJarTypeName: '',
      curveData: []
    }
  },
  computed: {
    isExcelFile() {
      if (!this.importFile) return false
      const ext = this.importFile.name.split('.').pop().toLowerCase()
      return ext === 'xlsx' || ext === 'xls'
    },
    importPreviewData() {
      return this.importData.slice(0, 10)
    },
    importLevelMin() {
      if (!this.importData.length || this.isExcelFile) return 0
      return this.importData[0].level
    },
    importLevelMax() {
      if (!this.importData.length || this.isExcelFile) return 0
      return this.importData[this.importData.length - 1].level
    },
    importVolumeMin() {
      if (!this.importData.length || this.isExcelFile) return 0
      return Math.min(...this.importData.map(d => d.volume))
    },
    importVolumeMax() {
      if (!this.importData.length || this.isExcelFile) return 0
      return Math.max(...this.importData.map(d => d.volume))
    }
  },
  created() {
    this.getList()
  },
  mounted() {

  },
  beforeDestroy() {
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
        jar_type_id: undefined,
        jar_type_name: '',
        jar_std_height: '',
        jar_std_volume: ''
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
          createJarType(this.temp).then(() => {
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
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateJarType(tempData).then(() => {
            const index = this.list.findIndex(v => v.jar_type_id === this.temp.jar_type_id)
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
        deleteJarType(row).then(response => {
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
    handleMonitor(row, index) {

    },
    handleImport(row) {
      this.importJarTypeName = row.jar_type_name
      this.importExistingCount = row.lv_count || 0
      this.importData = []
      this.importFile = null
      this.importDuplicateCount = 0
      this.importDialogVisible = true
    },
    onImportDialogOpened() {
      this.$nextTick(() => {
        if (this.$refs.csvInput) {
          this.$refs.csvInput.value = ''
        }
      })
    },
    triggerFileSelect() {
      if (this.$refs.csvInput) {
        this.$refs.csvInput.click()
      }
    },
    handleFileSelect(e) {
      const file = e.target.files[0]
      if (!file) return
      this.importFile = file
      const ext = file.name.split('.').pop().toLowerCase()
      if (ext === 'xlsx' || ext === 'xls') {
        this.importData = [{ level: '--', volume: '--' }]
        this.importDuplicateCount = 0
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        let text = ev.target.result
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        const levelMap = {}
        const data = []
        let duplicate = 0
        for (const line of lines) {
          const parts = line.split(',')
          if (parts.length < 2) continue
          const level = parseInt(parts[0])
          const volume = parseFloat(parts[1])
          if (!isNaN(level) && !isNaN(volume) && level >= 0 && volume >= 0) {
            if (level in levelMap) {
              duplicate++
            }
            levelMap[level] = volume
          }
        }
        for (const [level, volume] of Object.entries(levelMap)) {
          data.push({ level: Number(level), volume })
        }
        data.sort((a, b) => a.level - b.level)
        this.importDuplicateCount = duplicate
        this.importData = data
      }
      reader.readAsText(file, 'UTF-8')
    },
    confirmImport() {
      if (!this.importFile || !this.importData.length) {
        this.$message.warning('请先选择CSV文件')
        return
      }
      this.importLoading = true
      const formData = new FormData()
      formData.append('jar_type_name', this.importJarTypeName)
      formData.append('file', this.importFile)
      importLevelVolume(formData).then(res => {
        const msg = (res && res.message) || `导入成功，共 ${this.importData.length} 条数据`
        this.$notify({
          title: '操作成功',
          message: msg,
          type: 'success',
          duration: 2000
        })
        this.importDialogVisible = false
        this.importData = []
        this.importFile = null
        this.importLoading = false
        this.importExistingCount = 0
        this.importDuplicateCount = 0
        this.getList()
      }).catch(() => {
        this.importLoading = false
        this.$notify({
          title: '错误',
          message: '导入失败',
          type: 'error',
          duration: 2000
        })
      })
    },
    handleExportLv(row) {
      exportLevelVolume(row.jar_type_name).then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `level_volume_${row.jar_type_name}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      }).catch(() => {
        this.$notify({
          title: '错误',
          message: '导出失败',
          type: 'error',
          duration: 2000
        })
      })
    },
    handleShowCurve(row) {
      this.curveJarTypeName = row.jar_type_name
      this.curveData = []
      this.curveDialogVisible = true
      getLevelVolumeCurve({ jar_type_name: row.jar_type_name, sample_count: 200 }).then(res => {
        this.curveData = res.items
        this.$nextTick(() => {
          this.renderCurveChart()
        })
      })
    },
    renderCurveChart() {
      if (!this.curveData.length) return
      const dom = this.$refs.curveChart
      if (!dom) return
      let chart = echarts.getInstanceByDom(dom)
      if (chart) chart.dispose()
      chart = echarts.init(dom)
      chart.setOption({
        title: { text: this.curveJarTypeName, left: 'center' },
        tooltip: { trigger: 'axis', formatter: '液位: {b} mm<br/>容积: {c} m³' },
        xAxis: { name: '液位(mm)', type: 'value', nameLocation: 'center', nameGap: 30 },
        yAxis: { name: '容积(m³)', type: 'value', nameLocation: 'center', nameGap: 40 },
        series: [{
          type: 'line',
          data: this.curveData.map(d => [d.level, d.volume]),
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#409EFF', width: 2 }
        }]
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
        const tHeader = ['陶坛类型ID', '陶坛类型名称', '标准高度', '标准容量']
        const filterVal = ['jar_type_id', 'jar_type_name', 'jar_std_height', 'jar_std_volume']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'current-page-jar-type-list'
        })
        this.downloadLoading = false
      })
    },
    exportAllPages() {
      this.downloadLoading = true // 开始下载时显示加载状态

      // 发起请求以获取 Excel 文件，传递查询参数
      exportJarTypeList(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = '陶坛类型列表.xlsx' // 设置下载的文件名
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

<style>

.custom-dialog .el-dialog__header {
  color: white; /* 设置标题文字颜色 */
  background-color: #344b58 !important;; /* 设置标题栏背景颜色 */
  height: 50px; /* 设置标题栏的最小高度 */
}

.custom-dialog .el-dialog__body {
  padding: 0; /* 去掉弹窗的内边距 */
  background-color: transparent; /* 使弹窗内容背景透明 */
}
.custom-dialog .el-dialog__close {
  color: white; /* 关闭按钮颜色 */
  font-size: 20px; /* 调整关闭按钮大小 */
}

.chart-container {
  height: 100%; /* 高度填满 */
  width: 90%; /* 宽度填满 */
  background-color: #344b58; /* 设置图表的背景颜色 */
}
</style>
