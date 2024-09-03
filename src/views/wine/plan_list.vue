<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.plan_name" placeholder="方案名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
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
      <el-table-column align="center" label="方案ID" min-width="250">
        <template slot-scope="{row}">
          <span>{{ row.plan_id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="250px" align="center" label="方案名称">
        <template slot-scope="{row}">
          <span>{{ row.plan_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" label="增益" align="center">
        <template slot-scope="{row}">
          <span>{{ row.gain }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" label="峰值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.peak }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" label="补偿值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.compensation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="" align="center" min-width="230" class-name="small-padding fixed-width">
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
        <el-form-item label="方案ID" prop="plan_id" label-width="100px">
          <el-input v-model="temp.plan_id" :readonly="readOnly" />
        </el-form-item>
        <el-form-item label="方案名称" prop="plan_name" label-width="100px">
          <el-input v-model="temp.plan_name" />
        </el-form-item>
        <el-form-item label="增益" prop="gain" label-width="100px">
          <el-input v-model="temp.gain" />
        </el-form-item>
        <el-form-item label="峰值" prop="peak" label-width="100px">
          <el-input v-model="temp.peak" />
        </el-form-item>
        <el-form-item label="补偿值" prop="compensation" label-width="100px">
          <el-input v-model="temp.compensation" />
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
import { fetchList, deletePlan, createPlan, updatePlan } from '@/api/wine_plan'
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
        plan_id: ''
      },

      showReviewer: false,
      temp: {
        plan_id: undefined,
        plan_name: '',
        gain: '',
        peak: '',
        compensation: ''
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
        plan_id: [
          { required: true, message: '请输入方案ID', trigger: 'blur' }
        ],
        paln_name: [
          { required: true, message: '请输入方案名称', trigger: 'blur' }
        ],
        gain: [
          { required: true, message: '请输入增益', trigger: 'blur' }
        ],
        peak: [
          { required: true, message: '请输入峰值', trigger: 'blur' }
        ],
        compensation: [
          { required: true, message: '请输入补偿值', trigger: 'blur' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
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
      console.log('listQuery', this.listQuery)
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
        plan_id: undefined,
        plan_name: '',
        gain: '',
        peak: '',
        compensation: ''
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
          console.log(this.temp)
          createPlan(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.total += 1
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
          updatePlan(tempData).then(() => {
            const index = this.list.findIndex(v => v.plan_id === this.temp.plan_id)
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
      this.$confirm('确定删除该方案, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePlan(row).then(response => {
          this.$notify({
            title: '操作成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.total -= 1 // 更新总数
          this.list.splice(index, 1)
        }).catch(error => {
          console.error('Error deleting user:', error)
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
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['plan_id', 'plan_name', 'gain', 'peak', 'compensation']
        const filterVal = ['plan_id', 'plan_name', 'gain', 'peak', 'compensation']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
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
