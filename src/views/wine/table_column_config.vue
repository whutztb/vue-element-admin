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
        提示：勾选"显示"来控制列是否可见；点击上下箭头调整排序；修改各项属性后点击"保存配置"生效。展开每行可配置该字段在"更多详情/新增/编辑"弹窗中的显示、必填、表单类型与默认值。
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

        <el-table-column label="最小宽度" min-width="90" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.minWidth" size="small" placeholder="如: 80" />
          </template>
        </el-table-column>

        <el-table-column label="固定位置" min-width="110" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.fixed" size="small" placeholder="不固定" style="width: 100%;">
              <el-option label="不固定" value="" />
              <el-option label="左侧" value="left" />
              <el-option label="右侧" value="right" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="渲染类型" min-width="110" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.type" size="small" style="width: 100%;">
              <el-option label="文本" value="text" />
              <el-option label="Tag" value="tag" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="Tag配置" min-width="200" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.tagMappings && scope.row.tagMappings.length > 0" style="display: flex; flex-direction: column; gap: 4px;">
              <div v-for="(m, idx) in scope.row.tagMappings" :key="idx" style="display: flex; gap: 4px;">
                <el-input v-model="m.value" size="small" placeholder="值" style="width: 50px;" />
                <el-input v-model="m.text" size="small" placeholder="文字" style="flex: 1;" />
                <el-button type="text" size="mini" icon="el-icon-delete" style="color: #F56C6C;" @click="scope.row.tagMappings.splice(idx, 1)" />
              </div>
              <el-button type="text" size="mini" icon="el-icon-plus" style="padding: 0;" @click="scope.row.tagMappings.push({ value: '', text: '' })">添加映射</el-button>
            </div>
            <div v-else-if="scope.row.type === 'tag'" style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; gap: 4px;">
                <el-select v-model="scope.row.tagCondition" size="small" placeholder="条件" style="flex: 1;">
                  <el-option label="等于" value="eq" />
                  <el-option label="非空" value="truthy" />
                </el-select>
                <el-input v-if="scope.row.tagCondition === 'eq'" v-model="scope.row.tagValue" size="small" placeholder="对比值" style="width: 60px;" />
              </div>
              <el-select v-model="scope.row.tagType" size="small" placeholder="类型" style="width: 100%;">
                <el-option label="success" value="success" />
                <el-option label="warning" value="warning" />
                <el-option label="danger" value="danger" />
                <el-option label="info" value="info" />
              </el-select>
              <el-input v-model="scope.row.tagText" size="small" placeholder="文字" style="width: 100%;" />
            </div>
            <span v-else style="color: #C0C4CC; font-size: 12px;">-</span>
          </template>
        </el-table-column>

        <el-table-column label="弹窗显示" min-width="130" align="center">
          <template slot-scope="scope">
            <div class="stack-checkboxes">
              <el-checkbox v-model="scope.row.showInDetail">更多详情</el-checkbox>
              <el-checkbox v-model="scope.row.showInCreate">新增弹窗</el-checkbox>
              <el-checkbox v-model="scope.row.showInEdit">编辑弹窗</el-checkbox>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="必填/只读" min-width="110" align="center">
          <template slot-scope="scope">
            <div class="stack-checkboxes">
              <el-checkbox v-model="scope.row.requiredCreate" :disabled="!scope.row.showInCreate">新增必填</el-checkbox>
              <el-checkbox v-model="scope.row.requiredEdit" :disabled="!scope.row.showInEdit">编辑必填</el-checkbox>
              <el-checkbox v-model="scope.row.readonlyOnEdit" :disabled="!scope.row.showInEdit">编辑只读</el-checkbox>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="表单类型" min-width="200" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.formType" size="small" style="width: 100%; margin-bottom: 4px;">
              <el-option label="文本输入" value="input" />
              <el-option label="数字输入" value="number" />
              <el-option label="下拉选择" value="select" />
              <el-option label="日期" value="date" />
              <el-option label="日期时间" value="datetime" />
              <el-option label="开关" value="switch" />
            </el-select>
            <el-select v-if="scope.row.formType === 'select'" v-model="scope.row.formOptionsSource" size="small" style="width: 100%;" placeholder="选项来源">
              <el-option label="自定义选项" value="static" />
              <el-option label="陶坛类型(jarTypeOptions)" value="jarTypeOptions" />
              <el-option label="栋号(factoryPosOptions)" value="factoryPosOptions" />
              <el-option label="库号(cellarPosOptions)" value="cellarPosOptions" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="自定义选项" min-width="220" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.formType === 'select' && scope.row.formOptionsSource === 'static'" style="display: flex; flex-direction: column; gap: 4px;">
              <div v-for="(op, idx) in scope.row.formOptions" :key="idx" style="display: flex; gap: 4px;">
                <el-input v-model="op.value" size="small" placeholder="值" style="width: 80px;" />
                <el-input v-model="op.label" size="small" placeholder="显示文字" style="flex: 1;" />
                <el-button type="text" size="mini" icon="el-icon-delete" style="color: #F56C6C;" @click="scope.row.formOptions.splice(idx, 1)" />
              </div>
              <el-button type="text" size="mini" icon="el-icon-plus" style="padding: 0;" @click="ensureFormOptions(scope.row).push({ value: '', label: '' })">添加选项</el-button>
            </div>
            <span v-else style="color: #C0C4CC; font-size: 12px;">-</span>
          </template>
        </el-table-column>

        <el-table-column label="新增时默认值" min-width="120" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.defaultValue" size="small" placeholder="新增时的默认值" />
          </template>
        </el-table-column>

        <el-table-column label="占位提示(placeholder)" min-width="140" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.placeholder" size="small" placeholder="输入框占位文字" />
          </template>
        </el-table-column>

        <el-table-column label="辅助提示(tooltip)" min-width="160" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.tooltip" size="small" placeholder="鼠标悬停提示，留空则不显示" />
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
import { createColumnDefaults, DEFAULT_COLUMNS_MAP, mergeColumnConfig } from '@/config/jarListColumns'

const PAGE_OPTIONS = [
  { key: 'jar_list', name: '陶坛管理' }
]

export default {
  name: 'TableColumnConfig',
  data() {
    return {
      pageOptions: PAGE_OPTIONS,
      allConfigs: {},
      selectedPage: '',
      columns: [],
      addDialogVisible: false,
      newColumn: createColumnDefaults({ prop: '', label: '', minWidth: '80' })
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
          const defaults = DEFAULT_COLUMNS_MAP[page.key] || []
          const saved = (res && res.columns) || []
          cache[page.key] = mergeColumnConfig(saved, defaults)
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
      this.newColumn = createColumnDefaults({ prop: '', label: '', minWidth: '80' })
      this.addDialogVisible = true
    },
    ensureFormOptions(row) {
      if (!row.formOptions) {
        this.$set(row, 'formOptions', [])
      }
      return row.formOptions
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
.stack-checkboxes {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
</style>
