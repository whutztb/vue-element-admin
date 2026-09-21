<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 20px;">
      <span style="margin-right: 10px;">选择页面：</span>
      <el-select v-model="selectedPage" placeholder="请选择页面" style="width: 200px;" @change="handlePageChange">
        <el-option
          v-for="page in pageOptions"
          :key="page.key"
          :label="page.name"
          :value="page.key"
        />
      </el-select>
      <el-button type="primary" icon="el-icon-plus" size="small" style="margin-left: 10px;" :disabled="!selectedPage" @click="handleAddColumn">
        新增字段
      </el-button>
      <el-tooltip content="恢复之后，保存配置" placement="top">
        <el-button type="warning" icon="el-icon-refresh-left" size="small" :disabled="!selectedPage" @click="handleReset">
          恢复默认
        </el-button>
      </el-tooltip>
      <el-button type="success" icon="el-icon-download" size="small" :disabled="!selectedPage" @click="handleSave">
        保存配置
      </el-button>
    </div>

    <el-alert
      v-if="!selectedPage"
      title="请先选择一个页面"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />

    <div v-if="selectedPage" class="config-table-wrap">
      <div style="margin-bottom: 12px; color: #909399; font-size: 13px;">
        提示：勾选"显示"来控制列是否可见；点击上下箭头调整排序；修改各项属性后点击"保存配置"生效。
      </div>

      <el-table ref="configTable" :data="columns" border size="small" style="width: 100%;">
        <el-table-column type="index" label="序号" min-width="30" align="center" />

        <el-table-column label="操作" min-width="120" align="center">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-top" :disabled="scope.$index === 0" @click="moveUp(scope.$index)" />
            <el-button size="mini" icon="el-icon-bottom" :disabled="scope.$index === columns.length - 1" @click="moveDown(scope.$index)" />
          </template>
        </el-table-column>

        <el-table-column label="显示" min-width="60" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible" />
          </template>
        </el-table-column>

        <el-table-column label="字段名(prop)" min-width="120" align="center">
          <template slot-scope="scope">
            <span style="color: #606266;">{{ scope.row.prop }}</span>
          </template>
        </el-table-column>

        <el-table-column label="显示名称(label)" min-width="140" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.label" size="small" placeholder="列标题，可用<br>换行" />
          </template>
        </el-table-column>

        <el-table-column label="最小宽度" min-width="70" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.minWidth" size="small" placeholder="如: 80" />
          </template>
        </el-table-column>

        <el-table-column label="固定位置" min-width="100" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.fixed" size="small" placeholder="不固定" style="width: 100%;">
              <el-option label="不固定" value="" />
              <el-option label="左侧" value="left" />
              <el-option label="右侧" value="right" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="渲染类型" min-width="90" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.type" size="small" style="width: 100%;">
              <el-option label="文本" value="text" />
              <el-option label="Tag" value="tag" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="Tag配置" min-width="260" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.tagMappings && scope.row.tagMappings.length > 0" style="display: flex; flex-direction: column; gap: 4px;">
              <div v-for="(m, idx) in scope.row.tagMappings" :key="idx" style="display: flex; gap: 4px;">
                <el-input v-model="m.value" size="small" placeholder="值" style="width: 50px;" />
                <el-input v-model="m.text" size="small" placeholder="文字" style="flex: 1;" />
                <el-button type="text" size="mini" icon="el-icon-delete" style="color: #F56C6C;" @click="scope.row.tagMappings.splice(idx, 1)" />
              </div>
              <el-button type="text" size="mini" icon="el-icon-plus" style="padding: 0;" @click="scope.row.tagMappings.push({ value: '', text: '' })">添加映射</el-button>
            </div>
            <div v-else-if="scope.row.type === 'tag'" style="display: flex; gap: 6px; flex-wrap: wrap;">
              <el-select v-model="scope.row.tagCondition" size="small" placeholder="条件" style="flex: 1; min-width: 65px;">
                <el-option label="等于" value="eq" />
                <el-option label="非空" value="truthy" />
              </el-select>
              <el-input v-if="scope.row.tagCondition === 'eq'" v-model="scope.row.tagValue" size="small" placeholder="对比值" style="width: 50px;" />
              <el-select v-model="scope.row.tagType" size="small" placeholder="类型" style="flex: 1; min-width: 65px;">
                <el-option label="success" value="success" />
                <el-option label="warning" value="warning" />
                <el-option label="danger" value="danger" />
                <el-option label="info" value="info" />
              </el-select>
              <el-input v-model="scope.row.tagText" size="small" placeholder="文字" style="width: 40px;" />
            </div>
            <span v-else style="color: #C0C4CC; font-size: 12px;">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="addDialogVisible" title="新增字段" width="480px">
      <el-form :model="newColumn" label-width="100px">
        <el-form-item label="字段名" required>
          <el-input v-model="newColumn.prop" placeholder="后端返回的字段名，如 jar_id" />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="newColumn.label" placeholder="列标题，可用<br>换行，如：坛高<br>(mm)" />
        </el-form-item>
        <el-form-item label="最小宽度">
          <el-input v-model="newColumn.minWidth" placeholder="如: 80" />
        </el-form-item>
        <el-form-item label="固定位置">
          <el-select v-model="newColumn.fixed" placeholder="不固定" style="width: 100%;">
            <el-option label="不固定" value="" />
            <el-option label="左侧" value="left" />
            <el-option label="右侧" value="right" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddColumn">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getColumnConfig, saveColumnConfig } from '@/api/table_column_config'

const PAGE_OPTIONS = [
  { key: 'jar_list', name: '陶坛管理' }
]

const DEFAULT_COLUMNS_MAP = {
  jar_list: [
    { prop: 'jar_id', label: '陶坛ID', minWidth: '140', fixed: 'left', visible: true, type: 'text' },
    { prop: 'cellar_pos', label: '栋号', minWidth: '55', fixed: 'left', visible: true, type: 'text' },
    { prop: 'jar_pos', label: '库号', minWidth: '55', fixed: 'left', visible: true, type: 'text' },
    { prop: 'barrel_no', label: '桶号', minWidth: '55', fixed: 'left', visible: true, type: 'text' },
    { prop: 'jar_no', label: '坛号', minWidth: '55', fixed: 'left', visible: true, type: 'text' },
    { prop: 'jar_height', label: '坛高<br>(mm)', minWidth: '60', fixed: '', visible: true, type: 'text' },
    { prop: 'air_height', label: '净空<br>(mm)', minWidth: '60', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_level', label: '液位<br>(mm)', minWidth: '60', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_volume', label: '体积<br>(m³)', minWidth: '60', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_vol', label: '原度<br>(%vol)', minWidth: '65', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_temp', label: '温度<br>(℃)', minWidth: '55', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_rou', label: '密度<br>(t/m³)', minWidth: '75', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_weight', label: '原度重量<br>(t)', minWidth: '80', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_vol_convert', label: '标准酒度<br>(%vol)', minWidth: '80', fixed: '', visible: true, type: 'text' },
    { prop: 'wine_weight_convert', label: '折算重量<br>(t)', minWidth: '80', fixed: '', visible: true, type: 'text' },
    { prop: 'humidity', label: '湿度<br>(%)', minWidth: '60', fixed: '', visible: true, type: 'text' },
    { prop: 'team_group', label: '班组', minWidth: '60', fixed: '', visible: true, type: 'text' },
    { prop: 'first_measure', label: '首测<br>标志', minWidth: '60', fixed: '', visible: true, type: 'tag', tagCondition: 'truthy', tagType: 'success', tagText: '是' },
    { prop: 'last_jar_flag', label: '尾坛<br>标志', minWidth: '60', fixed: '', visible: true, type: 'tag', tagCondition: 'truthy', tagType: 'success', tagText: '是' },
    { prop: 'calc_mode', label: '计算方式', minWidth: '100', fixed: '', visible: true, type: 'tag', tagMappings: [{ value: '0', text: '单坛模式', tagType: 'primary' }, { value: '1', text: '厂家模式', tagType: 'success' }, { value: '2', text: '经验公式', tagType: 'warning' }] }
  ]
}

export default {
  name: 'TableColumnConfig',
  data() {
    return {
      pageOptions: PAGE_OPTIONS,
      allConfigs: {},
      selectedPage: '',
      columns: [],
      addDialogVisible: false,
      newColumn: {
        prop: '',
        label: '',
        minWidth: '80',
        fixed: '',
        visible: true,
        type: 'text',
        tagCondition: 'truthy',
        tagValue: '',
        tagType: 'success',
        tagText: '是'
      }
    }
  },
  created() {
    this.loadAllConfigs()
    this._resizeHandler = () => {
      if (this.$refs.configTable) {
        this.$nextTick(() => this.$refs.configTable.doLayout())
      }
    }
    window.addEventListener('resize', this._resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._resizeHandler)
  },
  methods: {
    loadAllConfigs() {
      const cache = {}
      const promises = this.pageOptions.map(page => {
        return getColumnConfig(page.key).then(res => {
          if (res && res.columns && res.columns.length > 0) {
            cache[page.key] = res.columns
          } else {
            cache[page.key] = null
          }
        }).catch(() => {
          cache[page.key] = null
        })
      })
      Promise.all(promises).then(() => {
        this.allConfigs = cache
        if (this.pageOptions.length > 0) {
          this.selectedPage = this.pageOptions[0].key
          this.applyCurrentPageColumns()
        }
      })
    },
    handlePageChange() {
      this.applyCurrentPageColumns()
    },
    applyCurrentPageColumns() {
      if (!this.selectedPage) return
      const cached = this.allConfigs[this.selectedPage]
      if (cached && cached.length > 0) {
        this.columns = JSON.parse(JSON.stringify(cached))
      } else {
        this.useDefaultConfig()
      }
    },
    useDefaultConfig() {
      const defaults = DEFAULT_COLUMNS_MAP[this.selectedPage] || []
      this.columns = JSON.parse(JSON.stringify(defaults))
      this.$message.info('使用默认列配置')
    },
    handleReset() {
      this.$confirm('确定恢复为默认配置？当前未保存的修改将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.useDefaultConfig()
      }).catch(() => {})
    },
    handleSave() {
      for (let i = 0; i < this.columns.length; i++) {
        if (!this.columns[i].prop) {
          this.$message.error('第 ' + (i + 1) + ' 行的字段名不能为空')
          return
        }
        if (!this.columns[i].label) {
          this.$message.error('第 ' + (i + 1) + ' 行的显示名称不能为空')
          return
        }
      }
      this.columns.forEach(function(col, idx) { col.sortOrder = idx })
      saveColumnConfig({
        page_key: this.selectedPage,
        columns: this.columns
      }).then(() => {
        this.allConfigs[this.selectedPage] = JSON.parse(JSON.stringify(this.columns))
        this.$notify({
          title: '保存成功',
          message: '列配置已更新',
          type: 'success',
          duration: 2000
        })
      }).catch(() => {
        this.$notify({
          title: '保存失败',
          message: '请检查后端接口是否已实现',
          type: 'error',
          duration: 3000
        })
      })
    },
    handleAddColumn() {
      this.newColumn = {
        prop: '',
        label: '',
        minWidth: '80',
        fixed: '',
        visible: true,
        type: 'text',
        tagCondition: 'truthy',
        tagValue: '',
        tagType: 'success',
        tagText: '是',
        tagMappings: []
      }
      this.addDialogVisible = true
    },
    confirmAddColumn() {
      if (!this.newColumn.prop || !this.newColumn.label) {
        this.$message.error('字段名和显示名称不能为空')
        return
      }
      this.columns.push(JSON.parse(JSON.stringify(this.newColumn)))
      this.addDialogVisible = false
    },
    moveUp(index) {
      if (index <= 0) return
      var temp = this.columns[index]
      this.$set(this.columns, index, this.columns[index - 1])
      this.$set(this.columns, index - 1, temp)
    },
    moveDown(index) {
      if (index >= this.columns.length - 1) return
      var temp = this.columns[index]
      this.$set(this.columns, index, this.columns[index + 1])
      this.$set(this.columns, index + 1, temp)
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.config-table-wrap {
  margin-top: 10px;
}
</style>
