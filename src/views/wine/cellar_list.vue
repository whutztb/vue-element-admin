<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.cellar_pos" placeholder="酒库位置" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.cellar_id" placeholder="酒库ID" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.cellar_name" placeholder="酒库名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-s-data" @click="handleStock">
        统计
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
      <el-table-column min-width="100px" label="酒库位置" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cellar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="酒库ID" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.cellar_id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="酒库名称">
        <template slot-scope="scope">
          <span>{{ scope.row.cellar_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" label="缸型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_type }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="50px" label="缸数" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.all_jar_num }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="50px" label="空缸" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.empty_jar_num }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="50px" label="漏缸" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bad_jar_num }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>现有酒量<br>(m³)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.all_wine_volume }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>库容<br>(m³)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.all_jar_volume }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center">
        <template slot="header">
          <span>折算重量<br>(t)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.all_wine_mass }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="70px" label="利用率" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cellar_usage_rate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="info" icon="el-icon-video-camera" @click="handleMonitor(row,$index)">
            监控
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
        <el-form-item label="酒库ID" prop="cellar_id" label-width="100px">
          <el-input v-model="temp.cellar_id" :readonly="readOnly" />
        </el-form-item>
        <el-form-item label="酒库名称" prop="cellar_name" label-width="100px">
          <el-input v-model="temp.cellar_name" />
        </el-form-item>
        <el-form-item label="酒库位置" prop="cellar_pos" label-width="100px">
          <el-input v-model="temp.cellar_pos" />
        </el-form-item>
        <el-form-item label="缸型" prop="jar_type" label-width="100px">
          <el-select v-model="temp.jar_type" class="filter-item" placeholder="请选择">
            <el-option v-for="item in jarTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="缸数" prop="all_jar_num" label-width="100px">
          <el-input v-model="temp.all_jar_num" />
        </el-form-item>
        <el-form-item label="空缸" prop="empty_jar_num" label-width="100px">
          <el-input v-model="temp.empty_jar_num" />
        </el-form-item>
        <el-form-item label="漏缸" prop="bad_jar_num" label-width="100px">
          <el-input v-model="temp.bad_jar_num" />
        </el-form-item>
        <el-form-item label="现有酒量(m³)" prop="all_wine_volume" label-width="110px">
          <el-input v-model="temp.all_wine_volume" />
        </el-form-item>
        <el-form-item label="库容(m³)" prop="all_jar_volume" label-width="100px">
          <el-input v-model="temp.all_jar_volume" />
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
import { getJarTypeOptions } from '@/api/wine_jar'
import { fetchList, deleteCellar, createCellar, updateCellar, exportCellarList, getStock } from '@/api/wine_cellar'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import echarts from 'echarts'

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
        cellar_name: '',
        cellar_id: '',
        cellar_pos: ''
      },

      showReviewer: false,
      temp: {
        cellar_id: undefined,
        cellar_name: '',
        cellar_pos: '',
        jar_type: '',
        all_jar_num: '',
        empty_jar_num: '',
        bad_jar_num: '',
        all_wine_volume: '',
        all_jar_volume: '',
        all_wine_mass: '',
        cellar_usage_rate: ''
      },
      jarTypeOptions: [],
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
        cellar_id: [
          { required: true, message: '请输入酒库ID', trigger: 'blur' }
        ],
        cellar_name: [
          { required: true, message: '请输入酒库名称', trigger: 'blur' }
        ],
        cellar_pos: [
          { required: true, message: '请输入酒库位置', trigger: 'blur' }
        ],
        jar_type: [
          { required: true, message: '请输入缸型', trigger: 'blur' }
        ],
        all_jar_num: [
          { required: true, message: '请输入总缸数', trigger: 'blur' }
        ],
        empty_jar_num: [
          { required: true, message: '请输入空缸数', trigger: 'blur' }
        ],
        bad_jar_num: [
          { required: true, message: '请输入漏缸数', trigger: 'blur' }
        ],
        all_wine_volume: [
          { required: true, message: '请输入酒容积', trigger: 'blur' }
        ],
        all_jar_volume: [
          { required: true, message: '请输入总容积', trigger: 'blur' }
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
  watch: {
    showChart(newVal) {
      if (newVal) {
        this.initChart()
      }
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.initChart()
    this.fetchJarTypeOptions()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    // 获取陶坛类型
    fetchJarTypeOptions() {
      getJarTypeOptions().then(response => {
        this.jarTypeOptions = response.items.map(item => item.jar_type_name)
      })
    },
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
        cellar_id: undefined,
        cellar_name: '',
        cellar_pos: '',
        jar_type: '',
        all_jar_num: 0,
        empty_jar_num: 0,
        bad_jar_num: 0,
        all_wine_volume: 0,
        all_jar_volume: 0,
        all_wine_mass: 0,
        cellar_usage_rate: 0.0
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
          createCellar(this.temp).then(() => {
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
          updateCellar(tempData).then(() => {
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
        deleteCellar(row).then(response => {
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
    handleStock() {
      getStock().then(response => {
        this.stockData = response.items
        this.showChart = true
        this.$nextTick(() => { // 确保 DOM 更新后再初始化图表
          this.initChart()
        })
      })
    },
    initChart() {
      const chartElement = this.$refs.chartContainer
      if (chartElement) {
        this.chart = echarts.init(chartElement)
        // 提取数据
        const xData = this.stockData.map(item => item.cellar_name)
        const allWineVolumeData = this.stockData.map(item => item.all_wine_volume)
        const allJarVolumeData = this.stockData.map(item => item.all_jar_volume)

        this.chart.setOption({
          // backgroundColor: '#344b58',
          title: {
            x: '20',
            top: '20',
            textStyle: {
              color: '#fff',
              fontSize: '22'
            },
            subtextStyle: {
              color: '#90979c',
              fontSize: '16'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              textStyle: {
                color: '#fff'
              }
            }
          },
          grid: {
            left: '7%',
            right: '5%',
            borderWidth: 0,
            top: 100,
            bottom: 50,
            textStyle: {
              color: '#fff'
            }
          },
          legend: {
            x: '5%',
            top: '10%',
            textStyle: {
              color: '#90979c'
            },
            data: ['库容(m³)', '现有酒量(m³)']
          },
          calculable: true,
          xAxis: [{
            type: 'category',
            axisLine: {
              lineStyle: {
                color: '#90979c'
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitArea: {
              show: false
            },
            axisLabel: {
              interval: 0

            },
            data: xData
          }],
          yAxis: [{
            type: 'value',
            min: 0,
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#90979c'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              interval: 0
            },
            splitArea: {
              show: false
            }
          }],
          dataZoom: [{
            show: false,
            height: 30,
            xAxisIndex: [
              0
            ],
            bottom: 30,
            start: 0,
            end: 100,
            handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleSize: '110%',
            handleStyle: {
              color: '#d3dee5'

            },
            textStyle: {
              color: '#fff' },
            borderColor: '#90979c'

          }, {
            type: 'inside',
            show: true,
            height: 15,
            start: 1,
            end: 35
          }],
          series: [{
            name: '库容(m³)',
            type: 'bar',
            barMaxWidth: 35,
            barGap: '10%', // 设置间隔
            itemStyle: {
              normal: {
                color: 'rgba(255,144,128,1)',
                label: {
                  show: true,
                  textStyle: {
                    color: '#fff'
                  },
                  position: 'top', // 在顶部显示
                  formatter(p) {
                    return p.value > 0 ? p.value : ''
                  }
                }
              }
            },
            data: allJarVolumeData
          }, {
            name: '现有酒量(m³)',
            type: 'bar',
            itemStyle: {
              normal: {
                color: 'rgba(0,191,183,1)',
                barBorderRadius: 0,
                label: {
                  show: true,
                  position: 'top', // 在内部显示
                  formatter(p) {
                    return p.value > 0 ? p.value : ''
                  }
                }
              }
            },
            data: allWineVolumeData
          }]
        })
        setTimeout(() => {
          this.chart.resize()
        }, 100) // 确保在弹窗打开后再调整大小
      }
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
        const tHeader = ['酒库ID', '酒库名称', '酒库位置', '缸型', '总数', '空缸', '漏缸', '总酒量(m³)', '总容量(m³)', '利用率']
        const filterVal = ['cellar_id', 'cellar_name', 'cellar_pos', 'jar_type', 'all_jar_num', 'empty_jar_num', 'bad_jar_num', 'all_wine_volume', 'all_jar_volume', 'cellar_usage_rate']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'current-page-jar-list'
        })
        this.downloadLoading = false
      })
    },
    exportAllPages() {
      this.downloadLoading = true // 开始下载时显示加载状态

      // 发起请求以获取 Excel 文件，传递查询参数
      exportCellarList(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = '酒库列表.xlsx' // 设置下载的文件名
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
