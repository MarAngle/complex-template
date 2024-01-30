import { defineComponent, h, PropType } from "vue"
import { Col, Form, Row, FormProps } from "ant-design-vue"
import { FormLabelAlign } from "ant-design-vue/es/form/interface"
import { FormLayout } from "ant-design-vue/es/form/Form"
import { mergeData } from "complex-utils"
import { FormValue } from "complex-data"
import DictionaryValue, { DictionaryEditMod, DictionaryEditModInitOption } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultMod from "complex-data/src/dictionary/DefaultMod"
import AutoFormItem, { AutoFormItemProps } from "./components/AutoFormItem"
import config from "../config"

export interface FormViewDefaultProps {
  menu?: (DictionaryEditMod | DictionaryEditModInitOption)[]
  layout?: FormLayout
  labelAlign?: FormLabelAlign
  layoutProps?: Record<string, unknown>
  formProps?: FormProps
  disabled?: boolean
  loading?: boolean
}

export interface FormViewProps extends FormViewDefaultProps {
  form: FormValue
  list: ObserveList
  type: string
}

export default defineComponent({
  name: 'FormView',
  props: {
    form: {
      type: Object as PropType<FormViewProps['form']>,
      required: true
    },
    list: {
      type: Object as PropType<FormViewProps['list']>,
      required: true
    },
    menu: {
      type: Object as PropType<FormViewProps['menu']>,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    layout: { // 表单布局'horizontal'|'vertical'|'inline'
      type: String as PropType<FormViewProps['layout']>,
      required: false,
      default: 'horizontal'
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<FormViewProps['labelAlign']>,
      required: false,
      default: 'right'
    },
    layoutProps: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false,
      default: () => {
        return config.form.layoutProps
      }
    },
    formProps: { // form-model-view设置项
      type: Object as PropType<FormViewProps['formProps']>,
      required: false
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
        return this.menu.map(item => DictionaryValue.$initEditMod(item)!)
      } else {
        return null
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
      } as AutoFormItemProps
    },
    renderMenuList() {
      if (this.currentMenu && this.currentMenu.length > 0) {
        if (this.layout === 'inline') {
          return this.currentMenu.map((item, index) => {
            return this.renderItem((item), index)
          })
        } else {
          return this.currentMenu.map((item, index) => {
            return h(Col, this.getItemGrid(item), {
              default: () => this.renderItem((item), index)
            })
          })
        }
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

   * @returns {VNode}
   */
  render() {
    const layoutClass = `complex-form-${this.layout}`
    const list = this.renderList()
    const menuList = this.renderMenuList() || []
    const render = h(Form, {
      class: `complex-form ${layoutClass}`,
      ...this.currentFormProps
    }, {
      default: () => {
        if (this.layout === 'inline') {
          return [...list, ...menuList]
        } else {
          return h(Row, this.layoutProps, {
            default: () => [...list, ...menuList]
          })
        }
      }
    })
    return render
  }
})
