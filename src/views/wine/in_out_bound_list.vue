<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="filter-item">
        <el-select v-model="listQuery.condition" placeholder="日期选择" style="width: 120px;">
          <el-option label="按照年度" value="year" />
          <el-option label="按照季度" value="quarter" />
          <el-option label="按照月份" value="month" />
          <el-option label="指定区间" value="range" />
        </el-select>
      </div>
      <div v-if="listQuery.condition === 'year'" class="filter-item">
        <el-select v-model="listQuery.year" placeholder="选择年份" style="width: 120px;">
          <el-option v-for="year in years" :key="year" :label="year" :value="year" />
        </el-select>
      </div>
      <div v-if="listQuery.condition === 'quarter'" class="filter-item">
        <el-select v-model="listQuery.quarter" placeholder="选择季度" style="width: 180px;">
          <template v-for="year in years">
            <el-option
              v-for="quarter in quarters"
              :key="`${year}-${quarter}`"
              :label="`${year}年${quarter}`"
              :value="`${year}-${quarter}`"
            />
          </template>
        </el-select>
      </div>
      <div v-if="listQuery.condition === 'month'" class="filter-item">
        <el-select v-model="listQuery.month" placeholder="选择月份" style="width: 120px;">
          <template v-for="year in years">
            <el-option
              v-for="month in months"
              :key="`${year}-${month}`"
              :label="`${year}年${month}月`"
              :value="`${year}-${month}`"
            />
          </template>
        </el-select>
      </div>
      <div v-if="listQuery.condition === 'range'" class="filter-item">
        <el-date-picker
          v-model="listQuery.startDate"
          type="datetime"
          placeholder="选择起始时间"
          style="width: 180px;"
        />
        <el-date-picker
          v-model="listQuery.endDate"
          type="datetime"
          placeholder="选择结束时间"
          style="width: 180px;"
        />
      </div>
      <el-input v-model="listQuery.jar_pos" placeholder="位置" style="width: 120px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.wine_name" placeholder="品名" style="width: 120px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-document" @click="handleAddUp">
        统计
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
      <el-table-column align="center" label="陶坛ID" min-width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" label="陶坛位置" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="70px" label="缸型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_type }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="70px" label="品名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.wine_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" label="当前液位(mm)" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.wine_level }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" label="当前酒量(t)" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.wine_volume }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="出入库酒量(t)">
        <template slot-scope="scope">
          <span :style="{ color: scope.row.in_out_bound > 0 ? 'red' : 'blue' }">
            {{ scope.row.in_out_bound }}
          </span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="损耗酒量(t)">
        <template slot-scope="scope">
          <span :style="{ color: 'red'}">
            {{ scope.row.wine_leak }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="110" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status!='deleted'" size="mini" type="primary" icon="el-icon-document" @click="handleHistory(row,$index)">
            酒量变化
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
import { fetchList, getHistory, getTotalInOutBound, exportInOutBoundList } from '@/api/wine_in_out_bound'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import echarts from 'echarts'
import { MessageBox } from 'element-ui'

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
        jar_type: '',
        jar_id: '',
        jar_pos: '',
        wine_name: '',
        startDate: '',
        endDate: ''
      },
      years: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i), // 倒序的年份
      quarters: ['第4季度', '第3季度', '第2季度', '第1季度'], // 倒序的季度
      months: Array.from({ length: 12 }, (_, i) => (12 - i).toString().padStart(2, '0')), // 倒序的月份
      showSelectedOptions: false, // 控制是否显示已选择的选项

      showReviewer: false,
      temp: {
        jar_id: undefined,
        jar_type: '',
        jar_pos: '',
        jar_height: '',
        wine_level: '',
        wine_vol: '',
        wine_volume: '',
        wine_name: '',
        in_out_bound: '',
        wine_leak: ''
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
    handleConditionChange() {
      // Reset startDate and endDate
      if (this.listQuery.condition !== 'range') {
        this.listQuery.startDate = ''
        this.listQuery.endDate = ''
      }

      const year = this.listQuery.year
      const month = this.listQuery.month
      const quarter = this.listQuery.quarter

      if (this.listQuery.condition === 'year' && year) {
        this.listQuery.startDate = new Date(year, 0, 1) // 1月1日
        this.listQuery.endDate = new Date(year, 11, 31) // 12月31日
      } else if (this.listQuery.condition === 'quarter' && quarter) {
        const [qYear, q] = quarter.split('-')
        if (q === '第1季度') {
          this.listQuery.startDate = new Date(qYear, 0, 1) // 1月1日
          this.listQuery.endDate = new Date(qYear, 2, 31) // 3月31日
        } else if (q === '第2季度') {
          this.listQuery.startDate = new Date(qYear, 3, 1) // 4月1日
          this.listQuery.endDate = new Date(qYear, 5, 30) // 6月30日
        } else if (q === '第3季度') {
          this.listQuery.startDate = new Date(qYear, 6, 1) // 7月1日
          this.listQuery.endDate = new Date(qYear, 8, 30) // 9月30日
        } else if (q === '第4季度') {
          this.listQuery.startDate = new Date(qYear, 9, 1) // 10月1日
          this.listQuery.endDate = new Date(qYear, 11, 31) // 12月31日
        }
      } else if (this.listQuery.condition === 'month' && month) {
        const [mYear, m] = month.split('-')
        this.listQuery.startDate = new Date(mYear, m - 1, 1) // 每月1日
        this.listQuery.endDate = new Date(mYear, m, 0) // 该月最后一天
      }
    },
    handleFilter() {
      this.handleConditionChange()
      // console.log("startDate",this.listQuery.startDate)
      // console.log("endDate",this.listQuery.endDate)
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
        jar_type: '',
        jar_pos: '',
        jar_height: '',
        wine_level: '',
        wine_vol: '',
        wine_volume: '',
        wine_name: '',
        in_out_bound: '',
        wine_leak: ''
      }
    },
    handleAddUp() {
      this.handleConditionChange()
      // console.log("startDate1",this.listQuery.startDate)
      // console.log("endDate1",this.listQuery.endDate)
      getTotalInOutBound(this.listQuery).then(response => {
        console.log(response)
        MessageBox.alert(
          `符合查询条件:<br>出入库酒量(吨): ${response.in_out_bound}<br>损耗酒量(吨):${response.wine_leak}`,
          '统计结果',
          {
            confirmButtonText: '确定',
            type: 'info',
            dangerouslyUseHTMLString: true // 允许使用 HTML
          }
        )
      })
    },
    handleHistory(row, index) {
      getHistory(row).then(response => {
        const message = response.message
        console.log(message)
        // 如果 response.message 是字符串，尝试将其解析为数组
        if (typeof message === 'string') {
          console.log('888')
        } else {
          this.historyData = response.message.level_msg // 直接赋值
          this.lidOpenData = response.message.lid_msg // 直接赋值
          this.volHistoryData = response.message.vol_msg // 直接赋值
        }
        this.showChart = true
      })
    },
    initChart() {
      this.$nextTick(() => {
        const chartElement = this.$refs.chartContainer
        if (chartElement) {
          this.chart = echarts.init(chartElement)
          // 按照从小到大排序
          const sortedHistoryData = this.historyData.sort((a, b) => new Date(a.rec_time) - new Date(b.rec_time))
          // 提取时间和对应的酒量
          const timestamps = sortedHistoryData.map(item => item.rec_time) // 提取时间
          const recLevels = sortedHistoryData.map(item => item.rec_volume) // 提取 rec_volume

          /*
          const recVols = this.volHistoryData.map(item => item.rec_vol) // 提取 rec_vol
          const openLidTimes = this.lidOpenData.map(item => item.open_time) // 提取 open_time
          const openLidValue = this.lidOpenData.map(item => item.value) // 提取值（无实际意义）

          // 创建一个时间点集合
          const allTimestamps = Array.from(new Set([...timestamps, ...openLidTimes]))
          // 对时间戳进行排序
          allTimestamps.sort((a, b) => new Date(a) - new Date(b))

          // 对齐数据
          const alignedRecLevels = allTimestamps.map(time => {
            const index = timestamps.indexOf(time)
            return index !== -1 ? recLevels[index] : null // 如果没有对应的值，则填充 null
          })
          const alignedRecVols = allTimestamps.map(time => {
            const index = timestamps.indexOf(time)
            return index !== -1 ? recVols[index] : null // 如果没有对应的值，则填充 null
          })

          const alignedOpenLidValues = allTimestamps.map(time => {
            const index = openLidTimes.indexOf(time)
            return index !== -1 ? openLidValue[index] : null // 如果没有对应的值，则填充 null
          })
          */
          this.chart.setOption({
            // backgroundColor: '#394056',
            title: {
              top: 20,
              textStyle: {
                fontWeight: 'normal',
                fontSize: 16,
                color: '#F1F1F3'
              },
              left: '1%'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                lineStyle: {
                  color: '#57617B'
                }
              }
            },
            legend: {
              top: 10,
              left: 'center', // 将图例水平居中
              orient: 'horizontal', // 设置图例为水平布局
              icon: 'rect',
              itemWidth: 14,
              itemHeight: 5,
              itemGap: 13,
              right: '4%',
              textStyle: {
                fontSize: 12,
                color: '#F1F1F3'
              }
            },
            grid: {
              top: '10%',
              left: '6%',
              right: '6%',
              bottom: '2%',
              containLabel: true
            },
            xAxis: [{
              type: 'category', // category,time
              boundaryGap: false,
              axisLine: {
                lineStyle: {
                  color: '#F1F1F3'
                }
              },
              axisLabel: {
                formatter: function(value) {
                  const date = new Date(value)
                  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
                }
              },
              data: timestamps // 转换为 Date 对象
            }],
            yAxis: [
              {
                type: 'value',
                name: '酒量(t)',
                nameTextStyle: {
                  color: '#F1F1F3' // 设置液位 Y 轴名称的颜色为白色
                },
                axisTick: {
                  show: false
                },
                axisLine: {
                  lineStyle: {
                    color: '#57617B'
                  }
                },
                axisLabel: {
                  margin: 10,
                  textStyle: {
                    fontSize: 12,
                    color: '#F1F1F3'
                  }
                },
                splitLine: {
                  lineStyle: {
                    color: '#57617B'
                  }
                }
              }/*,
              {
                type: 'value',
                name: '酒度（°）',
                nameTextStyle: {
                  color: '#F1F1F3' // 设置液位 Y 轴名称的颜色为白色
                },
                min: 30,
                max: 80,
                axisTick: {
                  show: false
                },
                axisLine: {
                  lineStyle: {
                    color: '#57617B'
                  }
                },
                axisLabel: {
                  margin: 10,
                  textStyle: {
                    fontSize: 12,
                    color: '#F1F1F3'
                  }
                },
                splitLine: {
                  lineStyle: {
                    color: '#57617B'
                  }
                },
                position: 'right', // 将第二个Y轴放在右侧
                offset: 0
              }*/],
            series: [{
              name: '现有酒量(t)',
              type: 'scatter',
              connectNulls: true, // 连接 null 值
              smooth: false,
              symbol: 'circle',
              symbolSize: 5,
              showSymbol: false,
              lineStyle: {
                normal: {
                  width: 1
                }
              },
              itemStyle: {
                normal: {
                  color: 'rgb(137,189,27)',
                  borderColor: 'rgba(137,189,2,0.27)',
                  borderWidth: 12
                }
              },
              data: recLevels

            }/*, {
              name: '酒度值',
              type: 'line',
              yAxisIndex: 1, // 指定使用第二个Y轴
              connectNulls: true, // 连接 null 值
              smooth: true,
              symbol: 'circle',
              symbolSize: 5,
              showSymbol: false,
              lineStyle: {
                normal: {
                  width: 1
                }
              },
              itemStyle: {
                normal: {
                  color: 'rgb(237,89,227)',
                  borderColor: 'rgba(137,189,2,0.27)',
                  borderWidth: 12
                }
              },
              data: alignedRecVols
            }, {
              name: '开缸点',
              type: 'scatter',
              smooth: true,
              symbol: 'circle',
              symbolSize: 8,
              showSymbol: false,
              lineStyle: {
                normal: {
                  width: 1
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(0, 136, 212, 0.3)'
                  }, {
                    offset: 0.8,
                    color: 'rgba(0, 136, 212, 0)'
                  }], false),
                  shadowColor: 'rgba(0, 0, 0, 0.1)',
                  shadowBlur: 10
                }
              },
              itemStyle: {
                normal: {
                  color: 'rgb(0,136,212)',
                  borderColor: 'rgba(0,136,212,0.2)',
                  borderWidth: 12
                }
              },
              data: alignedOpenLidValues
            }*/]
          })
          setTimeout(() => {
            this.chart.resize()
          }, 100) // 确保在弹窗打开后再调整大小
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
        const tHeader = ['陶坛ID', '陶坛位置', '缸型', '品名', '当前液位(mm)', '现有酒量(t)', '出入库酒量(t)', '损耗酒量(t)']
        const filterVal = ['jar_id', 'jar_pos', 'jar_type', 'wine_name', 'wine_level', 'wine_volume', 'in_out_bound', 'wine_leak']
        const data = this.formatJson(filterVal)

        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'current-page-in_out_bound-list'
        })
        this.downloadLoading = false
      })
    },
    exportAllPages() {
      this.downloadLoading = true // 开始下载时显示加载状态

      // 发起请求以获取 Excel 文件，传递查询参数
      exportInOutBoundList(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = 'all-page-in_out_bound-list.xlsx' // 设置下载的文件名
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
  background-color: #394056 !important;; /* 设置标题栏背景颜色 */
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
  width: 100%; /* 宽度填满 */
  background-color: #394056; /* 设置图表的背景颜色 */
}
</style>
