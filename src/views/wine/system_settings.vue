<template>
  <div class="app-container">
    <el-form ref="settingsForm" :model="settings" :rules="rules" label-width="150px">
      <!--<el-form-item label="系统名称" prop="systemName">
        <el-input v-model="settings.systemName" placeholder="请输入系统名称" />
      </el-form-item>-->

      <el-form-item label="容积计算方式" prop="calculate">
        <el-select v-model="settings.calculateType" placeholder="请选择计算方式">
          <el-option label="经验公式" value="0" />
          <el-option label="等效圆柱折算（平均半径）" value="1" />
          <el-option label="等效圆台折算" value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="折算酒度(%vol)" prop="volConvert">
        <el-input-number v-model="settings.volConvert" :min="1" />
      </el-form-item>

      <el-form-item label="出入库阈值(mm)" prop="inOutThreshold">
        <el-input-number v-model="settings.inOutThreshold" :min="1" />
      </el-form-item>

      <el-form-item label="渗漏告警阈值(mm)" prop="leakThreshold">
        <el-input-number v-model="settings.leakThreshold" :min="1" />
      </el-form-item>

      <el-form-item label="登录超时时间(s)" prop="timeout">
        <el-input-number v-model="settings.timeout" :min="1" />
      </el-form-item>

      <el-form-item label="报警蜂鸣时间(s)" prop="beepTime">
        <el-input-number v-model="settings.beepTime" :min="0" />
      </el-form-item>
      <el-form-item label="是否弹窗报警" prop="popupAlarm">
        <el-select v-model="settings.popupAlarm" placeholder="请选择是否弹窗告警">
          <el-option label="否" value="0" />
          <el-option label="是" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="缸盖异动报警" prop="lidWarnMode">
        <el-select v-model="settings.lidWarnMode" placeholder="请选择异动告警开关">
          <el-option label="开" value="0" />
          <el-option label="关" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </el-form-item>

    </el-form>

    <el-dialog :visible.sync="dialogVisible" title="提示">
      <span>{{ dialogMessage }}</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { setSystemSettings, getSystemSettings } from '@/api/wine_system'
export default {
  name: 'SystemSettings',
  data() {
    return {
      settings: {
        systemName: '',
        calculateType: '',
        popupAlarm: '',
        volConvert: '',
        inOutThreshold: '',
        leakThreshold: '',
        beepTime: 0.5,
        lidWarnMode: 0,
        timeout: 30
      },
      rules: {
        systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
        volConvert: [{ required: true, message: '请输入折算酒度', trigger: 'blur' }],
        inOutThreshold: [{ required: true, message: '请输入出入库阈值', trigger: 'blur' }],
        leakThreshold: [{ required: true, message: '请输入渗漏报警阈值', trigger: 'blur' }],
        beepTime: [{ required: true, message: '请输入蜂鸣报警时间', trigger: 'blur' }],
        timeout: [{ required: true, message: '请输入超时时间', trigger: 'blur' }]
      },
      dialogVisible: false,
      dialogMessage: ''
    }
  },
  created() {
    this.loadSettings()
  },
  methods: {
    saveSettings() {
      this.$refs.settingsForm.validate((valid) => {
        if (valid) {
          // console.log("setSystemSettings")
          setSystemSettings(this.settings).then(() => {
            this.dialogMessage = '设置已成功保存！'
            this.dialogVisible = true
          }).catch(error => {
            console.error('保存设置失败:', error)
            this.dialogMessage = '保存设置失败，请重试！'
            this.dialogVisible = true
          })
        } else {
          this.dialogMessage = '请检查输入的内容！'
          this.dialogVisible = true
        }
      })
    },
    loadSettings() {
      getSystemSettings().then(response => {
        this.settings.systemName = response.systemName
        this.settings.calculateType = response.calculateType
        this.settings.timeout = response.timeout
        this.settings.inOutThreshold = response.inOutThreshold
        this.settings.volConvert = response.volConvert
        this.settings.beepTime = response.beepTime
        this.settings.leakThreshold = response.leakThreshold
        this.settings.popupAlarm = response.popupAlarm
        this.settings.lidWarnMode = response.lidWarnMode
      }).catch(error => {
        console.error('获取设置失败:', error)
        this.dialogMessage = '获取设置失败，请重试！'
        this.dialogVisible = true
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.dialog-footer {
  text-align: right;
}
</style>
