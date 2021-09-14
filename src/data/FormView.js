import _func from 'complex-func'
import config from '../../config'
import FormItem from '../base/FormItem'
import FormFoot from '../base/FormFoot'

export default {
  name: 'FormView',
  props: {
    type: { // formType
      type: String,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: false,
      default: function() {
        return config.FormView.layout
      }
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false,
      default: function() {
        return config.FormView.layoutOption
      }
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String,
      required: false,
      default: function() {
        return config.FormView.labelAlign
      }
    },
    checkOnRuleChange: { // 是否在 rules 属性改变后立即触发一次验证
      type: Boolean,
      required: false,
      default: function() {
        return config.FormView.checkOnRuleChange
      }
    },
    checkOnInit: { // 是否在加载时进行检查
      type: Boolean,
      required: false,
      default: function() {
        return config.FormView.checkOnInit
      }
    },
    clearCheckOnInit: { // 是否在加载时不检查情况下清除检查结果
      type: Boolean,
      required: false,
      default: function() {
        return config.FormView.clearCheckOnInit
      }
    },
    form: { // form数据{ data, num }
      type: Object,
      required: true
    },
    formOption: { // form-model-view设置项
      type: Object,
      required: false,
      default: null
    },
    mainlist: { // pitem列表
      type: Array,
      required: true
    },
    footMenu: { // 底部菜单
      type: Array,
      required: false
    },
    auto: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    currentAuto() {
      let currentAuto = this._func.setDataByDefault(this.auto, config.FormView.auto)
      if (currentAuto.foot.type == 'auto') {
        currentAuto.foot.type = this.layout == 'inline' ? 'single' : 'multiple'
      }
      return currentAuto
    },
    currentFormOption() {
      // formOption格式化
      let defaultFormOption = {
        props: {
          model: this.form.data,
          layout: this.layout,
          labelAlign: this.labelAlign,
          validateOnRuleChange: this.checkOnRuleChange
        }
      }
      let currentFormOption = _func.mergeData(defaultFormOption, this.formOption)
      currentFormOption.ref = config.FormView.ref
      return currentFormOption
    },
    currentFootMenu() {
      // 底部菜单的VNode
      let currentFootMenu
      let menuList = this.footMenu
      if (menuList && menuList.length > 0) {
        currentFootMenu = this.$createElement(FormFoot, {
          props: {
            list: menuList,
            auto: this.currentAuto.foot,
            form: this.form,
            type: this.type,
            layout: this.layout,
            target: this
          }
        })
      }
      return currentFootMenu
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setFormRef(this.checkOnInit, this.clearCheckOnInit)
    })
  },
  methods: {
    /**
     * 设置form的ref
     * @param {*} check 是否进行规则检查
     * @param {*} clear 在不进行规则检查的基础上是否清除规则检查
     */
    setFormRef(check, clear) {
      this.form.ref = this.$refs[config.FormView.ref]
      if (check) {
        this.triggerRuleCheck()
      } else if (clear) {
        this.clearRuleCheck()
      }
    },
    /**
     * 清除指定检查
     * @param {*} prop 需要清除检查的属性值
     */
    clearRuleCheck(prop) {
      if (this.form.ref) {
        this.form.ref.clearValidate(prop)
      }
    },
    /**
     * 重置检查
     */
    resetRuleCheck() {
      if (this.form.ref) {
        this.form.ref.resetFields()
      }
    },
    /**
     * 触发检查
     * @param {*} [prop] 需要触发检查的属性值
     */
    triggerRuleCheck(prop) {
      if (this.form.ref) {
        if (prop) {
          this.form.ref.validateField(prop)
        } else {
          this.form.ref.validate()
        }
      }
    },
    /**
     * 构建列表模板
     * @returns {VNode}
     */
    renderFormList() {
      const renderFormList = this.mainlist.map((item, index) => {
        return this.renderItem(item, index)
      })
      if (this.currentFootMenu) {
        renderFormList.push(this.currentFootMenu)
      }
      return renderFormList
    },
    /**
     * 构建forviewItem模板
     * @param {*} item 数据
     * @param {*} index index
     * @returns {VNode}
     */
    renderItem(data, index) {
      return this.$createElement(FormItem, {
        props: {
          data: data,
          index: index,
          labelAlign: this.labelAlign,
          auto: this.currentAuto,
          mainlist: this.mainlist,
          form: this.form,
          type: this.type,
          layout: this.layout,
          target: this
        }
      })
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render(h) {
    let renderFormList = this.renderFormList()
    let renderForm
    if (this.layout == 'inline') {
      renderForm = h('a-form-model', this.currentFormOption, renderFormList)
    } else {
      // 非inline模式下加载栅格布局
      renderForm = h('a-form-model', this.currentFormOption, [
        h('a-row', { ...this.layoutOption }, renderFormList)
      ])
    }
    let mainClass = config.FormView.className
    let render = h('div', {
      class: [mainClass, mainClass + this.layout]
    }, [ renderForm ])
    return render
  }
}
