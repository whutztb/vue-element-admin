const titles = { tank: '数智化大罐监测系统', jar: '数智化陶坛监测系统' }
const containerType = process.env.VUE_APP_CONTAINER_TYPE || 'jar'

module.exports = {
  title: titles[containerType],

  /**
   * @type {boolean} true | false
   * @description Whether show the settings right-panel
   * 界面是否显示设置选项
   */
  showSettings: false,

  /**
   * @type {boolean} true | false
   * @description Whether need tagsView
   */
  tagsView: true,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: true,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production'
}
