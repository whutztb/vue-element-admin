<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.jar_id" placeholder="陶坛ID" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-circle-plus" @click="handleCreate">
        新增
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
      <el-table-column align="center" label="陶坛ID" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="编号" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_no }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="陶坛类型" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_type }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="所属酒库" min-width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.cellar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" min-width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新时间" min-width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="280" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="mini" type="success" icon="el-icon-upload2" @click="handleImport(row)">
            导入
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-download" @click="handleExport(row)">
            导出
          </el-button>
          <el-button size="mini" type="info" icon="el-icon-data-line" @click="handleShowCurve(row)">
            曲线
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 导入液位容积对话框 -->
    <el-dialog :visible.sync="importDialogVisible" :title="importDialogTitle" width="550px" @opened="onImportDialogOpened">
      <el-form ref="importForm" label-position="left" label-width="100px">
        <el-form-item label="陶坛ID" prop="import_jar_id" :rules="[{ required: true, message: '请输入陶坛ID', trigger: 'blur' }]">
          <el-input v-model="importJarId" :readonly="!!importRowJarId" placeholder="请输入陶坛ID" />
        </el-form-item>
      </el-form>
      <el-alert v-if="importExistingCount > 0" title="该陶坛已有液位容积数据，导入将覆盖旧数据" type="warning" :closable="false" show-icon style="margin-bottom:12px" />
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
        <el-button @click="importDialogVisible = false; importData = []; importFile = null; importExistingCount = 0; importJarId = ''; importRowJarId = ''">取消</el-button>
        <el-button v-if="importData.length" type="primary" :loading="importLoading" @click="confirmImport">确认导入</el-button>
      </span>
    </el-dialog>

    <!-- 液位容积曲线对话框 -->
    <el-dialog :visible.sync="curveDialogVisible" :title="'液位-容积曲线 - ' + curveJarId" width="800px" @opened="renderCurveChart">
      <div ref="curveChart" style="width:100%;height:400px" />
    </el-dialog>
  </div>
</template>

<script>
import { fetchJarLevelVolumeList, importJarLevelVolume, exportJarLevelVolume, getJarLevelVolumeCurve, deleteJarLevelVolume } from '@/api/wine_jar_level_volume'
import echarts from 'echarts'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'JarLevelVolumeList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        jar_id: ''
      },
      importDialogVisible: false,
      importDialogTitle: '',
      importJarId: '',
      importRowJarId: '',
      importData: [],
      importFile: null,
      importLoading: false,
      importExistingCount: 0,
      curveDialogVisible: false,
      curveJarId: '',
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
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchJarLevelVolumeList(this.listQuery).then(response => {
        this.list = response.items
        this.total = response.total_count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        if (order === 'ascending') {
          this.listQuery.sort = '+id'
        } else {
          this.listQuery.sort = '-id'
        }
        this.handleFilter()
      }
    },
    handleCreate() {
      this.importJarId = ''
      this.importRowJarId = ''
      this.importData = []
      this.importFile = null
      this.importExistingCount = 0
      this.importDialogTitle = '新增陶坛个体液位容积'
      this.importDialogVisible = true
    },
    handleImport(row) {
      this.importJarId = row.jar_id
      this.importRowJarId = row.jar_id
      this.importData = []
      this.importFile = null
      this.importExistingCount = 1
      this.importDialogTitle = '更新液位容积 - ' + row.jar_id
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
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        let text = ev.target.result
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        const levelMap = {}
        const data = []
        for (const line of lines) {
          const parts = line.split(',')
          if (parts.length < 2) continue
          const level = parseInt(parts[0])
          const volume = parseFloat(parts[1])
          if (!isNaN(level) && !isNaN(volume) && level >= 0 && volume >= 0) {
            levelMap[level] = volume
          }
        }
        for (const [level, volume] of Object.entries(levelMap)) {
          data.push({ level: Number(level), volume })
        }
        data.sort((a, b) => a.level - b.level)
        this.importData = data
      }
      reader.readAsText(file, 'UTF-8')
    },
    confirmImport() {
      if (!this.importJarId) {
        this.$message.warning('请输入陶坛ID')
        return
      }
      if (!this.importFile || !this.importData.length) {
        this.$message.warning('请先选择CSV文件')
        return
      }
      this.importLoading = true
      const formData = new FormData()
      formData.append('jar_id', this.importJarId)
      formData.append('file', this.importFile)
      importJarLevelVolume(formData).then(res => {
        this.$notify({
          title: '操作成功',
          message: res && res.message ? res.message : '导入成功',
          type: 'success',
          duration: 2000
        })
        this.importDialogVisible = false
        this.importData = []
        this.importFile = null
        this.importLoading = false
        this.importExistingCount = 0
        this.importJarId = ''
        this.importRowJarId = ''
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
    handleExport(row) {
      exportJarLevelVolume(row.jar_id).then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jar_level_volume_${row.jar_id}.csv`
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
      this.curveJarId = row.jar_id
      this.curveData = []
      this.curveDialogVisible = true
      getJarLevelVolumeCurve({ jar_id: row.jar_id, sample_count: 200 }).then(res => {
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
        title: { text: this.curveJarId, left: 'center' },
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
    handleDelete(row, index) {
      this.$confirm('确定删除该陶坛的液位容积数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteJarLevelVolume({ jar_id: row.jar_id }).then(() => {
          this.$notify({
            title: '操作成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        }).catch(() => {
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
          message: '已取消删除'
        })
      })
    }
  }
}
</script>
