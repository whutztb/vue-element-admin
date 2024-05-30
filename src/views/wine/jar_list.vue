<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.asset_id" placeholder="陶坛编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="陶坛编号" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.asset_id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="陶坛名称">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_name }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="陶坛位置" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" label="陶坛高度" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_height }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100px" label="陶坛液位" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.wine_level }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="液位更新日期">
        <template slot-scope="scope">
          <span>{{ scope.row.level_update_time }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column min-width="300px" label="Title">
        <template slot-scope="{row}">
          <router-link :to="'/example/edit/'+row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column> -->

      <el-table-column align="center" label="" width="220">
        <template slot-scope="scope">
          <router-link :to="'/example/edit/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
            <el-button type="danger" size="small" icon="el-icon-delete">
              删除
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList } from '@/api/wine_jar'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'JarList',
  components: { Pagination },
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
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      }

    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log('response', response)
        this.list = response.items
        this.total = response.total_count
        this.listLoading = false
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
