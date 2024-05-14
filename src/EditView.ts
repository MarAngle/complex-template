import { defineComponent, h, PropType } from "vue"
import { Col, Form, Row, FormProps, RowProps } from "ant-design-vue"
import { mergeData } from "complex-utils"
import { FormValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultInfo from "complex-data/src/dictionary/DefaultInfo"
import AutoItem, { AutoItemProps } from "./components/AutoItem"
import config from "../config"
import { InfoViewDefaultProps } from "./InfoView"

export interface EditViewDefaultProps extends InfoViewDefaultProps {
  formProps?: FormProps
  choice?: number
}

export interface EditViewProps extends EditViewDefaultProps {
  form: FormValue
  list: ObserveList
  type: string
}

export default defineComponent({
  name: 'EditView',
  props: {
    form: {
      type: Object as PropType<EditViewProps['form']>,
      required: true
    },
    list: {
      type: Object as PropType<EditViewProps['list']>,
      required: true
    },
    menu: {
      type: Object as PropType<EditViewProps['menu']>,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<EditViewProps['labelAlign']>,
      required: false,
      default: 'right'
    },
    gridParse: {
      type: Object as PropType<EditViewProps['gridParse']>,
      required: false
    },
    gridRowProps: { // form-model-view设置项
      type: Object as PropType<EditViewProps['gridRowProps']>,
      required: false
    },
    formProps: { // form-model-view设置项
      type: Object as PropType<EditViewProps['formProps']>,
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
    },
    currentList() {
      if (this.currentMenu && this.currentMenu.length > 0) {
        return this.list.data.concat(this.currentMenu)
      } else {
        return this.list.data
      }
    }
  },
  mounted () {
    this.form.setRef(this.$refs[this.currentFormProps.ref])
  },
  methods: {
    parseGrid(data: DefaultInfo) {
      return config.parseGrid(this.gridParse!.parseData(data.$grid, 'main', this.type))
    },
    getItemProps(data: DefaultInfo, index: number) {
      return {
        edit: true,
        target: data,
        index: index,
        list: this.list,
        type: this.type,
        choice: this.choice,
        gridParse: this.gridParse,
        disabled: this.disabled,
        loading: this.loading,
        form: this.form,
        data: undefined,
        parent: this
      } as AutoItemProps<true>
    },
    renderItem(item: DefaultInfo, index: number) {
      return h(AutoItem, this.getItemProps(item, index))
    },
    renderList() {
      if (!this.gridParse) {
        return this.currentList.map((item, index) => {
          return this.renderItem(item, index)
        })
      } else {
        return this.currentList.map((item, index) => {
          return h(Col, this.parseGrid(item), {
            default: () => this.renderItem(item, index)
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
    const layoutClass = `complex-edit-${this.gridParse ? 'grid' : 'inline'}`
    const list = this.renderList()
    const render = h(Form, {
      class: `complex-edit ${layoutClass}`,
      ...this.currentFormProps
    }, {
      default: () => {
        if (!this.gridParse) {
          return list
        } else {
          return h(Row, { ...this.gridRowProps }, {
            default: () => list
          })
        }
      }
    })
    return render
  }
})
