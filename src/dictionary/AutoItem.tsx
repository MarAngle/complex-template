import { defineComponent, h, PropType } from "vue"
import { Col, FormItem, Row, Tooltip } from "ant-design-vue"
import { AttrsValue, FormValue, DefaultInfo } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultEdit from "complex-data/src/dictionary/DefaultEdit"
import GridParse from "complex-data/src/lib/GridParse"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import EditView from "../EditView"
import InfoView from "../InfoView"
import AutoEditItem from "./AutoEditItem"
import AutoInfoItem from "./AutoInfoItem"
import config from "../../config"

export interface AutoItemPayloadType<E = true> {
  prop: string
  type: string
  target: E extends true ? DictionaryEditMod : DefaultInfo
  index: number
  list: ObserveList
  choice?: number
  disabled?: boolean
  loading?: boolean
  targetData: Record<PropertyKey, any>
  form: E extends true ? FormValue : undefined
  data: E extends false ? Record<PropertyKey, any> : undefined
  parent: E extends true ? InstanceType<typeof EditView> : InstanceType<typeof InfoView>
}

export interface AutoItemProps<E = true> {
  edit: E
  target: E extends true ? DictionaryEditMod : DefaultInfo
  index: number
  list: ObserveList
  type: string
  gridParse?: GridParse
  choice?: number
  disabled?: boolean
  loading?: boolean
  form: E extends true ? FormValue : undefined
  data: E extends false ? Record<PropertyKey, any> : undefined
  parent: E extends true ? InstanceType<typeof EditView> : InstanceType<typeof InfoView>
}

export default defineComponent({
  name: 'AutoItem',
  props: {
    edit: {
      type: Boolean as PropType<AutoItemProps<boolean>['edit']>,
      required: true
    },
    target: {
      type: Object as PropType<AutoItemProps<boolean>['target']>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<AutoItemProps<boolean>['list']>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    gridParse: {
      type: Object as PropType<AutoItemProps<boolean>['gridParse']>,
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
    },
    form: {
      type: Object as PropType<AutoItemProps<boolean>['form']>,
      required: false
    },
    data: {
      type: Object as PropType<AutoItemProps<boolean>['data']>,
      required: false
    },
    parent: { // EditView实例
      type: Object as PropType<AutoItemProps<boolean>['parent']>,
      required: true
    }
  },
  computed: {
    payload() {
      return {
        prop: this.target.$prop,
        type: this.type,
        target: this.target,
        index: this.index,
        list: this.list,
        choice: this.choice,
        disabled: this.disabled,
        loading: this.loading,
        targetData: this.edit ? this.form!.data : this.data!,
        form: this.form,
        data: this.data,
        parent: this.parent,
      }
    },
    isEdit() {
      return this.edit && ['button', 'buttonGroup', 'content'].indexOf((this.target as DictionaryEditMod).type) === -1
    }
  },
  methods: {
    renderTip() {
      const mainRender = config.component.parseData(this.target.$renders, 'main')
      const item = !mainRender ? this.renderItem() : mainRender(this.payload)
      if (this.target.$tip) {
        return h(Tooltip, {
          title: this.target.$tip.getData ? this.target.$tip.getData(this.payload) : this.target.$tip.data,
          placement: this.target.$tip.location,
          ...config.component.parseAttrs(this.target.$tip.$attrs)
        }, {
          default: () => item
        })
      } else {
        return item
      }
    },
    renderLabel() {
      const labelAttrs = config.component.parseData(this.target.$local, 'label') || new AttrsValue()
      labelAttrs.pushClass('complex-auto-item-label')
      labelAttrs.pushClass(`complex-auto-item-${this.parent.labelAlign}-label`)
      if (this.target.colon && this.target.$name) {
        labelAttrs.pushClass('complex-auto-item-colon-label')
      }
      return h('div', config.component.parseAttrs(labelAttrs), {
        default: () => this.target.$name
      })
    },
    renderItem() {
      if (this.isEdit) {
        return h(AutoEditItem, {
          payload: this.payload as AutoItemPayloadType<true>
        })
      } else {
        return h(AutoInfoItem, {
          payload: this.payload as AutoItemPayloadType<false>
        })
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const mainRender = config.component.parseData(this.target.$renders, 'main')
    if (!mainRender) {
      if (this.isEdit) {
        const mainAttributes = new AttrsValue({
          class: ['complex-auto-item'],
          props: {
            name: this.target.$prop,
            label: this.target.$name,
            colon: this.target.colon,
            required: (this.target as DictionaryEditMod).required,
            rules: this.target instanceof DefaultEdit ? this.target.getRuleList(this.payload.targetData) : undefined
          }
        })
        if (this.gridParse) {
          mainAttributes.props.labelCol = this.gridParse!.parseData(this.target.$grid, 'label', this.type)
          mainAttributes.props.wrapperCol = this.gridParse!.parseData(this.target.$grid, 'content', this.type)
        }
        mainAttributes.merge(config.component.parseData(this.target.$local, 'main'))
        return h(FormItem, config.component.parseAttrs(mainAttributes), { default: () => this.renderTip() })
      } else {
        const mainAttributes = new AttrsValue({
          class: ['complex-auto-item', 'complex-auto-item-info']
        })
        mainAttributes.merge(config.component.parseData(this.target.$local, 'main'))
        if (this.gridParse) {
          return h(Row, config.component.parseAttrs(mainAttributes), {
            default: () => [
              h(Col, config.parseGrid(this.payload.parent.gridParse!.parseData(this.payload.target.$grid, 'label', this.payload.type)), {
                default: () => this.renderLabel()
              }),
              h(Col, config.parseGrid(this.payload.parent.gridParse!.parseData(this.payload.target.$grid, 'content', this.payload.type)), {
                default: () => this.renderTip()
              })
            ]
           })
        } else {
          return h('div', config.component.parseAttrs(mainAttributes), {
            default: () => [
              this.renderLabel(),
              this.renderTip()
            ]
          })
        }
      }
    } else {
      return mainRender(this.payload)
    }
  }
})
