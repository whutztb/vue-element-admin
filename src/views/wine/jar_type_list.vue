<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.jar_type_name" placeholder="陶坛类型名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="showDialog = true">
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
          <span>颈高<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.neck_height }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>肩高<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.shoulder_height }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>颈周长<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.neck_cir }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>肩周长<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.shoulder_cir }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>底周长<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.bottom_cir }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60px" align="center">
        <template slot="header">
          <span>底厚<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.bottom_height }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60px" align="center">
        <template slot="header">
          <span>壁厚<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.thickness }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="180" class-name="small-padding fixed-width">
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
        <el-form-item label="颈高(mm)" prop="neck_height" label-width="120px">
          <el-input v-model="temp.neck_height" />
        </el-form-item>
        <el-form-item label="肩高(mm)" prop="shoulder_height" label-width="120px">
          <el-input v-model="temp.shoulder_height" />
        </el-form-item>
        <el-form-item label="颈周长(mm)" prop="neck_cir" label-width="120px">
          <el-input v-model="temp.neck_cir" />
        </el-form-item>
        <el-form-item label="肩周长(mm)" prop="shoulder_cir" label-width="120px">
          <el-input v-model="temp.shoulder_cir" />
        </el-form-item>
        <el-form-item label="底周长(mm)" prop="bottom_cir" label-width="120px">
          <el-input v-model="temp.bottom_cir" />
        </el-form-item>
        <el-form-item label="底高(mm)" prop="bottom_height" label-width="120px">
          <el-input v-model="temp.bottom_height" />
        </el-form-item>
        <el-form-item label="壁厚(mm)" prop="thickness" label-width="120px">
          <el-input v-model="temp.thickness" />
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
import { fetchList, deleteJarType, createJarType, updateJarType, exportJarTypeList } from '@/api/wine_jar_type'
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
        jar_std_volume: 0,
        neck_height: 0,
        shoulder_height: 0,
        neck_cir: 0,
        shoulder_cir: 0,
        bottom_cir: 0,
        bottom_height: 0,
        thickness: 0
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
        ],
        neck_height: [
          { required: true, message: '请输入颈高', trigger: 'blur' }
        ],
        shoulder_height: [
          { required: true, message: '请输入肩高', trigger: 'blur' }
        ],
        neck_cir: [
          { required: true, message: '请输入颈周长', trigger: 'blur' }
        ],
        shoulder_cir: [
          { required: true, message: '请输入肩周长', trigger: 'blur' }
        ],
        bottom_cir: [
          { required: true, message: '请输入底周长', trigger: 'blur' }
        ],
        bottom_height: [
          { required: true, message: '请输入底高', trigger: 'blur' }
        ],
        thickness: [
          { required: true, message: '请输入壁厚', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      showDialog: false,
      showChart: false,
      chartTitle: '',
      className: 'chart',
      stockData: null // 初始化为空数组,库存数据
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
        jar_std_volume: '',
        neck_height: 0,
        shoulder_height: 0,
        neck_cir: 0,
        shoulder_cir: 0,
        bottom_cir: 0,
        bottom_height: 0,
        thickness: 0
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
          if (this.temp.all_jar_volume > 0) {
            this.temp.cellar_usage_rate = (this.temp.all_wine_volume / this.temp.all_jar_volume).toFixed(3)
          } else {
            this.temp.cellar_usage_rate = 0 // 或根据需求设置为其他值
          }
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
          if (this.temp.all_jar_volume > 0) {
            this.temp.cellar_usage_rate = (this.temp.all_wine_volume / this.temp.all_jar_volume).toFixed(3)
          } else {
            this.temp.cellar_usage_rate = 0 // 或根据需求设置为其他值
          }
          const tempData = Object.assign({}, this.temp)
          updateJarType(tempData).then(() => {
            const index = this.list.findIndex(v => v.cellar_id === this.temp.cellar_id)
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
          this.getList() // 调用 getList 方法以刷新数据
          this.list.splice(index, 1)
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
        const tHeader = ['陶坛类型ID', '陶坛类型名称', '标准高度', '标准容量', '颈高', '肩高', '颈周长', '肩周长', '底周长', '底厚', '壁厚']
        const filterVal = ['jar_type_id', 'jar_type_name', 'jar_std_height', 'jar_std_volume', 'neck_height', 'shoulder_height', 'neck_cir', 'shoulder_cir', 'bottom_cir', 'bottom_height', 'thickness']
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
          a.download = 'all-page-jar-type-list.xlsx' // 设置下载的文件名
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
