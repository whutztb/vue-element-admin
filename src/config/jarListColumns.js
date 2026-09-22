// jar_list 页面的字段配置：默认值 + 与后端已保存配置的合并逻辑
// 表单渲染类型可选项来源：jarTypeOptions / factoryPosOptions / cellarPosOptions（对应 jar_list.vue 中已获取的动态下拉数据）

export function createColumnDefaults(base) {
  return Object.assign(
    {
      // 表格显示
      fixed: '',
      visible: true,
      type: 'text',
      // 弹窗/表单相关配置
      showInDetail: false, // 是否在"更多"详情弹窗中展示
      showInCreate: false, // 是否在"新增"弹窗中展示
      showInEdit: false, // 是否在"编辑"弹窗中展示
      requiredCreate: false, // 新增时是否必填
      requiredEdit: false, // 编辑时是否必填
      readonlyOnEdit: false, // 编辑时该字段是否只读
      formType: 'input', // input | number | select | date | datetime | switch
      formOptionsSource: '', // '' | jarTypeOptions | factoryPosOptions | cellarPosOptions | static
      formOptions: [], // formOptionsSource=static 时使用，[{ value, label }]
      defaultValue: '', // 新增时的默认值
      placeholder: '',
      tooltip: ''
    },
    base
  )
}

export const JAR_LIST_DEFAULT_COLUMNS = [
  createColumnDefaults({
    prop: 'jar_id',
    label: '陶坛ID',
    minWidth: '140',
    fixed: 'left',
    showInDetail: true,
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true,
    readonlyOnEdit: true,
    placeholder: '请输入陶坛ID'
  }),
  createColumnDefaults({
    prop: 'jar_type',
    label: '缸型',
    minWidth: '80',
    visible: false,
    showInDetail: true,
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true,
    formType: 'select',
    formOptionsSource: 'jarTypeOptions'
  }),
  createColumnDefaults({
    prop: 'cellar_pos',
    label: '栋号',
    minWidth: '55',
    fixed: 'left',
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true,
    formType: 'select',
    formOptionsSource: 'factoryPosOptions'
  }),
  createColumnDefaults({
    prop: 'jar_pos',
    label: '库号',
    minWidth: '55',
    fixed: 'left',
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true,
    formType: 'select',
    formOptionsSource: 'cellarPosOptions'
  }),
  createColumnDefaults({
    prop: 'barrel_no',
    label: '桶号',
    minWidth: '55',
    fixed: 'left',
    showInCreate: true,
    showInEdit: true
  }),
  createColumnDefaults({
    prop: 'jar_no',
    label: '坛号',
    minWidth: '55',
    fixed: 'left',
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true
  }),
  createColumnDefaults({
    prop: 'jar_height',
    label: '坛高<br>(mm)',
    minWidth: '60',
    showInDetail: true,
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true,
    placeholder: '选择坛型后自动填充，可手动修改'
  }),
  createColumnDefaults({
    prop: 'air_height',
    label: '净空<br>(mm)',
    minWidth: '60'
  }),
  createColumnDefaults({
    prop: 'wine_level',
    label: '液位<br>(mm)',
    minWidth: '60',
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true
  }),
  createColumnDefaults({
    prop: 'wine_volume',
    label: '体积<br>(m³)',
    minWidth: '60'
  }),
  createColumnDefaults({
    prop: 'wine_vol',
    label: '原度<br>(%vol)',
    minWidth: '65',
    showInDetail: true
  }),
  createColumnDefaults({
    prop: 'wine_temp',
    label: '温度<br>(℃)',
    minWidth: '55',
    showInDetail: true,
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true
  }),
  createColumnDefaults({
    prop: 'wine_rou',
    label: '密度<br>(t/m³)',
    minWidth: '75'
  }),
  createColumnDefaults({
    prop: 'wine_weight',
    label: '原度重量<br>(t)',
    minWidth: '80'
  }),
  createColumnDefaults({
    prop: 'wine_vol_convert',
    label: '标准酒度<br>(%vol)',
    minWidth: '80',
    showInDetail: true,
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true,
    placeholder: '输入20℃标准酒度，保存后自动推算原始酒度'
  }),
  createColumnDefaults({
    prop: 'wine_weight_convert',
    label: '折算重量<br>(t)',
    minWidth: '80'
  }),
  createColumnDefaults({
    prop: 'humidity',
    label: '湿度<br>(%)',
    minWidth: '60',
    showInCreate: true,
    showInEdit: true
  }),
  createColumnDefaults({
    prop: 'team_group',
    label: '班组',
    minWidth: '60',
    showInCreate: true,
    showInEdit: true
  }),
  createColumnDefaults({
    prop: 'first_measure',
    label: '首测<br>标志',
    minWidth: '60',
    type: 'tag',
    tagCondition: 'truthy',
    tagType: 'success',
    tagText: '是',
    showInCreate: true,
    showInEdit: true,
    formType: 'switch',
    defaultValue: 0
  }),
  createColumnDefaults({
    prop: 'last_jar_flag',
    label: '尾坛<br>标志',
    minWidth: '60',
    type: 'tag',
    tagCondition: 'truthy',
    tagType: 'success',
    tagText: '是',
    showInCreate: true,
    showInEdit: true,
    formType: 'switch',
    defaultValue: 0
  }),
  createColumnDefaults({
    prop: 'calc_mode',
    label: '计算方式',
    minWidth: '100',
    type: 'tag',
    tagMappings: [
      { value: '0', text: '单坛模式', tagType: 'primary' },
      { value: '1', text: '厂家模式', tagType: 'success' },
      { value: '2', text: '经验公式', tagType: 'warning' }
    ]
  }),
  createColumnDefaults({
    prop: 'wine_name',
    label: '品名',
    minWidth: '80',
    visible: false,
    showInDetail: true,
    showInCreate: true,
    showInEdit: true
  }),
  createColumnDefaults({
    prop: 'wine_type',
    label: '香型',
    minWidth: '80',
    visible: false,
    showInDetail: true,
    showInCreate: true,
    showInEdit: true
  }),
  createColumnDefaults({
    prop: 'factory',
    label: '生产厂区',
    minWidth: '80',
    visible: false,
    showInDetail: true,
    showInCreate: true,
    showInEdit: true
  }),
  createColumnDefaults({
    prop: 'wine_date',
    label: '入库时间',
    minWidth: '110',
    visible: false,
    showInDetail: true,
    showInCreate: true,
    showInEdit: true,
    formType: 'date'
  }),
  createColumnDefaults({
    prop: 'compensation_value',
    label: '补偿值（mm）',
    minWidth: '90',
    visible: false,
    showInCreate: true,
    showInEdit: true,
    defaultValue: 0
  }),
  createColumnDefaults({
    prop: 'level_update_time',
    label: '更新时间',
    minWidth: '150',
    visible: false,
    showInDetail: true,
    showInCreate: true,
    showInEdit: true,
    requiredCreate: true,
    requiredEdit: true,
    formType: 'datetime'
  }),
  createColumnDefaults({
    prop: 'wine_rou_input',
    label: '密度(t/m³)',
    minWidth: '90',
    visible: false,
    showInCreate: true,
    showInEdit: true,
    placeholder: '点击输入密度(按指定密度计算)',
    tooltip:
      '如果不为空，将按照输入密度计算酒量，如果为空，自动根据酒度温度查表计算密度'
  }),
  createColumnDefaults({
    prop: 'convert_fraction',
    label: '折酒系数',
    minWidth: '80',
    visible: false,
    showInDetail: true
  })
]

export const DEFAULT_COLUMNS_MAP = {
  jar_list: JAR_LIST_DEFAULT_COLUMNS
}

// 将后端已保存的列配置与最新的默认字段模板合并：
// - 已保存字段：以默认模板为基底、用保存的值覆盖（这样旧数据缺失的新配置项会自动补上默认值）
// - 默认模板中新增的字段（旧的保存数据里完全没有）：追加到末尾，管理员可在配置页里调整顺序
// - 保存数据中存在但默认模板没有的字段（管理员手动新增的自定义列）：原样保留
export function mergeColumnConfig(savedColumns, defaultColumns) {
  const saved = savedColumns || []
  const defaults = defaultColumns || []
  const savedByProp = {}
  saved.forEach((s, idx) => {
    savedByProp[s.prop] = {
      data: s,
      order: s.sortOrder !== undefined ? s.sortOrder : idx
    }
  })
  const usedProps = new Set()
  const items = []

  defaults.forEach((def, idx) => {
    const hit = savedByProp[def.prop]
    const base = JSON.parse(JSON.stringify(def))
    if (hit) {
      usedProps.add(def.prop)
      items.push({ col: Object.assign(base, hit.data), order: hit.order })
    } else {
      // 全新字段，历史保存数据中不存在，排到末尾
      items.push({ col: base, order: 100000 + idx })
    }
  })

  saved.forEach((s, idx) => {
    if (!usedProps.has(s.prop)) {
      const base = createColumnDefaults({
        prop: s.prop,
        label: s.label || s.prop
      })
      items.push({
        col: Object.assign(base, s),
        order: s.sortOrder !== undefined ? s.sortOrder : 200000 + idx
      })
    }
  })

  items.sort((a, b) => a.order - b.order)
  return items.map((i) => i.col)
}
