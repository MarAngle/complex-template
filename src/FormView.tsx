import { defineComponent, h, PropType } from "vue"
import { Col, Form, Row } from "ant-design-vue"
import { FormLabelAlign } from "ant-design-vue/es/form/interface"
import { FormLayout } from "ant-design-vue/es/form/Form"
import { mergeData } from "complex-utils"
import { DictionaryEditMod } from "complex-data/src/dictionary/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultMod from "complex-data/src/dictionary/DefaultMod"
import DefaultEditButtonGroup, { DefaultEditButtonGroupInitOption } from "complex-data/src/dictionary/DefaultEditButtonGroup"
import AntdFormValue from "./class/AntdFormValue"
import AutoFormItem from "./components/AutoFormItem"
import config from "../config"

export default defineComponent({
  name: 'FormView',
  props: {
    form: {
      type: Object as PropType<AntdFormValue>,
      required: true
    },
    list: {
      type: Object as PropType<ObserveList>,
      required: true
    },
    menu: {
      type: Object as PropType<DefaultEditButtonGroup | DefaultEditButtonGroupInitOption>,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    layout: { // 表单布局'horizontal'|'vertical'|'inline'
      type: String as PropType<FormLayout>,
      required: false,
      default: 'horizontal'
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<FormLabelAlign>,
      required: false,
      default: 'right'
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false,
      default: () => {
        return config.form.layoutOption
      }
    },
    formProps: { // form-model-view设置项
      type: Object,
      required: false,
      default: null
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    }
  },
  computed: {
    currentFormProps() {
      const formProps = {
        ref: 'form',
        model: this.form.data,
        layout: this.layout,
        labelAlign: this.labelAlign
      }
      return mergeData(formProps, this.formProps)
    },
    currentMenu() {
      if (this.menu) {
        if (this.menu instanceof DefaultEditButtonGroup) {
          return this.menu
        } else {
          return new DefaultEditButtonGroup(this.menu)
        }
      } else {
        return null
      }
    },
    payload() {
      return {
        type: this.type,
        form: this.form,
        list: this.list
      }
    }
  },
  mounted () {
    this.form.setRef(this.$refs[this.currentFormProps.ref])
  },
  methods: {
    getItemGrid(data: DefaultMod) {
      return config.parseGrid(data.$layout, 'main', this.type)
    },
    getItemProps(data: DictionaryEditMod, index: number) {
      return {
        data: data,
        index: index,
        list: this.list,
        form: this.form,
        type: this.type,
        disabled: this.disabled,
        loading: this.loading,
        target: this
      }
    },
    renderMenu() {
      if (this.currentMenu) {
        return this.renderItem(this.currentMenu, this.list.data.length)
      } else {
        return null
      }
    },
    renderItem(item: DictionaryEditMod, index: number) {
      return h(AutoFormItem, this.getItemProps(item, index))
    },
    renderList() {
      if (this.layout === 'inline') {
        return this.list.data.map((item, index) => {
          return this.renderItem((item as DictionaryEditMod), index)
        })
      } else {
        return this.list.data.map((item, index) => {
          return h(Col, this.getItemGrid(item), {
            default: () => this.renderItem((item as DictionaryEditMod), index)
          })
        })
      }
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    const layoutClass = `complex-form-${this.layout}`
    const render = h(Form, {
      class: `complex-form ${layoutClass}`,
      ...this.currentFormProps
    }, {
      default: () => {
        const list = this.renderList()
        const menu = this.renderMenu()
        if (this.layout === 'inline') {
          return [...list, menu]
        } else {
          return h(Row, this.layoutOption, {
            default: () => [...list, menu]
          })
        }
      }
    })
    return render
  }
})
