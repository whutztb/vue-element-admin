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
      <el-input v-model="listQuery.jar_id" placeholder="指示灯ID" style="width: 120px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!--<el-input v-model="listQuery.jar_type" placeholder="缸型" style="width: 120px;" class="filter-item" @keyup.enter.native="handleFilter" />-->
      <!--<el-input v-model="listQuery.wine_name" placeholder="品名" style="width: 120px;" class="filter-item" @keyup.enter.native="handleFilter" />-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
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
      <el-table-column v-if="true" align="center" min-width="100">
        <template slot="header">
          <span>指示灯ID</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.jar_id }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="65px" align="center">
        <template slot="header">
          <span>酒库<br>编号</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.cellar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="65px" align="center">
        <template slot="header">
          <span>房间<br>编号</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.jar_pos }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="65px" align="center">
        <template slot="header">
          <span>坛号</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.jar_no }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column min-width="120px" label="生产年月" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.wine_date }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center" label="缸型">
        <template slot-scope="scope">
          <span>{{ scope.row.jar_type }}</span>
        </template>
      </el-table-column>-->
      <el-table-column v-if="false" min-width="60px" align="center">
        <template slot="header">
          <span>缸高<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.jar_height }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="60px" align="center">
        <template slot="header">
          <span>净空(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.air_height }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="60px" align="center">
        <template slot="header">
          <span>液位<br>(mm)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_level }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="60" align="center">
        <template slot="header">
          <span>体积<br>(m³)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_volume }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="65" align="center">
        <template slot="header">
          <span>酒度<br>(%vol)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_vol }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="55" align="center">
        <template slot="header">
          <span>温度<br>(℃)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_temp }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="false" min-width="75" align="center">
        <template slot="header">
          <span>密度<br>(t/m³)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_rou }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="80" align="center">
        <template slot="header">
          <span>原度重量<br>(t)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_weight }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="80" align="center">
        <template slot="header">
          <span>折算酒度<br>(%vol)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_vol_convert }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" min-width="80" align="center">
        <template slot="header">
          <span>折算重量<br>(t)</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.wine_weight_convert }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="155px" align="center">
        <template slot="header">
          <span>更新时间</span>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.level_update_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status!='deleted'" size="mini" type="info" icon="el-icon-document" @click="handleHistory(row,$index)">
            历史
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="showChart" :title="chartTitle" width="650px" :styles="{ height: '300px' }" class="custom-dialog">
      <div ref="chartContainer" class="chart-container" :style="{ height: '300px', width: '100%' }" />
      <!-- 表格容器 -->
      <el-table :data="historyDataTable" class="custom-table" style="width: 100%;background-color: #394056;">
        <el-table-column prop="rec_time" label="时间" width="230" align="center" />
        <el-table-column prop="rec_lv" label="液位（mm）" width="210" align="center" />
      </el-table>
    </el-dialog>
    <!--<history_chart v-if="historyDataTable.length" :historyDataTable="historyDataTable" />-->

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="陶坛ID" prop="jar_id" label-width="150px">
          <el-input v-model="temp.jar_id" :readonly="readOnly" />
        </el-form-item>
        <el-form-item label="缸型" prop="jar_type" label-width="150px">
          <el-select v-model="temp.jar_type" class="filter-item" placeholder="请选择" @change="onJarTypeChange">
            <el-option v-for="item in jarTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="酒库编号" prop="cellar_pos" label-width="150px">
          <el-select v-model="temp.cellar_pos" class="filter-item" placeholder="请选择">
            <el-option v-for="item in factoryPosOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间编号" prop="jar_pos" label-width="150px">
          <el-select v-model="temp.jar_pos" class="filter-item" placeholder="请选择">
            <el-option v-for="item in cellarPosOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="陶坛编号" prop="jar_no" label-width="150px">
          <el-input v-model="temp.jar_no" />
        </el-form-item>
        <el-form-item label="陶坛高(mm)" prop="jar_height" label-width="150px">
          <el-input v-model="temp.jar_height" placeholder="选择坛型后自动填充，可手动修改" />
        </el-form-item>
        <el-form-item label="液位(mm)" prop="wine_level" label-width="150px">
          <el-input v-model="temp.wine_level" />
        </el-form-item>
        <el-form-item label="酒度(%vol)" prop="wine_vol" label-width="150px">
          <el-input v-model="temp.wine_vol" />
        </el-form-item>
        <el-form-item label="温度(℃)" prop="wine_temp" label-width="150px">
          <el-input v-model="temp.wine_temp" />
        </el-form-item>
        <el-form-item label="品名" prop="wine_name" label-width="150px">
          <el-input v-model="temp.wine_name" />
        </el-form-item>
        <el-form-item label="香型" prop="wine_type" label-width="150px">
          <el-input v-model="temp.wine_type" />
        </el-form-item>
        <el-form-item label="生产厂区" prop="factory" label-width="150px">
          <el-input v-model="temp.factory" />
        </el-form-item>
        <el-form-item label="入库时间" prop="wine_date" label-width="150px">
          <el-date-picker v-model="temp.wine_date" type="date" placeholder="请选择日期" />
        </el-form-item>
        <el-form-item label="补偿值（mm）" prop="compensation_value" label-width="150px">
          <el-input v-model="temp.compensation_value" />
        </el-form-item>
        <el-form-item label="更新时间" prop="level_update_time" label-width="150px">
          <el-date-picker v-model="temp.level_update_time" type="datetime" placeholder="请选择日期" />
        </el-form-item>
        <el-form-item label="密度(t/m³)" prop="wine_rou_input" label-width="150px">
          <el-tooltip
            class="item"
            effect="dark"
            content="如果不为空，将按照输入密度计算酒量，如果为空，自动根据酒度温度查表计算密度"
            placement="top"
            :visible-arrow="false"
          >
            <el-input
              v-model="temp.wine_rou_input"
              placeholder="点击输入密度(按指定密度计算)"
            />
          </el-tooltip>
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

    <!-- 导入陶坛列表对话框 -->
    <el-dialog :visible.sync="importDialogVisible" title="导入陶坛列表" width="750px" @opened="onImportDialogOpened">
      <el-alert v-if="importSkipCount > 0" :title="'CSV中存在 ' + importSkipCount + ' 行空行或不完整数据，将自动跳过'" type="warning" :closable="false" show-icon style="margin-bottom:12px" />
      <div v-if="!importData.length">
        <input ref="csvFileInput" type="file" accept=".csv" style="display:none" @change="handleFileSelect">
        <div style="text-align:center;padding:30px">
          <el-button type="primary" icon="el-icon-folder-opened" size="large" @click="triggerCsvInput">
            选择 CSV 文件
          </el-button>
          <div style="margin-top:15px;color:#999;font-size:13px;line-height:1.8">
            CSV 需包含以下列：Address1（地址标识1）, Address2（地址标识2）, Address3（地址标识3）, Address4（地址标识4）, Jar No.（坛号）, Distance:mm（测量值）, Date（测量日期）, Test Time（测量时间）<br>
            可选列：factory（陶坛类型）, alcohol（酒度）, temperature（温度）<br>
            陶坛ID拼接规则：提取地址标识1~4中的字母数字 + 坛号数字（坛号补零/截取至3位），以“-”连接
          </div>
        </div>
      </div>
      <div v-else>
        <div style="margin-bottom:12px">
          <span>文件：<b>{{ importFileName }}</b></span>
          <span style="margin-left:20px">有效数据行数：<b>{{ importData.length }}</b></span>
          <span style="margin-left:20px">新增：<b style="color:#67C23A">{{ importNewCount }}</b></span>
          <span style="margin-left:20px">更新：<b style="color:#409EFF">{{ importUpdateCount }}</b></span>
        </div>
        <el-table :data="importPreviewData" border size="small" max-height="300" style="width:100%">
          <el-table-column prop="addr1" label="地址标识1" width="80" />
          <el-table-column prop="addr2" label="地址标识2" width="80" />
          <el-table-column prop="addr3" label="地址标识3" width="80" />
          <el-table-column prop="addr4" label="地址标识4" width="80" />
          <el-table-column prop="jar_no" label="坛号" width="80" />
          <el-table-column prop="jar_id" label="陶坛ID(拼接)" width="140" />
          <el-table-column prop="level" label="净空(mm)" width="80" />
          <el-table-column prop="date" label="日期" width="90" />
          <el-table-column prop="time" label="时间" width="80" />
          <el-table-column prop="factory" label="缸型" width="70" />
          <el-table-column prop="alcohol" label="酒度" width="60" />
          <el-table-column prop="temperature" label="温度" width="60" />
        </el-table>
        <div v-if="importData.length > 10" style="margin-top:5px;color:#999;text-align:center">
          ... 仅显示前10条，共 {{ importData.length }} 条
        </div>
        <div style="margin-top:10px">
          <el-button size="small" @click="resetImport">重新选择文件</el-button>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false; resetImport()">取消</el-button>
        <el-button v-if="importData.length" type="primary" :loading="importLoading" @click="confirmImport">
          确认导入（{{ importData.length }} 条）
        </el-button>
      </span>
    </el-dialog>

    <!-- 新酒库确认对话框 -->
    <el-dialog :visible.sync="newCellarDialogVisible" title="发现新酒库" width="500px">
      <div style="margin-bottom:12px">
        本次导入发现 <b>{{ newCellarData.length }}</b> 个酒库在酒库管理中尚不存在，是否自动创建？
      </div>
      <el-table :data="newCellarData" border size="small" max-height="250" style="width:100%">
        <el-table-column prop="cellar_pos" label="酒库编号" width="170" />
        <el-table-column prop="cellar_name" label="房间编号" width="170" />
        <el-table-column label="酒库ID" width="140">
          <template slot-scope="scope">
            {{ scope.row.cellar_pos + '-' + scope.row.cellar_name }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelCreateCellars">跳过</el-button>
        <el-button type="primary" @click="confirmCreateCellars">
          确认创建（{{ newCellarData.length }} 个）
        </el-button>
      </span>
    </el-dialog>

    <!-- 导入历史对话框 -->
    <el-dialog :visible.sync="importHistoryDialogVisible" title="导入历史" width="900px" @opened="fetchImportHistory">
      <el-table v-loading="importHistoryLoading" :data="importHistoryList" border size="small" max-height="400" style="width:100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="import_type" label="导入类型" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.import_type === 'web_csv'" type="primary" size="small">网页导入</el-tag>
            <el-tag v-else-if="scope.row.import_type === 'tcp_device'" type="success" size="small">设备上传</el-tag>
            <el-tag v-else type="info" size="small">{{ scope.row.import_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source_name" label="来源" min-width="150" show-overflow-tooltip />
        <el-table-column prop="user_or_device" label="操作人/设备" width="130" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="110">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'COMPLETED'" type="success" size="small">已完成</el-tag>
            <el-tag v-else-if="scope.row.status === 'IMPORTING'" type="warning" size="small">进行中</el-tag>
            <el-tag v-else-if="scope.row.status === 'FAILED'" type="danger" size="small">失败</el-tag>
            <el-tag v-else-if="scope.row.status === 'ROLLED_BACK'" type="info" size="small">已回退</el-tag>
            <el-tag v-else size="small">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="record_count" label="记录数" width="80" />
        <el-table-column prop="created_at" label="导入时间" width="160" />
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 'COMPLETED' && isAdministrator"
              type="danger"
              size="mini"
              icon="el-icon-refresh-left"
              @click="handleRollbackConfirm(scope.row)"
            >
              回退
            </el-button>
            <span v-else-if="scope.row.status === 'ROLLED_BACK'" style="color:#909399;font-size:12px">已回退</span>
            <span v-else style="color:#909399;font-size:12px">-</span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:10px;text-align:right">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="importHistoryTotal"
          :page-size="importHistoryQuery.limit"
          :current-page.sync="importHistoryQuery.page"
          @current-change="fetchImportHistory"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importHistoryDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, deleteJar, createJar, updateJar, exportJarList, getHistory, getTotalMass, getJarTypeOptions, getCellarPosOptions, getFactoryPosOptions, importJarCsv, createCellarsBatch, clearHistory, exportJarHistory, fetchImportSessions, rollbackImport } from '@/api/wine_jar'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import echarts from 'echarts'
import { MessageBox } from 'element-ui'
import { EventBus } from '@/utils/eventBus'

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
        cellar_pos: '',
        wine_name: '',
        startDate: '',
        endDate: '',
        export_jar_id: ''
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
        cellar_pos: '',
        jar_no: '',
        jar_height: '',
        wine_level: '',
        air_height: '',
        wine_vol: '',
        wine_rou: '',
        wine_rou_input: '',
        wine_weight: '',
        wine_weight_convert: '',
        wine_volume: '',
        wine_name: '',
        wine_temp: '',
        convert_fraction: '',
        wine_date: '',
        factory: '',
        wine_type: '',
        wine_vol_convert: '',
        level_update_time: '',
        compensation_value: 0,
        startDate: '',
        endDate: ''
      },
      cellarPosOptions: [],
      factoryPosOptions: [],
      jarTypeOptions: [],
      jarTypeHeightMap: {},
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
          { required: true, message: '请输入房间编号', trigger: 'blur' }
        ],
        cellar_pos: [
          { required: true, message: '请输入酒库编号', trigger: 'blur' }
        ],
        jar_no: [
          { required: true, message: '请输入陶坛编号', trigger: 'blur' }
        ],
        jar_height: [
          { required: true, message: '请输入陶坛高度', trigger: 'blur' }
        ],
        wine_level: [
          { required: true, message: '请输入陶坛液位', trigger: 'blur' }
        ],
        wine_temp: [
          { required: true, message: '请输入温度', trigger: 'blur' }
        ],
        wine_vol: [
          { required: true, message: '请输入酒度', trigger: 'blur' }
        ],
        wine_rou_input: [
          { required: false, message: '请输入密度', trigger: 'blur' }
        ],
        wine_name: [
          { required: true, message: '请输入品名', trigger: 'blur' }
        ],
        wine_type: [
          { required: true, message: '请输入香型', trigger: 'blur' }
        ],
        wine_date: [
          { required: true, message: '请输入入库时间', trigger: 'blur' }
        ],
        factory: [
          { required: true, message: '请输入生产厂区', trigger: 'blur' }
        ],
        compensation_value: [
          { required: false, message: '请输入补偿值', trigger: 'blur' }
        ],
        level_update_time: [
          { required: true, message: '请输入液位陶坛更新时间', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      showDialog: false,
      importDialogVisible: false,
      importData: [],
      importFileName: '',
      importLoading: false,
      importSkipCount: 0,
      importNewCount: 0,
      importUpdateCount: 0,
      newCellarDialogVisible: false,
      newCellarData: [],
      newCellarCreatedCount: 0,
      importHistoryDialogVisible: false,
      importHistoryList: [],
      importHistoryTotal: 0,
      importHistoryLoading: false,
      importHistoryQuery: {
        page: 1,
        limit: 20
      },
      showChart: false,
      chartTitle: '',
      className: 'chart',
      historyData: [], // 初始化为空数组
      historyDataTable: [], // 初始化为空数组
      lidOpenData: [], // 初始化为空数组
      volHistoryData: []
      // socket: null  // 定义 socket 实例
    }
  },
  computed: {
    isAdministrator() {
      const userRoles = this.$store.state.user.roles || []
      return userRoles.includes('管理员')
    },
    importPreviewData() {
      return this.importData.slice(0, 10)
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
    if (window.EventBus) {
      window.EventBus.$on('updateJarListUI', this.getList)
    } else {
      console.error('全局 EventBus 未找到，使用局部 EventBus')
      EventBus.$on('updateJarListUI', this.getList)
    }
    this.loadSavedQuery()
  },
  mounted() {
    this.initChart()
    this.fetchCellarPosOptions()
    this.fetchFactoryPosOptions()
    this.fetchJarTypeOptions()
  },
  beforeDestroy() {
    // 清除事件监听
    if (window.EventBus) {
      window.EventBus.$off('updateJarListUI', this.getList)
    } else {
      EventBus.$off('updateJarListUI', this.getList)
    }
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    // 获取酒库位置
    fetchCellarPosOptions() {
      getCellarPosOptions().then(response => {
        this.cellarPosOptions = response.items.map(item => item.cellar_name)
      })
    },
    // 获取厂区位置
    fetchFactoryPosOptions() {
      getFactoryPosOptions().then(response => {
        this.factoryPosOptions = response.items.map(item => item.cellar_pos)
      })
    },
    // 获取陶坛类型
    fetchJarTypeOptions() {
      getJarTypeOptions().then(response => {
        this.jarTypeOptions = response.items.map(item => item.jar_type_name)
        this.jarTypeHeightMap = {}
        response.items.forEach(item => {
          this.jarTypeHeightMap[item.jar_type_name] = item.jar_std_height
        })
      })
    },

    onJarTypeChange(val) {
      if (val && this.jarTypeHeightMap[val] != null) {
        this.temp.jar_height = this.jarTypeHeightMap[val]
      }
    },
    getList() {
      // console.log('jar listQuery', this.listQuery)
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.items
        this.total = response.total_count
        this.listLoading = false
      })
    },
    loadSavedQuery() {
      const savedQuery = localStorage.getItem('timeRangeQuery_jar')
      if (savedQuery) {
        const query = JSON.parse(savedQuery)
        // 确保日期字符串转换为 Date 对象
        if (query.startDate) query.startDate = new Date(query.startDate)
        if (query.endDate) query.endDate = new Date(query.endDate)
        this.listQuery = {
          ...this.listQuery, // 保持当前的分页设置
          ...query, // 应用保存的搜索条件
          page: 1, // 但强制重置为第一页
          limit: this.listQuery.limit // 保持当前的每页数量
        }
        this.getList() // 确保 listQuery 更新后调用 getList
      } else {
        this.getList()
      }
    },
    saveQuery() {
      localStorage.setItem('timeRangeQuery_jar', JSON.stringify(this.listQuery))
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

      this.saveQuery()
    },
    handleFilter() {
      this.handleConditionChange()
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
        cellar_pos: '',
        jar_no: '',
        jar_height: '',
        air_height: '',
        wine_level: '',
        wine_vol: '',
        wine_volume: '',
        wine_rou: '',
        wine_rou_input: '',
        wine_weight: '',
        wine_weight_convert: '',
        wine_name: '',
        convert_fraction: '',
        wine_date: '',
        factory: '',
        wine_type: '',
        wine_temp: '',
        wine_vol_convert: '',
        level_update_time: '',
        compensation_value: 0,
        startDate: '',
        endDate: ''
      }
    },
    handleAddUp() {
      getTotalMass(this.listQuery).then(response => {
        MessageBox.alert(
          `符合查询条件折算酒量(吨): ${response.message}`,
          '统计结果',
          {
            confirmButtonText: '确定',
            type: 'info',
            dangerouslyUseHTMLString: true // 允许使用 HTML
          }
        )
      })
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
          if (!this.temp.compensation_value && this.temp.compensation_value !== 0) {
            this.temp.compensation_value = 0
          }
          const date = new Date(this.temp.level_update_time)
          const formattedDateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
          this.temp.level_update_time = formattedDateTime
          const date2 = new Date(this.temp.wine_date)
          const formattedDateTime2 = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, '0')}-${String(date2.getDate()).padStart(2, '0')}`
          this.temp.wine_date = formattedDateTime2
          createJar(this.temp).then(() => {
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
    handleMoreDetail(row) {
      this.temp = Object.assign({}, row)
      MessageBox.alert(
        `陶坛ID: ${this.temp.jar_id}<br>品名: ${this.temp.wine_name}<br>香型: ${this.temp.wine_type}<br>陶坛类型: ${this.temp.jar_type}<br>陶坛高度(mm): ${this.temp.jar_height}<br>折酒系数: ${this.temp.convert_fraction}<br>入库时间: ${this.temp.wine_date}<br>生产厂区: ${this.temp.factory}<br>温度(℃): ${this.temp.wine_temp}<br>原始酒度: ${this.temp.wine_vol}<br>折算酒度: ${this.temp.wine_vol_convert}<br>测量数据更新日期: ${this.temp.level_update_time}`,
        '更多细节',
        {
          confirmButtonText: '确定',
          type: 'info',
          dangerouslyUseHTMLString: true // 允许使用 HTML
        }
      )
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
          if (!this.temp.compensation_value && this.temp.compensation_value !== 0) {
            this.temp.compensation_value = 0
          }
          // 格式化日期（将Wed May 01 2024 16:15:23 GMT+0800 (中国标准时间)格式化为2024-05-01 16:15:23）
          const date = new Date(this.temp.level_update_time)
          const formattedDateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
          this.temp.level_update_time = formattedDateTime
          const date2 = new Date(this.temp.wine_date)
          const formattedDateTime2 = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, '0')}-${String(date2.getDate()).padStart(2, '0')}`
          this.temp.wine_date = formattedDateTime2
          // const tempData = Object.assign({}, this.temp)
          // 确保 wine_rou_input 字段存在，即使为空
          const tempData = {
            ...this.temp,
            wine_rou_input: this.temp.wine_rou_input || '' // 确保 wine_rou_input 被传递
          }
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateJar(tempData).then((response) => {
            this.temp.wine_volume = response.wine_volume // 将 wine_volume 赋值给 this.temp.wine_volume
            this.temp.wine_weight = response.wine_weight
            this.temp.wine_weight_convert = response.wine_weight_convert
            this.temp.convert_fraction = response.convert_fraction
            this.temp.wine_rou = response.wine_rou
            this.temp.wine_temp = response.wine_temp
            this.temp.wine_vol = response.wine_vol
            this.temp.wine_vol_convert = response.wine_vol_convert
            const index = this.list.findIndex(v => v.jar_id === this.temp.jar_id)
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
        deleteJar(row).then(response => {
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
          message: '取消删除'
        })
      })
    },
    handleClearHistory(row, index) {
      this.$confirm('确定删除该陶坛历史数据, 删除后将无法恢复，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        clearHistory(row).then(response => {
          this.$notify({
            title: '操作成功',
            message: '清除历史成功',
            type: 'success',
            duration: 2000
          })
        }).catch(error => {
          console.error('清除历史失败:', error)
          this.$notify({
            title: '错误',
            message: '清除历史失败',
            type: 'error',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消清除历史'
        })
      })
    },
    handleHistory(row, index) {
      // 传入检索的时间范围
      row.startDate = this.listQuery.startDate
      row.endDate = this.listQuery.endDate
      getHistory(row).then(response => {
        const message = response.message
        // 如果 response.message 是字符串，尝试将其解析为数组
        if (typeof message === 'string') {
          console.log('888')
        } else {
          this.historyData = response.message.level_msg // 直接赋值
          this.historyDataTable = [...this.historyData].sort((a, b) =>
            new Date(b.rec_time) - new Date(a.rec_time)
          )
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
          // const recWeights = sortedHistoryData.map(item => item.rec_weight) // 提取 rec_weight
          const recLevels = sortedHistoryData.map(item => item.rec_lv)
          const minRecLevel = Math.min(...recLevels)
          const maxRecLevel = Math.max(...recLevels)
          this.chart.setOption({
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
              left: 'center',
              orient: 'horizontal',
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
              type: 'category',
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
              data: timestamps
            }],
            yAxis: [{
              type: 'value',
              name: '液位（mm）',
              min: Math.round(minRecLevel - 50),
              max: Math.round(maxRecLevel + 50),
              nameTextStyle: {
                color: '#F1F1F3'
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
            }],
            series: [{
              name: '液位值（mm）',
              type: 'line',
              connectNulls: true,
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
              data: recLevels
            }]
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
        const tHeader = ['陶坛ID', '缸型', '缸高', '房间编号', '液位(mm)', '现有酒量(t)', '品名', '更新时间']
        const filterVal = ['jar_id', 'jar_type', 'jar_height', 'jar_pos', 'wine_level', 'wine_volume', 'wine_name', 'level_update_time']
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
      exportJarList(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = '陶坛清单.xlsx' // 设置下载的文件名
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
    // ========== CSV 导入相关方法 ==========
    handleImportCsv() {
      this.resetImport()
      this.importDialogVisible = true
    },
    onImportDialogOpened() {
      this.$nextTick(() => {
        if (this.$refs.csvFileInput) {
          this.$refs.csvFileInput.value = ''
        }
      })
    },
    resetImport() {
      this.importData = []
      this.importFileName = ''
      this.importSkipCount = 0
      this.importNewCount = 0
      this.importUpdateCount = 0
      if (this.$refs.csvFileInput) {
        this.$refs.csvFileInput.value = ''
      }
    },
    triggerCsvInput() {
      if (this.$refs.csvFileInput) {
        this.$refs.csvFileInput.click()
      }
    },
    handleFileSelect(e) {
      const file = e.target.files[0]
      if (!file) return
      this.importFile = file
      this.importFileName = file.name
      const reader = new FileReader()
      reader.onload = (ev) => {
        const buf = ev.target.result
        let text = ''
        const decoders = ['gbk', 'utf-8']
        for (const enc of decoders) {
          const decoded = new TextDecoder(enc).decode(new Uint8Array(buf))
          if ((decoded.match(/�/g) || []).length < decoded.length * 0.01) {
            text = decoded
            break
          }
        }
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
        const lines = text.split(/\r?\n/)
        if (lines.length < 2) {
          this.$message.error('CSV文件格式不正确或无数据')
          return
        }
        const headers = lines[0].replace(/\s+$/, '').replace(/,$/, '').split(',')
        const jarNoIdx = headers.indexOf('Jar No.')
        const addr1Idx = headers.indexOf('Address1')
        const addr2Idx = headers.indexOf('Address2')
        const addr3Idx = headers.indexOf('Address3')
        const addr4Idx = headers.indexOf('Address4')
        const levelIdx = headers.indexOf('Distance:mm')
        const dateIdx = headers.indexOf('Date')
        const timeIdx = headers.indexOf('Test Time')
        const factoryIdx = headers.indexOf('factory')
        const alcoholIdx = headers.indexOf('alcohol')
        const tempIdx = headers.indexOf('temperature')

        if (jarNoIdx === -1 || levelIdx === -1 || dateIdx === -1 || timeIdx === -1) {
          this.$message.error('CSV缺少必要列：Jar No., Distance:mm, Date, Test Time')
          return
        }

        const data = []
        let skipCount = 0
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          if (!line || !line.trim()) { skipCount++; continue }
          const parts = line.split(',')
          const addr1 = addr1Idx >= 0 ? (parts[addr1Idx] || '').trim() : ''
          const addr2 = addr2Idx >= 0 ? (parts[addr2Idx] || '').trim() : ''
          const addr3 = addr3Idx >= 0 ? (parts[addr3Idx] || '').trim() : ''
          const addr4 = addr4Idx >= 0 ? (parts[addr4Idx] || '').trim() : ''
          const jar_no = (parts[jarNoIdx] || '').trim()
          const extractAlnum = (s) => {
            const m = s.match(/[a-zA-Z0-9]/g)
            return m ? m.join('') : ''
          }
          const idParts = [];
          [addr1, addr2, addr3, addr4].forEach(f => {
            const alnum = extractAlnum(f)
            if (alnum) idParts.push(alnum)
          })
          const jarDigits = jar_no.replace(/\D/g, '')
          if (!jarDigits) { skipCount++; continue }
          const jar_no_clean = jarDigits.padStart(3, '0').slice(-3)
          idParts.push(jar_no_clean)
          const jar_id = idParts.join('-')
          const level = (parts[levelIdx] || '').trim()
          if (!level) { skipCount++; continue }
          data.push({
            addr1: addr1,
            addr2: addr2,
            addr3: addr3,
            addr4: addr4,
            jar_no: jar_no_clean,
            jar_id: jar_id,
            level: level,
            date: dateIdx >= 0 ? parts[dateIdx] || '' : '',
            time: timeIdx >= 0 ? parts[timeIdx] || '' : '',
            factory: factoryIdx >= 0 ? (parts[factoryIdx] || '').trim() : '',
            alcohol: alcoholIdx >= 0 ? (parts[alcoholIdx] || '').trim() : '',
            temperature: tempIdx >= 0 ? (parts[tempIdx] || '').trim() : ''
          })
        }
        this.importData = data
        this.importSkipCount = skipCount
        this.importNewCount = data.length
        this.importUpdateCount = 0
      }
      reader.readAsArrayBuffer(file)
    },
    confirmImport() {
      if (!this.importData.length) {
        this.$message.warning('没有可导入的数据')
        return
      }
      if (!this.importFile) {
        this.$message.error('请重新选择文件')
        return
      }
      this.importLoading = true
      const formData = new FormData()
      formData.append('file', this.importFile)

      importJarCsv(formData).then(res => {
        const msg = res.message || '导入完成'
        const updated = res.updated_count || 0
        const created = res.created_count || 0
        this.$notify({
          title: '导入成功',
          message: `${msg}（更新 ${updated} 条，新增 ${created} 条）`,
          type: 'success',
          duration: 3000
        })
        this.importDialogVisible = false
        this.importLoading = false
        const newCellars = res.new_cellars || []
        if (newCellars.length > 0) {
          this.newCellarData = newCellars
          this.newCellarCreatedCount = 0
          this.newCellarDialogVisible = true
        } else {
          this.resetImport()
          this.getList()
        }
      }).catch(() => {
        this.importLoading = false
        this.$notify({
          title: '导入失败',
          message: '处理 CSV 文件时出错，请检查文件格式和数据',
          type: 'error',
          duration: 3000
        })
      })
    },
    confirmCreateCellars() {
      createCellarsBatch({ cellars: this.newCellarData }).then(res => {
        this.newCellarCreatedCount = res.created_count || 0
        this.$notify({
          title: '创建完成',
          message: `成功创建 ${this.newCellarCreatedCount} 个酒库`,
          type: 'success',
          duration: 3000
        })
        this.newCellarDialogVisible = false
        this.resetImport()
        this.getList()
      }).catch(() => {
        this.$notify({
          title: '创建失败',
          message: '批量创建酒库时出错',
          type: 'error',
          duration: 3000
        })
      })
    },
    cancelCreateCellars() {
      this.newCellarDialogVisible = false
      this.resetImport()
      this.getList()
    },
    // ========== 导入历史与回退 ==========
    handleImportHistory() {
      this.importHistoryQuery.page = 1
      this.importHistoryList = []
      this.importHistoryTotal = 0
      this.importHistoryDialogVisible = true
    },
    fetchImportHistory() {
      this.importHistoryLoading = true
      fetchImportSessions(this.importHistoryQuery).then(res => {
        this.importHistoryList = res.items || []
        this.importHistoryTotal = res.total || 0
        this.importHistoryLoading = false
      }).catch(() => {
        this.importHistoryLoading = false
        this.$message.error('获取导入历史失败')
      })
    },
    handleRollbackConfirm(row) {
      this.$confirm(
        `确认回退导入记录 #${row.id}？<br>
        来源：${row.source_name}<br>
        记录数：${row.record_count}<br>
        此操作将恢复被修改的 Stock 数据，并删除本次导入产生的 Record 记录。`,
        '回退确认',
        {
          confirmButtonText: '确认回退',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        this.doRollback(row)
      }).catch(() => {})
    },
    doRollback(row) {
      rollbackImport({ import_session_id: row.id }).then(res => {
        this.$notify({
          title: '回退成功',
          message: res.message || '导入数据已回退',
          type: 'success',
          duration: 3000
        })
        this.fetchImportHistory()
        this.getList()
      }).catch(() => {
        this.$notify({
          title: '回退失败',
          message: '回退操作出错',
          type: 'error',
          duration: 3000
        })
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
    exportHistory(row, index) {
      this.downloadLoading = true // 开始下载时显示加载状态
      this.listQuery.export_jar_id = row.jar_id
      // 发起请求以获取 Excel 文件，传递查询参数
      exportJarHistory(this.listQuery)
        .then(blob => { // 直接获取 Blob 对象
          const url = window.URL.createObjectURL(blob) // 创建 Blob URL
          const a = document.createElement('a') // 创建一个链接元素
          a.href = url
          a.download = `历史数据_${row.jar_no}.xlsx` // 设置下载的文件名
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
.ellipsis {
  display: inline-block;
  width: 100%; /* 或者根据实际需求设置固定宽度 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}
.custom-table {
  background-color: #394056; /* 设置表格背景色 */
  color: rgb(61, 152, 51); /* 设置表格文本颜色 */
}
.custom-table .el-table__body tr:hover {
  background-color: #394056;
}
.custom-table .el-table__cell {
  background-color: #394056; /* 设置单元格背景色 */
  color: #fff; /* 设置单元格文本颜色 */
}

.custom-table .el-table__body td {
  background-color: #394056;
}

</style>
