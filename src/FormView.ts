import { defineComponent, h, PropType } from "vue"
import { Col, Form, Row, FormProps, RowProps } from "ant-design-vue"
import { FormLabelAlign } from "ant-design-vue/es/form/interface"
import { mergeData } from "complex-utils"
import { FormValue } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultMod from "complex-data/src/dictionary/DefaultMod"
import GridParse from "complex-data/src/lib/GridParse"
import AutoFormItem, { AutoFormItemProps } from "./components/AutoFormItem"
import config from "../config"

export interface FormViewDefaultProps {
  menu?: DictionaryEditMod[]
  labelAlign?: FormLabelAlign
  gridParse?: GridParse
  gridRowProps?: RowProps
  formProps?: FormProps
  choice?: number
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
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<FormViewProps['labelAlign']>,
      required: false,
      default: 'right'
    },
    gridParse: {
      type: Object as PropType<FormViewProps['gridParse']>,
      required: false
    },
    gridRowProps: { // form-model-view设置项
      type: Object as PropType<FormViewProps['gridRowProps']>,
      required: false
    },
    formProps: { // form-model-view设置项
      type: Object as PropType<FormViewProps['formProps']>,
      required: false
    },
    choice: {
      type: Number,
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
        layout: this.gridParse ? 'horizontal' : 'inline',
        labelAlign: this.labelAlign
      }
      return mergeData(formProps, this.formProps!)
    },
    currentMenu() {
      if (this.menu) {
        return this.menu
      } else {
        return null
      }
    }
  },
  mounted () {
    this.form.setRef(this.$refs[this.currentFormProps.ref])
  },
  methods: {
    parseGrid(data: DefaultMod) {
      return config.parseGrid(this.gridParse!.parseData(data.$grid, 'main', this.type))
    },
    getItemProps(data: DictionaryEditMod, index: number) {
      return {
        data: data,
        index: index,
        list: this.list,
        form: this.form,
        type: this.type,
        choice: this.choice,
        disabled: this.disabled,
        loading: this.loading,
        target: this
      } as AutoFormItemProps
    },
    renderMenuList() {
      if (this.currentMenu && this.currentMenu.length > 0) {
        if (!this.gridParse) {
          return this.currentMenu.map((item, index) => {
            return this.renderItem((item), index)
          })
        } else {
          return this.currentMenu.map((item, index) => {
            return h(Col, this.parseGrid(item), {
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
      if (!this.gridParse) {
        return this.list.data.map((item, index) => {
          return this.renderItem((item as DictionaryEditMod), index)
        })
      } else {
        return this.list.data.map((item, index) => {
          return h(Col, this.parseGrid(item), {
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
    const layoutClass = `complex-form-${this.gridParse ? 'grid' : 'inline'}`
    const list = this.renderList()
    const menuList = this.renderMenuList() || []
    const render = h(Form, {
      class: `complex-form ${layoutClass}`,
      ...this.currentFormProps
    }, {
      default: () => {
        if (!this.gridParse) {
          return [...list, ...menuList]
        } else {
          return h(Row, { ...this.gridRowProps }, {
            default: () => [...list, ...menuList]
          })
        }
      }
    })
    return render
  }
})
